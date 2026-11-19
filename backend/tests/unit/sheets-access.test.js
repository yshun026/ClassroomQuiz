import test from 'node:test';
import assert from 'node:assert/strict';
import {SheetsAccess, SHEETS_FIELDS} from '../../src/services/sheets-access.js';
import {AppError} from '../../src/api/errors.js';
import {createFakeSheetsAccess} from '../helpers/fake-sheets-access.js';
import {syntheticSheetA,syntheticSheetB,syntheticCases} from '../../../tests/fixtures/google-sheets/sources.js';
import {createTestRuntime} from '../helpers/runtime.js';
import {quizFixture} from '../helpers/quiz.js';

const source=()=>({spreadsheetId:'synthetic-A',properties:{title:'Unit source'},sheets:[{properties:{sheetId:0,title:'Hidden Notes',sheetType:'GRID',hidden:true,gridProperties:{rowCount:50,columnCount:20}},merges:[],data:[{startRow:3,startColumn:2,rowData:[{values:[{}, {userEnteredValue:{stringValue:'{{Q1}}'},userEnteredFormat:{backgroundColor:{red:1}}}]}]}]}]});
const response=(status,data=source(),headers={})=>({status,headers:new Headers(headers),json:async()=>structuredClone(data),text:async()=>JSON.stringify(data)});
const fill=(answerText='=1+2')=>({questionNumber:1,location:{sheetId:0,rowIndex:3,columnIndex:3},answerText});
const turns=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
function clock(){
 let time=0,id=0;const timers=new Map(),sleeps=[];
 return {sleeps,now:()=>time,wallNow:()=>Date.UTC(2026,10,18)+time,
  setTimeout(fn,ms){const key=++id;timers.set(key,{at:time+ms,fn});return key;},clearTimeout(key){timers.delete(key);},
  sleep:async ms=>{sleeps.push(ms);time+=ms;},
  async advance(ms){const end=time+ms;while(true){const next=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;timers.delete(next[0]);next[1].fn();await turns();}time=end;await turns();},
  elapse:ms=>{time+=ms;}
 };
}
function access(fetch,extra={}){return new SheetsAccess({tokenProvider:async()=> 'synthetic-unit-token',fetch,...extra});}

test('read only fixed Sheets host with full field mask, no ranges/redirect, preserve sparse grid and sheetId zero',async()=>{
 const a=access(async(url,options)=>{
  const u=new URL(url);assert.equal(u.origin,'https://sheets.googleapis.com');assert.equal(u.pathname,'/v4/spreadsheets/synthetic-A');
  assert.equal(u.searchParams.get('fields'),SHEETS_FIELDS);assert.equal(u.searchParams.has('ranges'),false);
  for(const field of ['startRow','startColumn','userEnteredValue','userEnteredFormat','textFormatRuns','chipRuns','protectedRanges','requestingUserCanEdit','unprotectedRanges','namedRanges','tables'])assert(SHEETS_FIELDS.includes(field));
  assert.equal(options.method,'GET');assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Bearer synthetic-unit-token');return response(200);
 });
 const s=await a.getSource('synthetic-A');assert.equal(s.sheets[0].properties.sheetId,0);assert.equal(s.sheets[0].data[0].startRow,3);assert.deepEqual(s.sheets[0].data[0].rowData[0].values[0],{});
 assert.equal((await a.verify('synthetic-A',{})).spreadsheetId,'synthetic-A');
});

test('invalid IDs and malformed/mismatched protocol fail before any arbitrary target request',async()=>{
 let calls=0;const a=access(async()=>{calls++;return response(200);});
 for(const id of ['https://attacker.invalid','../x','x?y','x/y',''])await assert.rejects(a.getSource(id),{code:'SHEETS_URL_INVALID'});
 assert.equal(calls,0);
 for(const data of [{}, {...source(),spreadsheetId:'wrong'}, {...source(),sheets:[{properties:{title:'no-id'}}]}]){
  let attempts=0;await assert.rejects(access(async()=>{attempts++;return response(200,data);}).getSource('synthetic-A'),{code:'SOURCE_UNSUPPORTED'});assert.equal(attempts,1);
 }
});

