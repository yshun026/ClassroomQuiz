import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {quizFixture,bearer} from '../helpers/quiz.js';
const path='/api/activity/guided-notes/export';

test('retired export authenticates first and never accepts an arbitrary or missing activity',async()=>{
 const f=quizFixture(3),api=request(f.app),id=f.c.store.activity.id;
 assert.equal((await api.get(path).query({activityId:id})).status,401);
 assert.equal((await api.get(path).query({activityId:id}).set(bearer(f.students[0]))).status,403);
 assert.equal((await api.get(path).query({activityId:'old'}).set(bearer(f.teacher))).body.error.code,'EXCEL_FLOW_RETIRED');
 f.c.store.activity=null;
 assert.equal((await api.get(path).set(bearer(f.teacher))).body.error.code,'EXCEL_FLOW_RETIRED');
});

test('retired export returns JSON 410 in all four phases with no cloud calls or quiz mutations',async()=>{
 const f=quizFixture(3),api=request(f.app),a=f.c.store.activity;
 for(const phase of ['WAITING','ANSWERING','RESULTS','COMPLETED']){
  if(phase==='ANSWERING')f.c.questions.start(f.teacher,f.body);
  if(phase==='RESULTS')f.c.questions.close(f.teacher,f.body);
  if(phase==='COMPLETED')for(const n of [2,3]){f.c.questions.next(f.teacher,{...f.body,questionNumber:n-1});f.c.questions.start(f.teacher,{...f.body,questionNumber:n});f.c.questions.close(f.teacher,{...f.body,questionNumber:n});}
  const before=f.c.activity.teacherView(),source=structuredClone(f.c.sheetsAccess.documents.get('synthetic-quiz'));
  for(let i=0;i<2;i++){
   const r=await api.get(path).query({activityId:a.id}).set(bearer(f.teacher));
   assert.equal(r.status,410);assert.equal(r.body.error.code,'EXCEL_FLOW_RETIRED');assert.match(r.headers['content-type'],/application\/json/);
   assert(!('content-disposition'in r.headers));assert(!('etag'in r.headers));assert.match(r.body.error.requestId,/^[0-9a-f-]{36}$/);
  }
  assert.deepEqual(f.c.activity.teacherView(),before);assert.deepEqual(f.c.sheetsAccess.documents.get('synthetic-quiz'),source);assert.equal(f.c.sheetsAccess.calls.length,0);
 }
});

test('retired HTTP never invokes legacy conversion or emits binary bytes/private errors',async()=>{
 const f=quizFixture(1),api=request(f.app),before=f.c.activity.teacherView();let conversions=0;
 for(const name of ['validateAndImport','renderExport','exportClosedWinnerSnapshot']){
  assert.equal(typeof f.c.activity.notes[name],'undefined');
  f.c.activity.notes[name]=()=>{conversions++;throw Error('private conversion details must not leak');};
 }
 const send=f.app.response.send;f.app.response.send=function(body){if(Buffer.isBuffer(body))throw Error('binary output forbidden');return send.call(this,body);};
 const response=await api.get(path).query({activityId:f.body.activityId}).set(bearer(f.teacher));
 assert.equal(response.status,410);assert.equal(response.body.error.code,'EXCEL_FLOW_RETIRED');assert(!JSON.stringify(response.body).includes('private conversion'));assert.equal(conversions,0);
 assert.deepEqual(f.c.activity.teacherView(),before);assert.equal(f.c.sheetsAccess.calls.length,0);
});
