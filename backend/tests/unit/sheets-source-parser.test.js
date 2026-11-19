import test from 'node:test';
import assert from 'node:assert/strict';
import {GuidedNotesService,parseSheetsUrl} from '../../src/services/guided-notes-service.js';
import {syntheticSheetA,syntheticSheetB,syntheticCases} from '../../../tests/fixtures/google-sheets/sources.js';
const parse=source=>new GuidedNotesService().parseSource(source,`https://docs.google.com/spreadsheets/d/${source.spreadsheetId}/edit`);
test('URL allowlist parses identity only and drops gid/share query',()=>{
 assert.deepEqual(parseSheetsUrl('https://docs.google.com/spreadsheets/d/synthetic-A/edit?share=private#gid=7'),{spreadsheetId:'synthetic-A',canonicalUrl:'https://docs.google.com/spreadsheets/d/synthetic-A/edit'});
 for(const url of ['http://docs.google.com/spreadsheets/d/a/edit','https://docs.google.com.attacker.invalid/spreadsheets/d/a','https://user:pass@docs.google.com/spreadsheets/d/a','https://docs.google.com:444/spreadsheets/d/a','https://docs.google.com/spreadsheets/d/e/published','https://short.invalid/a','https://docs.google.com/spreadsheets/d/a/../b','https://docs.google.com/spreadsheets/d/a/%2e%2e/b','https://docs.google.com\\@attacker.invalid/spreadsheets/d/a',null])assert.throws(()=>parseSheetsUrl(url),{code:'SHEETS_URL_INVALID'});
});
test('dynamic A/B all GRID sheets including hidden, sheet zero, offsets, holes and merged master',()=>{
 const a=parse(syntheticSheetA()),b=parse(syntheticSheetB());assert.equal(a.placeholderLocations.size,3);assert.equal(a.placeholderLocations.get(1).sheetId,0);assert.equal(a.placeholderLocations.get(1).cellAddress,'C4');assert.equal(a.placeholderLocations.get(2).cellAddress,'E4');assert.equal(b.placeholderLocations.get(3).cellAddress,'C11');assert.equal(b.excludedSheets.length,1);assert.equal(b.supportedSheets.size,2);assert.equal(a.permissionAssessment,'UNKNOWN');
 assert.throws(()=>a.placeholderLocations.set(9,{}));assert.throws(()=>a.baselineCellValues.clear());
 assert.equal(a.baselineCellValues.get('0/8/1').formulaValue,'=1+2');
});
for(const [value,code] of [['{{Q0}}','PLACEHOLDER_INVALID'],['{{Q01}}','PLACEHOLDER_INVALID'],['{{q1}}','PLACEHOLDER_INVALID'],['{{Q1}} ','PLACEHOLDER_INVALID'],[' {{Q1}}','PLACEHOLDER_INVALID'],['{{Q1}','PLACEHOLDER_INVALID'],['x{{Q1}}','PLACEHOLDER_INVALID'],['{Q1}','PLACEHOLDER_INVALID'],['{{Q1}}{{Q2}}','PLACEHOLDER_INVALID'],['{{Q9007199254740992}}','PLACEHOLDER_INVALID'],['{{Q4}}','QUESTION_GAP']])test(`reject marker ${value}`,()=>{
 const s=syntheticSheetA();s.sheets[0].data[0].rowData[0].values[0]={userEnteredValue:{stringValue:value}};assert.throws(()=>parse(s),{code});
});
test('reject formula, cross-sheet duplicate, no markers, partial runs and chips with safe locations',()=>{
 const cases=syntheticCases();for(const [s,code] of [[cases.duplicate,'PLACEHOLDER_DUPLICATE'],[cases.formula,'PLACEHOLDER_INVALID'],[cases.rich,'ANSWER_CELL_FORMAT_UNSUPPORTED']])assert.throws(()=>parse(s),e=>e.code===code&&!!e.details.locations[0].cellAddress);
 const blank=syntheticSheetA();blank.sheets.forEach(s=>{s.data=[];});assert.throws(()=>parse(blank),{code:'PLACEHOLDER_MISSING'});
 const chip=syntheticSheetA();chip.sheets[0].data[0].rowData[0].values[0].chipRuns=[{startIndex:0}];assert.throws(()=>parse(chip),{code:'ANSWER_CELL_FORMAT_UNSUPPORTED'});
});
test('known protection denial rejects; unknown/warning/editable allow with no guarantee; sheet exceptions subtract',()=>{
 const s=syntheticCases().protectedSource;assert.throws(()=>parse(s),{code:'SHEETS_NOT_EDITABLE'});
 for(const protection of [{range:{sheetId:0},requestingUserCanEdit:false,warningOnly:true},{range:{sheetId:0},requestingUserCanEdit:true},{namedRangeId:'missing',requestingUserCanEdit:false},{range:{sheetId:0},requestingUserCanEdit:false,unprotectedRanges:[{sheetId:0,startRowIndex:3,endRowIndex:4,startColumnIndex:2,endColumnIndex:5}]}]){
  const a=syntheticSheetA();a.sheets[0].protectedRanges=[protection];assert.equal(parse(a).permissionAssessment,'UNKNOWN');
 }
});
test('named-range/table protections resolve dynamically; missing refs remain unknown',()=>{
 for(const type of ['namedRangeId','tableId']){const a=syntheticSheetA();a.sheets[0].protectedRanges=[{[type]:'ref',requestingUserCanEdit:false}];const range={sheetId:0,startRowIndex:3,endRowIndex:4,startColumnIndex:2,endColumnIndex:3};if(type==='tableId')a.sheets[0].tables=[{tableId:'ref',range}];else a.namedRanges=[{namedRangeId:'ref',range}];assert.throws(()=>parse(a),{code:'SHEETS_NOT_EDITABLE'});}
});

test('single-question Sheets source has exactly one dynamic marker without stale XLSX dimensions',()=>{
 const source=syntheticSheetA();
 for(const sheet of source.sheets)for(const block of sheet.data??[])for(const row of block.rowData??[])for(const cell of row.values??[]){if(['{{Q2}}','{{Q3}}'].includes(cell.userEnteredValue?.stringValue))delete cell.userEnteredValue;}
 const parsed=parse(source);assert.equal(parsed.placeholderLocations.size,1);assert.equal(parsed.placeholderLocations.get(1).cellAddress,'C4');
});
