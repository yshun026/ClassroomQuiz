import test from 'node:test';
import assert from 'node:assert/strict';
import {quizFixture} from '../helpers/quiz.js';
test('receive sequence is consecutive; duplicate/blank attempts do not consume rank',()=>{
 const {c,teacher,students,body}=quizFixture();c.questions.start(teacher,body);
 assert.throws(()=>c.submissions.submit(students[0],{...body,answerText:' '}),{code:'ANSWER_BLANK'});
 const order=[2,0,1];for(const [i,index]of order.entries()){c.submissions.submit(students[index],{...body,answerText:`answer-${index}`,timestamp:999999-i});assert.throws(()=>c.submissions.submit(students[index],{...body,answerText:'duplicate'}),{code:'DUPLICATE_SUBMISSION'});}
 const q=c.store.activity.questions.get(1);assert.equal(q.nextSubmissionSequence,3);assert.deepEqual([...q.submissionsByGroup.values()].map(s=>[s.groupNumber,s.receiveRank]),[[3,1],[1,2],[2,3]]);
});
test('same-group competing requests result in one accepted submission',async()=>{const {c,teacher,students,body}=quizFixture();c.questions.start(teacher,body);const outcomes=await Promise.allSettled([1,2].map(i=>Promise.resolve().then(()=>c.submissions.submit(students[0],{...body,answerText:String(i)}))));assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.equal(c.store.activity.questions.get(1).nextSubmissionSequence,1);});
test('submission before close accepted; close before submission rejected without mutation',()=>{
 const a=quizFixture();a.c.questions.start(a.teacher,a.body);a.c.submissions.submit(a.students[0],{...a.body,answerText:'accepted'});a.c.questions.close(a.teacher,a.body);assert.equal(a.c.store.activity.questions.get(1).submissionsByGroup.size,1);
 const b=quizFixture();b.c.questions.start(b.teacher,b.body);b.c.questions.close(b.teacher,b.body);const revision=b.c.store.activity.stateRevision;assert.throws(()=>b.c.submissions.submit(b.students[0],{...b.body,answerText:'late'}),{code:'PHASE_CONFLICT'});assert.equal(b.c.store.activity.questions.get(1).submissionsByGroup.size,0);assert.equal(b.c.store.activity.stateRevision,revision);
});
