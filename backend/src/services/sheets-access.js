import {GoogleAuth} from 'google-auth-library';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {loadServiceAccountCredentials} from '../config.js';
import {AppError} from '../api/errors.js';

export const SHEETS_SCOPE='https://www.googleapis.com/auth/spreadsheets';
const API='https://sheets.googleapis.com/v4/spreadsheets/';
export const SHEETS_FIELDS='spreadsheetId,properties(title),namedRanges(namedRangeId,range),sheets(properties(sheetId,title,index,sheetType,hidden,gridProperties(rowCount,columnCount)),merges,protectedRanges(protectedRangeId,range,namedRangeId,tableId,warningOnly,requestingUserCanEdit,unprotectedRanges),tables(tableId,range),data(startRow,startColumn,rowData(values(userEnteredValue,userEnteredFormat,textFormatRuns,chipRuns))))';
const MAX_BODY=2*1024*1024;
const defaultClock={now:()=>performance.now(),wallNow:()=>Date.now(),setTimeout:(fn,ms)=>setTimeout(fn,ms),clearTimeout:id=>clearTimeout(id)};
const safeError=(error,fallback='SHEETS_UNAVAILABLE')=>error instanceof AppError?new AppError(error.code):new AppError(fallback);
const errorView=error=>({code:error.code,message:error.message});
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]+$/.test(id);
const index=n=>Number.isSafeInteger(n)&&n>=0;

export function createServiceAccountTokenProvider({credentialPath,credentialLoader=loadServiceAccountCredentials,authFactory=options=>new GoogleAuth(options)}={}){
 let auth;
 return async()=>{
  try{
   if(!auth){const credentials=await credentialLoader(credentialPath);auth=authFactory({credentials,scopes:[SHEETS_SCOPE]});}
   const token=await auth.getAccessToken();
   if(typeof token!=='string'||!token||/[\r\n]/.test(token))throw Error();
   return token;
  }catch{throw new AppError('GOOGLE_AUTH_UNAVAILABLE');}
 };
}

class ReadFailure extends Error{
 constructor(code,retry=false,retryAfter=0){super(code);Object.assign(this,{code,retry,retryAfter});}
}
function statusCode(status){
 if(status===401)return 'GOOGLE_AUTH_UNAVAILABLE';
 if(status===403||status===404)return 'SHEETS_ACCESS_UNAVAILABLE';
 if(status===429)return 'SHEETS_RATE_LIMITED';
 return 'SHEETS_UNAVAILABLE';
}
function retryAfter(value,wallNow){
 if(typeof value!=='string')return 0;
 if(/^\d+$/.test(value.trim()))return Number(value.trim())*1000;
 // Reject non-HTTP-date strings (Date.parse accepts misleading things like "-3").
 if(!/^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value))return 0;
 const date=Date.parse(value);return Number.isFinite(date)?Math.max(0,date-wallNow):0;
}

// Protocol normalization only. Placeholder parsing / permissions belong to US1.
function normalizeSource(value,id){
 if(!value||value.spreadsheetId!==id||typeof value.properties?.title!=='string'||!Array.isArray(value.sheets))throw new AppError('SOURCE_UNSUPPORTED');
 const copy=structuredClone(value),seen=new Set();
 for(const sheet of copy.sheets){
  const p=sheet.properties;
  if(!p||!index(p.sheetId)||seen.has(p.sheetId)||typeof p.title!=='string')throw new AppError('SOURCE_UNSUPPORTED');
  seen.add(p.sheetId);p.sheetType??='GRID';p.hidden??=false;p.index??=0;
  if(p.sheetType!=='GRID')continue;
  if(!Number.isSafeInteger(p.gridProperties?.rowCount)||p.gridProperties.rowCount<1||!Number.isSafeInteger(p.gridProperties?.columnCount)||p.gridProperties.columnCount<1)throw new AppError('SOURCE_UNSUPPORTED');
  sheet.data??=[];sheet.merges??=[];
  if(!Array.isArray(sheet.data)||!Array.isArray(sheet.merges))throw new AppError('SOURCE_UNSUPPORTED');
  for(const grid of sheet.data){
   grid.startRow??=0;grid.startColumn??=0;grid.rowData??=[];
   if(!index(grid.startRow)||!index(grid.startColumn)||!Array.isArray(grid.rowData))throw new AppError('SOURCE_UNSUPPORTED');
   for(const row of grid.rowData){row.values??=[];if(!Array.isArray(row.values)||row.values.some(cell=>!cell||typeof cell!=='object'||Array.isArray(cell)))throw new AppError('SOURCE_UNSUPPORTED');}
  }
 }
 // Optional permission fields remain absent when invisible; never synthesize edit rights.
 return copy;
}

