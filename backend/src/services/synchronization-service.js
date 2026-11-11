import {isDeepStrictEqual} from 'node:util';
export class SynchronizationService{
 constructor(store,auth,activity){Object.assign(this,{store,auth,activity});}
 teacherView(){return this.activity.teacherView();}
 studentView(session){const a=this.auth.validateBinding(session);const q=a.questions.get(a.currentQuestionNumber);const own=q.submissionsByGroup.get(session.groupNumber);const publishedResults=[...a.questions.values()].filter(q=>q.closed).map(q=>{const submissions=[...q.submissionsByGroup.values()].sort((x,y)=>x.receiveRank-y.receiveRank).map(s=>({groupNumber:s.groupNumber,answerText:s.answerText,receiveRank:s.receiveRank}));return {questionNumber:q.number,submissions,winnerGroupNumber:submissions[0]?.groupNumber??null,noAnswers:!submissions.length};});
 const projection={activityId:a.id,phase:a.phase,currentQuestionNumber:a.currentQuestionNumber,questionCount:a.questions.size,publishedResults,ownGroupNumber:session.groupNumber,ownSubmission:own?{submitted:true,answerText:own.answerText}:{submitted:false}};
 if(session.lastStudentProjection!==null&&!isDeepStrictEqual(projection,session.lastStudentProjection))session.studentViewRevision++;
 session.lastStudentProjection=structuredClone(projection);return {...projection,studentViewRevision:session.studentViewRevision};}
 resumeView(session){return session.role==='teacher'?this.teacherView():this.studentView(session);}
}
