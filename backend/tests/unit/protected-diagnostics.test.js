import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnoseProtected,editabilityState,PROTECTED_DIAGNOSTIC_CODES} from '../helpers/protected-diagnostics.js';
import {SheetsAccess} from '../../src/services/sheets-access.js';
import {syntheticSheetA,syntheticSheetB} from '../../../tests/fixtures/google-sheets/sources.js';
const protection=(fields={})=>({range:{sheetId:0,startRowIndex:3,endRowIndex:4,startColumnIndex:2,endColumnIndex:3},requestingUserCanEdit:false,...fields});
async function diagnose(rules,change=()=>{}){const raw=syntheticSheetA();if(rules!==undefined)raw.sheets[0].protectedRanges=rules;change(raw);let reads=0;
 const result=await diagnoseProtected({access:{getSource:async()=>{reads++;return raw;},writeValues:()=>{throw Error('write forbidden');}},sourceId:raw.spreadsheetId});assert.equal(reads,1);assert.deepEqual(Object.keys(result).sort(),['codes','passed']);return result;}
test('protected diagnostic confirms denial only when the original parser throws SHEETS_NOT_EDITABLE',async()=>{
 assert.deepEqual(await diagnose([protection()]),{passed:true,codes:['P_DENIED_CONFIRMED']});
 assert.deepEqual(await diagnose(undefined),{passed:false,codes:['P_NO_PROTECTION']});
});
test('missing, null and non-boolean editability remain unknown; true is not denial',async()=>{
 assert.deepEqual(await diagnose([{range:protection().range}]),{passed:false,codes:['P_EDITABILITY_MISSING','P_EDITABILITY_UNKNOWN']});
 for(const value of [undefined,null,'false',0])assert.deepEqual(await diagnose([protection({requestingUserCanEdit:value})]),{passed:false,codes:[value===null?'P_EDITABILITY_NULL':'P_EDITABILITY_NON_BOOLEAN','P_EDITABILITY_UNKNOWN']});
 assert.deepEqual(await diagnose([protection({requestingUserCanEdit:true})]),{passed:false,codes:['P_EDITABILITY_TRUE','P_EDITABILITY_ALLOWED']});
});
test('source validation failure precedes protection analysis and reveals no private payload',async()=>{
 const result=await diagnose([protection()],raw=>{raw.sheets[0].data[0].rowData[0].values[0].userEnteredValue={stringValue:'private-sentinel{{Q0}}'};});
 assert.deepEqual(result,{passed:false,codes:['P_SOURCE_INVALID']});assert(!JSON.stringify(result).includes('private-sentinel'));
});
test('read failure and unexpected parser exception serialize fixed codes only',async()=>{
 const secret='SENSITIVE_SENTINEL_'+Math.random();
 const failed=await diagnoseProtected({access:{getSource:async()=>{throw Object.assign(Error(secret),{body:secret,config:{headers:{Authorization:secret}}});}},sourceId:secret});
 assert.deepEqual(failed,{passed:false,codes:['P_READ_FAILED']});
 const wrongStage=await diagnoseProtected({access:{getSource:async()=>{throw {code:'SHEETS_NOT_EDITABLE',message:secret};}},sourceId:secret});assert.deepEqual(wrongStage,{passed:false,codes:['P_READ_FAILED']});
 const unexpected=await diagnoseProtected({access:{getSource:async()=>syntheticSheetA()},sourceId:'synthetic-A',notes:{parseSource:()=>{throw Object.assign(Error(secret),{code:secret});}}});
 assert.deepEqual(unexpected,{passed:false,codes:['P_DIAGNOSTIC_UNAVAILABLE']});
 for(const result of [failed,unexpected])assert(!JSON.stringify(result).includes(secret));
});
test('no answer match requires all protection references resolved, and warning/exceptions are observations',async()=>{
 assert.deepEqual(await diagnose([protection({range:{sheetId:0,startRowIndex:20,endRowIndex:21,startColumnIndex:2,endColumnIndex:3}})]),{passed:false,codes:['P_NO_ANSWER_MATCH']});
 assert.deepEqual(await diagnose([{namedRangeId:'missing',requestingUserCanEdit:false}]),{passed:false,codes:['P_REFERENCE_UNRESOLVED']});
 assert.deepEqual(await diagnose([protection({warningOnly:true})]),{passed:false,codes:['P_EDITABILITY_FALSE','P_WARNING_ONLY']});
 assert.deepEqual(await diagnose([{range:{sheetId:0},requestingUserCanEdit:false,unprotectedRanges:[{...protection().range,endColumnIndex:5}]}]),{passed:false,codes:['P_EDITABILITY_FALSE','P_EXCEPTION_MATCH']});
});
test('multiple rules retain distinct reasons; one known denial still passes despite other uncertain rules',async()=>{
 const mixed=await diagnose([protection({warningOnly:true}),protection({requestingUserCanEdit:null}),{namedRangeId:'missing',requestingUserCanEdit:false}]);
 assert.deepEqual(new Set(mixed.codes),new Set(['P_EDITABILITY_FALSE','P_WARNING_ONLY','P_EDITABILITY_NULL','P_EDITABILITY_UNKNOWN','P_REFERENCE_UNRESOLVED','P_MULTIPLE_MATCHING_PROTECTIONS','P_EDITABILITY_MIXED']));assert.equal(mixed.passed,false);
 assert.deepEqual(await diagnose([protection({warningOnly:true}),{namedRangeId:'missing',requestingUserCanEdit:false},protection()]),{passed:true,codes:['P_DENIED_CONFIRMED']});
});
test('sheet exceptions, named/table references and merged master use the source mapping',async()=>{
 assert.deepEqual(await diagnose([{range:{sheetId:0},requestingUserCanEdit:false,unprotectedRanges:[{sheetId:999}]}]),{passed:false,codes:['P_EDITABILITY_FALSE','P_REFERENCE_UNRESOLVED']});
 for(const kind of ['namedRangeId','tableId']){
  const result=await diagnose([{[kind]:'ref',requestingUserCanEdit:false}],raw=>{const range=protection().range;if(kind==='namedRangeId')raw.namedRanges=[{namedRangeId:'ref',range}];else raw.sheets[0].tables=[{tableId:'ref',range}];});assert.equal(result.passed,true);
 }
 const hidden=await diagnose(undefined,raw=>{raw.sheets[1].protectedRanges=[{range:{sheetId:2},requestingUserCanEdit:false}];});assert.equal(hidden.passed,true);
 for(const startColumnIndex of [2,3]){
  const raw=syntheticSheetB();raw.sheets[1].protectedRanges=[{range:{sheetId:9,startRowIndex:10,endRowIndex:11,startColumnIndex,endColumnIndex:4},requestingUserCanEdit:false}];
  const checked=await diagnoseProtected({access:{getSource:async()=>raw},sourceId:raw.spreadsheetId});
  assert.deepEqual(checked,{passed:startColumnIndex===2,codes:[startColumnIndex===2?'P_DENIED_CONFIRMED':'P_NO_ANSWER_MATCH']});
 }
});
test('diagnostic result cannot contain raw source, coordinates, identities, exceptions or caller strings',async()=>{
 const result=await diagnose([protection({requestingUserCanEdit:null})],raw=>{raw.properties.title='PRIVATE_TITLE';raw.sheets[0].properties.title='PRIVATE_SHEET';});
 assert.deepEqual(result,{passed:false,codes:['P_EDITABILITY_NULL','P_EDITABILITY_UNKNOWN']});for(const code of result.codes)assert(PROTECTED_DIAGNOSTIC_CODES.includes(code));
 assert(!/PRIVATE|sheetId|spreadsheetId|cellAddress|token|stack|message/.test(JSON.stringify(result)));
});

