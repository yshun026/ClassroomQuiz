import {api} from './api.js';
const stale=()=>Object.assign(Error('已忽略過期來源或操作回覆'),{code:'STALE_RESPONSE'});
export function createGuidedNotesClient({request=api}={}){
 let generation=0,activityId=null,discovery=0,sessionKey=null,currentOperationId=null,currentOperation=null,posting=false;
 const signature=session=>`${session?.generation??''}/${session?.token??''}`;
 const reset=()=>{generation++;discovery++;activityId=null;sessionKey=null;currentOperationId=null;currentOperation=null;posting=false;};
 function bind(id,session){const key=signature(session);if(activityId!==id||sessionKey!==key){reset();activityId=id;sessionKey=key;}}
 const check=(epoch,id)=>{if(epoch!==generation||id!==activityId)throw stale();};
 function select(view){currentOperationId=view?.operationId??null;currentOperation=view??null;return currentOperation;}
 function update(view){
  if(!view||view.activityId!==activityId||view.operationId!==currentOperationId)throw stale();
  if(!currentOperation||view.operationRevision>=currentOperation.operationRevision)currentOperation=view;
  return currentOperation;
 }
 async function postOperation(id,session,reconcileId=null){
  if(reconcileId&&(activityId!==id||sessionKey!==signature(session)||currentOperationId!==reconcileId))throw stale();
  bind(id,session);const epoch=++generation;discovery++;posting=true;if(!reconcileId)select(null);
  const path=reconcileId?'/activity/guided-notes/writebacks/'+encodeURIComponent(reconcileId)+'/reconcile':'/activity/guided-notes/writeback';
  try{
   const view=await request(path,{method:'POST',body:{activityId:id},session});check(epoch,id);posting=false;
   if(reconcileId)return update(view);
   select(view);return update(view);
  }catch(error){
   check(epoch,id);posting=false;
   if(!error.code||['INTERNAL_ERROR','WRITEBACK_BUSY','WRITEBACK_PENDING','WRITEBACK_NOT_PENDING'].includes(error.code)){
    generation++;discovery++;
    const notes=await client.getSource(id,session);if(notes.latestWriteback)return notes.latestWriteback;
   }
   throw error;
  }
 }
 const client={
  reset,
  async importSource(spreadsheetUrl,session){
   reset();sessionKey=signature(session);const epoch=generation;
   try{const view=await request('/preparation/guided-notes',{method:'POST',body:{spreadsheetUrl},session});if(epoch!==generation)throw stale();activityId=view.activityId;return view;}
   catch(error){if(epoch!==generation)throw stale();throw error;}
  },
  async getSource(id,session){
   bind(id,session);const epoch=generation,query=++discovery;
   try{
    const notes=await request('/activity/guided-notes?activityId='+encodeURIComponent(id),{session});check(epoch,id);if(query!==discovery||notes.activityId!==activityId)throw stale();
    if(!posting){const latest=notes.latestWriteback??null;if(latest?.operationId===currentOperationId&&latest)update(latest);else select(latest);}
    return {...notes,latestWriteback:currentOperation};
   }catch(error){check(epoch,id);if(query!==discovery)throw stale();throw error;}
  },
  writeback:(id,session)=>postOperation(id,session),
  reconcile:(id,operationId,session)=>postOperation(id,session,operationId),
  async getOperation(id,operationId,session){
   if(activityId!==id||sessionKey!==signature(session)||operationId!==currentOperationId)throw stale();
   const epoch=generation;
   try{const view=await request('/activity/guided-notes/writebacks/'+encodeURIComponent(operationId)+'?activityId='+encodeURIComponent(id),{session});check(epoch,id);return update(view);}
   catch(error){check(epoch,id);if(operationId!==currentOperationId)throw stale();throw error;}
  }
 };
 return client;
}
