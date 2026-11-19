import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {preparedQuizFixture,bearer} from '../helpers/quiz.js';
const base='/api/activity/guided-notes',body=f=>({activityId:f.body.activityId});
function close(f){f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText:'expected'});f.c.questions.close(f.teacher,f.body);}
async function pending(){const f=await preparedQuizFixture(1);close(f);f.c.sheetsAccess.writeValues=async()=>({sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'});const op=f.c.writeback.start(f.teacher,f.body.activityId);await f.c.writeback.wait(op.operationId);return {...f,op};}
const path=f=>base+'/writebacks/'+f.op.operationId+'/reconcile';

test('reconcile authenticates each request and uses only existing eligible activity operation',async()=>{
 const f=await pending(),api=request(f.app);
 assert.equal((await api.post(path(f)).send(body(f))).status,401);assert.equal((await api.post(path(f)).set(bearer(f.students[0])).send(body(f))).status,403);
 assert.equal((await api.post(path(f)).set(bearer(f.teacher)).send({activityId:'old'})).body.error.code,'STALE_ACTIVITY');
 assert.equal((await api.post(base+'/writebacks/missing/reconcile').set(bearer(f.teacher)).send(body(f))).body.error.code,'WRITEBACK_NOT_FOUND');
 assert.equal((await api.post(path(f)).set(bearer(f.teacher)).send({...body(f),spreadsheetId:'other'})).status,400);
 const r=await api.post(path(f)).set(bearer(f.teacher)).send(body(f));assert.equal(r.status,202);assert.equal(r.body.operationId,f.op.operationId);await f.c.writeback.wait(f.op.operationId);assert.equal(f.c.writeback.latest(f.teacher,f.body.activityId).status,'PENDING_VERIFICATION');
 const fresh=await api.post(base+'/writeback').set(bearer(f.teacher)).send(body(f));assert.equal(fresh.status,409);assert.equal(fresh.body.error.details.operationId,f.op.operationId);
});

test('two teacher sessions cannot reconcile or write concurrently; GET remains local',async()=>{
 const f=await pending(),second=f.c.auth.issue('teacher').token,api=request(f.app);let release;const gate=new Promise(r=>{release=r;});const read=f.c.sheetsAccess.getSource.bind(f.c.sheetsAccess);let reads=0;f.c.sheetsAccess.getSource=async(...a)=>{reads++;await gate;return read(...a);};
 const r=await api.post(path(f)).set(bearer(f.teacher)).send(body(f));assert.equal(r.status,202);
 for(const url of [path(f),base+'/writeback']){const busy=await api.post(url).set(bearer(second)).send(body(f));assert.equal(busy.status,409);assert.equal(busy.body.error.code,'WRITEBACK_BUSY');assert.equal(busy.body.error.details.operationId,f.op.operationId);}
 assert.equal((await api.get(base+'/writebacks/'+f.op.operationId).query(body(f)).set(bearer(second))).status,200);assert.equal(reads,1);release();await f.c.writeback.wait(f.op.operationId);
});

test('lost write POST response keeps worker; apply plus failed verify recovers without resending',async()=>{
 const f=await preparedQuizFixture(1);close(f);const verify=f.c.sheetsAccess.verify.bind(f.c.sheetsAccess);f.c.sheetsAccess.verify=async()=>{throw Error('private upstream');};
 const json=f.app.response.json;f.app.response.json=function(value){if(this.statusCode===202){this.destroy();return this;}return json.call(this,value);};
 await assert.rejects(request(f.app).post(base+'/writeback').set(bearer(f.teacher)).send(body(f)));
 f.app.response.json=json;const op=f.c.writeback.latest(f.teacher,f.body.activityId);assert(op);await f.c.writeback.wait(op.operationId);assert.equal(f.c.writeback.latest(f.teacher,f.body.activityId).status,'PENDING_VERIFICATION');
 f.c.sheetsAccess.verify=verify;const r=await request(f.app).post(base+'/writebacks/'+op.operationId+'/reconcile').set(bearer(f.teacher)).send(body(f));assert.equal(r.status,202);await f.c.writeback.wait(op.operationId);assert.equal(f.c.writeback.latest(f.teacher,f.body.activityId).status,'SUCCEEDED');assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,1);
 assert.equal((await request(f.app).post(base+'/writebacks/'+op.operationId+'/reconcile').set(bearer(f.teacher)).send(body(f))).body.error.code,'WRITEBACK_NOT_PENDING');
});

test('in-flight matching readback remains busy until settle; settled unknown markers stay read-only',async()=>{
 for(const applied of [true,false]){
  const f=await preparedQuizFixture(1);close(f);let settle,sends=0;const whenTransportSettled=new Promise(r=>{settle=r;});const original=f.c.sheetsAccess.writeValues.bind(f.c.sheetsAccess);f.c.sheetsAccess.writeValues=async(...a)=>{sends++;if(applied)await original(...a);return {sent:true,transportState:'IN_FLIGHT',remoteOutcome:'UNKNOWN',whenTransportSettled};};
  const op=f.c.writeback.start(f.teacher,f.body.activityId);await f.c.writeback.wait(op.operationId);
  const url=base+'/writebacks/'+op.operationId+'/reconcile';assert.equal((await request(f.app).post(url).set(bearer(f.teacher)).send(body(f))).body.error.code,'WRITEBACK_BUSY');settle();await new Promise(r=>setImmediate(r));
  if(applied)assert.equal(f.c.writeback.latest(f.teacher,f.body.activityId).status,'SUCCEEDED');else{assert.equal((await request(f.app).post(url).set(bearer(f.teacher)).send(body(f))).status,202);await f.c.writeback.wait(op.operationId);assert.equal(f.c.writeback.latest(f.teacher,f.body.activityId).status,'PENDING_VERIFICATION');}
  assert.equal(sends,1);
 }
});
