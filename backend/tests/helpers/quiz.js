import {createApp} from '../../src/app.js';
import {loadConfig} from '../../src/config.js';
import {Activity} from '../../src/models/activity.js';
import {randomBytes} from 'node:crypto';
import {createFakeSheetsAccess} from './fake-sheets-access.js';
import {syntheticDomainSource,syntheticQuizWire} from '../../../tests/fixtures/google-sheets/sources.js';
export function quizFixture(count=1){
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:randomBytes(16).toString('hex')}),sheetsAccess:createFakeSheetsAccess()});const c=app.locals.context;
 c.store.activity=new Activity(3,syntheticDomainSource(count));
 const teacher=c.auth.issue('teacher').token;
 const students=[1,2,3].map(group=>c.dispatcher.run(()=>c.auth.claimGroup(c.store.activity.id,group)).token);
 const body={activityId:c.store.activity.id,questionNumber:1};
 return {app,c,teacher,students,body};
}
export const bearer=token=>({Authorization:`Bearer ${token}`});

// Integration fixtures traverse the real groups-first preparation boundary, with fake Access only.
export async function preparedQuizFixture(count=1){
 const sheetsAccess=createFakeSheetsAccess({sources:[syntheticQuizWire(count)]});
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:randomBytes(16).toString('hex')}),sheetsAccess});const c=app.locals.context;
 c.activity.setGroups(3);await c.activity.loadSource('https://docs.google.com/spreadsheets/d/synthetic-quiz/edit');
 const teacher=c.auth.issue('teacher').token;
 const students=[1,2,3].map(group=>c.dispatcher.run(()=>c.auth.claimGroup(c.store.activity.id,group)).token);
 return {app,c,teacher,students,body:{activityId:c.store.activity.id,questionNumber:1}};
}
