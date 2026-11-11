import test from 'node:test';
import assert from 'node:assert/strict';
import {isolatedProfile} from './setup.js';
test('test identities use distinct profiles',async()=>{const a=await isolatedProfile(),b=await isolatedProfile();try{assert.notEqual(a.path,b.path);}finally{await a.cleanup();await b.cleanup();}});
