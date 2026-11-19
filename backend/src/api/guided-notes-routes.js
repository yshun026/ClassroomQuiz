import {AppError} from './errors.js';
export function registerGuidedNotes(app,c){
 const teacher=req=>{c.auth.fromRequest(req,'teacher');return req.headers.authorization.slice(7);};
 app.get('/api/activity/guided-notes',(req,res)=>{
  const token=teacher(req);if(Object.keys(req.query).length!==1||typeof req.query.activityId!=='string')throw new AppError('INVALID_INPUT');
  res.json({...c.activity.notesView(req.query.activityId),latestWriteback:c.writeback.latest(token,req.query.activityId)});
 });
 app.post('/api/activity/guided-notes/writeback',(req,res)=>{
  const token=teacher(req);
  if(!req.is('application/json')||!req.body||Array.isArray(req.body)||Object.keys(req.body).length!==1||typeof req.body.activityId!=='string')throw new AppError('INVALID_INPUT');
  const view=c.writeback.start(token,req.body.activityId);res.status(view.status==='NO_CHANGES'?200:202).json(view);
 });
 app.get('/api/activity/guided-notes/writebacks/:operationId',(req,res)=>{
  const token=teacher(req);if(Object.keys(req.query).length!==1||typeof req.query.activityId!=='string')throw new AppError('INVALID_INPUT');
  res.json(c.writeback.get(token,req.query.activityId,req.params.operationId));
 });
 app.post('/api/activity/guided-notes/writebacks/:operationId/reconcile',(req,res)=>{
  const token=teacher(req);
  if(!req.is('application/json')||!req.body||Array.isArray(req.body)||Object.keys(req.body).length!==1||typeof req.body.activityId!=='string')throw new AppError('INVALID_INPUT');
  res.status(202).json(c.writeback.reconcile(token,req.body.activityId,req.params.operationId));
 });
 app.get('/api/activity/guided-notes/export',(req,res)=>{teacher(req);throw new AppError('EXCEL_FLOW_RETIRED');});
}
