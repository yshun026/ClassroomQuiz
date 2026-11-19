import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {scenario} from './lifecycle-fixture.js';

test('Sheets-prepared quiz: login, three groups, late join, close, results, Sheets fidelity and reset',async({browser})=>{
 const f=await scenario(browser,3);f.c.store.activity=null;f.c.store.sessionsByTokenHash.clear();
 try{
  const teacher=await f.pageFor(null,'teacher',false);
  await teacher.getByLabel('管理密碼').fill('incorrect');await teacher.getByRole('button',{name:'登入',exact:true}).click();await expect(teacher.getByRole('alert')).toHaveText('管理密碼錯誤');
  await teacher.getByLabel('管理密碼').fill(f.c.config.password);await teacher.getByRole('button',{name:'登入',exact:true}).click();await expect(teacher.getByText('活動尚未準備完成')).toBeVisible();
  await teacher.getByLabel('參與組數').fill('4');await teacher.getByRole('button',{name:'設定組數'}).click();await expect(teacher.getByText('已設定組數：4')).toBeVisible();
  const gap=structuredClone(f.c.sheetsAccess.documents.get('synthetic-quiz'));gap.spreadsheetId='synthetic-gap';gap.sheets[0].data[0].rowData.splice(1,1);f.c.sheetsAccess.documents.set('synthetic-gap',gap);
  await teacher.getByLabel('Google Sheets 網址').fill('https://docs.google.com/spreadsheets/d/synthetic-gap/edit');await teacher.getByRole('button',{name:'讀取 Guided Notes'}).click();await expect(teacher.getByRole('alert')).toContainText('題號必須從 Q1 連續排列');await expect(teacher.getByRole('button',{name:'開始搶答',exact:true})).toHaveCount(0);
  await teacher.getByLabel('Google Sheets 網址').fill('https://docs.google.com/spreadsheets/d/synthetic-quiz/edit');await teacher.getByRole('button',{name:'讀取 Guided Notes'}).click();await expect(teacher.getByRole('status').first()).toHaveText('第 1 題 · WAITING · 共 3 題');
  const students=[];for(let n=1;n<=3;n++){const page=await f.pageFor(null,'student',false);await page.getByRole('button',{name:`加入第 ${n} 組`,exact:true}).click();await expect(page.getByTestId('connection')).toHaveText('即時同步已連線');students.push(page);}
  const call=(page,path,body,method='POST')=>page.evaluate(async({path,body,method})=>{const token=localStorage.getItem('classroomquiz.session');const response=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:response.status,data:await response.json()};},{path,body,method});
  const id=f.c.store.activity.id,body={activityId:id,questionNumber:1};
  // Every privileged HTTP operation must reject students, including operations hidden in the UI.
  for(const [path,data,method] of [['/preparation/groups',{groupCount:9},'PUT'],['/preparation/guided-notes',{},'POST'],...['start','close','next'].map(op=>['/activity/questions/'+op,body,'POST']),['/activity/guided-notes/export?activityId='+id,undefined,'GET']])expect((await call(students[0],path,data,method)).status).toBe(403);
  expect((await call(students[0],'/activity/submissions',{...body,answerText:'early'})).status).toBe(409);
  await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();
  const literal='<b>first literal answer</b>';await students[0].getByLabel('答案',{exact:true}).fill(literal);await students[0].getByRole('button',{name:'提交答案',exact:true}).click();await expect(students[0].getByText('本題已提交',{exact:true})).toBeVisible();
  expect((await call(students[0],'/activity/submissions',{...body,answerText:'overwrite'})).data.error.code).toBe('DUPLICATE_SUBMISSION');
  const own=await call(students[1],'/activity',undefined,'GET');expect(JSON.stringify(own.data)).not.toContain(literal);expect(own.data).not.toHaveProperty('stateRevision');
  await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await expect(students[2].getByRole('region',{name:'第 1 題結果'})).toContainText(literal);await expect(teacher.locator('b')).toHaveCount(0);
  await teacher.getByRole('button',{name:'下一題',exact:true}).click();await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await expect(students[1].getByText('無人作答',{exact:true})).toBeVisible();
  await teacher.getByRole('button',{name:'下一題',exact:true}).click();await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();
  const late=await f.pageFor(null,'student',false);await expect(late.getByRole('button',{name:'第 1 組（已占用）'})).toBeDisabled();await late.getByRole('button',{name:'加入第 4 組',exact:true}).click();await expect(late.getByRole('status').first()).toContainText('ANSWERING');
  // Controlled close-before-submit after late join: accepted only according to backend order.
  await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();expect((await call(late,'/activity/submissions',{activityId:id,questionNumber:3,answerText:'late'})).status).toBe(409);
  await expect(late.getByRole('status').first()).toContainText('COMPLETED');await late.reload();await expect(late.getByRole('region',{name:'第 1 題結果'})).toContainText(literal);
  expect((await call(students[0],'/activity/questions/3/results',undefined,'GET')).data.noAnswers).toBe(true);
  expect((await call(teacher,'/activity/questions/next',{activityId:id,questionNumber:3})).status).toBe(409);
  // The current Sheets path preserves exact winners and every non-target field.
  await expect(teacher.getByRole('button',{name:'匯出 Guided Notes'})).toHaveCount(0);
  const original=structuredClone(f.c.sheetsAccess.documents.get('synthetic-quiz'));
  const before=f.c.activity.teacherView();
  await teacher.getByRole('button',{name:'寫回 Google Sheets',exact:true}).click();
  await expect(teacher.getByTestId('writeback-status')).toHaveText('已讀回核對完成');
  const expected=structuredClone(original);expected.sheets[0].data[0].rowData[0].values[0].userEnteredValue={stringValue:literal};
  expect(f.c.sheetsAccess.documents.get('synthetic-quiz')).toEqual(expected);
  expect(f.c.activity.teacherView()).toEqual(before);
  await teacher.getByRole('button',{name:'寫回 Google Sheets',exact:true}).click();
  await expect(teacher.getByRole('table',{name:'寫回逐題結果'})).toContainText('已同步，略過');
  expect(f.c.sheetsAccess.documents.get('synthetic-quiz')).toEqual(expected);
  expect(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues')).toHaveLength(1);
  expect(f.c.activity.teacherView()).toEqual(before);
  // Reset the isolated backend's whole runtime epoch, matching process restart; no public reset endpoint.
  f.c.store.activity=null;f.c.store.preparationDraft={};f.c.store.sessionsByTokenHash.clear();f.c.sync.changed();
  await expect(teacher.getByLabel('管理密碼')).toBeVisible();await expect(students[0].getByText('目前組別：第 1 組')).toHaveCount(0);await students[0].reload();await expect(students[0].getByText('等待活動準備完成。')).toBeVisible();
 }finally{await f.cleanup();}
});
