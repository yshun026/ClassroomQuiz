import {AppError} from './errors.js';
const exactBody=(req,key)=>{if(!req.is('application/json')||!req.body||Array.isArray(req.body)||Object.keys(req.body).length!==1||!Object.hasOwn(req.body,key))throw new AppError('INVALID_INPUT');};
export function registerPreparation(app,c){
 const teacher=(req,res,next)=>{try{c.auth.fromRequest(req,'teacher');next();}catch(e){next(e);}};
 app.put('/api/preparation/groups',teacher,(req,res)=>{exactBody(req,'groupCount');c.activity.setGroups(req.body.groupCount);c.sync.changed();res.status(200).json(c.activity.teacherView());});
 app.post('/api/preparation/guided-notes',teacher,async(req,res)=>{exactBody(req,'spreadsheetUrl');await c.activity.loadSource(req.body.spreadsheetUrl,()=>c.auth.fromRequest(req,'teacher'));c.sync.changed();res.status(201).json(c.activity.teacherView());});
}