test('read retries three attempts with bounded jitter endpoints; never retries authorization or source parse errors',async()=>{
 for(const [rng,expected] of [[()=>0,[1000,2000]],[()=>0.999999,[1250,2250]]]){
  const c=clock();let calls=0;await assert.rejects(access(async()=>{calls++;return response(503);},{clock:c,rng}).getSource('synthetic-A'),{code:'SHEETS_UNAVAILABLE'});
  assert.equal(calls,3);assert.deepEqual(c.sleeps,expected);
 }
 for(const status of [400,401,403,404]){let calls=0;await assert.rejects(access(async()=>{calls++;return response(status,{error:'do-not-leak'});}).getSource('synthetic-A'));assert.equal(calls,1);}
});

test('Retry-After integer/date/past/invalid is a floor; over-budget delay is not shortened',async()=>{
 for(const [header,delay] of [['4',4000],[new Date(Date.UTC(2026,10,18)+5000).toUTCString(),5000],['bad',1000],['-3',1000],[new Date(0).toUTCString(),1000]]){
  const c=clock();let calls=0;await access(async()=>++calls===1?response(429,{}, {'Retry-After':header}):response(200),{clock:c,rng:()=>0}).getSource('synthetic-A');assert.deepEqual(c.sleeps,[delay]);assert.equal(calls,2);
 }
 const c=clock();let calls=0;await assert.rejects(access(async()=>{calls++;return response(429,{}, {'Retry-After':'100'});},{clock:c}).getSource('synthetic-A'),{code:'SHEETS_RATE_LIMITED'});assert.equal(calls,1);assert.deepEqual(c.sleeps,[]);
});

test('100s total includes token/response/body/backoff; per-attempt timeout and late response cannot extend it',async()=>{
 const c=clock();let calls=0;
 const a=access(async()=>{calls++;if(calls===1){c.elapse(29000);return response(429,{}, {'Retry-After':'60'});}return new Promise(()=>{});},{clock:c,rng:()=>0});
 const pending=a.getSource('synthetic-A');const check=assert.rejects(pending,{code:'SHEETS_TIMEOUT'});await turns();assert.equal(calls,2);assert.equal(c.now(),89000);await c.advance(11000);await check;assert.equal(c.now(),100000);assert.equal(calls,2);
 const lateClock=clock();let release,fetches=0;
 const tokenWait=new Promise(r=>{release=r;});const b=access(async()=>{fetches++;return response(200);},{clock:lateClock,tokenProvider:()=>tokenWait});
 const denied=assert.rejects(b.getSource('synthetic-A'),{code:'SHEETS_TIMEOUT'});await turns();await lateClock.advance(100000);await denied;release('synthetic-late-token');await turns();assert.equal(fetches,0);
});

test('read network/stream errors retry but auth failures never issue Sheets fetch',async()=>{
 const c=clock();let calls=0;await access(async()=>{calls++;if(calls===1)throw Error('network');if(calls===2)return {...response(200),json:async()=>{throw TypeError('stream');}};return response(200);},{clock:c}).getSource('synthetic-A');assert.equal(calls,3);
 let writes=0;const a=access(async()=>{writes++;return response(200);},{tokenProvider:async()=>{throw Error('private-token-header');}});
 await assert.rejects(a.getSource('synthetic-A'),e=>e.code==='GOOGLE_AUTH_UNAVAILABLE'&&!JSON.stringify(e).includes('private-token-header'));
 const outcome=await a.writeValues('synthetic-A',[fill()],'auth-failure');assert.equal(outcome.remoteOutcome,'NOT_SENT');assert.equal(outcome.sent,false);assert.equal(writes,0);
});