test('GET JSON and production normalization preserve missing/null/nonboolean/true/false using fake transport only',async()=>{
 for(const [value,state] of [[undefined,'P_EDITABILITY_MISSING'],[null,'P_EDITABILITY_NULL'],['false','P_EDITABILITY_NON_BOOLEAN'],[true,'P_EDITABILITY_TRUE'],[false,'P_EDITABILITY_FALSE']]){
  const raw=syntheticSheetA(),rule={range:protection().range};if(value!==undefined)rule.requestingUserCanEdit=value;raw.sheets[0].protectedRanges=[rule];let gets=0;
  const access=new SheetsAccess({tokenProvider:async()=>'synthetic-offline-token',fetch:async(url,options)=>{gets++;assert.equal(options.method,'GET');assert(new URL(url).searchParams.get('fields').includes('requestingUserCanEdit'));return new Response(JSON.stringify(raw),{status:200});}});
  const normalized=await access.getSource(raw.spreadsheetId),actual=normalized.sheets[0].protectedRanges[0];
  assert.equal(Object.hasOwn(actual,'requestingUserCanEdit'),Object.hasOwn(rule,'requestingUserCanEdit'));assert.equal(actual.requestingUserCanEdit,value);assert.equal(editabilityState(actual),state);assert.equal(gets,1);
 }
});

test('distinct protection states remain distinct, identical unknown rules still reveal multiplicity without identities',async()=>{
 const same=await diagnose([{range:protection().range},{range:protection().range}]);assert.deepEqual(same,{passed:false,codes:['P_EDITABILITY_MISSING','P_EDITABILITY_UNKNOWN','P_MULTIPLE_MATCHING_PROTECTIONS']});
 const mixed=await diagnose([{range:protection().range},protection({requestingUserCanEdit:null}),protection({requestingUserCanEdit:'PRIVATE_VALUE'})]);
 assert.equal(mixed.passed,false);for(const code of ['P_EDITABILITY_MISSING','P_EDITABILITY_NULL','P_EDITABILITY_NON_BOOLEAN','P_MULTIPLE_MATCHING_PROTECTIONS','P_EDITABILITY_MIXED'])assert(mixed.codes.includes(code));assert(!JSON.stringify(mixed).includes('PRIVATE_VALUE'));
});
