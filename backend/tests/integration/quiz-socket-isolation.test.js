import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {io as client} from 'socket.io-client';
import request from 'supertest';
import {setTimeout as delay} from 'node:timers/promises';
import {attachRealtime} from '../../src/realtime/socket-server.js';
import {preparedQuizFixture as quizFixture,bearer} from '../helpers/quiz.js';
async function socketSetup(){const f=await quizFixture();const server=createServer(f.app);const io=attachRealtime(server,f.c);await new Promise(r=>server.listen(0,'localhost',r));const url=`http://localhost:${server.address().port}`;const sockets=[];
 async function connect(token,extra={}){const socket=client(url,{auth:{token,...extra},extraHeaders:{Origin:'http://localhost:5173'},transports:['websocket'],reconnection:false,autoConnect:false});sockets.push(socket);const views=[];socket.on('state:snapshot',v=>views.push(v));await new Promise((resolve,reject)=>{socket.once('state:snapshot',resolve);socket.once('connect_error',reject);socket.connect();});return {socket,views};}
 return {...f,connect,url,cleanup:async()=>{sockets.forEach(s=>s.disconnect());await new Promise(r=>io.close(r));if(server.listening)await new Promise(r=>server.close(r));}};
}
const ack=s=>new Promise(r=>s.emit('state:request',{},r));
test('only teacher and submitter receive updates; observers see no revision or notification side channel',async()=>{
 const f=await socketSetup();try{const teacher=await f.connect(f.teacher),students=await Promise.all(f.students.map(t=>f.connect(t))),tab=await f.connect(f.students[0]);const api=request(f.app);const start=Date.now();await api.post('/api/activity/questions/start').set(bearer(f.teacher)).send(f.body);await delay(50);assert(students.every(s=>s.views.at(-1).phase==='ANSWERING'));assert(Date.now()-start<2000);
 const observer=students[1],before=(await ack(observer.socket)).view,counts=students.map(s=>s.views.length);const submitted=Date.now();const response=await api.post('/api/activity/submissions').set(bearer(f.students[0])).send({...f.body,answerText:'private-answer'});assert.equal(response.status,201);await delay(100);
 assert.equal(observer.views.length,counts[1]);assert.equal(students[2].views.length,counts[2]);assert.equal(students[0].views.length,counts[0]+1);assert.equal(tab.views.at(-1).ownSubmission.answerText,'private-answer');assert.equal(teacher.views.at(-1).currentSubmissions[0].receiveRank,1);assert(Date.now()-submitted<2000);
 const after=(await ack(observer.socket)).view;assert.deepEqual(after,before);const http=await api.get('/api/activity').set(bearer(f.students[1]));assert.deepEqual(http.body,before);assert(!JSON.stringify(http.headers).includes('stateRevision'));assert(!JSON.stringify(http.body).includes('private-answer'));assert(!('stateRevision'in response.body));
 const error=await api.post('/api/activity/submissions').set(bearer(f.students[0])).send({...f.body,answerText:'repeat'});assert.equal(error.body.error.code,'DUPLICATE_SUBMISSION');assert(!JSON.stringify(error.body).includes('private-answer'));
 const close=Date.now();await api.post('/api/activity/questions/close').set(bearer(f.teacher)).send(f.body);await delay(60);assert(students.every(s=>s.views.at(-1).phase==='COMPLETED'));assert.equal(observer.views.at(-1).publishedResults[0].submissions[0].answerText,'private-answer');assert(Date.now()-close<2000);
 }finally{await f.cleanup();}
});
test('socket auth does not trust role/room; state requests revalidate token',async()=>{
 const f=await socketSetup();try{const student=await f.connect(f.students[0],{role:'teacher',room:'teacher'});const own=await ack(student.socket);assert.equal(own.ok,true);assert(!('stateRevision'in own.view));f.c.store.sessionsByTokenHash.delete(f.c.auth.validate(f.students[0]).tokenHash);const invalid=await ack(student.socket);assert.equal(invalid.ok,false);assert.equal(invalid.error.code,'SESSION_INVALID');const forged=client(f.url,{auth:{token:'forged'},transports:['websocket'],reconnection:false});try{const error=await new Promise(r=>forged.once('connect_error',r));assert.equal(error.data.code,'SESSION_INVALID');assert(!String(error).includes('answer'));}finally{forged.disconnect();}}finally{await f.cleanup();}
});
