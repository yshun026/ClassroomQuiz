import {randomUUID} from 'node:crypto';
import {Question} from './question.js';
import {Group} from './group.js';
export class Activity {constructor(groupCount,document){this.id=randomUUID();this.groupCount=groupCount;this.phase='WAITING';this.currentQuestionNumber=1;this.stateRevision=1;this.document=document;this.questions=new Map([...document.placeholderLocations].map(([number,location])=>[number,new Question(number,location)]));this.groups=new Map(Array.from({length:groupCount},(_,i)=>[i+1,new Group(i+1)]));}}
