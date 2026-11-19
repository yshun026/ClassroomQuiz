import test from 'node:test';
import assert from 'node:assert/strict';
import {preparedQuizFixture} from '../helpers/quiz.js';
import {captureClosedWinners,WritebackOperation,WriteAttempt} from '../../src/models/writeback-operation.js';

test('snapshot contains only closed minimum-rank winners with immutable exact text and locations',async()=>{
 const f=await preparedQuizFixture(4),a=f.c.store.activity;
 a.questions.get(1).closed=true;a.questions.get(1).submissionsByGroup=new Map([[2,{receiveRank:2,answerText:'second'}],[1,{receiveRank:1,answerText:' =1+2\n中文😀 '}]]);
 a.questions.get(2).closed=true;a.questions.get(3).submissionsByGroup.set(1,{receiveRank:1,answerText:'not closed'});
 const before=a.stateRevision,s=captureClosedWinners(a);assert.equal(s.fills.length,1);assert.equal(s.fills[0].answerText,' =1+2\n中文😀 ');assert.equal(s.fills[0].location.sheetId,0);
 a.questions.get(1).submissionsByGroup.get(1).answerText='changed';assert.equal(s.fills[0].answerText,' =1+2\n中文😀 ');assert.throws(()=>s.fills.push({}));assert.throws(()=>{s.fills[0].location.rowIndex=99;});assert.equal(a.stateRevision,before);
});
test('snapshot-before-close and close-before-snapshot are separate consistent copies; enums begin safely',async()=>{
 const f=await preparedQuizFixture(1),a=f.c.store.activity,q=a.questions.get(1);q.submissionsByGroup.set(1,{receiveRank:1,answerText:'{{Q1}}'});
 const early=captureClosedWinners(a);q.closed=true;const late=captureClosedWinners(a);assert.equal(early.fills.length,0);assert.equal(late.fills[0].answerText,'{{Q1}}');
 const op=new WritebackOperation(late),attempt=new WriteAttempt([1]);assert.equal(op.status,'PRECHECKING');assert.equal(op.revision,1);assert.equal(attempt.sent,false);assert.equal(attempt.remoteOutcome,'NOT_SENT');assert.throws(()=>attempt.targetQuestionNumbers.push(2));
});
