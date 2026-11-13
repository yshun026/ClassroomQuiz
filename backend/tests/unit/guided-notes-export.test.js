import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {exportFixture} from '../helpers/export.js';
import {verifyWorkbookFidelity} from '../../src/services/workbook-fidelity.js';
import JSZip from 'jszip';

for(const answerText of ['ordinary_under_score','_x0041_','_x005F_x0041_','__x0041__','_x005F_','_x00af_','a\rb','a\nb','a\r\nb','a\u0000\u0001\u007fb',' leading \t trailing ','=1+2','文字😀<&>'])test(`export preserves exact answer ${JSON.stringify(answerText)}`,async()=>{
 const f=await exportFixture('fidelity');f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText});f.c.questions.close(f.teacher,f.body);
 const before=f.c.activity.teacherView(),snapshot=f.notes.exportClosedWinnerSnapshot(f.c,f.teacher,f.c.store.activity.id),output=await f.notes.renderExport(snapshot),w=new ExcelJS.Workbook();await w.xlsx.load(output);
 assert.equal(w.getWorksheet('Notes').getCell('B3').value,answerText);assert.equal(w.getWorksheet('Notes').getCell('B3').type,ExcelJS.ValueType.String);
 assert.deepEqual(f.c.activity.teacherView(),before);assert(f.source.equals(f.c.store.activity.document.originalBuffer));
 if(answerText==='_x0041_'){const zip=await JSZip.loadAsync(output);assert((await zip.file('xl/sharedStrings.xml').async('string')).includes('_x005F_x0041_'));}
});

test('fidelity validates expected answer values instead of blindly exempting target cells',async()=>{
 const f=await exportFixture();const location=f.c.store.activity.document.placeholderLocations.get(1);
 await assert.rejects(()=>verifyWorkbookFidelity(f.source,f.source,{allowedCells:[location],expectedFills:[{location,answerText:'expected winner'}]}),{code:'WORKBOOK_UNSUPPORTED'});
});

test('unrepresentable lone surrogate fails explicitly instead of replacing the accepted answer',async()=>{
 const f=await exportFixture();f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText:'a\ud800b'});f.c.questions.close(f.teacher,f.body);
 await assert.rejects(()=>f.notes.renderExport(f.notes.exportClosedWinnerSnapshot(f.c,f.teacher,f.c.store.activity.id)),{code:'EXPORT_FAILED'});
});
for(const name of ['valid-a','valid-b','fidelity','merged'])test(`export ${name}: dynamic cells, closed winner, original content and format`,async()=>{
 const f=await exportFixture(name),a=f.c.store.activity;
 f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[1],{...f.body,answerText:'=1+2'});f.c.submissions.submit(f.students[0],{...f.body,answerText:'later'});f.c.questions.close(f.teacher,f.body);
 const before=f.c.activity.teacherView(),snapshot=f.notes.exportClosedWinnerSnapshot(f.c,f.teacher,a.id),output=await f.notes.renderExport(snapshot),book=new ExcelJS.Workbook();await book.xlsx.load(output);
 for(const [n,loc] of a.document.placeholderLocations){const cell=book.getWorksheet(loc.worksheetId).getCell(loc.cellAddress);assert.equal(cell.value,n===1?'=1+2':`{{Q${n}}}`);if(n===1)assert.equal(cell.type,ExcelJS.ValueType.String);}
 assert.deepEqual(f.c.activity.teacherView(),before);assert(f.source.equals(a.document.originalBuffer));
 await verifyWorkbookFidelity(f.source,output,{allowedCells:snapshot.fills.map(x=>x.location)});
 const again=await f.notes.renderExport(f.notes.exportClosedWinnerSnapshot(f.c,f.teacher,a.id));const second=new ExcelJS.Workbook();await second.xlsx.load(again);assert.equal(second.worksheets[0].getCell('A1').value,'原始題目文字');
});
test('export-before-close and close-before-export yield consistent independent snapshots',async()=>{
 const f=await exportFixture(),a=f.c.store.activity;
 f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText:'winner'});
 const open=f.notes.exportClosedWinnerSnapshot(f.c,f.teacher,a.id);f.c.questions.close(f.teacher,f.body);
 const closed=f.notes.exportClosedWinnerSnapshot(f.c,f.teacher,a.id);const load=async s=>{const w=new ExcelJS.Workbook();await w.xlsx.load(await f.notes.renderExport(s));return w;};
 assert.equal((await load(open)).getWorksheet('Notes').getCell('B3').value,'{{Q1}}');assert.equal((await load(closed)).getWorksheet('Notes').getCell('B3').value,'winner');
 f.c.questions.next(f.teacher,f.body);f.c.questions.start(f.teacher,{...f.body,questionNumber:2});f.c.questions.close(f.teacher,{...f.body,questionNumber:2});
 assert.equal((await load(f.notes.exportClosedWinnerSnapshot(f.c,f.teacher,a.id))).getWorksheet('Notes').getCell('D5').value,'{{Q2}}');
});
test('fidelity check rejects unrelated edits even when answer changes are allowed',async()=>{
 const f=await exportFixture('fidelity'),w=new ExcelJS.Workbook();await w.xlsx.load(f.source);w.getWorksheet('Notes').getCell('A1').value='lost question';
 const altered=await w.xlsx.writeBuffer();await assert.rejects(()=>verifyWorkbookFidelity(f.source,altered,{allowedCells:[{worksheetId:1,cellAddress:'B3'}]}));
});
