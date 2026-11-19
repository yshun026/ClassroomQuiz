import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {isAbsolute,relative,sep} from 'node:path';
import {REPOSITORY_ROOT,loadConfig} from '../../src/config.js';
import {createApp} from '../../src/app.js';

// Pure gate: never opens a credential, obtains a Token or calls any API.
export function liveConfiguration(env){
 if(env.RUN_GOOGLE_LIVE_TESTS!=='1')return {enabled:false,reason:'NOT RUN: explicit opt-in absent'};
 if(!env.GOOGLE_APPLICATION_CREDENTIALS||!env.GOOGLE_TEST_SHEET_A||!env.GOOGLE_TEST_SHEET_B||env.GOOGLE_LIVE_CONFIRM_DEDICATED!=='YES')return {enabled:false,reason:'NOT RUN: dedicated sources, credentials and confirmation required'};
 const path=env.GOOGLE_APPLICATION_CREDENTIALS,rel=relative(REPOSITORY_ROOT,path);
 if(!isAbsolute(path)||rel===''||!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+sep))throw Error('LIVE_CONFIGURATION_INVALID: credential must be outside repository');
 if(![env.GOOGLE_TEST_SHEET_A,env.GOOGLE_TEST_SHEET_B].every(id=>/^[A-Za-z0-9_-]+$/.test(id))||env.GOOGLE_TEST_SHEET_A===env.GOOGLE_TEST_SHEET_B)throw Error('LIVE_CONFIGURATION_INVALID: two distinct valid source identities required');
 const mode=env.GOOGLE_LIVE_MODE||'acceptance';if(!['acceptance','protected','read-denied'].includes(mode))throw Error('LIVE_CONFIGURATION_INVALID: unsupported mode');
 return {enabled:true,credentialPath:path,ids:[env.GOOGLE_TEST_SHEET_A,env.GOOGLE_TEST_SHEET_B],mode};
}
const key=l=>`${l.sheetId}/${l.rowIndex}/${l.columnIndex}`;
export function cellsOf(raw){const cells=new Map();for(const s of raw.sheets)for(const b of s.data??[])for(const [r,row] of (b.rowData??[]).entries())for(const [c,cell] of (row.values??[]).entries())if(Object.keys(cell).length)cells.set(`${s.properties.sheetId}/${(b.startRow??0)+r}/${(b.startColumn??0)+c}`,structuredClone(cell));return cells;}
// Canonical sparse coordinates avoid differences caused only by GridData block layout.
export function preservationView(raw,allowed=[]){const cells=cellsOf(raw);for(const l of allowed){const cell=cells.get(key(l));if(cell){delete cell.userEnteredValue;if(!Object.keys(cell).length)cells.delete(key(l));}}
 return {spreadsheetId:raw.spreadsheetId,properties:raw.properties,namedRanges:raw.namedRanges??[],sheets:raw.sheets.map(({data,...s})=>s),cells:[...cells].sort(([a],[b])=>a.localeCompare(b))};}

// Both fake contract tests and opt-in live suite use the same acceptance algorithm.
// Callers must suppress raw assertion details when working with real source data.
export async function exerciseSource(access,baseline){
 let writes=0;const bound={getSource:id=>access.getSource(id),verify:(...args)=>access.verify(...args),writeValues:(...args)=>{writes++;return access.writeValues(...args);}};
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:randomBytes(24).toString('hex')}),sheetsAccess:bound}),c=app.locals.context;
 c.activity.setGroups(3);await c.activity.loadSource('https://docs.google.com/spreadsheets/d/'+baseline.spreadsheetId+'/edit');
 const source=c.store.activity.document;assert(source.placeholderLocations.size>=3,'dedicated source needs at least three questions');
 const teacher=c.auth.issue('teacher').token,students=[1,2,3].map(n=>c.dispatcher.run(()=>c.auth.claimGroup(c.store.activity.id,n)).token),body={activityId:c.store.activity.id,questionNumber:1};
 async function write(){const view=c.writeback.start(teacher,body.activityId);await c.writeback.wait(view.operationId);return c.writeback.get(teacher,body.activityId,view.operationId);}
 assert.equal((await write()).status,'NO_CHANGES');assert.equal(writes,0);
 const first=' =1+2\n中文😀 ',third='=1+2\nUnicode Ω 😀\n_x0041_';
 c.questions.start(teacher,body);c.submissions.submit(students[1],{...body,answerText:first});c.submissions.submit(students[0],{...body,answerText:'later answer'});c.questions.close(teacher,body);
 assert.equal((await write()).status,'SUCCEEDED');assert.equal(writes,1);
 let raw=await access.getSource(source.spreadsheetId);const l1=source.placeholderLocations.get(1),l3=source.placeholderLocations.get(3);
 assert.deepEqual(cellsOf(raw).get(key(l1)).userEnteredValue,{stringValue:first});
 assert.deepEqual(preservationView(raw,[l1]),preservationView(baseline,[l1]));
 const repeat=await write();assert.equal(repeat.status,'SUCCEEDED');assert.equal(repeat.items[0].state,'SKIPPED_VERIFIED');assert.equal(writes,1);
 c.questions.next(teacher,body);const q2={...body,questionNumber:2};c.questions.start(teacher,q2);c.questions.close(teacher,q2);c.questions.next(teacher,q2);
 const q3={...body,questionNumber:3};c.questions.start(teacher,q3);
 assert.equal((await write()).status,'SUCCEEDED');assert.equal(writes,1); // Q2 unanswered / Q3 open remain markers.
 c.submissions.submit(students[2],{...q3,answerText:third});c.questions.close(teacher,q3);assert.equal((await write()).status,'SUCCEEDED');assert.equal(writes,2);
 raw=await access.getSource(source.spreadsheetId);
 for(const [n,l] of source.placeholderLocations)assert.deepEqual(cellsOf(raw).get(key(l)).userEnteredValue,{stringValue:n===1?first:n===3?third:l.originalPlaceholder});
 assert.deepEqual(preservationView(raw,[l1,l3]),preservationView(baseline,[l1,l3]));
 return {questionCount:source.placeholderLocations.size,writeCalls:writes};
}
