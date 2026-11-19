// Offline candidate/index/bundle scan. Emits locations and classifications, never matching values.
import {execFileSync} from 'node:child_process';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateSync} from 'node:zlib';
import JSZip from '../../../backend/node_modules/jszip/lib/index.js';
const root=fileURLToPath(new URL('../../../',import.meta.url)),here=fileURLToPath(new URL('.',import.meta.url));
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:50*1024*1024});
const paths=git('ls-files','-z','--cached','--others','--exclude-standard').toString('utf8').split('\0').filter(Boolean);
const findings=[],counts={workingFiles:0,indexChangedFiles:0,bundleFiles:0,archiveEntries:0,pngMetadata:0};
const rules=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g],['google-access-token',/ya29\.[A-Za-z0-9._-]{20,}/g],['google-api-key',/AIza[0-9A-Za-z_-]{30,}/g],['oauth-client-secret',/GOCSPX-[A-Za-z0-9_-]{15,}/g],['github-token',/(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,})/g],['private-key-field',/["']private_key["']\s*:\s*["']([^"'\r\n]+)["']/g],['literal-password',/(?:\bADMIN_PASSWORD|\bpassword)\s*[:=]\s*["']([^"'\r\n]+)["']/g]];
function scanText(text,label){for(const [rule,re] of rules){re.lastIndex=0;for(const match of text.matchAll(re)){
 const fixture=(rule==='private-key-field'&&/^(?:synthetic|fixture|fake|test|dummy|not-a-|private-key-must-not)/i.test(match[1]??''))||(rule==='literal-password'&&/^(?:wrong|bad|invalid)$/i.test(match[1]??''));
 findings.push({file:label,line:text.slice(0,match.index).split('\n').length,rule,classification:fixture?'synthetic-test-literal':'REVIEW_REQUIRED'});
 }} }
async function scanBuffer(data,path,label){
 scanText(data.toString('utf8'),label);
 if(extname(path)==='.xlsx'){try{const zip=await JSZip.loadAsync(data);for(const entry of Object.values(zip.files))if(!entry.dir){counts.archiveEntries++;scanText(await entry.async('string'),label+'!'+entry.name);}}catch{findings.push({file:label,rule:'invalid-xlsx-archive',classification:'REVIEW_REQUIRED'});}}
 if(extname(path)==='.png'){
  for(let i=8;i+12<=data.length;){
   const length=data.readUInt32BE(i),type=data.toString('ascii',i+4,i+8),chunk=data.subarray(i+8,i+8+length),zero=chunk.indexOf(0);
   if(type==='tEXt'){counts.pngMetadata++;scanText(chunk.toString('utf8'),label+'!tEXt');}
   if(type==='zTXt'&&zero>=0&&chunk[zero+1]===0){counts.pngMetadata++;scanText(inflateSync(chunk.subarray(zero+2),{maxOutputLength:10*1024*1024}).toString('utf8'),label+'!zTXt');}
   if(type==='iTXt'&&zero>=0){const lang=chunk.indexOf(0,zero+3),translated=chunk.indexOf(0,lang+1);if(lang>=0&&translated>=0){counts.pngMetadata++;const text=chunk.subarray(translated+1);scanText((chunk[zero+1]===1?inflateSync(text,{maxOutputLength:10*1024*1024}):text).toString('utf8'),label+'!iTXt');}}
   i+=length+12;
  }
 }
}
function privateFilename(path){return /(?:^|\/)(?:\.env(?:\..+)?|service-account[^/]*\.json|credentials\/.*|[^/]*\.(?:pem|key))$/i.test(path)&&!path.endsWith('.env.example');}
for(const path of paths){
 if(privateFilename(path)){findings.push({file:path,rule:'private-filename',classification:'REVIEW_REQUIRED_NOT_OPENED'});continue;}
 try{await scanBuffer(await readFile(resolve(root,path)),path,path);counts.workingFiles++;}catch(e){if(e.code!=='ENOENT')throw e;}
}
// Unchanged index blobs equal the scanned worktree. Scan differing/staged/deleted index blobs separately.
const changed=git('diff','--name-only','-z','HEAD').toString('utf8').split('\0').filter(Boolean);
for(const path of changed){if(privateFilename(path))continue;let blob;try{blob=git('show',':'+path);}catch{continue;}await scanBuffer(blob,path,'INDEX:'+path);counts.indexChangedFiles++;}
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else{counts.bundleFiles++;const data=await readFile(path);scanText(data.toString('utf8'),'BUNDLE:'+entry.name);if(/GOOGLE_APPLICATION_CREDENTIALS|private_key|ya29\./.test(data.toString('utf8')))findings.push({file:'BUNDLE:'+entry.name,rule:'backend-credential-boundary',classification:'REVIEW_REQUIRED'});}}}
await walk(resolve(root,'frontend/dist'));
// Reviewed exceptions are tied to exact Git blobs. A changed test file requires review again.
const reviewed=JSON.parse(await readFile(join(here,'security-reviewed.json'),'utf8'));
for(const item of findings)if(item.classification==='REVIEW_REQUIRED'){
 const entry=reviewed.find(r=>r.file===item.file&&r.rule===item.rule);if(!entry)continue;
 const path=item.file.replace(/^INDEX:/,'');const hash=(item.file.startsWith('INDEX:')?git('rev-parse',':'+path):git('hash-object','--',path)).toString('utf8').trim();
 if(entry.gitBlob===hash)item.classification=item.rule==='invalid-xlsx-archive'?'reviewed-invalid-fixture':'reviewed-synthetic-test-literal';
}
const report={scope:'git tracked+untracked nonignored worktree; differing index blobs; XLSX entries; PNG tEXt/zTXt/iTXt; current dist',counts,findings,reviewRequired:findings.filter(f=>f.classification.startsWith('REVIEW_REQUIRED')).length};
await writeFile(join(here,'security-scan.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({counts,reviewRequired:report.reviewRequired,reviewedNonSecretFindings:findings.length-report.reviewRequired}));
if(report.reviewRequired)process.exitCode=1;
