import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {scenario} from './lifecycle-fixture.js';
const cell=f=>f.c.sheetsAccess.documents.get('synthetic-quiz').sheets[0].data[0].rowData[0].values[0];
async function closed(f){f.c.questions.start(f.teacher,f.body);f.c.submissions.submit(f.students[0],{...f.body,answerText:'expected'});f.c.questions.close(f.teacher,f.body);}
const write=p=>p.getByRole('button',{name:'寫回 Google Sheets',exact:true}),check=p=>p.getByRole('button',{name:'核對原寫回操作',exact:true});

test('two teacher pages share busy/pending ID; unknown marker reconciles read-only, matching content then succeeds',async({browser})=>{
 const f=await scenario(browser,2);let release;try{
  await closed(f);const teacher=await f.pageFor(f.teacher,'teacher'),other=await f.pageFor(f.c.auth.issue('teacher').token,'teacher');
  let sends=0;const gate=new Promise(r=>{release=r;});f.c.sheetsAccess.writeValues=async()=>{sends++;await gate;return {sent:true,transportState:'SETTLED',remoteOutcome:'UNKNOWN'};};
  await write(teacher).click();await expect(teacher.getByTestId('writeback-status')).toHaveText('正在寫回');
  const busy=other.waitForResponse(r=>r.url().endsWith('/writeback')&&r.status()===409);await write(other).click();const busyResponse=await busy,original=(await busyResponse.json()).error.details.operationId;expect(original).toBe(f.c.writeback.latest(f.teacher,f.body.activityId).operationId);await expect(write(other)).toBeDisabled();
  release();await expect(teacher.getByTestId('writeback-status')).toHaveText('結果待核對');await other.reload();await expect(other.getByTestId('writeback-status')).toHaveText('結果待核對');
  const pending=await other.evaluate(async id=>{const r=await fetch('/api/activity/guided-notes/writeback',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('classroomquiz.session')},body:JSON.stringify({activityId:id})});return {status:r.status,body:await r.json()};},f.body.activityId);expect(pending.status).toBe(409);expect(pending.body.error.details.operationId).toBe(original);
  await check(other).click();await expect(other.getByTestId('writeback-status')).toHaveText('正在核對原試算表');await expect(other.getByTestId('writeback-status')).toHaveText('結果待核對');await expect(other.getByRole('table',{name:'寫回逐題結果'})).toContainText('僅核對');expect(sends).toBe(1);
  cell(f).userEnteredValue={stringValue:'expected'};await check(other).click();await expect(other.getByTestId('writeback-status')).toHaveText('已讀回核對完成');expect(sends).toBe(1);
  await write(other).click();await expect(other.getByRole('table',{name:'寫回逐題結果'})).toContainText('已同步，略過');expect(sends).toBe(1);
  cell(f).userEnteredValue={stringValue:'external'};await write(other).click();await expect(other.getByTestId('writeback-status')).toHaveText('來源衝突');await expect(other.getByRole('table',{name:'寫回逐題結果'})).toContainText('G1');await expect(other.getByRole('table',{name:'寫回逐題結果'})).toContainText('已改變');expect(sends).toBe(1);
  await expect(other.getByRole('button',{name:/強制覆|自動還原/})).toHaveCount(0);
 }finally{release?.();await f.cleanup();}
});

test('Google authorization failure retains teacher session and refresh never sends a write',async({browser})=>{
 const f=await scenario(browser,1);try{
  await closed(f);let sends=0;f.c.sheetsAccess.writeValues=async()=>{sends++;return {sent:true,transportState:'SETTLED',remoteOutcome:'KNOWN_REJECTED',error:{code:'GOOGLE_AUTH_UNAVAILABLE'}};};
  const teacher=await f.pageFor(f.teacher,'teacher');await write(teacher).click();await expect(teacher.getByTestId('writeback-status')).toHaveText('寫回未完成');await expect(teacher.getByRole('textbox',{name:'管理密碼'})).toHaveCount(0);expect(await teacher.evaluate(()=>localStorage.getItem('classroomquiz.session'))).toBe(f.teacher);
  await teacher.reload();await expect(teacher.getByTestId('writeback-status')).toHaveText('寫回未完成');await expect(teacher.getByText('Google 認證或分享／保護範圍有誤時，請管理者修正；不需重新登入 Google。')).toBeVisible();expect(sends).toBe(1);
 }finally{await f.cleanup();}
});

