import {randomUUID} from 'node:crypto';
import {immutable} from './guided-notes-source.js';

export const OPERATION_STATUSES=Object.freeze(['PRECHECKING','WRITING','VERIFYING','PENDING_VERIFICATION','SUCCEEDED','NO_CHANGES','FAILED','CONFLICT']);
export class ClosedWinnerSnapshot{
 constructor(activity){
  const fills=[];
  for(const q of [...activity.questions.values()].sort((a,b)=>a.number-b.number))if(q.closed){
   const winner=[...q.submissionsByGroup.values()].reduce((first,s)=>!first||s.receiveRank<first.receiveRank?s:first,null);
   if(winner)fills.push({questionNumber:q.number,location:{...activity.document.placeholderLocations.get(q.number)},answerText:winner.answerText});
  }
  Object.assign(this,{activityId:activity.id,sourceId:activity.document.spreadsheetId,capturedAt:new Date().toISOString(),fills});immutable(this);
 }
}
export const captureClosedWinners=activity=>new ClosedWinnerSnapshot(activity);
export class WritebackItem{
 constructor(fill){Object.assign(this,{questionNumber:fill.questionNumber,location:fill.location,expectedText:fill.answerText,state:'UNKNOWN',safeReason:null});}
}
export class WriteAttempt{
 constructor(numbers){Object.assign(this,{id:randomUUID(),sent:false,transportState:'NOT_SENT',remoteOutcome:'NOT_SENT',targetQuestionNumbers:Object.freeze([...numbers]),startedAt:new Date().toISOString(),endedAt:null});}
}
export class WritebackOperation{
 constructor(snapshot){Object.assign(this,{id:randomUUID(),activityId:snapshot.activityId,status:'PRECHECKING',revision:1,kind:'INITIAL',snapshot,items:new Map(snapshot.fills.map(fill=>[fill.questionNumber,new WritebackItem(fill)])),running:true,unresolvedAttempt:false,lastError:null,attempts:[]});}
}
