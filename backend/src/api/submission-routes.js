export function registerSubmissions(app,c){
  app.post('/api/activity/submissions',(req,res)=>{
    c.auth.fromRequest(req,'student');
    res.status(201).json(c.submissions.submit(req.headers.authorization.slice(7),req.body));
  });
}
