import test from 'node:test';
import assert from 'node:assert/strict';
import {preparedQuizFixture} from '../helpers/quiz.js';
import {createApp} from '../../src/app.js';
import {loadConfig} from '../../src/config.js';
import {randomBytes} from 'node:crypto';

test('new activity cannot reuse filled source or old evidence; explicit manual marker restore permits fresh import (fake)',async()=>{
 const f=await preparedQuizFixture(1);f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText:'filled'});f.c.questions.close(f.teacher,f.body);
 const op=f.c.writeback.start(f.teacher,f.body.activityId);await f.c.writeback.wait(op.operationId);assert.equal(f.c.writeback.get(f.teacher,f.body.activityId,op.operationId).status,'SUCCEEDED');
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:randomBytes(24).toString('hex')}),sheetsAccess:f.c.sheetsAccess}),c=app.locals.context;c.activity.setGroups(3);
 await assert.rejects(c.activity.loadSource('https://docs.google.com/spreadsheets/d/synthetic-quiz/edit'),{code:'PLACEHOLDER_MISSING'});assert.equal(c.store.activity,null);assert.equal(c.store.preparationDraft.groupCount,3);assert.equal(c.store.guidedNotesWritebacks.size,0);
 assert.equal(f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].data[0].rowData[0].values[0].userEnteredValue.stringValue,'filled');
 // Test simulates a HUMAN restoring the dedicated template, never an app restore feature.
 f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].data[0].rowData[0].values[0].userEnteredValue={stringValue:'{{Q1}}'};
 await c.activity.loadSource('https://docs.google.com/spreadsheets/d/synthetic-quiz/edit');assert.notEqual(c.store.activity.id,f.body.activityId);assert.equal(c.store.activity.phase,'WAITING');assert.equal(c.store.guidedNotesWritebacks.size,0);assert.equal(f.c.sheetsAccess.calls.filter(call=>call.method==='writeValues').length,1);
});
