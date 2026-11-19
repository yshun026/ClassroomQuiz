import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {scenario} from './lifecycle-fixture.js';
test('literal browser answer is written as an exact Sheets string without a formal Excel UI',async({browser})=>{
 const f=await scenario(browser,1);try{
  const teacher=await f.pageFor(f.teacher,'teacher'),student=await f.pageFor(f.students[0],'student'),answer='_x0041_\n_x005F_x0041_\n=1+2\nordinary_under_score';
  await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await student.getByLabel('答案',{exact:true}).fill(answer);await student.getByRole('button',{name:'提交答案',exact:true}).click();await expect(student.getByText('本題已提交',{exact:true})).toBeVisible();await expect(teacher.getByRole('table',{name:'當題提交紀錄'})).toContainText('_x0041_');
  await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await expect(teacher.getByRole('status').first()).toContainText('COMPLETED');await expect(teacher.getByRole('button',{name:'匯出 Guided Notes'})).toHaveCount(0);
  const original=structuredClone(f.c.sheetsAccess.documents.get('synthetic-quiz'));
  await teacher.getByRole('button',{name:'寫回 Google Sheets',exact:true}).click();await expect(teacher.getByTestId('writeback-status')).toHaveText('已讀回核對完成');
  const expected=structuredClone(original);expected.sheets[0].data[0].rowData[0].values[0].userEnteredValue={stringValue:answer};
  expect(f.c.sheetsAccess.documents.get('synthetic-quiz')).toEqual(expected);
  expect(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues')).toHaveLength(1);
 }finally{await f.cleanup();}
});
