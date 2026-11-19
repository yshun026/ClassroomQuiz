import test from 'node:test';
import assert from 'node:assert/strict';
import {createGuidedNotesClient} from '../src/services/guided-notes.js';
test('source import sends only JSON URL and teacher Notes uses bound activity',async()=>{
 const calls=[],client=createGuidedNotesClient({request:async(path,options)=>{calls.push({path,options});return path.includes('preparation')?{activityId:'a',phase:'WAITING'}:{activityId:'a',source:{writePermission:'UNKNOWN'}};}});
 await client.importSource('https://docs.google.com/spreadsheets/d/synthetic-A/edit',{});const notes=await client.getSource('a',{});assert.equal(notes.source.writePermission,'UNKNOWN');assert.deepEqual(calls[0].options.body,{spreadsheetUrl:'https://docs.google.com/spreadsheets/d/synthetic-A/edit'});assert.equal(calls[0].options.method,'POST');assert.match(calls[1].path,/activityId=a/);
});
test('old activity Notes and reset/import late replies cannot replace current source',async()=>{
 const pending=[];const client=createGuidedNotesClient({request:()=>new Promise(resolve=>pending.push(resolve))});
 const old=client.getSource('old',{});const rejected=assert.rejects(old,{code:'STALE_RESPONSE'});const next=client.getSource('new',{});pending[1]({activityId:'new',source:{title:'New'}});assert.equal((await next).source.title,'New');pending[0]({activityId:'old',source:{title:'Old'}});await rejected;
 const loading=client.importSource('url',{});const stale=assert.rejects(loading,{code:'STALE_RESPONSE'});client.reset();pending[2]({activityId:'late'});await stale;
});

const op=(id,revision=1)=>({activityId:'a',operationId:id,operationRevision:revision,status:'SUCCEEDED',running:false,items:[]});
test('different operations never compare revisions; A late GET and older Notes cannot replace B',async()=>{
 const pending=[];let post=0;
 const client=createGuidedNotesClient({request:async(path)=>{
  if(path.endsWith('/writeback'))return op(++post===1?'A':'B');
  return new Promise(resolve=>pending.push(resolve));
 }});
 await client.writeback('a',{});const old=client.getOperation('a','A',{}),rejected=assert.rejects(old,{code:'STALE_RESPONSE'});
 await client.writeback('a',{});pending.shift()(op('A',99));await rejected;
 const first=client.getSource('a',{}),stale=assert.rejects(first,{code:'STALE_RESPONSE'});const latest=client.getSource('a',{});
 pending[1]({activityId:'a',latestWriteback:op('B',2)});assert.equal((await latest).latestWriteback.operationId,'B');pending[0]({activityId:'a',latestWriteback:op('A',100)});await stale;
});
test('same-operation out-of-order replies retain current revision, and Session/reset invalidates requests',async()=>{
 let resolve;const client=createGuidedNotesClient({request:async path=>path.endsWith('/writeback')?op('A',5):new Promise(r=>{resolve=r;})});
 await client.writeback('a',{token:'one',generation:1});const older=client.getOperation('a','A',{token:'one',generation:1});resolve(op('A',2));assert.equal((await older).operationRevision,5);
 const late=client.getOperation('a','A',{token:'one',generation:1}),stale=assert.rejects(late,{code:'STALE_RESPONSE'});client.reset();resolve(op('A',9));await stale;
 await assert.rejects(client.getOperation('a','A',{token:'two',generation:2}),{code:'STALE_RESPONSE'});
});
test('lost POST response discovers existing operation without replay; busy/pending recovery is read-only',async()=>{
 for(const code of [undefined,'WRITEBACK_BUSY','WRITEBACK_PENDING']){
  const calls=[];const client=createGuidedNotesClient({request:async(path,options)=>{calls.push([path,options]);if(path.endsWith('/writeback'))throw Object.assign(Error('lost or busy'),{code});return {activityId:'a',latestWriteback:op('existing')};}});
  assert.equal((await client.writeback('a',{})).operationId,'existing');assert.equal(calls.filter(([,o])=>o.method==='POST').length,1);assert.equal(calls.length,2);
 }
});

test('a late POST response cannot replace a newer operation selected after reset',async()=>{
 let release,count=0;const client=createGuidedNotesClient({request:async()=>++count===1?new Promise(r=>{release=r;}):op('B',1)});
 const late=client.writeback('a',{token:'one',generation:1}),stale=assert.rejects(late,{code:'STALE_RESPONSE'});
 client.reset();assert.equal((await client.writeback('a',{token:'two',generation:2})).operationId,'B');
 release(op('A',999));await stale;assert.equal(count,2);
 await assert.rejects(client.getOperation('a','A',{token:'two',generation:2}),{code:'STALE_RESPONSE'});
});

test('explicit reconcile keeps original ID, bumps epoch and never automatically repeats POST',async()=>{
 const calls=[];let resolve;const session={token:'teacher',generation:1};
 const client=createGuidedNotesClient({request:async(path,options)=>{calls.push([path,options]);if(path.includes('/reconcile'))return {...op('A',7),status:'PRECHECKING',running:true};if(path.endsWith('/writeback'))return {...op('A',5),status:'PENDING_VERIFICATION',canReconcile:true};return new Promise(r=>{resolve=r;});}});
 await client.writeback('a',session);const old=client.getOperation('a','A',session),stale=assert.rejects(old,{code:'STALE_RESPONSE'});
 const reconciled=await client.reconcile('a','A',session);resolve(op('A',999));await stale;assert.equal(reconciled.operationId,'A');assert.equal(reconciled.operationRevision,7);assert.deepEqual(calls.at(-1)[1].body,{activityId:'a'});assert.equal(calls.at(-1)[0],'/activity/guided-notes/writebacks/A/reconcile');
 await assert.rejects(client.reconcile('a','B',session),{code:'STALE_RESPONSE'});
});

test('lost reconcile reply discovers same operation; Google failure view never clears local identity',async()=>{
 const session={token:'teacher',generation:1};let posts=0;
 const client=createGuidedNotesClient({request:async(path)=>{
  if(path.endsWith('/writeback')){posts++;return {...op('A'),status:'PENDING_VERIFICATION'};}
  if(path.endsWith('/reconcile')){posts++;throw Error('lost');}
  return {activityId:'a',latestWriteback:{...op('A',9),status:'PENDING_VERIFICATION',message:'後端 Google 認證不可用'}};
 }});
 await client.writeback('a',session);assert.equal((await client.reconcile('a','A',session)).status,'PENDING_VERIFICATION');assert.equal(posts,2);assert.equal(session.token,'teacher');
});
