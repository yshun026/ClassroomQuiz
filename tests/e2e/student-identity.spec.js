import {test,expect,chromium} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {createApp} from '../../backend/src/app.js';
import {loadConfig} from '../../backend/src/config.js';
test('separate persistent browser identities claim and recover without takeover',async()=>{
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:'isolated-test-only'})});const c=app.locals.context;await c.activity.import(await readFile(new URL('../fixtures/guided-notes/valid-a.xlsx',import.meta.url)),'notes.xlsx');c.activity.setGroups(3);
 const server=createServer(app);await new Promise(r=>server.listen(0,'localhost',r));const port=server.address().port;const paths=[];const contexts=[];
 async function browser(path){const context=await chromium.launchPersistentContext(path,{headless:true});contexts.push(context);await context.route('**/api/**',async route=>{const u=new URL(route.request().url());u.port=String(port);const response=await route.fetch({url:u.href});await route.fulfill({response});});return context;}
 try{for(let i=0;i<2;i++)paths.push(await mkdtemp(join(tmpdir(),'classroomquiz-e2e-profile-')));
 let a=await browser(paths[0]);const first=await a.newPage();await first.goto('http://localhost:5173/?role=student');await first.getByRole('button',{name:'加入第 1 組',exact:true}).click();await expect(first.getByText('目前組別：第 1 組')).toBeVisible();
 const second=await a.newPage();await second.goto('http://localhost:5173/?role=student');await expect(second.getByText('目前組別：第 1 組')).toBeVisible();await first.reload();await expect(first.getByText('目前組別：第 1 組')).toBeVisible();
 const b=await browser(paths[1]);const other=await b.newPage();await other.goto('http://localhost:5173/?role=student');await expect(other.getByRole('button',{name:'第 1 組（已占用）',exact:true})).toBeDisabled();await other.getByRole('button',{name:'加入第 2 組',exact:true}).click();await expect(other.getByText('目前組別：第 2 組')).toBeVisible();
 await a.close();a=await browser(paths[0]);const reopened=await a.newPage();await reopened.goto('http://localhost:5173/?role=student');await expect(reopened.getByText('目前組別：第 1 組')).toBeVisible();
 await a.clearCookies();await reopened.evaluate(()=>localStorage.clear());await reopened.reload();await expect(reopened.getByRole('button',{name:'第 1 組（已占用）',exact:true})).toBeDisabled();
 }finally{for(const context of contexts)await context.close().catch(()=>{});await new Promise(r=>server.close(r));for(const path of paths){if(!resolve(path).startsWith(resolve(tmpdir())+sep)||!path.includes('classroomquiz-e2e-profile-'))throw Error('Unexpected cleanup path');await rm(path,{recursive:true,force:true,maxRetries:10,retryDelay:250});}}
});
