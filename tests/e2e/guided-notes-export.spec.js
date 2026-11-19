import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {scenario} from './lifecycle-fixture.js';
test('retired XLSX endpoint preserves authorization and activity in all four phases',async({browser})=>{
 const f=await scenario(browser,3);try{
  const teacher=await f.pageFor(f.teacher,'teacher'),student=await f.pageFor(f.students[0],'student');
  for(const phase of ['WAITING','ANSWERING','RESULTS','COMPLETED']){
   if(phase==='ANSWERING'){await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await student.getByLabel('答案',{exact:true}).fill('=1+2');await student.getByRole('button',{name:'提交答案',exact:true}).click();await expect(student.getByText('本題已提交',{exact:true})).toBeVisible();}
   if(phase==='RESULTS')await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();
   if(phase==='COMPLETED')for(let n=2;n<=3;n++){await teacher.getByRole('button',{name:'下一題',exact:true}).click();await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();}
   await expect(teacher.getByRole('status').first()).toContainText(phase);
   await expect(teacher.getByRole('button',{name:'寫回 Google Sheets',exact:true})).toBeVisible();
   await expect(teacher.getByRole('button',{name:'匯出 Guided Notes'})).toHaveCount(0);
   await expect(student.getByRole('button',{name:'寫回 Google Sheets',exact:true})).toHaveCount(0);
   const before=f.c.activity.teacherView();
   const retired=await teacher.evaluate(()=>fetch('/api/activity/guided-notes/export',{headers:{Authorization:'Bearer '+localStorage.getItem('classroomquiz.session')}}).then(async r=>({status:r.status,body:await r.json(),disposition:r.headers.get('content-disposition')})));
   expect(retired.status).toBe(410);expect(retired.body.error.code).toBe('EXCEL_FLOW_RETIRED');expect(retired.disposition).toBeNull();expect(f.c.activity.teacherView()).toEqual(before);
  }
  expect(await student.evaluate(()=>fetch('/api/activity/guided-notes/export',{headers:{Authorization:'Bearer '+localStorage.getItem('classroomquiz.session')}}).then(r=>r.status))).toBe(403);
  expect(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues')).toHaveLength(0);
 }finally{await f.cleanup();}
});
