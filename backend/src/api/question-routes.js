import {AppError} from './errors.js';
export function registerQuestions(app,c){
  for(const operation of ['start','close','next'])app.post('/api/activity/questions/'+operation,(req,res)=>{
    const session=c.auth.fromRequest(req,'teacher');
    // The service revalidates Token and state in the shared synchronous command boundary.
    const token=req.headers.authorization.slice(7);
    res.json(c.questions[operation](token,req.body));
  });
  app.get('/api/activity/questions/:number/results',(req,res)=>{
    const session=c.auth.fromRequest(req);if(session.role==='student')c.auth.validateBinding(session);
    const a=c.store.activity;if(!a)throw new AppError('ACTIVITY_NOT_READY');
    const n=Number(req.params.number);if(!Number.isSafeInteger(n)||!a.questions.has(n))throw new AppError('QUESTION_NOT_FOUND');
    if(!a.questions.get(n).closed)throw new AppError('QUESTION_NOT_CLOSED');
    res.json(c.activity.publishedResults().find(r=>r.questionNumber===n));
  });
}
