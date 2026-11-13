import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import ExcelJS from '../../backend/node_modules/exceljs/excel.js';
import {scenario} from './lifecycle-fixture.js';

test('escape-like answer stays literal through browser submission and downloaded workbook',async({browser})=>{
 const f=await scenario(browser,1);try{
  f.c.store.activity.document=await f.c.activity.notes.validateAndImport(await readFile(new URL('../fixtures/guided-notes/single-question.xlsx',import.meta.url)),'single-question.xlsx');
  const teacher=await f.pageFor(f.teacher,'teacher'),student=await f.pageFor(f.students[0],'student'),answer='_x0041_\n_x005F_x0041_\n=1+2\nordinary_under_score';
  await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await student.getByLabel('答案',{exact:true}).fill(answer);await student.getByRole('button',{name:'提交答案',exact:true}).click();await expect(student.getByText('本題已提交',{exact:true})).toBeVisible();await expect(teacher.getByRole('table',{name:'當題提交紀錄'})).toContainText('_x0041_');
  await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await expect(teacher.getByRole('status').first()).toContainText('COMPLETED');await expect(teacher.getByRole('button',{name:'匯出 Guided Notes'})).toBeEnabled();
  const event=teacher.waitForEvent('download');await teacher.getByRole('button',{name:'匯出 Guided Notes'}).click();const download=await event;
  await mkdir(new URL('../records/convergence/',import.meta.url),{recursive:true});const path=fileURLToPath(new URL('../records/convergence/escape-answer.xlsx',import.meta.url));await download.saveAs(path);
  const w=new ExcelJS.Workbook();await w.xlsx.readFile(path);expect(w.getWorksheet('Notes').getCell('B3').value).toBe(answer);expect(w.getWorksheet('Notes').getCell('B3').type).toBe(ExcelJS.ValueType.String);expect(w.getWorksheet('Notes').getCell('A1').value).toBe('原始題目文字');
 }finally{await f.cleanup();}
});