test('write exact per-cell stringValue only in a single batch; empty fill is zero transport',async()=>{
 let calls=0;const a=access(async(url,o)=>{calls++;assert.equal(url,'https://sheets.googleapis.com/v4/spreadsheets/synthetic-A:batchUpdate');assert.equal(o.redirect,'error');assert.equal(o.method,'POST');const body=JSON.parse(o.body);assert.deepEqual(body,{requests:[{updateCells:{start:{sheetId:0,rowIndex:3,columnIndex:3},rows:[{values:[{userEnteredValue:{stringValue:'=1+2'}}]}],fields:'userEnteredValue'}}],includeSpreadsheetInResponse:false});return response(200,{});});
 assert.equal((await a.writeValues('synthetic-A',[],'empty')).remoteOutcome,'NOT_SENT');assert.equal(calls,0);
 const result=await a.writeValues('synthetic-A',[fill()],'one');assert.equal(result.remoteOutcome,'APPLIED');assert.equal(result.transportState,'SETTLED');assert.equal(calls,1);
});

for(const status of [400,401,403,404,429,500,502,503,504,302])test(`write status ${status} never replays and exposes safe outcome only`,async()=>{
 let calls=0;const a=access(async()=>{calls++;return response(status,{private:'do-not-leak'},{'Retry-After':'1'});});
 const result=await a.writeValues('synthetic-A',[fill()],'single');assert.equal(calls,1);assert.equal(result.remoteOutcome,[400,401,403,404,429].includes(status)?'KNOWN_REJECTED':'UNKNOWN');assert(!JSON.stringify(result).includes('do-not-leak'));
});

test('write lost reply, truncated response and 200s timeout are UNKNOWN, not cancellation or automatic retry',async()=>{
 for(const fetch of [async()=>{throw Error('private-config');},async()=>({...response(403),text:async()=>{throw Error('truncated');}}),async()=>({...response(200),text:async()=>{throw Error('lost-body');}})]){
  let calls=0;const result=await access(async(...args)=>{calls++;return fetch(...args);}).writeValues('synthetic-A',[fill()],'unknown');assert.equal(result.remoteOutcome,'UNKNOWN');assert.equal(calls,1);assert(!JSON.stringify(result).includes('private-config'));
 }
 const c=clock();let calls=0,late;const a=access(async()=>{calls++;return new Promise(r=>{late=r;});},{clock:c});
 const pending=a.writeValues('synthetic-A',[fill()],'timeout');await turns();await c.advance(200000);const result=await pending;assert.equal(result.remoteOutcome,'UNKNOWN');assert.equal(result.transportState,'IN_FLIGHT');assert.equal(calls,1);late(response(200,{}));await result.whenTransportSettled;await turns();assert.equal(result.transportState,'SETTLED');assert.equal(result.remoteOutcome,'UNKNOWN');
});

test('concurrent or repeated same attempt ID cannot emit a second write; different payload cannot reuse it',async()=>{
 let calls=0,release;const a=access(async()=>{calls++;await new Promise(r=>{release=r;});return response(200,{});});
 const first=a.writeValues('synthetic-A',[fill()],'same');await turns();
 const second=a.writeValues('synthetic-A',[fill()],'same');
 const rejected=await a.writeValues('synthetic-A',[fill('changed')],'same');assert.equal(rejected.sent,false);assert.equal(rejected.error.code,'INVALID_INPUT');
 assert.equal(calls,1);release();assert.equal(await first,await second);
 assert.equal((await a.writeValues('synthetic-A',[fill()],'same')).remoteOutcome,'APPLIED');assert.equal(calls,1);
});

test('reject oversized, non-text, surrogate, invalid or duplicate coordinates before send; never split/truncate',async()=>{
 let calls=0;const a=access(async()=>{calls++;return response(200);});
 for(const [fills,code] of [[[fill('x'.repeat(2*1024*1024))],'WRITEBACK_TOO_LARGE'],[[fill('\ud800')],'ANSWER_NOT_REPRESENTABLE'],[[fill(123)],'ANSWER_NOT_REPRESENTABLE'],[[{...fill(),location:{sheetId:-1,rowIndex:0,columnIndex:0}}],'INVALID_INPUT'],[[fill(),fill()],'INVALID_INPUT']]){
  const result=await a.writeValues('synthetic-A',fills,'invalid');assert.equal(result.sent,false);assert.equal(result.remoteOutcome,'NOT_SENT');assert.equal(result.error.code,code);
 }
 assert.equal(calls,0);
});

