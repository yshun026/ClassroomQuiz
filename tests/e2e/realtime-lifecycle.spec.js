import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {scenario} from './lifecycle-fixture.js';
import {Activity} from '../../backend/src/models/activity.js';

test('teacher ignores delayed preparation after a newer ANSWERING snapshot',async({browser})=>{
 const f=await scenario(browser,3);let release;try{
  const teacher=await f.pageFor(f.teacher,'teacher');let captured=false;const gate=new Promise(r=>{release=r;});let requested;const held=new Promise(r=>{requested=r;});
  await teacher.route('**/api/activity',async route=>{if(captured)return route.fallback();captured=true;requested();await gate;await route.fulfill({json:{prepared:false,groupCount:3}});});
  await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await held;await expect(teacher.getByRole('status').first()).toContainText('ANSWERING');release();await expect(teacher.getByRole('button',{name:'結束搶答',exact:true})).toBeEnabled();await expect(teacher.getByText('活動尚未準備完成')).toHaveCount(0);
 }finally{release?.();await f.cleanup();}
});

for(const kind of ['success','invalid','new-activity'])test(`student discards old ${kind} response after identity changes`,async({browser})=>{
 const f=await scenario(browser,3);let release;try{
  const student=await f.pageFor(f.students[0],'student'),oldView=f.c.sync.studentView(f.c.auth.validate(f.students[0]));let captured=false;let requested;const held=new Promise(r=>{requested=r;}),gate=new Promise(r=>{release=r;});
  await student.route('**/api/activity',async route=>{if(captured)return route.fallback();captured=true;requested();await gate;await route.fulfill({status:kind==='invalid'?401:200,json:kind==='invalid'?{error:{code:'SESSION_INVALID',message:'old invalid'}}:oldView});});
  await student.getByRole('button',{name:'重新取得目前狀態'}).click();await held;
  let token=f.students[1],group=2;
  if(kind==='new-activity'){const document=f.c.store.activity.document;f.c.store.sessionsByTokenHash.clear();f.c.store.activity=new Activity(3,document);f.c.store.activity.phase='ANSWERING';f.c.store.activity.questions.get(1).started=true;token=f.c.auth.claimGroup(f.c.store.activity.id,1).token;group=1;}
  await student.evaluate(token=>{const oldValue=localStorage.getItem('classroomquiz.session');localStorage.setItem('classroomquiz.session',token);window.dispatchEvent(new StorageEvent('storage',{key:'classroomquiz.session',oldValue,newValue:token}));},token);
  await expect(student.getByText(`目前組別：第 ${group} 組`,{exact:true})).toBeVisible();release();
  await expect(student.getByRole('button',{name:'重新取得目前狀態'})).toBeEnabled();await expect(student.getByTestId('connection')).toHaveText('即時同步已連線');
  expect(await student.evaluate(()=>localStorage.getItem('classroomquiz.session'))).toBe(token);await expect(student.getByText(`目前組別：第 ${group} 組`,{exact:true})).toBeVisible();
  if(kind==='new-activity'){await expect(student.getByRole('status').first()).toContainText('ANSWERING');const view=await student.evaluate(()=>fetch('/api/activity',{headers:{Authorization:'Bearer '+localStorage.getItem('classroomquiz.session')}}).then(r=>r.json()));expect(view.activityId).toBe(f.c.store.activity.id);expect(view.studentViewRevision).toBe(0);}
 }finally{release?.();await f.cleanup();}
});
test('three-question lifecycle: measured updates, four-phase refresh, offline restore and no answer replay',async({browser})=>{
 const f=await scenario(browser,3);try{
  const teacher=await f.pageFor(f.teacher,'teacher'),students=await Promise.all(f.students.map(t=>f.pageFor(t,'student'))),pages=[teacher,...students],measurements=[];
  let changedAt=0;f.c.sync.on('change',()=>{changedAt=Date.now();});
  async function phase(n,phase){await Promise.all(pages.map(p=>expect(p.getByRole('status').first()).toHaveText(`第 ${n} 題 · ${phase} · 共 3 題`,{timeout:1900})));const ms=Date.now()-changedAt;measurements.push({question:n,phase,ms});expect(ms).toBeLessThan(2000);}
  async function reloadAll(n,stage){await Promise.all(pages.map(async p=>{await p.reload();await expect(p.getByRole('status').first()).toHaveText(`第 ${n} 題 · ${stage} · 共 3 題`);await expect(p.getByTestId('connection')).toHaveText('即時同步已連線');}));}
  await reloadAll(1,'WAITING');
  await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await phase(1,'ANSWERING');
  await students[0].getByLabel('答案',{exact:true}).fill('Q1-answer');await students[0].getByRole('button',{name:'提交答案',exact:true}).click();await expect(teacher.getByRole('table',{name:'當題提交紀錄'})).toContainText('Q1-answer',{timeout:1900});measurements.push({question:1,submission:1,ms:Date.now()-changedAt});expect(measurements.at(-1).ms).toBeLessThan(2000);
  await reloadAll(1,'ANSWERING');await expect(students[0].getByText('本題已提交',{exact:true})).toBeVisible();
  await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await phase(1,'RESULTS');
  await reloadAll(1,'RESULTS');
  await teacher.getByRole('button',{name:'下一題',exact:true}).click();await phase(2,'WAITING');await expect(students[0].getByLabel('答案',{exact:true})).toHaveCount(0);await expect(students[0].getByRole('region',{name:'第 1 題結果'})).toContainText('Q1-answer');
  await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await phase(2,'ANSWERING');await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await phase(2,'RESULTS');await expect(students[1].getByText('無人作答',{exact:true})).toBeVisible();
  await teacher.getByRole('button',{name:'下一題',exact:true}).click();await phase(3,'WAITING');await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await phase(3,'ANSWERING');
  await students[2].getByLabel('答案',{exact:true}).fill('Q3-answer');await students[2].getByRole('button',{name:'提交答案',exact:true}).click();await expect(teacher.getByRole('table',{name:'當題提交紀錄'})).toContainText('Q3-answer',{timeout:1900});measurements.push({question:3,submission:3,ms:Date.now()-changedAt});expect(measurements.at(-1).ms).toBeLessThan(2000);
  await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await phase(3,'COMPLETED');await reloadAll(3,'COMPLETED');
  for(const p of pages){await expect(p.getByRole('region',{name:'第 1 題結果'})).toContainText('Q1-answer');await expect(p.getByRole('region',{name:'第 3 題結果'})).toContainText('Q3-answer');}await expect(teacher.getByRole('button',{name:'下一題',exact:true})).toHaveCount(0);
  await mkdir(new URL('../records/us4/',import.meta.url),{recursive:true});await writeFile(new URL('../records/us4/timings.json',import.meta.url),JSON.stringify(measurements,null,2));await teacher.screenshot({path:fileURLToPath(new URL('../records/us4/completed.png',import.meta.url)),fullPage:true});
 }finally{await f.cleanup();}
});