function batchBody(fills){
 if(!Array.isArray(fills))throw new AppError('INVALID_INPUT');
 const cells=new Set();
 const requests=fills.map(fill=>{
  const l=fill?.location;
  if(!l||![l.sheetId,l.rowIndex,l.columnIndex].every(index))throw new AppError('INVALID_INPUT');
  const key=`${l.sheetId}/${l.rowIndex}/${l.columnIndex}`;
  if(cells.has(key))throw new AppError('INVALID_INPUT');cells.add(key);
  if(typeof fill.answerText!=='string'||!fill.answerText.isWellFormed())throw new AppError('ANSWER_NOT_REPRESENTABLE');
  return {updateCells:{start:{sheetId:l.sheetId,rowIndex:l.rowIndex,columnIndex:l.columnIndex},rows:[{values:[{userEnteredValue:{stringValue:fill.answerText}}]}],fields:'userEnteredValue'}};
 });
 const body=JSON.stringify({requests,includeSpreadsheetInResponse:false});
 if(Buffer.byteLength(body,'utf8')>MAX_BODY)throw new AppError('WRITEBACK_TOO_LARGE');
 return body;
}
export {batchBody as buildWriteBatch};

export class SheetsAccess{
 #attempts=new Map();
 constructor({credentialPath,tokenProvider,fetch:transport=globalThis.fetch,clock=defaultClock,rng=Math.random}={}){
  this.tokenProvider=tokenProvider??createServiceAccountTokenProvider({credentialPath});
  this.transport=transport;this.clock=clock;this.rng=rng;
 }
 async #bounded(ms,work){
  const controller=new AbortController(),deadline=this.clock.now()+ms;
  const check=()=>{if(controller.signal.aborted||this.clock.now()>=deadline)throw new AppError('SHEETS_TIMEOUT');};
  let timer;
  try{
   return await Promise.race([
    new Promise((_,reject)=>{timer=this.clock.setTimeout(()=>{controller.abort();reject(new AppError('SHEETS_TIMEOUT'));},ms);}),
    Promise.resolve().then(()=>work(controller.signal,check)).then(result=>{check();return result;})
   ]);
  }finally{this.clock.clearTimeout(timer);}
 }
 async #token(){try{
  const token=await this.tokenProvider();if(typeof token!=='string'||!token||/[\r\n]/.test(token))throw Error();return token;
 }catch{throw new AppError('GOOGLE_AUTH_UNAVAILABLE');}}
 async getSource(id){
  if(!validId(id))throw new AppError('SHEETS_URL_INVALID');
  const deadline=this.clock.now()+100000;
  const url=new URL(API+id);url.searchParams.set('fields',SHEETS_FIELDS);
  for(let attempt=0;attempt<3;attempt++){
   if(this.clock.now()>=deadline)throw new AppError('SHEETS_TIMEOUT');
   try{
    return await this.#bounded(Math.min(30000,deadline-this.clock.now()),async(signal,check)=>{
     const token=await this.#token();check();
     const response=await this.transport(url.href,{method:'GET',redirect:'error',headers:{Authorization:`Bearer ${token}`},signal});check();
     const after=retryAfter(response.headers?.get('Retry-After'),this.clock.wallNow());
     if(response.status<200||response.status>=300){
      await response.text();check();
      throw new ReadFailure(statusCode(response.status),response.status===429||response.status>=500,after);
     }
     let data;try{data=await response.json();}catch(error){if(error instanceof SyntaxError)throw new AppError('SOURCE_UNSUPPORTED');throw error;}
     check();return normalizeSource(data,id);
    });
   }catch(error){
    const failure=error instanceof ReadFailure?error:error instanceof AppError?new ReadFailure(error.code,error.code==='SHEETS_TIMEOUT'):new ReadFailure('SHEETS_UNAVAILABLE',true);
    if(this.clock.now()>=deadline)throw new AppError('SHEETS_TIMEOUT');
    if(!failure.retry||attempt===2)throw new AppError(failure.code);
    const jitter=Math.min(250,Math.max(0,Math.floor(this.rng()*251)));
    const delay=Math.max((attempt+1)*1000+jitter,failure.retryAfter);
    if(delay>=deadline-this.clock.now())throw new AppError(failure.code);
    if(this.clock.sleep)await this.clock.sleep(delay);
    else await new Promise(resolve=>this.clock.setTimeout(resolve,delay));
   }
  }
 }
 verify(sourceId,_originalOperation){return this.getSource(sourceId);}
 async writeValues(sourceId,fills,attemptId){
  const notSent=error=>({attemptId,sent:false,transportState:'NOT_SENT',remoteOutcome:'NOT_SENT',...(error?{error:errorView(safeError(error))}:{})});
  let body;
  try{
   if(!validId(sourceId))throw new AppError('SHEETS_URL_INVALID');
   if(typeof attemptId!=='string'||!attemptId||attemptId.length>100)throw new AppError('INVALID_INPUT');
   body=batchBody(fills);if(!fills.length)return notSent();
  }catch(error){return notSent(error);}
  const hash=createHash('sha256').update(sourceId).update('\0').update(body).digest('hex');
  const prior=this.#attempts.get(attemptId);
  if(prior)return prior.hash===hash?prior.promise:notSent(new AppError('INVALID_INPUT'));
  // Register before authentication awaits: even duplicate concurrent invocations use one attempt.
  const promise=this.#write(sourceId,body,attemptId);
  this.#attempts.set(attemptId,{hash,promise});return promise;
 }
 async #write(sourceId,body,attemptId){
  let sent=false,settled=false,notifySettled;
  const whenTransportSettled=new Promise(resolve=>{notifySettled=resolve;});
  const result=value=>{
   const state={attemptId,sent,transportState:sent?(settled?'SETTLED':'IN_FLIGHT'):'NOT_SENT',...value};
   if(sent){
    // Internal lifecycle only, never a browser view. Timeout is NOT transport settlement.
    Object.defineProperty(state,'whenTransportSettled',{value:whenTransportSettled});
    whenTransportSettled.then(()=>{state.transportState='SETTLED';});
   }
   return state;
  };
  try{
   const outcome=await this.#bounded(200000,async(signal,check)=>{
    try{
    const token=await this.#token();check();
    sent=true;
    const response=await this.transport(API+sourceId+':batchUpdate',{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body,signal});
    // A truncated rejection is not a complete known rejection. Never retain/log its body.
    await response.text();check();
    if(response.status>=200&&response.status<300)return {remoteOutcome:'APPLIED'};
    return {remoteOutcome:[400,401,403,404,429].includes(response.status)?'KNOWN_REJECTED':'UNKNOWN',error:errorView(new AppError(statusCode(response.status)))};
    }finally{settled=true;notifySettled();}
   });
   return result(outcome);
  }catch(error){return result({remoteOutcome:sent?'UNKNOWN':'NOT_SENT',error:errorView(safeError(error))});}
 }
}
