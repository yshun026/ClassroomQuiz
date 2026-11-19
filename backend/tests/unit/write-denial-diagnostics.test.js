import test from 'node:test';
import assert from 'node:assert/strict';
import {SheetsAccess} from '../../src/services/sheets-access.js';
import {createWriteDenialDiagnostics} from '../helpers/write-denial-diagnostics.js';
const target='https://sheets.googleapis.com/v4/spreadsheets/synthetic-A:batchUpdate';
const fills=[{location:{sheetId:0,rowIndex:0,columnIndex:0},answerText:'synthetic answer'}];
const privateText='PRIVATE_SENTINEL_ID_EMAIL_TOKEN_CONTENT_PATH';
const access=observer=>new SheetsAccess({tokenProvider:async()=>privateText,fetch:observer.fetch});

test('403/404 including protected-looking messages never prove protection or sharing denial',async()=>{
 for(const status of [403,404]){
  let calls=0;const o=createWriteDenialDiagnostics(async()=>{calls++;return new Response(JSON.stringify({error:{status:'PERMISSION_DENIED',message:'protected '+privateText}}),{status});});
  const result=await access(o).writeValues('synthetic-A',fills,'attempt');
  assert.equal(result.remoteOutcome,'KNOWN_REJECTED');assert.equal(result.error.code,'SHEETS_ACCESS_UNAVAILABLE');assert.equal(calls,1);
  assert.deepEqual(o.snapshot(),{writeRequests:1,events:[{kind:'WRITE',code:'N_REJECTED_UNATTRIBUTED'}]});
  assert(!JSON.stringify(o.snapshot()).includes(privateText));
 }
});
test('complete authentication/quota/request rejection and acceptance remain distinct',async()=>{
 for(const [status,code,outcome] of [[401,'N_AUTH_REJECTED','KNOWN_REJECTED'],[429,'N_QUOTA_REJECTED','KNOWN_REJECTED'],[400,'N_REQUEST_REJECTED','KNOWN_REJECTED'],[200,'N_UNEXPECTED_ACCEPTED','APPLIED']]){
  const o=createWriteDenialDiagnostics(async()=>new Response(privateText,{status}));
  assert.equal((await access(o).writeValues('synthetic-A',fills,'a')).remoteOutcome,outcome);
  assert.equal(o.snapshot().events[0].code,code);assert.equal(o.snapshot().writeRequests,1);
 }
});
test('5xx and transport errors stay UNKNOWN without replay or private exception leakage',async()=>{
 for(const transport of [async()=>new Response(privateText,{status:503}),async()=>{throw Error(privateText);}]){
  const o=createWriteDenialDiagnostics(transport);const result=await access(o).writeValues('synthetic-A',fills,'a');
  assert.equal(result.remoteOutcome,'UNKNOWN');assert.deepEqual(o.snapshot(),{writeRequests:1,events:[{kind:'WRITE',code:'N_OUTCOME_UNKNOWN'}]});
 }
});
test('incomplete rejection body stays UNKNOWN and forwards the identical exception',async()=>{
 const error=Error(privateText),o=createWriteDenialDiagnostics(async()=>({status:403,text:async()=>{throw error;}}));
 const response=await o.fetch(target,{method:'POST'});await assert.rejects(response.text(),e=>e===error);
 assert.equal(o.snapshot().events[0].code,'N_OUTCOME_UNKNOWN');
 const p=createWriteDenialDiagnostics(async()=>({status:403,text:async()=>{throw error;}}));
 assert.equal((await access(p).writeValues('synthetic-A',fills,'a')).remoteOutcome,'UNKNOWN');
});
test('read denial is not write/share/protection proof and observer preserves JSON consumption',async()=>{
 const o=createWriteDenialDiagnostics(async()=>new Response(privateText,{status:403}));
 await assert.rejects(access(o).getSource('synthetic-A'),{code:'SHEETS_ACCESS_UNAVAILABLE'});
 assert.deepEqual(o.snapshot(),{writeRequests:0,events:[{kind:'READ',code:'N_READ_ACCESS_UNATTRIBUTED'}]});
 const p=createWriteDenialDiagnostics(async()=>new Response(JSON.stringify({value:privateText})));
 assert.deepEqual(await (await p.fetch('https://sheets.googleapis.com/v4/spreadsheets/synthetic-A',{method:'GET'})).json(),{value:privateText});
 assert.equal(p.snapshot().events[0].code,'N_READ_COMPLETED');
});
test('observer never consumes a body proactively, snapshots are isolated, unrelated requests pass through',async()=>{
 let reads=0;const raw={status:403,text:async()=>{reads++;return privateText;}},o=createWriteDenialDiagnostics(async()=>raw);
 const response=await o.fetch(target,{method:'POST',headers:{Authorization:privateText},body:privateText});
 assert.equal(reads,0);assert.equal(o.snapshot().events.length,0);assert.equal(await response.text(),privateText);assert.equal(reads,1);
 const snapshot=o.snapshot();snapshot.events[0].code=privateText;snapshot.events.push({code:privateText});assert(!JSON.stringify(o.snapshot()).includes(privateText));
 assert.equal(await o.fetch('https://unrelated.invalid',{method:'POST'}),raw);assert.equal(o.snapshot().writeRequests,1);
});
test('diagnostic observation does not become settlement or authorization policy',async()=>{
 let release;const pending=new Promise(resolve=>{release=resolve;}),o=createWriteDenialDiagnostics(async()=>({status:403,text:()=>pending}));
 const response=await o.fetch(target,{method:'POST'}),body=response.text();assert.deepEqual(o.snapshot(),{writeRequests:1,events:[]});
 release(privateText);assert.equal(await body,privateText);assert.equal(o.snapshot().events[0].code,'N_REJECTED_UNATTRIBUTED');
});
