import {AppError} from './errors.js';
export function registerGroups(app,c){
 app.get('/api/activity/join-options',(req,res)=>{const a=c.store.activity;if(!a)throw new AppError('ACTIVITY_NOT_READY');const groups=[...a.groups.values()];res.json({activityId:a.id,phase:a.phase,currentQuestionNumber:a.currentQuestionNumber,availableGroupNumbers:groups.filter(g=>!g.studentSessionId).map(g=>g.number),occupiedGroupNumbers:groups.filter(g=>g.studentSessionId).map(g=>g.number)});});
 app.post('/api/activity/groups/claim',(req,res)=>{const authorization=req.headers.authorization;const token=authorization?c.auth.fromRequest(req,'student')&&authorization.slice(7):null;const result=c.dispatcher.run(()=>c.auth.claimGroup(req.body?.activityId,req.body?.groupNumber,token));const view=c.sync.studentView(result.session);res.status(result.created?201:200).json({...(result.token?{token:result.token}:{}),role:'student',groupNumber:result.session.groupNumber,view});});
}
