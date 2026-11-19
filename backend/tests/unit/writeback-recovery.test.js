import test from 'node:test';
import assert from 'node:assert/strict';
import {preparedQuizFixture} from '../helpers/quiz.js';
import {AppError} from '../../src/api/errors.js';
const cell=(f,n=1)=>f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].data[0].rowData[n-1].values[0];
function close(f,n=1,text='answer'+n){const b={...f.body,questionNumber:n};f.c.questions.start(f.teacher,b);f.c.submissions.submit(f.students[0],{...b,answerText:text});f.c.questions.close(f.teacher,b);}
async function start(f){const op=f.c.writeback.start(f.teacher,f.body.activityId);await f.c.writeback.wait(op.operationId);return f.c.writeback.get(f.teacher,f.body.activityId,op.operationId);}
async function reconcile(f,id){f.c.writeback.reconcile(f.teacher,f.body.activityId,id);await f.c.writeback.wait(id);return f.c.writeback.get(f.teacher,f.body.activityId,id);}

test('evidence makes repeated writes no-ops, but external replacement or restored markers conflict',async()=>{
 for(const changed of [null,'external','{{Q1}}']){
  const f=await preparedQuizFixture(1);close(f);assert.equal((await start(f)).status,'SUCCEEDED');
  if(changed!==null)cell(f).userEnteredValue={stringValue:changed};
  const op=await start(f);assert.equal(op.status,changed===null?'SUCCEEDED':'CONFLICT');assert.equal(op.items[0].state,changed===null?'SKIPPED_VERIFIED':'CONFLICT');assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,1);
 }
 const f=await preparedQuizFixture(1);close(f);cell(f).userEnteredValue={stringValue:'answer1'};assert.equal((await start(f)).status,'CONFLICT');assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,0);
});

test('unknown partial results preserve snapshot/barrier; later exact content can reconcile without another write',async()=>{
 const f=await preparedQuizFixture(3);close(f);f.c.questions.next(f.teacher,f.body);close(f,2,'{{Q3}}');
 let sends=0;f.c.sheetsAccess.writeValues=async()=>{sends++;cell(f).userEnteredValue={stringValue:'answer1'};return {sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'};};
 const op=await start(f);assert.equal(op.status,'PENDING_VERIFICATION');assert.deepEqual(op.items.map(i=>i.state),['VERIFIED','NOT_WRITTEN']);assert(op.canReconcile);
 f.c.questions.next(f.teacher,{...f.body,questionNumber:2});close(f,3,'later');
 const again=await reconcile(f,op.operationId);assert.equal(again.status,'PENDING_VERIFICATION');assert.equal(sends,1);assert.equal(again.items.length,2);assert.equal(cell(f,3).userEnteredValue.stringValue,'{{Q3}}');
 cell(f,2).userEnteredValue={stringValue:'{{Q3}}'};const done=await reconcile(f,op.operationId);assert.equal(done.status,'SUCCEEDED');assert.equal(sends,1);assert(!done.canReconcile);
});

test('pending rechecks prior evidence, all locations, structure and non-answer formula before any resend',async()=>{
 for(const change of [f=>{cell(f).userEnteredValue={stringValue:'external'};},f=>{cell(f).userEnteredValue={stringValue:'{{Q1}}'};},f=>{cell(f,2).chipRuns=[{startIndex:0,chip:{}}];},f=>{f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].properties.gridProperties.rowCount++;},f=>{f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].merges=[{sheetId:0,startRowIndex:1,endRowIndex:2,startColumnIndex:6,endColumnIndex:8}];},f=>{f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].data.push({startRow:9,startColumn:1,rowData:[{values:[{userEnteredValue:{formulaValue:'=9'}}]}]});}]){
  const f=await preparedQuizFixture(2);close(f);await start(f);f.c.questions.next(f.teacher,f.body);close(f,2);
  f.c.sheetsAccess.writeValues=async()=>({sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'});
  const op=await start(f);assert.equal(op.status,'PENDING_VERIFICATION');change(f);const conflict=await reconcile(f,op.operationId);assert.equal(conflict.status,'CONFLICT');assert(conflict.canReconcile);assert.throws(()=>f.c.writeback.start(f.teacher,f.body.activityId),{code:'WRITEBACK_PENDING'});
 }
});

test('reconcile read/auth/permission failure preserves uncertainty and never becomes safely failed',async()=>{
 for(const fault of ['read','auth','permission']){
  const f=await preparedQuizFixture(1);close(f);let sends=0;f.c.sheetsAccess.writeValues=async()=>{sends++;return {sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'};};const op=await start(f);
  if(fault==='permission')f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].protectedRanges=[{range:{sheetId:0},requestingUserCanEdit:false}];else f.c.sheetsAccess.getSource=async()=>{throw new AppError(fault==='auth'?'GOOGLE_AUTH_UNAVAILABLE':'SHEETS_UNAVAILABLE');};
  assert.equal((await reconcile(f,op.operationId)).status,'PENDING_VERIFICATION');assert.equal(sends,1);assert.throws(()=>f.c.writeback.start(f.teacher,f.body.activityId),{code:'WRITEBACK_PENDING'});
 }
});

test('safe settled applied attempt can write only remaining markers on explicit reconcile',async()=>{
 const f=await preparedQuizFixture(2);close(f);f.c.questions.next(f.teacher,f.body);close(f,2);
 const original=f.c.sheetsAccess.writeValues.bind(f.c.sheetsAccess);let calls=0;
 f.c.sheetsAccess.writeValues=async(...args)=>{calls++;if(calls===1){cell(f).userEnteredValue={stringValue:'answer1'};return {sent:true,transportState:'SETTLED',remoteOutcome:'APPLIED'};}assert.deepEqual(args[1].map(i=>i.questionNumber),[2]);return original(...args);};
 const op=await start(f);assert.equal(op.status,'PENDING_VERIFICATION');assert.equal((await reconcile(f,op.operationId)).status,'SUCCEEDED');assert.equal(calls,2);assert.equal(cell(f).userEnteredValue.stringValue,'answer1');
});

test('exact marker answer is evidence-backed and malformed/oversize winners fail without a write',async()=>{
 const f=await preparedQuizFixture(1);close(f,1,'{{Q1}}');assert.equal((await start(f)).status,'SUCCEEDED');assert.equal((await start(f)).items[0].state,'SKIPPED_VERIFIED');assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,1);
 for(const text of ['bad\ud800','x'.repeat(2*1024*1024)]){const f=await preparedQuizFixture(1);close(f,1,text);assert.equal((await start(f)).status,'FAILED');assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,0);}
});

