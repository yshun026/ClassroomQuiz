import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {liveConfiguration,exerciseSource} from '../helpers/google-live.js';
import {REPOSITORY_ROOT} from '../../src/config.js';
import {createFakeSheetsAccess} from '../helpers/fake-sheets-access.js';
import {syntheticSheetA,syntheticSheetB} from '../../../tests/fixtures/google-sheets/sources.js';

test('live gate defaults off, requires explicit dedicated consent and distinct external configuration without reading keys',()=>{
 assert.equal(liveConfiguration({}).enabled,false);
 const env={RUN_GOOGLE_LIVE_TESTS:'1',GOOGLE_APPLICATION_CREDENTIALS:resolve(tmpdir(),'synthetic-not-created-key.json'),GOOGLE_TEST_SHEET_A:'synthetic-A',GOOGLE_TEST_SHEET_B:'synthetic-B'};
 assert.equal(liveConfiguration(env).enabled,false);env.GOOGLE_LIVE_CONFIRM_DEDICATED='YES';assert.equal(liveConfiguration(env).enabled,true);
 assert.throws(()=>liveConfiguration({...env,GOOGLE_TEST_SHEET_B:'synthetic-A'}));assert.throws(()=>liveConfiguration({...env,GOOGLE_APPLICATION_CREDENTIALS:resolve(REPOSITORY_ROOT,'synthetic-key.json')}));
});
test('live entry with opt-in disabled reports NOT RUN/skip and does not require credentials',async()=>{
 const env={...process.env,RUN_GOOGLE_LIVE_TESTS:'0',GOOGLE_APPLICATION_CREDENTIALS:'',GOOGLE_TEST_SHEET_A:'',GOOGLE_TEST_SHEET_B:''};delete env.NODE_TEST_CONTEXT;
 const {stdout}=await promisify(execFile)(process.execPath,['--test','--test-reporter=tap','tests/live/google-sheets.test.js'],{cwd:resolve(REPOSITORY_ROOT,'backend'),env});
 assert.match(stdout,/NOT RUN/);assert.match(stdout,/skipped 1/);assert.match(stdout,/pass 0/);
});
test('live acceptance algorithm contract passes both synthetic layouts offline (not real Google evidence)',async()=>{
 for(const source of [syntheticSheetA(),syntheticSheetB()]){const access=createFakeSheetsAccess({sources:[source]});assert.deepEqual(await exerciseSource(access,structuredClone(source)),{questionCount:3,writeCalls:2});}
});
