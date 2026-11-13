import {AppError} from './errors.js';
export function registerGuidedNotes(app,c){
 app.get('/api/activity/guided-notes/export',async(req,res,next)=>{
  try{
   c.auth.fromRequest(req,'teacher');
   const snapshot=c.activity.notes.exportClosedWinnerSnapshot(c,req.headers.authorization.slice(7),req.query.activityId);
   try{
    const output=await c.activity.notes.renderExport(snapshot);
    if(req.aborted||res.destroyed)return;
    res.attachment('ClassroomQuiz-guided-notes.xlsx');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(output);
   }catch{if(!res.headersSent){res.removeHeader('Content-Disposition');res.type('application/json');throw new AppError('EXPORT_FAILED');}}
  }catch(e){next(e);}
 });
}
