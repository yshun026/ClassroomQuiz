import {AppError} from '../api/errors.js';
import {captureClosedWinners,WritebackOperation,WriteAttempt} from '../models/writeback-operation.js';
import {WritebackEvidence} from '../models/writeback-evidence.js';
import {checkSourceConsistency,SourceConflict,exactString} from './source-consistency.js';
import {buildWriteBatch} from './sheets-access.js';

const coordinate=l=>`${l.sheetId}/${l.rowIndex}/${l.columnIndex}`;
const messages={PRECHECKING:'正在核對原試算表',WRITING:'正在寫回 Google Sheets',VERIFYING:'正在讀回核對',PENDING_VERIFICATION:'結果待核對，請勿重送或重啟企圖取消',SUCCEEDED:'已讀回核對完成',NO_CHANGES:'無可寫回答案',FAILED:'寫回未完成，搶答結果已保留',CONFLICT:'來源發生衝突，已停止尚未送出的更新'};
const safeError=e=>e instanceof AppError||e instanceof SourceConflict?{code:e.code,message:e.message}:{code:'SHEETS_UNAVAILABLE',message:'Google Sheets 操作未完成，請查詢目前狀態'};
const inFlight=op=>op.attempts.some(a=>a.transportState==='IN_FLIGHT');
const unknown=op=>op.attempts.some(a=>a.sent&&a.remoteOutcome==='UNKNOWN');
const eligible=op=>op.status==='PENDING_VERIFICATION'||op.status==='CONFLICT'&&op.unresolvedAttempt;
export class WritebackCoordinator{
 constructor(context){this.c=context;this.jobs=new Map();}
 #activity(token,id){this.c.auth.validate(token,'teacher');const a=this.c.store.activity;if(!a)throw new AppError('ACTIVITY_NOT_READY');if(a.id!==id)throw new AppError('STALE_ACTIVITY');return a;}
 #state(id){let state=this.c.store.guidedNotesWritebacks.get(id);if(!state){state={operations:new Map(),evidence:new Map(),latestId:null};this.c.store.guidedNotesWritebacks.set(id,state);}return state;}
 #mutate(op,state,work){return this.c.dispatcher.run(()=>{
  if(this.c.store.activity?.id!==op.activityId||this.c.store.guidedNotesWritebacks.get(op.activityId)!==state||state.latestId!==op.id||state.operations.get(op.id)!==op)throw new AppError('STALE_ACTIVITY');
  work();op.revision++;
 });}
 #view(op){return {activityId:op.activityId,operationId:op.id,operationRevision:op.revision,status:op.status,running:op.running,canReconcile:!op.running&&eligible(op),
  items:[...op.items.values()].map(i=>({questionNumber:i.questionNumber,state:i.state,sheetTitle:i.location.sheetTitle,cellAddress:i.location.cellAddress,...(i.safeReason?{reason:i.safeReason}:{})})),message:op.lastError?.message??messages[op.status]};}
 #busy(state){const running=[...state.operations.values()].find(o=>o.running||inFlight(o));if(running)throw new AppError('WRITEBACK_BUSY',{operationId:running.id});}
 #launch(op,state,source){const initial=this.#view(op);if(op.running){const job=Promise.resolve().then(()=>this.#run(op,state,source));this.jobs.set(op.id,job);job.catch(()=>{});}return initial;}
 start(token,id){
  let op,state,source;
  this.c.dispatcher.run(()=>{
   const a=this.#activity(token,id);source=a.document;if(!source.spreadsheetId)throw new AppError('SOURCE_UNSUPPORTED');state=this.#state(id);this.#busy(state);
   const pending=[...state.operations.values()].find(o=>o.unresolvedAttempt||o.status==='PENDING_VERIFICATION');if(pending)throw new AppError('WRITEBACK_PENDING',{operationId:pending.id});
   op=new WritebackOperation(captureClosedWinners(a));state.operations.set(op.id,op);state.latestId=op.id;
   if(!op.snapshot.fills.length){op.status='NO_CHANGES';op.running=false;}
  });
  return this.#launch(op,state,source);
 }
 reconcile(token,id,operationId){
  let op,state,source;
  this.c.dispatcher.run(()=>{
   source=this.#activity(token,id).document;state=this.#state(id);
   op=state.operations.get(operationId);if(!op)throw new AppError('WRITEBACK_NOT_FOUND');
   this.#busy(state);if(!eligible(op)||state.latestId!==op.id)throw new AppError('WRITEBACK_NOT_PENDING');
   // The same immutable snapshot and attempt history survive every reconciliation.
   op.kind='RECONCILE';op.status='PRECHECKING';op.running=true;op.lastError=null;op.revision++;
   for(const item of op.items.values())item.safeReason=null;
  });
  return this.#launch(op,state,source);
 }
 get(token,id,operationId){this.#activity(token,id);const op=this.c.store.guidedNotesWritebacks.get(id)?.operations.get(operationId);if(!op)throw new AppError('WRITEBACK_NOT_FOUND');return this.#view(op);}
 latest(token,id){this.#activity(token,id);const state=this.c.store.guidedNotesWritebacks.get(id);return state?.latestId?this.#view(state.operations.get(state.latestId)):null;}
 wait(operationId){return this.jobs.get(operationId)??Promise.resolve();}
 #recordChecked(op,state,source,checked,{beforeWrite=false}={}){
  for(const fill of op.snapshot.fills){
   const item=op.items.get(fill.questionNumber),value=checked.values.get(coordinate(fill.location));
   item.safeReason=null;
   if(checked.verified.has(fill.questionNumber)&&exactString(value,fill.answerText)){
    item.state=state.evidence.has(fill.questionNumber)&&beforeWrite||item.state==='SKIPPED_VERIFIED'?'SKIPPED_VERIFIED':'VERIFIED';
    state.evidence.set(fill.questionNumber,new WritebackEvidence({activityId:op.activityId,spreadsheetId:source.spreadsheetId,questionNumber:fill.questionNumber,location:fill.location,exactText:fill.answerText,operationId:op.id}));
   }else item.state='NOT_WRITTEN';
  }
 }
 // A settled local request is not proof that Google stopped processing it.
 #safeToSend(op,checked){return op.attempts.every(a=>(a.transportState==='SETTLED'||!a.sent&&a.transportState==='NOT_SENT')&&(!a.sent||a.remoteOutcome==='NOT_SENT'||a.remoteOutcome==='KNOWN_REJECTED'||a.remoteOutcome==='APPLIED'||a.remoteOutcome==='UNKNOWN'&&a.targetQuestionNumbers.every(n=>checked.verified.has(n))));}
 #pending(op){op.status='PENDING_VERIFICATION';op.unresolvedAttempt=true;op.running=inFlight(op);for(const item of op.items.values())if(item.state==='NOT_WRITTEN')item.safeReason='舊寫入結果仍不明，僅核對，不重新送出';}
 async #run(op,state,source){
  let result=null,attempt=null;
  try{
   const raw=await this.c.sheetsAccess.getSource(source.spreadsheetId);
   const checked=checkSourceConsistency(source,raw,{activityId:op.activityId,evidence:state.evidence,pendingOperation:op.kind==='RECONCILE'?op:null});
   const fills=op.snapshot.fills.filter(fill=>!checked.verified.has(fill.questionNumber));
   buildWriteBatch(fills);
   this.#mutate(op,state,()=>{this.#recordChecked(op,state,source,checked,{beforeWrite:true});});
   if(!this.#safeToSend(op,checked)){this.#mutate(op,state,()=>this.#pending(op));return;}
   if(!fills.length){this.#mutate(op,state,()=>{op.status='SUCCEEDED';op.running=false;op.unresolvedAttempt=false;});return;}
   attempt=new WriteAttempt(fills.map(f=>f.questionNumber));
   this.#mutate(op,state,()=>{op.status='WRITING';op.attempts.push(attempt);});
   try{result=await this.c.sheetsAccess.writeValues(source.spreadsheetId,fills,attempt.id);}
   catch{result={sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'};}
   this.#mutate(op,state,()=>{
    attempt.sent=result.sent===true;attempt.transportState=result.transportState;attempt.remoteOutcome=result.remoteOutcome;
    if(result.transportState!=='IN_FLIGHT')attempt.endedAt=new Date().toISOString();
    op.unresolvedAttempt=unknown(op);op.status='VERIFYING';
   });
   if(result.remoteOutcome==='NOT_SENT'||result.remoteOutcome==='KNOWN_REJECTED'){
    this.#mutate(op,state,()=>{op.status='FAILED';op.running=false;op.unresolvedAttempt=false;op.lastError=safeError(new AppError(result.error?.code??'SHEETS_UNAVAILABLE'));for(const i of op.items.values())if(!['VERIFIED','SKIPPED_VERIFIED'].includes(i.state))i.safeReason=op.lastError.message;});return;
   }
   const after=await this.c.sheetsAccess.verify(source.spreadsheetId,op);
   const verified=checkSourceConsistency(source,after,{activityId:op.activityId,evidence:state.evidence,pendingOperation:op});
   this.#mutate(op,state,()=>{
    this.#recordChecked(op,state,source,verified);
    if(result.transportState==='SETTLED'){attempt.transportState='SETTLED';attempt.endedAt??=new Date().toISOString();}
    const complete=[...op.items.values()].every(i=>['VERIFIED','SKIPPED_VERIFIED'].includes(i.state));
    if(complete&&!inFlight(op)){op.status='SUCCEEDED';op.running=false;op.unresolvedAttempt=false;}else this.#pending(op);
   });
  }catch(error){
   if(this.c.store.activity?.id!==op.activityId||state.latestId!==op.id||this.c.store.guidedNotesWritebacks.get(op.activityId)!==state)return;
   this.#mutate(op,state,()=>{
    op.lastError=safeError(error);
    const sent=op.attempts.some(a=>a.sent&&!['KNOWN_REJECTED','NOT_SENT'].includes(a.remoteOutcome));
    op.status=error instanceof SourceConflict?'CONFLICT':sent?'PENDING_VERIFICATION':'FAILED';
    op.unresolvedAttempt=sent&&(op.status==='PENDING_VERIFICATION'||unknown(op)||inFlight(op));
    op.running=inFlight(op);
    for(const item of op.items.values())if(item.state!=='SKIPPED_VERIFIED'){
     const hit=error instanceof SourceConflict&&(!error.locations.length||error.locations.some(l=>coordinate(l)===coordinate(item.location)));
     item.state=hit?'CONFLICT':sent?'UNKNOWN':'NOT_WRITTEN';item.safeReason=op.lastError.message;
    }
   });
  }finally{
   if(attempt?.transportState==='IN_FLIGHT'&&result?.whenTransportSettled){
    result.whenTransportSettled.then(()=>{
     if(this.c.store.activity?.id!==op.activityId||state.latestId!==op.id||this.c.store.guidedNotesWritebacks.get(op.activityId)!==state)return;
     this.#mutate(op,state,()=>{
      attempt.transportState='SETTLED';attempt.endedAt=new Date().toISOString();op.running=inFlight(op);
      if(!op.running&&op.status==='PENDING_VERIFICATION'&&[...op.items.values()].every(i=>['VERIFIED','SKIPPED_VERIFIED'].includes(i.state))){op.status='SUCCEEDED';op.unresolvedAttempt=false;op.lastError=null;}
      // Residual markers with UNKNOWN remain blocked. No background retries.
     });
    }).catch(()=>{});
   }
  }
 }
}
