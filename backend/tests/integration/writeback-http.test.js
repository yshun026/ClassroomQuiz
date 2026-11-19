import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {preparedQuizFixture,bearer} from '../helpers/quiz.js';
import {createApp} from '../../src/app.js';
import {createFakeSheetsAccess} from '../helpers/fake-sheets-access.js';
import {syntheticSheetA,syntheticSheetB} from '../../../tests/fixtures/google-sheets/sources.js';
import {loadConfig} from '../../src/config.js';
import {randomBytes} from 'node:crypto';
const path='/api/activity/guided-notes/writeback';
async function write(f){return request(f.app).post(path).set(bearer(f.teacher)).send({activityId:f.body.activityId});}
function close(f,n=1,text='=1+2\n中文😀'){
 const body={...f.body,questionNumber:n};f.c.questions.start(f.teacher,body);f.c.submissions.submit(f.students[0],{...body,answerText:text});f.c.questions.close(f.teacher,body);
}
test('no eligible answers means zero remote I/O and authenticated 200 NO_CHANGES',async()=>{
 const f=await preparedQuizFixture(3),before=f.c.sheetsAccess.calls.length,r=await write(f);assert.equal(r.status,200);assert.equal(r.body.status,'NO_CHANGES');assert.equal(f.c.sheetsAccess.calls.length,before);
});
test('manual exact write requires readback; preserves other cells, formats, phase/ranks and private student view',async()=>{
 const f=await preparedQuizFixture(3);close(f);const before=f.c.activity.teacherView(),own=f.c.sync.studentView(f.c.auth.validate(f.students[1]));const raw=structuredClone(f.c.sheetsAccess.documents.get('synthetic-quiz'));
 const r=await write(f);assert.equal(r.status,202);assert.equal(r.body.status,'PRECHECKING');await f.c.writeback.wait(r.body.operationId);
 const view=await request(f.app).get(path+'s/'+r.body.operationId).query({activityId:f.body.activityId}).set(bearer(f.teacher));assert.equal(view.status,200);assert.equal(view.body.status,'SUCCEEDED');assert.equal(view.body.items[0].state,'VERIFIED');assert(!JSON.stringify(view.body).includes('answerText'));
 const current=f.c.sheetsAccess.documents.get('synthetic-quiz');assert.deepEqual(current.sheets[0].data[0].rowData[0].values[0].userEnteredValue,{stringValue:'=1+2\n中文😀'});assert.deepEqual(current.sheets[0].data[0].rowData.slice(1),raw.sheets[0].data[0].rowData.slice(1));assert.deepEqual(current.sheets[0].data[0].rowData[0].values[0].userEnteredFormat,raw.sheets[0].data[0].rowData[0].values[0].userEnteredFormat);
 assert.deepEqual(f.c.activity.teacherView(),before);assert.deepEqual(f.c.sync.studentView(f.c.auth.validate(f.students[1])),own);
 assert.equal((await request(f.app).get(path+'s/'+r.body.operationId).query({activityId:f.body.activityId}).set(bearer(f.students[0]))).status,403);
});
test('all targets validate first: later-cell conflict causes zero writes, with safe per-target reason',async()=>{
 const f=await preparedQuizFixture(3);close(f);f.c.questions.next(f.teacher,f.body);close(f,2,'second');
 f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].data[0].rowData[1].values[0].userEnteredValue={stringValue:'external'};
 const r=await write(f);await f.c.writeback.wait(r.body.operationId);const op=f.c.writeback.get(f.teacher,f.body.activityId,r.body.operationId);assert.equal(op.status,'CONFLICT');assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,0);assert(op.items.some(i=>i.cellAddress==='G2'&&i.state==='CONFLICT'));
});
test('authorization, stale activity, unknown fields and retired export cannot select arbitrary targets',async()=>{
 const f=await preparedQuizFixture(1),api=request(f.app);
 assert.equal((await api.post(path).send({activityId:f.body.activityId})).status,401);
 assert.equal((await api.post(path).set(bearer(f.students[0])).send({activityId:f.body.activityId})).status,403);
 assert.equal((await api.post(path).set(bearer(f.teacher)).send({activityId:'old'})).status,409);
 assert.equal((await api.post(path).set(bearer(f.teacher)).send({...f.body,spreadsheetId:'other'})).status,400);
 assert.equal((await api.get('/api/activity/guided-notes/export').set(bearer(f.teacher))).status,410);
});
test('busy and pending barriers block new writes; 2xx without verified readback is never success',async()=>{
 const f=await preparedQuizFixture(1);close(f);let release;const gate=new Promise(r=>{release=r;});let written=false;
 const original=f.c.sheetsAccess.writeValues.bind(f.c.sheetsAccess);f.c.sheetsAccess.writeValues=async(...args)=>{await gate;written=true;return original(...args);};
 const r=await write(f);assert.equal((await write(f)).body.error.code,'WRITEBACK_BUSY');
 f.c.sheetsAccess.verify=async()=>{throw Error('private upstream error');};release();await f.c.writeback.wait(r.body.operationId);assert(written);
 const op=f.c.writeback.get(f.teacher,f.body.activityId,r.body.operationId);assert.equal(op.status,'PENDING_VERIFICATION');assert(!JSON.stringify(op).includes('private upstream'));assert.equal((await write(f)).body.error.code,'WRITEBACK_PENDING');assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,1);
});