for(const late of ['success','error'])test(`late A ${late} and old Notes cannot replace discovered B or alter controls`,async({browser})=>{
 const f=await scenario(browser,1);let releaseWrite,releaseViews;try{
  await closed(f);const teacher=await f.pageFor(f.teacher,'teacher'),other=await f.pageFor(f.c.auth.issue('teacher').token,'teacher');
  const writeGate=new Promise(r=>{releaseWrite=r;}),viewGate=new Promise(r=>{releaseViews=r;});const original=f.c.sheetsAccess.writeValues.bind(f.c.sheetsAccess);f.c.sheetsAccess.writeValues=async(...a)=>{await writeGate;return original(...a);};
  let operationEntered,notesEntered;const entered=new Promise(r=>{operationEntered=r;}),notesReady=new Promise(r=>{notesEntered=r;});
  const deliveries=[];
  await teacher.route('**/api/activity/guided-notes/writebacks/*?*',async route=>{
   const view=f.c.writeback.latest(f.teacher,f.body.activityId);operationEntered();await viewGate;
   const data=late==='success'?{...view,operationRevision:999}:{error:{code:'SESSION_INVALID',message:'OLD A INVALID'}};
   deliveries.push(route.fulfill({status:late==='success'?200:401,contentType:'application/json',body:JSON.stringify(data)}));await deliveries.at(-1);
  });
  let notesCalls=0;
  await teacher.route('**/api/activity/guided-notes?*',async route=>{
   if(++notesCalls!==1)return route.fallback();
   const notes={...f.c.activity.notesView(f.body.activityId),latestWriteback:{...f.c.writeback.latest(f.teacher,f.body.activityId),operationRevision:1000}};notesEntered();await viewGate;
   deliveries.push(route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(notes)}));await deliveries.at(-1);
  });
  await write(teacher).click();await entered;const a=f.c.writeback.latest(f.teacher,f.body.activityId).operationId;
  await teacher.getByRole('button',{name:'重新取得寫回狀態',exact:true}).click();await notesReady;
  releaseWrite();await f.c.writeback.wait(a);await write(other).click();await expect(other.getByTestId('writeback-status')).toHaveText('已讀回核對完成');
  const b=f.c.writeback.latest(f.teacher,f.body.activityId).operationId;expect(b).not.toBe(a);
  await teacher.getByRole('button',{name:'重新取得寫回狀態',exact:true}).click();await expect(teacher.getByTestId('writeback-status')).toHaveAttribute('data-operation-id',b);
  const oldResponses=Promise.all([teacher.waitForResponse(r=>r.url().includes('/writebacks/'+a)),teacher.waitForResponse(r=>r.url().includes('/activity/guided-notes?'))]);
  releaseViews();await Promise.all((await oldResponses).map(r=>r.finished()));await Promise.all(deliveries);
  await teacher.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await expect(teacher.getByTestId('writeback-status')).toHaveText('已讀回核對完成');await expect(teacher.getByTestId('writeback-status')).toHaveAttribute('data-operation-id',b);
  await expect(write(teacher)).toBeEnabled();await expect(teacher.getByText('OLD A INVALID')).toHaveCount(0);expect(await teacher.evaluate(()=>localStorage.getItem('classroomquiz.session'))).toBe(f.teacher);
  expect(f.c.sheetsAccess.calls.filter(c=>c.method==='writeValues')).toHaveLength(1);
 }finally{releaseWrite?.();releaseViews?.();await f.cleanup();}
});
