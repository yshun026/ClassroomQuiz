import test from 'node:test';
import assert from 'node:assert/strict';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import request from 'supertest';
import {loadConfig, loadServiceAccountCredentials, REPOSITORY_ROOT} from '../../src/config.js';
import {createApp} from '../../src/app.js';
import {createServiceAccountTokenProvider, SHEETS_SCOPE} from '../../src/services/sheets-access.js';
import {AppError} from '../../src/api/errors.js';

// Deliberately invalid signing material, never a real key or an OAuth token.
const specimen = () => ({type:'service_account',client_email:'synthetic@unit.iam.gserviceaccount.com',private_key:'not-signing-material',token_uri:'https://oauth2.googleapis.com/token'});
const external = join(tmpdir(),'classroomquiz-unit-only','synthetic.json');
const io = (value=specimen(), canonical=external) => ({realpath:async()=>canonical,readFile:async()=>JSON.stringify(value)});
const safeAuth = e => e.code==='GOOGLE_AUTH_UNAVAILABLE' && !JSON.stringify(e).includes('not-signing-material');

test('backend config never consumes frontend credentials or reads a key at startup',async()=>{
 const config=loadConfig({ADMIN_PASSWORD:'unit-only',VITE_GOOGLE_APPLICATION_CREDENTIALS:external});
 assert.equal(config.googleCredentialPath,undefined);
 const app=createApp({config});
 assert.equal((await request(app).get('/api/health')).status,200);
 await assert.rejects(loadServiceAccountCredentials(undefined),safeAuth);
});

test('credentials require an absolute repository-external canonical path including symlink resolution',async()=>{
 for(const path of [undefined,'relative.json',join(REPOSITORY_ROOT,'key.json')]) await assert.rejects(loadServiceAccountCredentials(path,io()),safeAuth);
 await assert.rejects(loadServiceAccountCredentials(external,io(specimen(),join(REPOSITORY_ROOT,'linked.json'))),safeAuth);
 const parsed=await loadServiceAccountCredentials(external,io());
 assert.equal(parsed.type,'service_account');
 assert.equal(resolve(external),external);
});

test('reject user ADC, delegated identities, custom token/universe endpoints, malformed or unreadable credentials safely',async()=>{
 for(const patch of [{type:'authorized_user'},{token_uri:'https://attacker.invalid/token'},{token_uri:'https://oauth2.googleapis.com/token?x=1'},{universe_domain:'attacker.invalid'},{subject:'teacher@example.invalid'},{client_email:'bad'},{private_key:''}]){
  await assert.rejects(loadServiceAccountCredentials(external,io({...specimen(),...patch})),safeAuth);
 }
 for(const injected of [{realpath:async()=>{throw Error('private-path');}},{...io(),readFile:async()=>'{private-syntax'}]) await assert.rejects(loadServiceAccountCredentials(external,injected),safeAuth);
});

test('GoogleAuth only obtains scoped tokens, lazily, without delegated clients or business request replay',async()=>{
 let creations=0,exchanges=0;
 const provider=createServiceAccountTokenProvider({credentialPath:external,credentialLoader:async()=>specimen(),authFactory:options=>{
  creations++; assert.deepEqual(options.scopes,[SHEETS_SCOPE]); assert.equal(options.credentials.type,'service_account');
  assert.equal(options.credentials.subject,undefined);
  return {getAccessToken:async()=>{exchanges++;return 'synthetic-unit-token';},request:()=>assert.fail('no auth business request')};
 }});
 assert.equal(creations,0);
 assert.equal(await provider(),'synthetic-unit-token'); assert.equal(await provider(),'synthetic-unit-token');
 assert.equal(creations,1); assert.equal(exchanges,2);
 const broken=createServiceAccountTokenProvider({credentialPath:external,credentialLoader:async()=>specimen(),authFactory:()=>({getAccessToken:async()=>{throw Error('private-auth-headers');}})});
 await assert.rejects(broken(),e=>safeAuth(e)&&!JSON.stringify(e).includes('private-auth-headers'));
});

test('Sheets errors serialize safe envelopes without headers, raw body, key path or credential internals',async()=>{
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:'unit-only',GOOGLE_APPLICATION_CREDENTIALS:external}),register:app=>app.get('/api/unit-error',()=>{throw new AppError('SHEETS_UNAVAILABLE',{headers:{Authorization:'private-upstream'},body:'private-upstream',credentialPath:external,operationId:'safe-id'});})});
 const response=await request(app).get('/api/unit-error');assert.equal(response.status,502);assert.equal(response.body.error.code,'SHEETS_UNAVAILABLE');assert.equal(response.body.error.details.operationId,'safe-id');assert.match(response.body.error.requestId,/^[a-f0-9-]{36}$/);
 assert(!JSON.stringify(response.body).includes('private-upstream'));assert(!JSON.stringify(response.body).includes(external));
 assert.deepEqual((await request(app).get('/api/health')).body,{status:'ok'});
});
