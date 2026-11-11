import {Activity} from '../models/activity.js';
import {AppError} from '../api/errors.js';
export class ActivityService{
 constructor(store,dispatcher,notes){Object.assign(this,{store,dispatcher,notes});}
 assertPreparation(){if(this.store.activity)throw new AppError('PREPARATION_LOCKED');if(this.store.preparationDraft.busy)throw new AppError('PREPARATION_BUSY');}
 commit(){const d=this.store.preparationDraft;if(d.groupCount&&d.document){this.store.activity=new Activity(d.groupCount,d.document);return true;}return false;}
 setGroups(groupCount){return this.dispatcher.run(()=>{this.assertPreparation();if(!Number.isSafeInteger(groupCount)||groupCount<1)throw new AppError('INVALID_GROUP_COUNT');this.store.preparationDraft.groupCount=groupCount;return this.commit();});}
 async import(buffer,filename){this.dispatcher.run(()=>{this.assertPreparation();this.store.preparationDraft.busy=true;});try{const document=await this.notes.validateAndImport(buffer,filename);return this.dispatcher.run(()=>{this.store.preparationDraft.document=document;return this.commit();});}finally{this.store.preparationDraft.busy=false;}}
 teacherView(){const a=this.store.activity,d=this.store.preparationDraft;if(!a)return {prepared:false,groupCount:d.groupCount,documentValidated:!!d.document};return {activityId:a.id,stateRevision:a.stateRevision,phase:a.phase,currentQuestionNumber:a.currentQuestionNumber,questionCount:a.questions.size,publishedResults:[],groups:[...a.groups.values()].map(g=>({groupNumber:g.number,occupied:!!g.studentSessionId,submitted:false})),currentSubmissions:[]};}
}
