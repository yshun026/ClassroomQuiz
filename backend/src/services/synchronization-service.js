import {isDeepStrictEqual} from 'node:util';
import {EventEmitter} from 'node:events';
export class SynchronizationService extends EventEmitter {
  constructor(store,auth,activity){super();Object.assign(this,{store,auth,activity});}
  teacherView(){return this.activity.teacherView();}
  studentView(session){
    const a=this.auth.validateBinding(session);
    const q=a.questions.get(a.currentQuestionNumber),own=q.submissionsByGroup.get(session.groupNumber);
    const projection={activityId:a.id,phase:a.phase,currentQuestionNumber:a.currentQuestionNumber,
      questionCount:a.questions.size,publishedResults:this.activity.publishedResults(),ownGroupNumber:session.groupNumber,
      ownSubmission:own?{submitted:true,answerText:own.answerText}:{submitted:false}};
    if(session.lastStudentProjection!==null&&!isDeepStrictEqual(projection,session.lastStudentProjection))session.studentViewRevision++;
    session.lastStudentProjection=structuredClone(projection);
    return {...projection,studentViewRevision:session.studentViewRevision};
  }
  resumeView(session){return session.role==='teacher'?this.teacherView():this.studentView(session);}
  changed(){
    // Advance only changed per-Session projections at the mutation boundary, including offline identities.
    for(const session of this.store.sessionsByTokenHash.values()){
      if(session.role==='student'&&session.activityId===this.store.activity?.id){try{this.studentView(session);}catch{/* invalid clients are disconnected by socket authorization */}}
    }
    this.emit('change');
  }
}
