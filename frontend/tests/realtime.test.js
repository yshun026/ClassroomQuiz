import test from 'node:test';
import assert from 'node:assert/strict';
import {acceptSnapshot} from '../src/services/realtime.js';
test('student compares only its own visible revision; teacher compares global revision',()=>{const own={activityId:'a',studentViewRevision:2};assert.equal(acceptSnapshot(own,{activityId:'a',studentViewRevision:1},'student'),own);assert.equal(acceptSnapshot(own,{activityId:'a',stateRevision:99},'student'),own);const next={activityId:'a',studentViewRevision:3};assert.equal(acceptSnapshot(own,next,'student'),next);const t={activityId:'a',stateRevision:4};assert.equal(acceptSnapshot(t,{activityId:'a',stateRevision:3},'teacher'),t);});
