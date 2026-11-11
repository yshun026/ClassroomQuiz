import {AppError} from '../api/errors.js';
import {Submission} from '../models/submission.js';
export class SubmissionService {
  constructor(context) { this.c=context; }
  submit(token, body) {
    return this.c.dispatcher.run(() => {
      const session=this.c.auth.validate(token,'student');
      this.c.auth.validateBinding(session);
      const {activity:a,question:q}=this.c.questions.current(body);
      if(a.phase!=='ANSWERING'||q.closed) throw new AppError('PHASE_CONFLICT');
      if(typeof body.answerText!=='string') throw new AppError('INVALID_INPUT');
      if(!body.answerText.trim()) throw new AppError('ANSWER_BLANK');
      if(q.submissionsByGroup.has(session.groupNumber)) throw new AppError('DUPLICATE_SUBMISSION');
      const submission=new Submission({activityId:a.id,questionNumber:q.number,groupNumber:session.groupNumber,
        answerText:body.answerText,submissionSequence:q.nextSubmissionSequence+1});
      q.nextSubmissionSequence++; q.submissionsByGroup.set(session.groupNumber,submission);
      a.stateRevision++; this.c.sync.changed();
      const view=this.c.sync.studentView(session);
      return {activityId:a.id,studentViewRevision:view.studentViewRevision,questionNumber:q.number,ownSubmission:view.ownSubmission};
    });
  }
}