test('known rejection, unsent auth failure and unsafe batch each stop without replay or quiz mutation',async()=>{
 for(const failure of ['reject','auth','surrogate','oversize','noedit']){
  const f=await preparedQuizFixture(1);close(f,1,failure==='surrogate'?'bad\ud800':failure==='oversize'?'a'.repeat(2*1024*1024):'valid');
  const before=f.c.activity.teacherView();let sends=0;
  if(['reject','auth'].includes(failure))f.c.sheetsAccess.writeValues=async()=>{sends++;return {sent:failure==='reject',transportState:failure==='reject'?'SETTLED':'NOT_SENT',remoteOutcome:failure==='reject'?'KNOWN_REJECTED':'NOT_SENT',error:{code:failure==='reject'?'SHEETS_ACCESS_UNAVAILABLE':'GOOGLE_AUTH_UNAVAILABLE'}};};
  if(failure==='noedit')f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].protectedRanges=[{range:{sheetId:0},warningOnly:false,requestingUserCanEdit:false}];
  const r=await write(f);await f.c.writeback.wait(r.body.operationId);const op=f.c.writeback.get(f.teacher,f.body.activityId,r.body.operationId);
  assert.equal(op.status,'FAILED',failure);assert.equal(op.running,false);assert.equal(sends,['reject','auth'].includes(failure)?1:0);assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,0);assert.deepEqual(f.c.activity.teacherView(),before);
  assert.equal((await request(f.app).get('/api/activity/guided-notes').query({activityId:f.body.activityId}).set(bearer(f.teacher))).body.latestWriteback.operationId,op.operationId);
 }
});

test('in-flight unknown write keeps barrier even with matching values; settled residual markers never cause replay',async()=>{
 for(const applied of [false,true]){
  const f=await preparedQuizFixture(1);close(f);let settle;const whenTransportSettled=new Promise(r=>{settle=r;});let sends=0;
  const original=f.c.sheetsAccess.writeValues.bind(f.c.sheetsAccess);
  f.c.sheetsAccess.writeValues=async(...args)=>{sends++;if(applied)await original(...args);return {sent:true,transportState:'IN_FLIGHT',remoteOutcome:'UNKNOWN',whenTransportSettled};};
  const r=await write(f);await f.c.writeback.wait(r.body.operationId);let op=f.c.writeback.get(f.teacher,f.body.activityId,r.body.operationId);
  assert.equal(op.status,'PENDING_VERIFICATION');assert.equal(op.running,true);assert.equal((await write(f)).body.error.code,'WRITEBACK_BUSY');assert.equal(sends,1);
  settle();await new Promise(r=>setImmediate(r));op=f.c.writeback.get(f.teacher,f.body.activityId,r.body.operationId);assert.equal(op.running,false);
  assert.equal(op.status,applied?'SUCCEEDED':'PENDING_VERIFICATION');
  if(!applied)assert.equal((await write(f)).body.error.code,'WRITEBACK_PENDING');
  assert.equal(sends,1);
 }
});

test('immutable snapshot and old ownership cannot absorb later closed answers or overwrite replacement activity',async()=>{
 const f=await preparedQuizFixture(2);close(f);let release;const gate=new Promise(r=>{release=r;});
 const original=f.c.sheetsAccess.getSource.bind(f.c.sheetsAccess);f.c.sheetsAccess.getSource=async id=>{await gate;return original(id);};
 const r=await write(f);f.c.questions.next(f.teacher,f.body);close(f,2,'later');release();await f.c.writeback.wait(r.body.operationId);
 const rows=f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].data[0].rowData;assert.equal(rows[1].values[0].userEnteredValue.stringValue,'{{Q2}}');assert.equal(f.c.writeback.get(f.teacher,f.body.activityId,r.body.operationId).items.length,1);
 const second=await preparedQuizFixture(1);close(second);let resume;const blocked=new Promise(r=>{resume=r;});const read=second.c.sheetsAccess.getSource.bind(second.c.sheetsAccess);second.c.sheetsAccess.getSource=async id=>{await blocked;return read(id);};
 const pending=await write(second);second.c.store.activity=null;resume();await second.c.writeback.wait(pending.body.operationId);assert.equal(second.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,0);
});

