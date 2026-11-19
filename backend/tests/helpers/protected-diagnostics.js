import {GuidedNotesService} from '../../src/services/guided-notes-service.js';

export const PROTECTED_DIAGNOSTIC_CODES=Object.freeze(['P_READ_FAILED','P_SOURCE_INVALID','P_NO_PROTECTION','P_EDITABILITY_UNKNOWN','P_NO_ANSWER_MATCH','P_DENIED_CONFIRMED','P_WARNING_ONLY','P_REFERENCE_UNRESOLVED','P_EXCEPTION_MATCH','P_EDITABILITY_ALLOWED','P_DIAGNOSTIC_UNAVAILABLE','P_EDITABILITY_MISSING','P_EDITABILITY_NULL','P_EDITABILITY_NON_BOOLEAN','P_EDITABILITY_TRUE','P_EDITABILITY_FALSE','P_MULTIPLE_MATCHING_PROTECTIONS','P_EDITABILITY_MIXED']);
const sourceErrors=new Set(['SHEETS_URL_INVALID','SOURCE_UNSUPPORTED','PLACEHOLDER_MISSING','PLACEHOLDER_INVALID','PLACEHOLDER_DUPLICATE','QUESTION_GAP','ANSWER_CELL_FORMAT_UNSUPPORTED']);
const result=(passed,codes)=>({passed,codes:[...new Set(codes)]});
const unavailable=()=>result(false,['P_DIAGNOSTIC_UNAVAILABLE']);

// Presence and JSON value type only: no coercion, no raw value in the result.
export function editabilityState(protection){
 if(!Object.hasOwn(protection,'requestingUserCanEdit'))return 'P_EDITABILITY_MISSING';
 const value=protection.requestingUserCanEdit;
 if(value===null)return 'P_EDITABILITY_NULL';
 if(value===true)return 'P_EDITABILITY_TRUE';
 if(value===false)return 'P_EDITABILITY_FALSE';
 return 'P_EDITABILITY_NON_BOOLEAN';
}

// Diagnostic geometry only. Mirrors the parser's range rules; never grants or denies access.
// If this interpretation disagrees with the authoritative parser, report unavailable.
function rangeFor(raw,sheet){
 if(!raw||(raw.sheetId??sheet.sheetId)!==sheet.sheetId)return null;
 const r={sheetId:raw.sheetId??sheet.sheetId,startRowIndex:raw.startRowIndex??0,endRowIndex:raw.endRowIndex??sheet.rowCount,startColumnIndex:raw.startColumnIndex??0,endColumnIndex:raw.endColumnIndex??sheet.columnCount};
 if(!Object.values(r).every(n=>Number.isSafeInteger(n)&&n>=0)||r.startRowIndex>=r.endRowIndex||r.startColumnIndex>=r.endColumnIndex||r.endRowIndex>sheet.rowCount||r.endColumnIndex>sheet.columnCount)return null;
 return r;
}
const contains=(r,l)=>l.rowIndex>=r.startRowIndex&&l.rowIndex<r.endRowIndex&&l.columnIndex>=r.startColumnIndex&&l.columnIndex<r.endColumnIndex;
function explainReturnedSource(raw,source){
 let rules=0,matched=false,unresolved=false,matchingRules=0;const codes=[],states=new Set();
 for(const [id,sheet] of source.supportedSheets){
  const wire=raw.sheets.find(s=>s.properties.sheetId===id);
  for(const protection of wire.protectedRanges??[]){
   rules++;
   const reference=protection.range??(protection.namedRangeId?raw.namedRanges?.find(n=>n.namedRangeId===protection.namedRangeId)?.range:wire.tables?.find(t=>t.tableId===protection.tableId)?.range);
   const range=rangeFor(reference,sheet);
   if(!range){unresolved=true;codes.push('P_REFERENCE_UNRESOLVED');continue;}
   const targets=[...source.placeholderLocations.values()].filter(l=>l.sheetId===id&&contains(range,l));
   if(!targets.length)continue;matched=true;matchingRules++;
   const state=editabilityState(protection);states.add(state);codes.push(state);
   if(protection.warningOnly===true){codes.push('P_WARNING_ONLY');continue;}
   // Strict comparison: absence, null, strings and numbers never mean false.
   if(protection.requestingUserCanEdit!==false){codes.push(protection.requestingUserCanEdit===true?'P_EDITABILITY_ALLOWED':'P_EDITABILITY_UNKNOWN');continue;}
   const whole=range.startRowIndex===0&&range.startColumnIndex===0&&range.endRowIndex===sheet.rowCount&&range.endColumnIndex===sheet.columnCount;
   const exceptions=whole?(protection.unprotectedRanges??[]).map(r=>rangeFor(r,sheet)):[];
   if(exceptions.some(r=>!r)){codes.push('P_REFERENCE_UNRESOLVED');continue;}
   if(targets.every(l=>exceptions.some(r=>contains(r,l)))){codes.push('P_EXCEPTION_MATCH');continue;}
   return unavailable(); // Parser returned despite what looks like denial: do not invent a cause/PASS.
  }
 }
 if(!rules)return result(false,['P_NO_PROTECTION']);
 if(!matched&&!unresolved)return result(false,['P_NO_ANSWER_MATCH']);
 if(matchingRules>1)codes.push('P_MULTIPLE_MATCHING_PROTECTIONS');
 if(states.size>1)codes.push('P_EDITABILITY_MIXED');
 return codes.length?result(false,codes):unavailable();
}

// Only a single injected GET plus the unchanged production parser. No write capability used.
// The ONLY successful condition is the original parser throwing SHEETS_NOT_EDITABLE.
export async function diagnoseProtected({access,sourceId,notes=new GuidedNotesService()}){
 let raw;try{raw=await access.getSource(sourceId);}catch{return result(false,['P_READ_FAILED']);}
 try{
  let source;
  try{source=notes.parseSource(raw,'https://docs.google.com/spreadsheets/d/'+sourceId+'/edit');}
  catch(error){
   if(error?.code==='SHEETS_NOT_EDITABLE')return result(true,['P_DENIED_CONFIRMED']);
   return sourceErrors.has(error?.code)?result(false,['P_SOURCE_INVALID']):unavailable();
  }
  return explainReturnedSource(raw,source);
 }catch{return unavailable();}
}
