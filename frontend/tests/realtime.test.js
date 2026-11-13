import test from 'node:test';
import assert from 'node:assert/strict';
import {acceptSnapshot} from '../src/services/realtime.js';
import {api} from '../src/services/api.js';
import * as session from '../src/services/session.js';
import {downloadGuidedNotes} from '../src/services/download.js';

test('full snapshots restore the newest state; preparation and a different student identity reset the baseline',()=>{
 const old={activityId:'a',ownGroupNumber:1,studentViewRevision:8,phase:'RESULTS'};
 assert.equal(acceptSnapshot(old,{...old,studentViewRevision:7,phase:'ANSWERING'},'student'),old);
 const restored={...old,studentViewRevision:9,phase:'WAITING',currentQuestionNumber:2};assert.equal(acceptSnapshot(old,restored,'student'),restored);
 const other={...old,ownGroupNumber:2,studentViewRevision:0};assert.equal(acceptSnapshot(old,other,'student',{reset:true}),other);
 const preparation={prepared:false,groupCount:3};assert.equal(acceptSnapshot({prepared:false},preparation,'teacher'),preparation);
 const newActivity={...old,activityId:'new',studentViewRevision:0};assert.equal(acceptSnapshot(old,newActivity,'student',{reset:true}),newActivity);
});

test('old preparation, activity and identity snapshots cannot reset an established baseline',()=>{
 const current={activityId:'current',stateRevision:8,phase:'ANSWERING'};
 assert.equal(acceptSnapshot(current,{prepared:false},'teacher'),current);
 assert.equal(acceptSnapshot(current,{activityId:'old',stateRevision:99},'teacher'),current);
 const own={activityId:'a',ownGroupNumber:2,studentViewRevision:4};
 assert.equal(acceptSnapshot(own,{activityId:'a',ownGroupNumber:1,studentViewRevision:99},'student'),own);
});

function mockStorage(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
test('late invalid response cannot erase a newer token',async()=>{
 const oldStorage=globalThis.localStorage,oldFetch=globalThis.fetch;globalThis.localStorage=mockStorage();let release;
 try{session.saveToken('old');globalThis.fetch=()=>new Promise(resolve=>{release=resolve;});const result=api('/activity');session.saveToken('new');release({ok:false,json:async()=>({error:{code:'SESSION_INVALID',message:'old invalid'}})});
  await assert.rejects(result,{code:'STALE_RESPONSE'});assert.equal(session.getToken(),'new');
 }finally{globalThis.localStorage=oldStorage;globalThis.fetch=oldFetch;}
});
test('late success and ABA token transitions are rejected by request generation',async()=>{
 const oldStorage=globalThis.localStorage,oldFetch=globalThis.fetch;globalThis.localStorage=mockStorage();let release;
 try{session.saveToken('A');globalThis.fetch=()=>new Promise(resolve=>{release=resolve;});const result=api('/activity');session.saveToken('B');session.saveToken('A');release({ok:true,json:async()=>({activityId:'old'})});await assert.rejects(result,{code:'STALE_RESPONSE'});
 }finally{globalThis.localStorage=oldStorage;globalThis.fetch=oldFetch;}
});

test('stale download and network failure do not affect a replacement session',async()=>{
 const oldStorage=globalThis.localStorage,oldFetch=globalThis.fetch;globalThis.localStorage=mockStorage();
 try{for(const networkFailure of [false,true]){
  session.saveToken('download-old');let release,reject;globalThis.fetch=()=>new Promise((yes,no)=>{release=yes;reject=no;});
  const result=downloadGuidedNotes('a');session.saveToken('download-new');if(networkFailure)reject(Error('old network failure'));else release({ok:false,json:async()=>({error:{code:'SESSION_INVALID'}})});
  await assert.rejects(result,{code:'STALE_RESPONSE'});assert.equal(session.getToken(),'download-new');
 }}finally{globalThis.localStorage=oldStorage;globalThis.fetch=oldFetch;}
});
test('student compares only its own visible revision; teacher compares global revision',()=>{const own={activityId:'a',studentViewRevision:2};assert.equal(acceptSnapshot(own,{activityId:'a',studentViewRevision:1},'student'),own);assert.equal(acceptSnapshot(own,{activityId:'a',stateRevision:99},'student'),own);const next={activityId:'a',studentViewRevision:3};assert.equal(acceptSnapshot(own,next,'student'),next);const t={activityId:'a',stateRevision:4};assert.equal(acceptSnapshot(t,{activityId:'a',stateRevision:3},'teacher'),t);});
