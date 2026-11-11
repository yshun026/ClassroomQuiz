export class Submission {
  constructor({activityId, questionNumber, groupNumber, answerText, submissionSequence}) {
    Object.assign(this, {activityId, questionNumber, groupNumber, answerText,
      submissionSequence, receiveRank: submissionSequence});
    Object.freeze(this);
  }
}
