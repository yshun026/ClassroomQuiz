import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {scenario} from './lifecycle-fixture.js';

test('manual writeback selects closed first-rank answer; worker does not block next question or leak progress',async({browser})=>{
 const f=await scenario(browser,3);let release;try{
  const teacher=await f.pageFor(f.teacher,'teacher'),first=await f.pageFor(f.students[0],'student'),second=await f.pageFor(f.students[1],'student');
  const button=teacher.getByRole('button',{name:'寫回 Google Sheets',exact:true});
  await button.click();await expect(teacher.getByTestId('writeback-status')).toHaveText('無可寫回答案');
  expect(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues')).toHaveLength(0);
  await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();
  await first.getByLabel('答案',{exact:true}).fill('first literal =1+2');await first.getByRole('button',{name:'提交答案',exact:true}).click();await expect(first.getByText('本題已提交',{exact:true})).toBeVisible();
  await second.getByLabel('答案',{exact:true}).fill('second');await second.getByRole('button',{name:'提交答案',exact:true}).click();await expect(second.getByText('本題已提交',{exact:true})).toBeVisible();
  expect(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues')).toHaveLength(0);
  await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();
  const original=f.c.sheetsAccess.writeValues.bind(f.c.sheetsAccess),gate=new Promise(r=>{release=r;});
  f.c.sheetsAccess.writeValues=async(...args)=>{await gate;return original(...args);};
  await button.click();await expect(button).toBeDisabled();await expect(teacher.getByTestId('writeback-status')).toHaveText('正在寫回');
  await teacher.getByRole('button',{name:'下一題',exact:true}).click();await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();
  await second.getByLabel('答案',{exact:true}).fill('Q2 private');await second.getByRole('button',{name:'提交答案',exact:true}).click();await expect(second.getByText('本題已提交',{exact:true})).toBeVisible();
  await expect(first.getByText('Q2 private',{exact:true})).toHaveCount(0);await expect(first.getByLabel('Google Sheets 寫回')).toHaveCount(0);
  await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();release();
  await expect(teacher.getByTestId('writeback-status')).toHaveText('已讀回核對完成');
  await expect(teacher.getByRole('table',{name:'寫回逐題結果'})).toContainText('Q1');await expect(teacher.getByRole('table',{name:'寫回逐題結果'})).not.toContainText('Q2');
  const rows=f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].data[0].rowData;
  expect(rows[0].values[0].userEnteredValue).toEqual({stringValue:'first literal =1+2'});expect(rows[1].values[0].userEnteredValue).toEqual({stringValue:'{{Q2}}'});
  expect(f.c.store.activity.questions.get(2).submissionsByGroup.get(2).receiveRank).toBe(1);
  await teacher.reload();await expect(teacher.getByTestId('writeback-status')).toHaveText('已讀回核對完成');expect(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues')).toHaveLength(1);
 }finally{release?.();await f.cleanup();}
});

test('HTTP success with failed readback stays pending and reload only reads local operation',async({browser})=>{
 const f=await scenario(browser,1);try{
  const teacher=await f.pageFor(f.teacher,'teacher'),student=await f.pageFor(f.students[0],'student');
  await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await student.getByLabel('答案',{exact:true}).fill('answer');await student.getByRole('button',{name:'提交答案',exact:true}).click();await expect(student.getByText('本題已提交',{exact:true})).toBeVisible();await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();
  f.c.sheetsAccess.verify=async()=>{throw Error('private Google failure');};
  await teacher.getByRole('button',{name:'寫回 Google Sheets',exact:true}).click();await expect(teacher.getByTestId('writeback-status')).toHaveText('結果待核對');
  await expect(teacher.getByRole('button',{name:'寫回 Google Sheets',exact:true})).toBeDisabled();await teacher.reload();await expect(teacher.getByTestId('writeback-status')).toHaveText('結果待核對');
  await expect(teacher.getByRole('button',{name:'重新查詢',exact:true})).toHaveCount(0);expect(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues')).toHaveLength(1);
  await expect(teacher.getByText('private Google failure')).toHaveCount(0);await expect(student.getByTestId('writeback-status')).toHaveCount(0);
 }finally{await f.cleanup();}
});
