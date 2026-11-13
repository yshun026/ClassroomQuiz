import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createServer} from 'node:http';
import {io as client} from 'socket.io-client';
import {setTimeout as delay} from 'node:timers/promises';
import {quizFixture,bearer} from '../helpers/quiz.js';
import {attachRealtime} from '../../src/realtime/socket-server.js';

test('three questions advance only from RESULTS; preserve history, reject stale commands and final next',async()=>{
 const f=quizFixture(3),api=request(f.app),t=bearer(f.teacher),s=bearer(f.students[0]);
 const command=(op,number)=>api.post('/api/activity/questions/'+op).set(t).send({...f.body,questionNumber:number});
 for(let n=1;n<=3;n++){
  const revision=f.c.store.activity.stateRevision;
  assert.equal((await command('next',n)).status,409);assert.equal(f.c.store.activity.stateRevision,revision);
  assert.equal((await api.post('/api/activity/questions/next').set(s).send({...f.body,questionNumber:n})).status,403);
  assert.equal((await command('start',n)).status,200);assert.equal((await command('next',n)).status,409);
  if(n!==2)assert.equal((await api.post('/api/activity/submissions').set(s).send({...f.body,questionNumber:n,answerText:'answer-'+n})).status,201);
  assert.equal((await command('close',n)).body.phase,n===3?'COMPLETED':'RESULTS');
  const before=f.c.store.activity.stateRevision;
  assert.equal((await command('start',n)).status,409);
  if(n<3){const next=await command('next',n);assert.equal(next.status,200);assert.equal(next.body.phase,'WAITING');assert.equal(next.body.currentQuestionNumber,n+1);assert.equal(next.body.stateRevision,before+1);
   assert.equal((await command('next',n)).body.error.code,'STALE_QUESTION');
   assert.equal((await api.post('/api/activity/submissions').set(s).send({...f.body,questionNumber:n,answerText:'old'})).body.error.code,'STALE_QUESTION');
   assert.equal((await command('start',n+2)).body.error.code,'STALE_QUESTION');
  }else assert.equal((await command('next',n)).status,409);
 }
 const view=(await api.get('/api/activity').set(s)).body;assert.equal(view.publishedResults.length,3);assert.equal(view.publishedResults[0].submissions[0].answerText,'answer-1');assert.equal(view.publishedResults[1].noAnswers,true);
});

test('reauthenticated reconnect restores four phases without revision changes or observer side channels',async()=>{
 const f=quizFixture(3),api=request(f.app),server=createServer(f.app),io=attachRealtime(server,f.c),sockets=[];
 await new Promise(r=>server.listen(0,'localhost',r));
 async function connect(token){const socket=client('http://localhost:'+server.address().port,{auth:{token},transports:['websocket'],reconnection:false,autoConnect:false});sockets.push(socket);const views=[],events=[];socket.onAny(name=>events.push(name));socket.on('state:snapshot',v=>views.push(v));await new Promise((resolve,reject)=>{socket.once('state:snapshot',resolve);socket.once('connect_error',reject);socket.connect();});return {socket,views,events};}
 const command=(op,n)=>api.post('/api/activity/questions/'+op).set(bearer(f.teacher)).send({...f.body,questionNumber:n});
 try{
  for(const phase of ['WAITING','ANSWERING','RESULTS','COMPLETED']){
   if(phase==='ANSWERING')await command('start',1);
   if(phase==='RESULTS')await command('close',1);
   if(phase==='COMPLETED'){await command('next',1);await command('start',2);await command('close',2);await command('next',2);await command('start',3);await command('close',3);}
   // Make an actual vacant group for a new late-joining identity, not a production reset endpoint.
   const old=f.c.auth.validate(f.students[2]);f.c.store.sessionsByTokenHash.delete(old.tokenHash);f.c.store.activity.groups.get(3).studentSessionId=null;
   const joined=await api.post('/api/activity/groups/claim').send({...f.body,groupNumber:3});assert.equal(joined.status,201);f.students[2]=joined.body.token;assert.equal(joined.body.view.phase,phase);
   const before=(await api.get('/api/activity').set(bearer(f.students[1]))).body;
   let observer=await connect(f.students[1]);assert.deepEqual(observer.views[0],before);observer.socket.disconnect();observer=await connect(f.students[1]);assert.deepEqual(observer.views[0],before);
   const ack=await new Promise(r=>observer.socket.emit('state:request',{},r));assert.deepEqual(ack.view,before);
   if(phase==='ANSWERING'){
    const count=observer.views.length,eventCount=observer.events.length;await api.post('/api/activity/submissions').set(bearer(f.students[0])).send({...f.body,answerText:'secret'});await delay(80);
    assert.equal(observer.views.length,count);assert.equal(observer.events.length,eventCount);const response=await api.get('/api/activity').set(bearer(f.students[1]));assert.deepEqual(response.body,before);assert(!/stateRevision|commandSequence/.test(JSON.stringify([response.body,response.headers])));
    assert.deepEqual((await new Promise(r=>observer.socket.emit('state:request',{},r))).view,before);
   }
   observer.socket.disconnect();
  }
  const active=await connect(f.students[1]);const invalid=new Promise(r=>active.socket.once('session:invalid',r));f.c.store.sessionsByTokenHash.clear();f.c.sync.changed();assert.equal((await invalid).code,'SESSION_INVALID');
  await assert.rejects(connect(f.students[0]),e=>e.data.code==='SESSION_INVALID');
  const fresh=quizFixture(3);assert.equal((await request(fresh.app).get('/api/activity').set(bearer(f.students[0]))).status,401);
 }finally{sockets.forEach(s=>s.disconnect());await new Promise(r=>io.close(r));}
});