test('Sheets AppError details cannot pass arbitrary upstream secrets to HTTP envelope',async()=>{
 const error=new AppError('SHEETS_UNAVAILABLE',{headers:{Authorization:'private-value'},body:'private-value',operationId:'safe-id'});
 assert(!JSON.stringify(error).includes('private-value'));assert.equal(error.details?.operationId,'safe-id');assert.equal(error.status,502);
});

test('synthetic A/B cover distinct sparse positions, hidden/merged/excluded sheets and negative wire variants',async()=>{
 const a=syntheticSheetA(),b=syntheticSheetB(),cases=syntheticCases();
 assert.notEqual(a.spreadsheetId,b.spreadsheetId);assert.equal(a.sheets[0].properties.sheetId,0);
 assert(b.sheets.some(s=>s.properties.hidden));assert(b.sheets.some(s=>s.merges?.length));assert(b.sheets.some(s=>s.properties.sheetType==='OBJECT'));
 assert(cases.rich.sheets[0].data[0].rowData[0].values[0].textFormatRuns.length);
 assert.equal(cases.protectedSource.sheets[0].protectedRanges[0].requestingUserCanEdit,false);
 assert.equal(cases.unknown.sheets[0].protectedRanges,undefined);
 const fake=createFakeSheetsAccess();const copy=await fake.getSource('synthetic-A');copy.properties.title='mutated';assert.equal(fake.documents.get('synthetic-A').properties.title,'Synthetic A');
 await assert.rejects(fake.getSource('synthetic-missing'),{code:'SHEETS_ACCESS_UNAVAILABLE'});
});

test('fake can hold a write, apply then lose reply and fail readback, with explicit call counts',async()=>{
 let release,failReads=false;const gate=new Promise(r=>{release=r;});
 const fake=createFakeSheetsAccess({beforeRead:async()=>{if(failReads)throw new AppError('SHEETS_UNAVAILABLE');},beforeWrite:async()=>gate,afterApply:async()=>({sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'})});
 const before=structuredClone(fake.documents.get('synthetic-A'));
 const fills=[{location:{sheetId:0,rowIndex:3,columnIndex:2},answerText:'=literal answer'}];
 const writing=fake.writeValues('synthetic-A',fills,'fake-lost');await turns();assert.deepEqual(fake.documents.get('synthetic-A'),before);
 release();assert.equal((await writing).remoteOutcome,'UNKNOWN');
 const result=await fake.verify('synthetic-A',{});assert.equal(result.sheets[0].data[0].rowData[0].values[0].userEnteredValue.stringValue,'=literal answer');
 assert.deepEqual(result.sheets[0].data[0].rowData[0].values[0].userEnteredFormat,before.sheets[0].data[0].rowData[0].values[0].userEnteredFormat);
 assert.deepEqual(result.sheets[1],before.sheets[1]);
 await fake.writeValues('synthetic-A',fills,'fake-lost');assert.equal(fake.calls.filter(c=>c.method==='writeValues').length,1);
 failReads=true;await assert.rejects(fake.verify('synthetic-A',{}),{code:'SHEETS_UNAVAILABLE'});
});

test('app DI and synchronous quiz fixture keep Sheets outside existing rank/close processing',()=>{
 const runtime=createTestRuntime();assert.equal(runtime.context.sheetsAccess,runtime.sheetsAccess);assert.equal(runtime.sheetsAccess.calls.length,0);
 const f=quizFixture(2),source=f.c.store.activity.document;
 assert.equal(source.supportedSheets.get(0).sheetId,0);assert.equal(source.placeholderLocations.get(1).rowIndex,0);assert.equal(source.placeholderLocations.get(1).worksheetId,undefined);
 f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText:'synthetic answer'});f.c.questions.close(f.teacher,f.body);
 assert.equal(f.c.store.activity.questions.get(1).submissionsByGroup.get(1).receiveRank,1);assert.equal(f.c.sheetsAccess.calls.length,0);
});
