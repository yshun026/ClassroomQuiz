import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import ExcelJS from '../../backend/node_modules/exceljs/excel.js';
import {scenario} from './lifecycle-fixture.js';
test('teacher exports all phases, student denied, failed download preserves state',async({browser})=>{
 const f=await scenario(browser,3);try{
  const source=await readFile(new URL('../fixtures/guided-notes/fidelity.xlsx',import.meta.url));f.c.store.activity.document=await f.c.activity.notes.validateAndImport(source,'fidelity.xlsx');
  const teacher=await f.pageFor(f.teacher,'teacher'),student=await f.pageFor(f.students[0],'student');
  await expect(student.getByRole('button',{name:'匯出 Guided Notes'})).toHaveCount(0);
  async function download(name,expected){await expect(teacher.getByRole('status').first()).toContainText(name.toUpperCase());await expect(teacher.getByRole('button',{name:'匯出 Guided Notes'})).toBeEnabled();const before=f.c.activity.teacherView(),event=teacher.waitForEvent('download');await teacher.getByRole('button',{name:'匯出 Guided Notes'}).click();const item=await event;expect(item.suggestedFilename()).toBe('ClassroomQuiz-guided-notes.xlsx');const output=fileURLToPath(new URL('../records/us5/'+name+'.xlsx',import.meta.url));await item.saveAs(output);const w=new ExcelJS.Workbook();await w.xlsx.readFile(output);expect(w.getWorksheet('Notes').getCell('B3').value).toBe(expected);expect(w.getWorksheet('Notes').getCell('D5').value).toBe('{{Q2}}');expect(f.c.activity.teacherView()).toEqual(before);expect(source.equals(f.c.store.activity.document.originalBuffer)).toBe(true);}
  await mkdir(new URL('../records/us5/',import.meta.url),{recursive:true});await download('waiting','{{Q1}}');
  await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await student.getByLabel('答案',{exact:true}).fill('=1+2');await student.getByRole('button',{name:'提交答案',exact:true}).click();await expect(student.getByText('本題已提交',{exact:true})).toBeVisible();await download('answering','{{Q1}}');
  await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await download('results','=1+2');
  for(let n=2;n<=3;n++){await teacher.getByRole('button',{name:'下一題',exact:true}).click();await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();}await download('completed','=1+2');
  const denied=await student.evaluate(id=>fetch('/api/activity/guided-notes/export?activityId='+id,{headers:{Authorization:'Bearer '+localStorage.getItem('classroomquiz.session')}}).then(r=>r.status),f.c.store.activity.id);expect(denied).toBe(403);
  const before=f.c.activity.teacherView();await teacher.route('**/api/activity/guided-notes/export?*',route=>route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:{code:'EXPORT_FAILED',message:'匯出失敗，活動資料未變更'}})}));await teacher.getByRole('button',{name:'匯出 Guided Notes'}).click();await expect(teacher.getByRole('alert')).toHaveText('匯出失敗，活動資料未變更');expect(f.c.activity.teacherView()).toEqual(before);
 }finally{await f.cleanup();}
});
