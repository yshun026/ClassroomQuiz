import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {quizFixture,bearer} from '../helpers/quiz.js';
test('teacher opens, students submit once, teacher closes and publishes',async()=>{
 const {app,teacher,students,body}=quizFixture(),api=request(app);const t=bearer(teacher),s=bearer(students[0]);
 assert.equal((await api.post('/api/activity/submissions').set(s).send({...body,answerText:'before'})).status,409);
 assert.equal((await api.post('/api/activity/questions/start').set(t).send(body)).status,200);
 for(const answerText of ['', '  \n\t'])assert.equal((await api.post('/api/activity/submissions').set(s).send({...body,answerText})).body.error.code,'ANSWER_BLANK');
 assert.equal((await api.get('/api/activity/questions/1/results').set(s)).status,409);
 const accepted=await api.post('/api/activity/submissions').set(s).send({...body,answerText:'first'});assert.equal(accepted.status,201);assert(!JSON.stringify(accepted.body).includes('receiveRank'));assert(!('stateRevision'in accepted.body));
 const duplicate=await api.post('/api/activity/submissions').set(s).send({...body,answerText:'overwrite'});assert.equal(duplicate.body.error.code,'DUPLICATE_SUBMISSION');
 assert.equal((await api.post('/api/activity/submissions').set(bearer(students[1])).send({...body,answerText:'second'})).status,201);
 const teacherView=(await api.get('/api/activity').set(t)).body;assert.deepEqual(teacherView.currentSubmissions.map(s=>s.receiveRank),[1,2]);assert.equal(teacherView.groups[2].submitted,false);
 assert.equal((await api.post('/api/activity/questions/close').set(t).send(body)).body.phase,'COMPLETED');
 const result=(await api.get('/api/activity/questions/1/results').set(s)).body;assert.equal(result.winnerGroupNumber,1);assert.equal(result.submissions[0].answerText,'first');
 assert.equal((await api.post('/api/activity/submissions').set(bearer(students[2])).send({...body,answerText:'late'})).status,409);
 for(const command of ['start','close'])assert.equal((await api.post('/api/activity/questions/'+command).set(t).send(body)).status,409);
});
test('teacher-only commands, binding, stale question and malformed input reject safely',async()=>{
 const {app,c,teacher,students,body}=quizFixture(),api=request(app),t=bearer(teacher),s=bearer(students[0]);
 for(const command of ['start','close']){assert.equal((await api.post('/api/activity/questions/'+command).send(body)).status,401);assert.equal((await api.post('/api/activity/questions/'+command).set(s).send(body)).status,403);}
 assert.equal((await api.post('/api/activity/questions/start').set(t).send({...body,activityId:'old'})).body.error.code,'STALE_ACTIVITY');
 assert.equal((await api.post('/api/activity/questions/start').set(t).send({...body,questionNumber:2})).body.error.code,'STALE_QUESTION');
 await api.post('/api/activity/questions/start').set(t).send(body);
 for(const answerText of [null,1,{},[]])assert.equal((await api.post('/api/activity/submissions').set(s).send({...body,answerText})).status,400);
 assert.equal((await api.post('/api/activity/submissions').set(t).send({...body,answerText:'teacher'})).status,403);
 c.store.activity.groups.get(1).studentSessionId='forged';assert.equal((await api.post('/api/activity/submissions').set(s).send({...body,answerText:'bad'})).status,403);
});
test('no answers and non-final results are irreversible; next is legal only for non-final RESULTS',async()=>{
 for(const count of [1,3]){const {app,teacher,students,body}=quizFixture(count),api=request(app),t=bearer(teacher);await api.post('/api/activity/questions/start').set(t).send(body);const closed=await api.post('/api/activity/questions/close').set(t).send(body);assert.equal(closed.body.phase,count===1?'COMPLETED':'RESULTS');const result=await api.get('/api/activity/questions/1/results').set(bearer(students[0]));assert.equal(result.body.noAnswers,true);assert.equal(result.body.winnerGroupNumber,null);assert.deepEqual(result.body.submissions,[]);assert.equal((await api.post('/api/activity/questions/start').set(t).send(body)).status,409);assert.equal((await api.post('/api/activity/questions/next').set(t).send(body)).status,count===1?409:200);}
});

test('three HTTP clients submit concurrently with one rank each',async()=>{
 const {app,c,teacher,students,body}=quizFixture(),api=request(app);await api.post('/api/activity/questions/start').set(bearer(teacher)).send(body);
 const responses=await Promise.all(students.map((token,i)=>api.post('/api/activity/submissions').set(bearer(token)).send({...body,answerText:'group-'+(i+1),timestamp:3-i})));
 assert(responses.every(r=>r.status===201));const q=c.store.activity.questions.get(1);assert.deepEqual([...q.submissionsByGroup.values()].map(s=>s.receiveRank),[1,2,3]);assert.equal(new Set([...q.submissionsByGroup.values()].map(s=>s.groupNumber)).size,3);
});
