import {randomUUID} from 'node:crypto';
export class Session {
  constructor({tokenHash,role,activityId=null,groupNumber=null}) {
    Object.assign(this,{id:randomUUID(),tokenHash,role,activityId,groupNumber,studentViewRevision:0,lastStudentProjection:null});
  }
}
