import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createStore} from '../../src/store/runtime-store.js';
import {AuthorizationService} from '../../src/services/authorization-service.js';
import {CommandDispatcher} from '../../src/services/command-dispatcher.js';
import {loadConfig} from '../../src/config.js';
import {createApp} from '../../src/app.js';
import {AppError} from '../../src/api/errors.js';
import {quizFixture,bearer} from '../helpers/quiz.js';

test('malformed JSON and invalid answer types report safe input errors without mutation',async()=>{
 const f=quizFixture();f.c.questions.start(f.teacher,f.body);const before=f.c.activity.teacherView(),ids=[];
 for(const raw of ['{"answerText":','{"private":"secret-incomplete','[']){
  const response=await request(f.app).post('/api/activity/submissions').set(bearer(f.students[0])).set('Content-Type','application/json').send(raw);
  assert.equal(response.status,400);assert.equal(response.body.error.code,'INVALID_INPUT');assert.equal(response.body.error.message,'輸入格式不正確');
  assert(!/secret-incomplete|stack|SyntaxError|tokenHash/.test(JSON.stringify(response.body)));assert.match(response.body.error.requestId,/^[0-9a-f-]{36}$/);ids.push(response.body.error.requestId);
 }
 assert.equal(new Set(ids).size,3);
 const typed=await request(f.app).post('/api/activity/submissions').set(bearer(f.students[0])).send({...f.body,answerText:[]});assert.equal(typed.status,400);assert.equal(typed.body.error.code,'INVALID_INPUT');
 assert.deepEqual(f.c.activity.teacherView(),before);assert.equal(f.c.store.activity.questions.get(1).submissionsByGroup.size,0);
});

test('retired multipart preparation is safely rejected; unknown errors remain internal',async()=>{
 const f=quizFixture(),before=f.c.activity.teacherView();const bad=await request(f.app).post('/api/preparation/guided-notes').set(bearer(f.teacher)).attach('wrong-field',Buffer.from('synthetic'),'input.xlsx');
 assert.equal(bad.status,400);assert.equal(bad.body.error.code,'INVALID_INPUT');assert.deepEqual(f.c.activity.teacherView(),before);
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:'test-only'}),register:app=>app.get('/api/unknown-failure',()=>{throw Error('private stack and password');})});
 const unknown=await request(app).get('/api/unknown-failure');assert.equal(unknown.status,500);assert.equal(unknown.body.error.code,'INTERNAL_ERROR');assert(!JSON.stringify(unknown.body).includes('private'));
});
test('fresh stores are isolated; sessions do not survive restart',()=>{const a=createStore(),b=createStore();const auth=new AuthorizationService(a,'test-secret');const {token}=auth.authenticateTeacher('test-secret');assert.equal(auth.validate(token).role,'teacher');assert.throws(()=>new AuthorizationService(b,'test-secret').validate(token),{code:'SESSION_INVALID'});assert.equal(a.activity,null);assert.equal(b.sessionsByTokenHash.size,0);assert(![...a.sessionsByTokenHash.keys()].includes(token));});
test('password and role checks cannot be bypassed',()=>{const a=new AuthorizationService(createStore(),'private');assert.throws(()=>a.authenticateTeacher('wrong'),{code:'INVALID_PASSWORD'});const {token}=a.authenticateTeacher('private');assert.throws(()=>a.validate(token,'student'),{code:'STUDENT_REQUIRED'});assert.throws(()=>a.validate('forged'),{code:'SESSION_INVALID'});});
test('commands are synchronous, ordered; rejects do not mutate activity',()=>{const s=createStore(),d=new CommandDispatcher(s),seen=[];d.run(()=>seen.push(1));d.run(()=>seen.push(2));const before=s.activity;assert.throws(()=>d.run(()=>{throw new AppError('PHASE_CONFLICT');}));assert.equal(s.activity,before);assert.equal(s.commandSequence,3);assert.deepEqual(seen,[1,2]);assert.throws(()=>d.run(async()=>42),/同步/);});
test('missing or blank admin password refuses startup',()=>{assert.throws(()=>loadConfig({}),/ADMIN_PASSWORD/);assert.throws(()=>loadConfig({ADMIN_PASSWORD:' '}),/ADMIN_PASSWORD/);assert.equal(loadConfig({ADMIN_PASSWORD:'safe'}).host,'localhost');});
test('HTTP errors are safe and origins restricted',async()=>{const app=createApp({config:loadConfig({ADMIN_PASSWORD:'secret'})});app.get('/api/test-failure',()=>{throw Error('secret internals');});const r=await request(app).get('/api/health').set('Origin','https://outside.invalid');assert.equal(r.status,403);assert(!JSON.stringify(r.body).includes('secret'));const ok=await request(app).get('/api/health');assert.equal(ok.status,200);assert.equal(ok.body.status,'ok');});
