import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {Session} from '../models/session.js';
import {AppError} from '../api/errors.js';
const digest=value=>createHash('sha256').update(value).digest();
export class AuthorizationService {
  constructor(store,password){this.store=store;this.passwordHash=digest(password);}
  issue(role,binding={}){const token=randomBytes(32).toString('hex');const tokenHash=digest(token).toString('hex');const session=new Session({tokenHash,role,...binding});this.store.sessionsByTokenHash.set(tokenHash,session);return {token,session};}
  authenticateTeacher(password){if(typeof password!=='string'||!timingSafeEqual(digest(password),this.passwordHash))throw new AppError('INVALID_PASSWORD');const {token}=this.issue('teacher');return {token,role:'teacher'};}
  validate(token,role){if(typeof token!=='string')throw new AppError('SESSION_INVALID');const s=this.store.sessionsByTokenHash.get(digest(token).toString('hex'));if(!s)throw new AppError('SESSION_INVALID');if(role&&s.role!==role)throw new AppError(role==='teacher'?'TEACHER_REQUIRED':'STUDENT_REQUIRED');return s;}
  validateBinding(session){const a=this.store.activity;if(!a)throw new AppError('ACTIVITY_NOT_READY');if(session.activityId!==a.id)throw new AppError('STALE_ACTIVITY');if(a.groups.get(session.groupNumber)?.studentSessionId!==session.id)throw new AppError('GROUP_BINDING_INVALID');return a;}
  claimGroup(activityId,groupNumber,token){const a=this.store.activity;if(!a)throw new AppError('ACTIVITY_NOT_READY');if(a.id!==activityId)throw new AppError('STALE_ACTIVITY');if(!Number.isSafeInteger(groupNumber)||!a.groups.has(groupNumber))throw new AppError('INVALID_INPUT');
    if(token){const existing=this.validate(token,'student');this.validateBinding(existing);if(existing.groupNumber!==groupNumber)throw new AppError('SESSION_ALREADY_BOUND');return {session:existing,created:false};}
    const group=a.groups.get(groupNumber);if(group.studentSessionId)throw new AppError('GROUP_OCCUPIED');const issued=this.issue('student',{activityId:a.id,groupNumber});group.studentSessionId=issued.session.id;a.stateRevision++;return {...issued,created:true};
  }
  fromRequest(req,role){const value=req.headers.authorization;return this.validate(typeof value==='string'&&value.startsWith('Bearer ')?value.slice(7):null,role);}
}
