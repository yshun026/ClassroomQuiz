import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import ExcelJS from 'exceljs';
import {exportFixture} from '../helpers/export.js';
import {quizFixture,bearer} from '../helpers/quiz.js';
const path='/api/activity/guided-notes/export';

test('HTTP export preserves escape-like text and line endings; unrepresentable text fails without mutation',async()=>{
 for(const answerText of ['_x0041_\r\nline\u0001','=SUM(A1:A2)','bad\ud800']){
  const f=await exportFixture();f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText});f.c.questions.close(f.teacher,f.body);const before=f.c.activity.teacherView();
  const response=await request(f.app).get(path).query({activityId:f.c.store.activity.id}).set(bearer(f.teacher)).buffer(true).parse((res,cb)=>{const chunks=[];res.on('data',x=>chunks.push(x));res.on('end',()=>cb(null,Buffer.concat(chunks)));});
  if(answerText.includes('\ud800')){assert.equal(response.status,500);assert.equal(JSON.parse(response.body.toString()).error.code,'EXPORT_FAILED');}
  else{assert.equal(response.status,200);const w=new ExcelJS.Workbook();await w.xlsx.load(response.body);assert.equal(w.getWorksheet('Notes').getCell('B3').value,answerText);}
  assert.deepEqual(f.c.activity.teacherView(),before);assert(f.source.equals(f.c.store.activity.document.originalBuffer));
 }
});
test('export checks teacher and activity before conversion',async()=>{
 const f=await exportFixture(),api=request(f.app),id=f.c.store.activity.id;
 assert.equal((await api.get(path).query({activityId:id})).status,401);assert.equal((await api.get(path).query({activityId:id}).set(bearer(f.students[0]))).status,403);
 assert.equal((await api.get(path).query({activityId:'old'}).set(bearer(f.teacher))).body.error.code,'STALE_ACTIVITY');
 const empty=quizFixture();empty.c.store.activity=null;assert.equal((await request(empty.app).get(path).set(bearer(empty.teacher))).body.error.code,'ACTIVITY_NOT_READY');
});
test('teacher downloads in all four phases without mutating activity or original workbook',async()=>{
 const f=await exportFixture(),a=f.c.store.activity,api=request(f.app);
 for(const phase of ['WAITING','ANSWERING','RESULTS','COMPLETED']){
  if(phase==='ANSWERING')f.c.questions.start(f.teacher,f.body);
  if(phase==='RESULTS')f.c.questions.close(f.teacher,f.body);
  if(phase==='COMPLETED')for(const n of [2,3]){f.c.questions.next(f.teacher,{...f.body,questionNumber:n-1});f.c.questions.start(f.teacher,{...f.body,questionNumber:n});f.c.questions.close(f.teacher,{...f.body,questionNumber:n});}
  const before=f.c.activity.teacherView();for(let i=0;i<2;i++){const r=await api.get(path).query({activityId:a.id}).set(bearer(f.teacher));assert.equal(r.status,200);assert.match(r.headers['content-type'],/application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/);assert.match(r.headers['content-disposition'],/attachment; filename="?ClassroomQuiz-guided-notes.xlsx"?/);assert(!('etag'in r.headers));}
  assert.deepEqual(f.c.activity.teacherView(),before);assert(f.source.equals(a.document.originalBuffer));
 }
});
test('conversion and response failure keep activity and original intact',async()=>{
 const f=await exportFixture(),before=f.c.activity.teacherView(),api=request(f.app),original=f.notes.renderExport;
 f.notes.renderExport=async()=>{throw Error('private answer stack must not leak');};
 const failed=await api.get(path).query({activityId:f.c.store.activity.id}).set(bearer(f.teacher));assert.equal(failed.status,500);assert.equal(failed.body.error.code,'EXPORT_FAILED');assert(!JSON.stringify(failed.body).includes('private answer'));
 f.notes.renderExport=original;
 const handler=f.app.response.send;f.app.response.send=function(body){if(Buffer.isBuffer(body))throw Error('response failed');return handler.call(this,body);};
 const response=await api.get(path).query({activityId:f.c.store.activity.id}).set(bearer(f.teacher));assert.equal(response.status,500);
 assert.deepEqual(f.c.activity.teacherView(),before);assert(f.source.equals(f.c.store.activity.document.originalBuffer));
});
