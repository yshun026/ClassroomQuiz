import test from 'node:test';
import assert from 'node:assert/strict';
import {fork} from 'node:child_process';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';

test('actual backend process restart clears activity and rejects old teacher and student tokens',async()=>{
 const password=randomBytes(24).toString('hex');let child;
 async function start(){child=fork(fileURLToPath(new URL('../helpers/process-server.js',import.meta.url)),[],{env:{...process.env,ADMIN_PASSWORD:password},stdio:['ignore','ignore','ignore','ipc']});const [ready]=await once(child,'message',{signal:AbortSignal.timeout(8000)});return 'http://localhost:'+ready.port+'/api';}
 async function stop(){if(child&&child.exitCode===null){const ended=once(child,'exit');child.kill();await ended;}child=null;}
 const json=(base,path,token,body)=>fetch(base+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 try{
  let base=await start();const teacher=(await(await json(base,'/teacher/login',null,{password})).json()).token;
  await fetch(base+'/preparation/groups',{method:'PUT',headers:{Authorization:'Bearer '+teacher,'Content-Type':'application/json'},body:JSON.stringify({groupCount:3})});
  assert.equal((await json(base,'/preparation/guided-notes',teacher,{spreadsheetUrl:'https://docs.google.com/spreadsheets/d/synthetic-A/edit'})).status,201);
  const view=await(await json(base,'/activity',teacher)).json(),student=(await(await json(base,'/activity/groups/claim',null,{activityId:view.activityId,groupNumber:1})).json()).token;
  await stop();base=await start();
  assert.equal((await json(base,'/activity',teacher)).status,401);assert.equal((await json(base,'/activity',student)).status,401);assert.equal((await json(base,'/activity/join-options')).status,404);
 }finally{await stop();}
});
