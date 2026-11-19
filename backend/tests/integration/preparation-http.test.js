import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../../src/app.js';
import {loadConfig} from '../../src/config.js';
import {createFakeSheetsAccess} from '../helpers/fake-sheets-access.js';
import {syntheticCases} from '../../../tests/fixtures/google-sheets/sources.js';
import {AppError} from '../../src/api/errors.js';
const url=id=>`https://docs.google.com/spreadsheets/d/${id}/edit#gid=0`;
async function setup(sheetsAccess=createFakeSheetsAccess()){
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:'integration-only'}),sheetsAccess}),api=request(app);
 const login=await api.post('/api/teacher/login').send({password:'integration-only'});
 return {api,app,sheetsAccess,auth:{Authorization:`Bearer ${login.body.token}`}};
}
test('groups first then complete source creates one activity; Notes teacher-only and source locked',async()=>{
 const {api,app,auth}=await setup();assert.equal((await api.get('/api/activity')).status,401);
 assert.equal((await api.post('/api/teacher/login').send({password:'wrong'})).status,401);
 for(const groupCount of [0,-1,1.5,'3',null])assert.equal((await api.put('/api/preparation/groups').set(auth).send({groupCount})).status,400);
 assert.equal((await api.put('/api/preparation/groups').set(auth).send({groupCount:3})).status,200);
 const imported=await api.post('/api/preparation/guided-notes').set(auth).send({spreadsheetUrl:url('synthetic-A')});assert.equal(imported.status,201,JSON.stringify(imported.body));
 const view=imported.body;assert.equal(view.phase,'WAITING');assert.equal(view.questionCount,3);assert.equal(view.currentQuestionNumber,1);
 const notes=await api.get('/api/activity/guided-notes').query({activityId:view.activityId}).set(auth);assert.equal(notes.status,200);assert.equal(notes.body.source.writePermission,'UNKNOWN');assert.match(notes.body.source.permissionMessage,/尚未確認/);
 assert.equal((await api.get('/api/activity/guided-notes').query({activityId:'old'}).set(auth)).status,409);
 assert.equal((await api.put('/api/preparation/groups').set(auth).send({groupCount:4})).status,409);
 assert.equal((await api.post('/api/preparation/guided-notes').set(auth).send({spreadsheetUrl:url('synthetic-B')})).status,409);
 const joined=await api.post('/api/activity/groups/claim').send({activityId:view.activityId,groupNumber:1});const student={Authorization:`Bearer ${joined.body.token}`};
 assert.equal((await api.get('/api/activity/guided-notes').query({activityId:view.activityId}).set(student)).status,403);
 const own=await api.get('/api/activity').set(student);assert(!JSON.stringify(own.body).includes('synthetic-A'));assert(!JSON.stringify(own.body).includes('permissionAssessment'));assert(!JSON.stringify(view).includes('synthetic-A'));
 assert.equal('document' in app.locals.context.store.preparationDraft,false);
});
test('reject no groups, unknown fields, multipart, invalid URL before cloud; preserve valid groups on failure/retry',async()=>{
 const {api,app,auth,sheetsAccess}=await setup();
 assert.equal((await api.post('/api/preparation/guided-notes').set(auth).send({spreadsheetUrl:url('synthetic-A')})).body.error.code,'INVALID_GROUP_COUNT');assert.equal(sheetsAccess.calls.length,0);
 await api.put('/api/preparation/groups').set(auth).send({groupCount:3});
 for(const body of [{spreadsheetUrl:url('synthetic-A'),cell:'A1'},{spreadsheetId:'synthetic-A'},{spreadsheetUrl:'https://attacker.invalid/'}])assert.equal((await api.post('/api/preparation/guided-notes').set(auth).send(body)).status,400);
 assert.equal((await api.post('/api/preparation/guided-notes').set(auth).attach('file',Buffer.from('synthetic'),'notes.xlsx')).status,400);assert.equal(sheetsAccess.calls.length,0);
 assert.equal((await api.post('/api/preparation/guided-notes').set(auth).send({spreadsheetUrl:url('missing')})).status,502);assert.equal(app.locals.context.store.activity,null);assert.equal(app.locals.context.store.preparationDraft.groupCount,3);
 assert.equal((await api.post('/api/preparation/guided-notes').set(auth).send({spreadsheetUrl:url('synthetic-B')})).status,201);
 assert.equal(app.locals.context.store.activity.document.spreadsheetId,'synthetic-B');
});
test('preparation mutex rejects second read/groups, failure releases ownership without partial source draft',async()=>{
 let release,entered;const gate=new Promise(r=>release=r),started=new Promise(r=>entered=r);let hold=true;
 const fake=createFakeSheetsAccess({beforeRead:async()=>{if(hold){entered();await gate;throw new AppError('SHEETS_UNAVAILABLE');}}});
 const {api,app,auth}=await setup(fake);await api.put('/api/preparation/groups').set(auth).send({groupCount:3});
 const pending=api.post('/api/preparation/guided-notes').set(auth).send({spreadsheetUrl:url('synthetic-A')}).then(r=>r);await started;
 assert.equal((await api.put('/api/preparation/groups').set(auth).send({groupCount:4})).body.error.code,'PREPARATION_BUSY');
 assert.equal((await api.post('/api/preparation/guided-notes').set(auth).send({spreadsheetUrl:url('synthetic-B')})).body.error.code,'PREPARATION_BUSY');release();assert.equal((await pending).status,502);
 assert.deepEqual(app.locals.context.store.preparationDraft,{groupCount:3,busy:false});hold=false;
 assert.equal((await api.post('/api/preparation/guided-notes').set(auth).send({spreadsheetUrl:url('synthetic-A')})).status,201);
});
test('DENIED/runs/duplicate/formula all reject entire source with locations; no writes; UNKNOWN admits',async()=>{
 for(const [key,code] of [['protectedSource','SHEETS_NOT_EDITABLE'],['rich','ANSWER_CELL_FORMAT_UNSUPPORTED'],['duplicate','PLACEHOLDER_DUPLICATE'],['formula','PLACEHOLDER_INVALID']]){
  const fake=createFakeSheetsAccess({sources:[syntheticCases()[key]]}),{api,app,auth}=await setup(fake);await api.put('/api/preparation/groups').set(auth).send({groupCount:3});
  const response=await api.post('/api/preparation/guided-notes').set(auth).send({spreadsheetUrl:url('synthetic-A')});assert.equal(response.status,422);assert.equal(response.body.error.code,code);assert(response.body.error.details.locations[0].cellAddress);assert.equal(app.locals.context.store.activity,null);assert.equal(fake.calls.some(c=>c.method==='writeValues'),false);
 }
});
test('unauthorized and student preparation rejected before any Google access',async()=>{
 const {api,app,sheetsAccess}=await setup();const {token}=app.locals.context.auth.issue('student');
 assert.equal((await api.post('/api/preparation/guided-notes').send({spreadsheetUrl:url('synthetic-A')})).status,401);
 assert.equal((await api.post('/api/preparation/guided-notes').set('Authorization',`Bearer ${token}`).send({spreadsheetUrl:url('synthetic-A')})).status,403);
 assert.equal((await api.put('/api/preparation/groups').set('Authorization',`Bearer ${token}`).send({groupCount:3})).status,403);assert.equal(sheetsAccess.calls.length,0);
});
