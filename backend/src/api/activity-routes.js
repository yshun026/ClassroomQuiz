export function registerActivity(app,c){app.get('/api/activity',(req,res)=>{const session=c.auth.fromRequest(req);res.json(c.sync.resumeView(session));});}
