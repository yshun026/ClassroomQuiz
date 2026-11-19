import {Activity} from '../models/activity.js';
import {AppError} from '../api/errors.js';
export class ActivityService{
 constructor(store,dispatcher,notes){Object.assign(this,{store,dispatcher,notes});}
 assertPreparation(){if(this.store.activity)throw new AppError('PREPARATION_LOCKED');if(this.store.preparationDraft.busy)throw new AppError('PREPARATION_BUSY');}
 setGroups(groupCount){return this.dispatcher.run(()=>{this.assertPreparation();if(!Number.isSafeInteger(groupCount)||groupCount<1)throw new AppError('INVALID_GROUP_COUNT');this.store.preparationDraft.groupCount=groupCount;return false;});}
 async loadSource(url,authorize=()=>{}){
  const owner=Symbol('preparation');let groups;
  this.dispatcher.run(()=>{authorize();this.assertPreparation();groups=this.store.preparationDraft.groupCount;if(!Number.isSafeInteger(groups)||groups<1)throw new AppError('INVALID_GROUP_COUNT');this.store.preparationDraft.busy=true;this.preparationOwner=owner;});
  try{
   const source=await this.notes.loadSource(url);
   return this.dispatcher.run(()=>{authorize();if(this.preparationOwner!==owner||this.store.activity||this.store.preparationDraft.groupCount!==groups)throw new AppError('PREPARATION_LOCKED');this.store.activity=new Activity(groups,source);return true;});
  }finally{this.dispatcher.run(()=>{if(this.preparationOwner===owner){this.store.preparationDraft.busy=false;this.preparationOwner=null;}});}
 }
 notesView(activityId){
  const a=this.store.activity;if(!a)throw new AppError('ACTIVITY_NOT_READY');if(a.id!==activityId)throw new AppError('STALE_ACTIVITY');
  const s=a.document;if(!s.spreadsheetId)throw new AppError('SOURCE_UNSUPPORTED');
  return {activityId:a.id,source:{title:s.title,url:s.canonicalUrl,supportedSheetCount:s.supportedSheets.size,excludedSheets:s.excludedSheets,writePermission:s.permissionAssessment,permissionMessage:'寫入權限尚未確認；請確認已分享編輯權，讀取成功不保證可寫入'},latestWriteback:null};
 }
 publishedResults(){const a=this.store.activity;if(!a)return [];return [...a.questions.values()].filter(q=>q.closed).map(q=>{const submissions=[...q.submissionsByGroup.values()].sort((x,y)=>x.receiveRank-y.receiveRank).map(s=>({groupNumber:s.groupNumber,answerText:s.answerText,receiveRank:s.receiveRank}));return {questionNumber:q.number,submissions,winnerGroupNumber:submissions[0]?.groupNumber??null,noAnswers:!submissions.length};});}
 teacherView(){const a=this.store.activity,d=this.store.preparationDraft;if(!a)return {prepared:false,groupCount:d.groupCount,documentValidated:false};const q=a.questions.get(a.currentQuestionNumber);return {activityId:a.id,stateRevision:a.stateRevision,phase:a.phase,currentQuestionNumber:a.currentQuestionNumber,questionCount:a.questions.size,publishedResults:this.publishedResults(),groups:[...a.groups.values()].map(g=>({groupNumber:g.number,occupied:!!g.studentSessionId,submitted:q.submissionsByGroup.has(g.number)})),currentSubmissions:[...q.submissionsByGroup.values()].sort((x,y)=>x.receiveRank-y.receiveRank).map(s=>({groupNumber:s.groupNumber,answerText:s.answerText,receiveRank:s.receiveRank}))};}
}
