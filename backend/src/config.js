import {readFile, realpath} from 'node:fs/promises';
import {isAbsolute, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {AppError} from './api/errors.js';

export const REPOSITORY_ROOT=fileURLToPath(new URL('../../',import.meta.url));
const insideRepository=path=>{const rel=relative(REPOSITORY_ROOT,path);return rel===''||(!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith(`..${sep}`));};

// Lazy: a missing/invalid Google credential must not prevent ordinary quiz startup.
export async function loadServiceAccountCredentials(path,io={readFile,realpath}){
  try{
    if(typeof path!=='string'||!isAbsolute(path)||insideRepository(path))throw Error();
    const canonical=await io.realpath(path);
    if(!isAbsolute(canonical)||insideRepository(canonical))throw Error();
    const value=JSON.parse(await io.readFile(canonical,'utf8'));
    if(value.type!=='service_account'||value.token_uri!=='https://oauth2.googleapis.com/token'
      ||(value.universe_domain!==undefined&&value.universe_domain!=='googleapis.com')
      ||value.subject!==undefined||typeof value.client_email!=='string'
      ||!/^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/.test(value.client_email)
      ||typeof value.private_key!=='string'||!value.private_key.trim())throw Error();
    // No arbitrary external-account URLs, delegation or user ADC fields reach GoogleAuth.
    return {type:'service_account',client_email:value.client_email,private_key:value.private_key,
      token_uri:'https://oauth2.googleapis.com/token',universe_domain:'googleapis.com',
      ...(typeof value.project_id==='string'?{project_id:value.project_id}:{}),
      ...(typeof value.private_key_id==='string'?{private_key_id:value.private_key_id}:{})};
  }catch{throw new AppError('GOOGLE_AUTH_UNAVAILABLE');}
}

export function loadConfig(env=process.env){
  if(typeof env.ADMIN_PASSWORD!=='string'||!env.ADMIN_PASSWORD.trim())throw Error('ADMIN_PASSWORD 必須由環境變數提供');
  return {password:env.ADMIN_PASSWORD,host:'localhost',port:3000,origin:'http://localhost:5173',
    googleCredentialPath:typeof env.GOOGLE_APPLICATION_CREDENTIALS==='string'&&env.GOOGLE_APPLICATION_CREDENTIALS.trim()?env.GOOGLE_APPLICATION_CREDENTIALS:undefined};
}
