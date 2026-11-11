import {AppError} from '../api/errors.js';
export class QuestionService {
  constructor(context) { this.c = context; }
  current(body) {
    const a = this.c.store.activity;
    if (!a) throw new AppError('ACTIVITY_NOT_READY');
    if (body?.activityId !== a.id) throw new AppError('STALE_ACTIVITY');
    if (body?.questionNumber !== a.currentQuestionNumber) throw new AppError('STALE_QUESTION');
    return {activity:a, question:a.questions.get(a.currentQuestionNumber)};
  }
  start(token, body) {
    return this.c.dispatcher.run(() => {
      this.c.auth.validate(token, 'teacher');
      const {activity:a, question:q} = this.current(body);
      if (a.phase !== 'WAITING' || q.closed || q.started) throw new AppError('PHASE_CONFLICT');
      q.started = true; a.phase = 'ANSWERING'; a.stateRevision++;
      this.c.sync.changed();
      return this.state(a);
    });
  }
  close(token, body) {
    return this.c.dispatcher.run(() => {
      this.c.auth.validate(token, 'teacher');
      const {activity:a, question:q} = this.current(body);
      if (a.phase !== 'ANSWERING' || q.closed) throw new AppError('PHASE_CONFLICT');
      q.closed = true;
      a.phase = a.currentQuestionNumber === a.questions.size ? 'COMPLETED' : 'RESULTS';
      a.stateRevision++; this.c.sync.changed();
      return this.state(a);
    });
  }
  state(a) { return {activityId:a.id,stateRevision:a.stateRevision,phase:a.phase,currentQuestionNumber:a.currentQuestionNumber}; }
}
