import test from 'node:test';
import assert from 'node:assert/strict';
import {GuidedNotesService} from '../../src/services/guided-notes-service.js';
import {checkSourceConsistency} from '../../src/services/source-consistency.js';
import {WritebackEvidence} from '../../src/models/writeback-evidence.js';
import {syntheticSheetA,syntheticSheetB} from '../../../tests/fixtures/google-sheets/sources.js';
const load=s=>new GuidedNotesService().parseSource(s,`https://docs.google.com/spreadsheets/d/${s.spreadsheetId}/edit`);
const target=s=>s.sheets[0].data[0].rowData[0].values[0];

test('stable IDs survive rename/reorder, whole-cell formats; formula calculation values are not definitions',()=>{
 const raw=syntheticSheetB(),source=load(raw);raw.sheets.reverse();raw.sheets.forEach(s=>{s.properties.title+=' renamed';s.properties.index=4;});checkSourceConsistency(source,raw,{activityId:'a'});
 const a=syntheticSheetA(),original=load(a);target(a).userEnteredFormat={textFormat:{bold:false}};a.sheets[0].data[1].rowData[0].values[0].effectiveValue={numberValue:99};checkSourceConsistency(original,a,{activityId:'a'});
});
test('unexplained same-as-answer, structure, formula, non-target changes and new partial formats conflict',()=>{
 const mutations=[s=>{s.spreadsheetId='wrong';},s=>{s.sheets.pop();},s=>{s.sheets[0].properties.gridProperties.rowCount++;},s=>{s.sheets[0].merges=[{sheetId:0,startRowIndex:3,endRowIndex:4,startColumnIndex:2,endColumnIndex:4}];},s=>{target(s).userEnteredValue={stringValue:'answer'};},s=>{target(s).userEnteredValue={formulaValue:'="{{Q1}}"'};},s=>{target(s).textFormatRuns=[{startIndex:0,format:{bold:true}}];},s=>{s.sheets[0].data[1].rowData[0].values[0].userEnteredValue.formulaValue='=9';}];
 for(const change of mutations){const raw=syntheticSheetA(),source=load(raw);change(raw);assert.throws(()=>checkSourceConsistency(source,raw,{activityId:'a'}),{code:'SOURCE_CONFLICT'});}
});
test('evidence/pending explanations replace markers before parsing, including marker-like answer text',()=>{
 const raw=syntheticSheetA(),source=load(raw),location=source.placeholderLocations.get(1);
 target(raw).userEnteredValue={stringValue:'{{Q2}}'};
 const evidence=new Map([[1,new WritebackEvidence({activityId:'a',spreadsheetId:source.spreadsheetId,questionNumber:1,location,exactText:'{{Q2}}',operationId:'op'})]]);
 const checked=checkSourceConsistency(source,raw,{activityId:'a',evidence});assert(checked.verified.has(1));
 assert.throws(()=>checkSourceConsistency(source,raw,{activityId:'other',evidence}),{code:'SOURCE_CONFLICT'});
 const pendingOperation={snapshot:{activityId:'a',sourceId:source.spreadsheetId,fills:[{questionNumber:1,location,answerText:'{{Q2}}'}]},attempts:[{sent:true,targetQuestionNumbers:[1]}]};
 assert(checkSourceConsistency(source,raw,{activityId:'a',pendingOperation}).verified.has(1));
 pendingOperation.attempts[0].sent=false;assert.throws(()=>checkSourceConsistency(source,raw,{activityId:'a',pendingOperation}),{code:'SOURCE_CONFLICT'});
 target(raw).userEnteredValue={stringValue:'{{Q1}}'};assert.throws(()=>checkSourceConsistency(source,raw,{activityId:'a',evidence}),{code:'SOURCE_CONFLICT'});
});
