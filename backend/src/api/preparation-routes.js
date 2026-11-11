import multer from 'multer';
import {AppError} from './errors.js';
const upload=multer({storage:multer.memoryStorage()});
export function registerPreparation(app,c){
 const teacher=(req,res,next)=>{try{c.auth.fromRequest(req,'teacher');next();}catch(e){next(e);}};
 app.put('/api/preparation/groups',teacher,(req,res)=>{const committed=c.activity.setGroups(req.body?.groupCount);res.status(committed?201:200).json(c.activity.teacherView());});
 app.post('/api/preparation/guided-notes',teacher,upload.single('file'),async(req,res)=>{if(!req.file)throw new AppError('FILE_UNREADABLE');const committed=await c.activity.import(req.file.buffer,req.file.originalname);res.status(committed?201:200).json(c.activity.teacherView());});
}
