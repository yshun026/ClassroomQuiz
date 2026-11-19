import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {createServer} from 'node:http';
import {preparedQuizFixture as quizFixture} from '../../backend/tests/helpers/quiz.js';
import {attachRealtime} from '../../backend/src/realtime/socket-server.js';
async function scenario(browser,count){
 const f=await quizFixture(count),baseURL=process.env.E2E_BASE_URL||'http://localhost:5173';f.c.config.origin=baseURL;
 const server=createServer(f.app),realtime=attachRealtime(server,f.c);await new Promise(r=>server.listen(0,'localhost',r));const port=server.address().port;const contexts=[];
 async function pageFor(token,role){const context=await browser.newContext();contexts.push(context);await context.addInitScript(token=>localStorage.setItem('classroomquiz.session',token),token);await context.route(/\/(?:api\/|socket\.io\/)/,async route=>{const u=new URL(route.request().url());u.port=String(port);const response=await route.fetch({url:u.href});await route.fulfill({response});});const page=await context.newPage();await page.goto(baseURL+'/?role='+role);await expect(page.getByTestId('connection')).toHaveText('即時同步已連線');return page;}
 return {...f,pageFor,cleanup:async()=>{for(const context of contexts){await context.unrouteAll({behavior:'ignoreErrors'});await context.close();}await new Promise(r=>realtime.close(r));if(server.listening)await new Promise(r=>server.close(r));}};
}
test('single question: manual start, private submissions, teacher live ranks and final publication within two seconds',async({browser})=>{
 const f=await scenario(browser,1);try{
 const teacher=await f.pageFor(f.teacher,'teacher'),students=await Promise.all(f.students.map(t=>f.pageFor(t,'student')));
 const timings={};let acceptedAt=0;f.c.sync.on('change',()=>{acceptedAt=Date.now();});
 await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await Promise.all(students.map(p=>expect(p.getByRole('status')).toHaveText('第 1 題 · ANSWERING · 共 1 題',{timeout:1900})));timings.startMs=Date.now()-acceptedAt;expect(timings.startMs).toBeLessThan(2000);
 const first=students[0],observer=students[1];await first.getByLabel('答案',{exact:true}).fill('   ');await expect(first.getByRole('button',{name:'提交答案',exact:true})).toBeDisabled();
 const literal='<img src=x onerror="window.bad=true">';await first.getByLabel('答案',{exact:true}).fill(literal);await first.getByRole('button',{name:'提交答案',exact:true}).click();await expect(teacher.getByRole('table',{name:'當題提交紀錄'})).toContainText(literal,{timeout:1900});timings.submitMs=Date.now()-acceptedAt;expect(timings.submitMs).toBeLessThan(2000);await expect(first.getByText('本題已提交',{exact:true})).toBeVisible();await expect(observer.getByText(literal,{exact:true})).toHaveCount(0);expect(await teacher.evaluate(()=>window.bad)).toBeUndefined();
 await students[1].getByLabel('答案',{exact:true}).fill('second');await students[1].getByRole('button',{name:'提交答案',exact:true}).click();await expect(teacher.getByRole('table',{name:'當題提交紀錄'})).toContainText('second');
 await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await Promise.all(students.map(p=>expect(p.getByRole('status')).toHaveText('第 1 題 · COMPLETED · 共 1 題',{timeout:1900})));timings.closeMs=Date.now()-acceptedAt;expect(timings.closeMs).toBeLessThan(2000);
 await mkdir(new URL('../records/002-google-sheets-integration/us2-single-question/',import.meta.url),{recursive:true});await writeFile(new URL('../records/002-google-sheets-integration/us2-single-question/timings.json',import.meta.url),JSON.stringify(timings,null,2));
 await teacher.screenshot({path:fileURLToPath(new URL('../records/002-google-sheets-integration/us2-single-question/teacher-results.png',import.meta.url)),fullPage:true});
 await students[2].screenshot({path:fileURLToPath(new URL('../records/002-google-sheets-integration/us2-single-question/student-results.png',import.meta.url)),fullPage:true});
 for(const page of students){await expect(page.getByRole('region',{name:'第 1 題結果'})).toContainText(literal);await expect(page.getByText('搶答成功組別：第 1 組')).toBeVisible();await expect(page.getByRole('button',{name:'提交答案',exact:true})).toHaveCount(0);}
 await expect(teacher.getByRole('button',{name:'開始搶答',exact:true})).toHaveCount(0);await expect(teacher.getByRole('button',{name:'下一題',exact:true})).toHaveCount(0);
 }finally{await f.cleanup();}
});
test('teacher can close an unanswered non-final question and publish no answers',async({browser})=>{
 const f=await scenario(browser,3);try{const teacher=await f.pageFor(f.teacher,'teacher'),student=await f.pageFor(f.students[0],'student');await teacher.getByRole('button',{name:'開始搶答',exact:true}).click();await expect(student.getByLabel('答案',{exact:true})).toBeVisible();await teacher.getByRole('button',{name:'結束搶答',exact:true}).click();await expect(student.getByRole('status')).toHaveText('第 1 題 · RESULTS · 共 3 題');await expect(student.getByText('無人作答',{exact:true})).toBeVisible();await expect(teacher.getByText('無人作答',{exact:true})).toBeVisible();await expect(teacher.getByRole('button',{name:'下一題',exact:true})).toBeVisible();}finally{await f.cleanup();}
});
