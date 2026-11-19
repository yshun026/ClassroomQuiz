import test from 'node:test';
import assert from 'node:assert/strict';
import {SheetsAccess} from '../../src/services/sheets-access.js';
import {GuidedNotesService} from '../../src/services/guided-notes-service.js';
import {liveConfiguration,exerciseSource} from '../helpers/google-live.js';
import {diagnoseProtected} from '../helpers/protected-diagnostics.js';

const config=liveConfiguration(process.env);
test('Google Sheets real API acceptance (opt-in; writes dedicated sources)',{skip:config.enabled?false:config.reason},async t=>{
 // Do not attach original errors: Google source contents/IDs must not enter TAP artifacts.
 try{
  const access=new SheetsAccess({credentialPath:config.credentialPath}),notes=new GuidedNotesService();
  if(config.mode==='read-denied'){
   await assert.rejects(access.getSource(config.ids[0]),e=>e.code==='SHEETS_ACCESS_UNAVAILABLE');
   t.diagnostic('A read-denied safe error observed; this does not prove known write denial');return;
  }
  if(config.mode==='protected'){
   const diagnosis=await diagnoseProtected({access,sourceId:config.ids[0],notes});
   for(const code of diagnosis.codes)t.diagnostic('protected diagnostic: '+code);
   assert.equal(diagnosis.passed,true); // Still requires parseSource to throw SHEETS_NOT_EDITABLE.
   t.diagnostic('A known protected answer rejected; zero writes');return;
  }
  // Validate BOTH clean dedicated templates before the first write, including B hidden/merge coverage.
  const raws=[],sources=[];
  for(const id of config.ids){const raw=await access.getSource(id);raws.push(raw);sources.push(notes.parseSource(raw,'https://docs.google.com/spreadsheets/d/'+id+'/edit'));}
  for(const s of sources)assert(s.placeholderLocations.size>=3);
  const positions=s=>JSON.stringify([...s.placeholderLocations.values()].map(l=>[l.sheetId,l.rowIndex,l.columnIndex]));assert.notEqual(positions(sources[0]),positions(sources[1]));
  assert([...sources[1].placeholderLocations.values()].some(l=>sources[1].supportedSheets.get(l.sheetId).hidden));assert([...sources[1].placeholderLocations.values()].some(l=>l.mergeRange));
  // A failure stops the whole run before B; never continue writing after uncertainty.
  for(const [i,raw] of raws.entries()){const result=await exerciseSource(access,raw);t.diagnostic((i===0?'A':'B')+': verified, questions='+result.questionCount+', explicit batches='+result.writeCalls);}
 }catch{throw Error('LIVE_ACCEPTANCE_FAILED: setup/permissions/content require local review; no private error details recorded');}
});
