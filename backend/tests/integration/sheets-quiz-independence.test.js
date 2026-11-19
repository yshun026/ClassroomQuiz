import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {preparedQuizFixture,bearer} from '../helpers/quiz.js';
import {AppError} from '../../src/api/errors.js';
import {createServer} from 'node:http';
import {io as client} from 'socket.io-client';
import {setTimeout as delay} from 'node:timers/promises';
import {attachRealtime} from '../../src/realtime/socket-server.js';

for(const fault of ['unavailable','pending-read','pending-write'])test(`loaded quiz completes three questions independent of Google ${fault}`,async()=>{
 const f=await preparedQuizFixture(3),access=f.c.sheetsAccess,api=request(f.app),t=bearer(f.teacher);
 const initialCalls=access.calls.length;assert.equal(initialCalls,1);
 let cloudCalls=0,release,settled=false;
 const held=new Promise(resolve=>{release=resolve;});
 // Faults are confined to Access. No writeback coordinator or business endpoint is added.
 access.getSource=async()=>{cloudCalls++;if(fault==='pending-read')await held;throw new AppError('SHEETS_UNAVAILABLE');};
 access.writeValues=async()=>{cloudCalls++;await held;return {sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'};};
 const pending=(fault==='pending-write'?access.writeValues('synthetic-quiz',[],'fault-only'):access.getSource('synthetic-quiz')).catch(e=>({code:e.code})).finally(()=>{settled=true;});
 const ownBefore=f.c.sync.studentView(f.c.auth.validate(f.students[1]));
 const teacherRevision=f.c.store.activity.stateRevision;
 await Promise.resolve();
 assert.equal(f.c.store.activity.stateRevision,teacherRevision);
 assert.deepEqual(f.c.sync.studentView(f.c.auth.validate(f.students[1])),ownBefore);
 for(let n=1;n<=3;n++){
  const body={...f.body,questionNumber:n};
  const started=f.c.questions.start(f.teacher,body);assert(!(started instanceof Promise),'start must remain synchronous');f.c.sync.changed();
  const observer=f.c.sync.studentView(f.c.auth.validate(f.students[2]));
  const submitted=await Promise.all(f.students.slice(0,2).map((token,i)=>api.post('/api/activity/submissions').set(bearer(token)).send({...body,answerText:`q${n}-g${i+1}`,timestamp:2-i})));
  assert(submitted.every(r=>r.status===201));
  assert.deepEqual(f.c.sync.studentView(f.c.auth.validate(f.students[2])),observer);
  assert(!/synthetic-quiz|supportedSheets|permissionAssessment|operationRevision/.test(JSON.stringify(observer)));
  const q=f.c.store.activity.questions.get(n);assert.deepEqual([...q.submissionsByGroup.values()].map(s=>s.receiveRank),[1,2]);
  assert.equal((await api.post('/api/activity/submissions').set(bearer(f.students[0])).send({...body,answerText:'duplicate'})).body.error.code,'DUPLICATE_SUBMISSION');
  const closed=f.c.questions.close(f.teacher,body);assert(!(closed instanceof Promise),'close must remain synchronous');f.c.sync.changed();
  assert.equal((await api.post('/api/activity/submissions').set(bearer(f.students[2])).send({...body,answerText:'after-close'})).status,409);
  assert.throws(()=>f.c.questions.start(f.teacher,body),{code:'PHASE_CONFLICT'});
  if(n<3){f.c.questions.next(f.teacher,body);f.c.sync.changed();assert.equal(f.c.store.activity.phase,'WAITING');}
 }
 assert.equal(f.c.store.activity.phase,'COMPLETED');assert.equal(f.c.activity.publishedResults().length,3);
 assert.equal(cloudCalls,1,'quiz commands never invoke any extra Google requests');
 if(fault!=='unavailable')assert.equal(settled,false,'quiz completes while Google request is unresolved');
 const before=f.c.activity.teacherView(),own=f.c.sync.studentView(f.c.auth.validate(f.students[1]));
 release();await pending;
 assert.deepEqual(f.c.activity.teacherView(),before);assert.deepEqual(f.c.sync.studentView(f.c.auth.validate(f.students[1])),own);
 assert.equal(access.calls.length,initialCalls);
});

for(const heldPhase of ['preflight','write','reconcile'])test(`real coordinator ${heldPhase} waiting preserves three-group ranking, privacy and <=2s Socket sync`,async()=>{
 const f=await preparedQuizFixture(3),api=request(f.app),t=bearer(f.teacher),sockets=[],server=createServer(f.app),io=attachRealtime(server,f.c);
 let release;try{
  f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText:'Q1 original'});f.c.questions.close(f.teacher,f.body);
  await new Promise(r=>server.listen(0,'localhost',r));
  async function connect(token){const socket=client('http://localhost:'+server.address().port,{auth:{token},extraHeaders:{Origin:f.c.config.origin},transports:['websocket'],reconnection:false,autoConnect:false}),views=[];sockets.push(socket);socket.on('state:snapshot',v=>views.push(v));await new Promise((resolve,reject)=>{socket.once('state:snapshot',resolve);socket.once('connect_error',reject);socket.connect();});return {socket,views};}
  const teacher=await connect(f.teacher),students=await Promise.all(f.students.map(connect));
  let op;
  if(heldPhase==='reconcile'){f.c.sheetsAccess.writeValues=async()=>({sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'});op=f.c.writeback.start(f.teacher,f.body.activityId);await f.c.writeback.wait(op.operationId);}
  const gate=new Promise(r=>{release=r;});let entered;const started=new Promise(r=>{entered=r;});
  const access=f.c.sheetsAccess,method=heldPhase==='write'?'writeValues':'getSource',original=access[method].bind(access);
  access[method]=async(...args)=>{entered();await gate;return original(...args);};
  const beforeTeacher=f.c.activity.teacherView(),beforeStudents=f.students.map(token=>f.c.sync.studentView(f.c.auth.validate(token))),counts=students.map(s=>s.views.length);
  op=heldPhase==='reconcile'?f.c.writeback.reconcile(f.teacher,f.body.activityId,op.operationId):f.c.writeback.start(f.teacher,f.body.activityId);await started;
  assert.deepEqual(f.c.activity.teacherView(),beforeTeacher);assert.deepEqual(f.students.map(token=>f.c.sync.studentView(f.c.auth.validate(token))),beforeStudents);assert.deepEqual(students.map(s=>s.views.length),counts);
  async function command(name,b){const at=Date.now();assert.equal((await api.post('/api/activity/questions/'+name).set(t).send(b)).status,200);await delay(35);assert(Date.now()-at<2000);assert(students.every(s=>s.views.at(-1).phase===f.c.store.activity.phase));assert.equal(teacher.views.at(-1).phase,f.c.store.activity.phase);}
  await command('next',f.body);
  for(const n of [2,3]){
   const b={...f.body,questionNumber:n};await command('start',b);
   const observer=students[2].views.length,at=Date.now();
   const answers=await Promise.all(f.students.slice(0,2).map((token,i)=>api.post('/api/activity/submissions').set(bearer(token)).send({...b,answerText:`private-${n}-${i}`,timestamp:2-i})));
   assert(answers.every(r=>r.status===201));await delay(35);assert(Date.now()-at<2000);assert.equal(students[2].views.length,observer);assert.equal(teacher.views.at(-1).currentSubmissions.length,2);
   assert.deepEqual([...f.c.store.activity.questions.get(n).submissionsByGroup.values()].map(s=>s.receiveRank),[1,2]);
   assert.equal((await api.post('/api/activity/submissions').set(bearer(f.students[0])).send({...b,answerText:'duplicate'})).body.error.code,'DUPLICATE_SUBMISSION');
   const submit=()=>api.post('/api/activity/submissions').set(bearer(f.students[2])).send({...b,answerText:'racing'}),close=()=>api.post('/api/activity/questions/close').set(t).send(b);
   const race=await Promise.all(n===2?[submit(),close()]:[close(),submit()]);const submitted=race[n===2?0:1],closed=race[n===2?1:0];assert.equal(closed.status,200);assert([201,409].includes(submitted.status));
   const q=f.c.store.activity.questions.get(n);assert.equal(q.submissionsByGroup.has(3),submitted.status===201);assert.deepEqual([...q.submissionsByGroup.values()].map(s=>s.receiveRank),Array.from({length:q.submissionsByGroup.size},(_,i)=>i+1));
   assert.equal((await submit()).status,409);await delay(35);assert(students.every(s=>s.views.at(-1).phase===f.c.store.activity.phase));
   if(n===2)await command('next',b);
  }
  assert.equal(f.c.store.activity.phase,'COMPLETED');const before=f.c.activity.teacherView(),views=f.students.map(token=>f.c.sync.studentView(f.c.auth.validate(token))),events=students.map(s=>s.views.length);
  release();await f.c.writeback.wait(op.operationId);await delay(35);assert.deepEqual(f.c.activity.teacherView(),before);assert.deepEqual(f.students.map(token=>f.c.sync.studentView(f.c.auth.validate(token))),views);assert.deepEqual(students.map(s=>s.views.length),events);
  for(const s of students)for(const v of s.views)assert(!/spreadsheetId|permissionAssessment|operationRevision|latestWriteback|synthetic-quiz/.test(JSON.stringify(v)));
 }finally{release?.();sockets.forEach(s=>s.disconnect());await new Promise(r=>io.close(r));if(server.listening)await new Promise(r=>server.close(r));}
});

test('late source reply for old operation cannot acquire replacement activity ownership',async()=>{
 const f=await preparedQuizFixture(1);f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText:'old'});f.c.questions.close(f.teacher,f.body);
 let release;const gate=new Promise(r=>{release=r;}),read=f.c.sheetsAccess.getSource.bind(f.c.sheetsAccess);f.c.sheetsAccess.getSource=async(...args)=>{await gate;return read(...args);};
 const op=f.c.writeback.start(f.teacher,f.body.activityId),replacement=await preparedQuizFixture(2);f.c.store.activity=replacement.c.store.activity;const before=f.c.activity.teacherView();release();await f.c.writeback.wait(op.operationId);
 assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,0);assert.deepEqual(f.c.activity.teacherView(),before);assert.throws(()=>f.c.writeback.get(f.teacher,f.body.activityId,op.operationId),{code:'STALE_ACTIVITY'});
});