test('backend identity loss clears student state and requires new teacher login',async({browser})=>{
 const f=await scenario(browser,3);try{const teacher=await f.pageFor(f.teacher,'teacher'),student=await f.pageFor(f.students[0],'student');f.c.store.sessionsByTokenHash.clear();f.c.sync.changed();await expect(teacher.getByLabel('管理密碼')).toBeVisible();await expect(student.getByText('目前組別：第 1 組')).toHaveCount(0);expect(await student.evaluate(()=>localStorage.getItem('classroomquiz.session'))).toBeNull();await student.reload();await expect(student.getByRole('button',{name:'第 1 組（已占用）'})).toBeDisabled();}finally{await f.cleanup();}
});

test('teacher and student reconnect in every phase; a lost submission reply never replays the answer',async({browser})=>{
 const f=await scenario(browser,2);try{
  const teacher=await f.pageFor(f.teacher,'teacher'),student=await f.pageFor(f.students[0],'student');
  for(const stage of ['WAITING','ANSWERING','RESULTS','COMPLETED']){
   if(stage==='ANSWERING')await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();
   if(stage==='RESULTS'){
    f.loseNextSubmissionReply(student);await student.getByLabel('答案',{exact:true}).fill('accepted despite lost reply');await student.getByRole('button',{name:'提交答案',exact:true}).click();await expect(student.getByText('本題已提交',{exact:true})).toBeVisible();
    f.setOffline(student,true);await expect(student.getByTestId('connection')).toContainText('中斷',{timeout:12000});await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();f.setOffline(student,false);await expect(student.getByTestId('connection')).toHaveText('即時同步已連線',{timeout:12000});await expect(student.getByRole('status').first()).toContainText('RESULTS');
   }
   if(stage==='COMPLETED'){await teacher.getByRole('button',{name:'下一題',exact:true}).click();await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();}
   for(const page of [teacher,student]){
    const revision=(await page.evaluate(()=>fetch('/api/activity',{headers:{Authorization:'Bearer '+localStorage.getItem('classroomquiz.session')}}).then(r=>r.json())));
    f.setOffline(page,true);await expect(page.getByTestId('connection')).toContainText('中斷',{timeout:12000});f.setOffline(page,false);await expect(page.getByTestId('connection')).toHaveText('即時同步已連線',{timeout:12000});await expect(page.getByRole('status').first()).toContainText(stage);
    const after=await page.evaluate(()=>fetch('/api/activity',{headers:{Authorization:'Bearer '+localStorage.getItem('classroomquiz.session')}}).then(r=>r.json()));expect(after).toEqual(revision);
   }
   if(stage!=='WAITING'&&stage!=='ANSWERING')expect(f.c.store.activity.questions.get(1).submissionsByGroup.size).toBe(1);
  }
 }finally{await f.cleanup();}
});