test('both synthetic sources preserve every non-target value, formula, format and merge through exact string batches',async()=>{
 for(const raw of [syntheticSheetA(),syntheticSheetB()]){
  const access=createFakeSheetsAccess({sources:[raw]}),app=createApp({sheetsAccess:access,config:loadConfig({ADMIN_PASSWORD:randomBytes(16).toString('hex')})}),c=app.locals.context;
  c.activity.setGroups(2);await c.activity.loadSource('https://docs.google.com/spreadsheets/d/'+raw.spreadsheetId+'/edit');
  const teacher=c.auth.issue('teacher').token,student=c.dispatcher.run(()=>c.auth.claimGroup(c.store.activity.id,1)).token;
  const body={activityId:c.store.activity.id,questionNumber:1},f={app,c,teacher,students:[student],body};close(f,1,'{{Q2}}');
  const expected=structuredClone(raw),loc=c.store.activity.document.placeholderLocations.get(1);
  for(const sheet of expected.sheets)for(const block of sheet.data??[])for(const [ri,row] of (block.rowData??[]).entries())for(const [ci,cell] of (row.values??[]).entries())if(sheet.properties.sheetId===loc.sheetId&&(block.startRow??0)+ri===loc.rowIndex&&(block.startColumn??0)+ci===loc.columnIndex)cell.userEnteredValue={stringValue:'{{Q2}}'};
  const r=await write(f);await c.writeback.wait(r.body.operationId);assert.equal(c.writeback.get(teacher,body.activityId,r.body.operationId).status,'SUCCEEDED');assert.deepEqual(access.documents.get(raw.spreadsheetId),expected);
 }
});

test('transport settling during readback also updates the attempt lifecycle without reopening a write',async()=>{
 const f=await preparedQuizFixture(1);close(f);let settle;const whenTransportSettled=new Promise(r=>{settle=r;});
 const original=f.c.sheetsAccess.writeValues.bind(f.c.sheetsAccess);
 f.c.sheetsAccess.writeValues=async(...args)=>{await original(...args);const result={sent:true,transportState:'IN_FLIGHT',remoteOutcome:'UNKNOWN',whenTransportSettled};whenTransportSettled.then(()=>{result.transportState='SETTLED';});return result;};
 const verify=f.c.sheetsAccess.verify.bind(f.c.sheetsAccess);f.c.sheetsAccess.verify=async(...args)=>{settle();await Promise.resolve();return verify(...args);};
 const r=await write(f);await f.c.writeback.wait(r.body.operationId);await new Promise(r=>setImmediate(r));
 const op=f.c.store.guidedNotesWritebacks.get(f.body.activityId).operations.get(r.body.operationId);
 assert.equal(op.status,'SUCCEEDED');assert.equal(op.running,false);assert.equal(op.attempts[0].transportState,'SETTLED');assert(op.attempts[0].endedAt);assert.equal(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues').length,1);
});

// Migrated from retired OOXML tests: Sheets stores literal text, never ST_Xstring escapes.
test('Sheets preserves escape-looking strings, whitespace, CRLF and Unicode without legacy encoding',async()=>{
 for(const answerText of ['_x0041_\r\nline\u0001','_x005F_x0041_','=1+2\n中文😀','  original_under_score  ']){
  const f=await preparedQuizFixture(1);close(f,1,answerText);
  const quiz=f.c.activity.teacherView(),original=structuredClone(f.c.sheetsAccess.documents.get('synthetic-quiz'));
  const response=await write(f);assert.equal(response.status,202);await f.c.writeback.wait(response.body.operationId);
  const view=f.c.writeback.get(f.teacher,f.body.activityId,response.body.operationId);assert.equal(view.status,'SUCCEEDED');
  const expected=structuredClone(original),location=f.c.store.activity.document.placeholderLocations.get(1);let targets=0;
  for(const sheet of expected.sheets)for(const block of sheet.data??[])for(const [ri,row] of (block.rowData??[]).entries())for(const [ci,cell] of (row.values??[]).entries())if(sheet.properties.sheetId===location.sheetId&&(block.startRow??0)+ri===location.rowIndex&&(block.startColumn??0)+ci===location.columnIndex){cell.userEnteredValue={stringValue:answerText};targets++;}
  assert.equal(targets,1);assert.deepEqual(f.c.sheetsAccess.documents.get('synthetic-quiz'),expected);assert.deepEqual(f.c.activity.teacherView(),quiz);
 }
});
