export class Question{constructor(number,location){Object.assign(this,{number,location,started:false,closed:false,nextSubmissionSequence:0,submissionsByGroup:new Map()});}}