test('safe initial read failure or known unsent/rejected write allows a new explicit operation after repair',async()=>{
 for(const failure of ['read','auth','rejected']){
  const f=await preparedQuizFixture(1);close(f);const read=f.c.sheetsAccess.getSource.bind(f.c.sheetsAccess),write=f.c.sheetsAccess.writeValues.bind(f.c.sheetsAccess);let sends=0;
  if(failure==='read')f.c.sheetsAccess.getSource=async()=>{throw new AppError('SHEETS_ACCESS_UNAVAILABLE');};
  else f.c.sheetsAccess.writeValues=async()=>{sends++;return {sent:failure==='rejected',transportState:failure==='rejected'?'SETTLED':'NOT_SENT',remoteOutcome:failure==='rejected'?'KNOWN_REJECTED':'NOT_SENT',error:{code:failure==='auth'?'GOOGLE_AUTH_UNAVAILABLE':'SHEETS_ACCESS_UNAVAILABLE'}};};
  const failed=await start(f);assert.equal(failed.status,'FAILED');assert(!failed.canReconcile);assert.equal(sends,failure==='read'?0:1);
  f.c.sheetsAccess.getSource=read;f.c.sheetsAccess.writeValues=write;const recovered=await start(f);assert.equal(recovered.status,'SUCCEEDED');assert.notEqual(recovered.operationId,failed.operationId);assert.equal(cell(f).userEnteredValue.stringValue,'answer1');
 }
});

test('unknown conflicting target remains a barrier; correcting only conflict to marker cannot enable resend',async()=>{
 const f=await preparedQuizFixture(2);close(f);f.c.questions.next(f.teacher,f.body);close(f,2);let sends=0;
 f.c.sheetsAccess.writeValues=async()=>{sends++;cell(f).userEnteredValue={stringValue:'answer1'};cell(f,2).userEnteredValue={stringValue:'external'};return {sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'};};
 const op=await start(f);assert.equal(op.status,'CONFLICT');assert(op.canReconcile);assert(op.items.some(i=>i.state==='CONFLICT'&&i.questionNumber===2));
 cell(f,2).userEnteredValue={stringValue:'{{Q2}}'};const checked=await reconcile(f,op.operationId);assert.equal(checked.status,'PENDING_VERIFICATION');assert.deepEqual(checked.items.map(i=>i.state),['VERIFIED','NOT_WRITTEN']);assert.equal(sends,1);
});

test('applied write with lost Google reply succeeds only through exact readback, or manual reconcile after read failure',async()=>{
 for(const failedRead of [false,true]){
  const f=await preparedQuizFixture(1);close(f);const write=f.c.sheetsAccess.writeValues.bind(f.c.sheetsAccess),verify=f.c.sheetsAccess.verify.bind(f.c.sheetsAccess);let sends=0;
  f.c.sheetsAccess.writeValues=async(...a)=>{sends++;await write(...a);return {sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'};};
  if(failedRead)f.c.sheetsAccess.verify=async()=>{throw new AppError('SHEETS_TIMEOUT');};
  const op=await start(f);assert.equal(op.status,failedRead?'PENDING_VERIFICATION':'SUCCEEDED');
  if(failedRead){f.c.sheetsAccess.verify=verify;assert.equal((await reconcile(f,op.operationId)).status,'SUCCEEDED');}
  assert.equal(sends,1);assert.equal(f.c.store.guidedNotesWritebacks.get(f.body.activityId).evidence.get(1).exactText,'answer1');
 }
});
