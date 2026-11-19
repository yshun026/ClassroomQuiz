import {createFakeSheetsAccess} from '../../backend/tests/helpers/fake-sheets-access.js';
import {attachRealtime} from '../../backend/src/realtime/socket-server.js';
import {test,expect,chromium} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {createServer} from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {createApp} from '../../backend/src/app.js';
import {loadConfig} from '../../backend/src/config.js';
test('separate persistent browser identities claim and recover without takeover',async()=>{
 const baseURL=process.env.E2E_BASE_URL||'http://localhost:5173';
 const app=createApp({config:{...loadConfig({ADMIN_PASSWORD:'isolated-test-only'}),origin:baseURL},sheetsAccess:createFakeSheetsAccess()});const c=app.locals.context;c.activity.setGroups(3);await c.activity.loadSource('https://docs.google.com/spreadsheets/d/synthetic-A/edit');
 const server=createServer(app);const realtime=attachRealtime(server,c);await new Promise(r=>server.listen(0,'localhost',r));const port=server.address().port;const paths=[];const contexts=[];
 async function browser(path){const context=await chromium.launchPersistentContext(path,{headless:true});contexts.push(context);await context.route(/\/(?:api\/|socket\.io\/)/,async route=>{const u=new URL(route.request().url());u.port=String(port);const response=await route.fetch({url:u.href});await route.fulfill({response});});return context;}
 try{for(let i=0;i<2;i++)paths.push(await mkdtemp(join(tmpdir(),'classroomquiz-e2e-profile-')));
 let a=await browser(paths[0]);const first=await a.newPage();await first.goto(baseURL+'/?role=student');await first.getByRole('button',{name:'加入第 1 組',exact:true}).click();await expect(first.getByText('目前組別：第 1 組')).toBeVisible();
 const originalToken=await first.evaluate(()=>localStorage.getItem('classroomquiz.session'));
 await first.getByRole('link',{name:'老師端',exact:true}).click();await expect(first.getByRole('heading',{name:'老師端',exact:true})).toBeVisible();
 await expect.poll(()=>first.evaluate(()=>localStorage.getItem('classroomquiz.session')),{timeout:3000}).toBe(originalToken);
 await first.getByLabel('管理密碼').fill('isolated-test-only');await first.getByRole('button',{name:'登入',exact:true}).click();await expect(first.getByRole('alert')).toContainText('已是學生身分');
 await expect.poll(()=>first.evaluate(()=>localStorage.getItem('classroomquiz.session'))).toBe(originalToken);
 await first.getByRole('link',{name:'學生端',exact:true}).click();await expect(first.getByText('目前組別：第 1 組')).toBeVisible();
 const second=await a.newPage();await second.goto(baseURL+'/?role=student');await expect(second.getByText('目前組別：第 1 組')).toBeVisible();await first.reload();await expect(first.getByText('目前組別：第 1 組')).toBeVisible();
 const b=await browser(paths[1]);const other=await b.newPage();await other.goto(baseURL+'/?role=student');await expect(other.getByRole('button',{name:'第 1 組（已占用）',exact:true})).toBeDisabled();await other.getByRole('button',{name:'加入第 2 組',exact:true}).click();await expect(other.getByText('目前組別：第 2 組')).toBeVisible();
 await a.unrouteAll({behavior:'ignoreErrors'});await a.close();a=await browser(paths[0]);const reopened=await a.newPage();await reopened.goto(baseURL+'/?role=student');await expect(reopened.getByText('目前組別：第 1 組')).toBeVisible();
 await a.clearCookies();await reopened.evaluate(()=>localStorage.clear());await reopened.reload();await expect(reopened.getByRole('button',{name:'第 1 組（已占用）',exact:true})).toBeDisabled();
 }finally{for(const context of contexts){await context.unrouteAll({behavior:'ignoreErrors'}).catch(()=>{});await context.close().catch(()=>{});}await new Promise(r=>realtime.close(r));if(server.listening)await new Promise(r=>server.close(r));for(const path of paths){if(!resolve(path).startsWith(resolve(tmpdir())+sep)||!path.includes('classroomquiz-e2e-profile-'))throw Error('Unexpected cleanup path');await rm(path,{recursive:true,force:true,maxRetries:10,retryDelay:250});}}
});
