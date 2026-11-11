import {createApp} from '../../src/app.js';
import {loadConfig} from '../../src/config.js';
import {Activity} from '../../src/models/activity.js';
import {randomBytes} from 'node:crypto';
export function quizFixture(count=1){
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:randomBytes(16).toString('hex')})});const c=app.locals.context;
 c.store.activity=new Activity(3,{placeholderLocations:new Map(Array.from({length:count},(_,i)=>[i+1,{questionNumber:i+1,worksheetId:1,worksheetName:'Notes',cellAddress:`G${i+1}`}]))});
 const teacher=c.auth.issue('teacher').token;
 const students=[1,2,3].map(group=>c.dispatcher.run(()=>c.auth.claimGroup(c.store.activity.id,group)).token);
 const body={activityId:c.store.activity.id,questionNumber:1};
 return {app,c,teacher,students,body};
}
export const bearer=token=>({Authorization:`Bearer ${token}`});
