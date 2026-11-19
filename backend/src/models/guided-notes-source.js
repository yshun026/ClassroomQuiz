export function immutable(value){
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  if(value instanceof Map){for(const [k,v] of value){immutable(k);immutable(v);}for(const method of ['set','delete','clear'])Object.defineProperty(value,method,{value:()=>{throw TypeError('Immutable source map');}});}
  else for(const child of Object.values(value))immutable(child);
  Object.freeze(value);
 }return value;
}
export class GuidedNotesSource{
 constructor({spreadsheetId,canonicalUrl,title,supportedSheets,excludedSheets,placeholderLocations,baselineCellValues,permissionAssessment='UNKNOWN'}){
  if(typeof spreadsheetId!=='string'||!spreadsheetId||typeof canonicalUrl!=='string'||typeof title!=='string'||![supportedSheets,placeholderLocations,baselineCellValues].every(m=>m instanceof Map)||!['UNKNOWN','NO_KNOWN_DENIAL'].includes(permissionAssessment))throw TypeError('Invalid Guided Notes source');
  if(!supportedSheets.size||!placeholderLocations.size||!Array.isArray(excludedSheets))throw TypeError('Incomplete Guided Notes source');
  for(const [id,s] of supportedSheets)if(id!==s.sheetId||!Number.isSafeInteger(id)||id<0||typeof s.title!=='string'||!Number.isInteger(s.index)||s.index<0||s.sheetType!=='GRID'||typeof s.hidden!=='boolean'||![s.rowCount,s.columnCount].every(n=>Number.isSafeInteger(n)&&n>0)||!Array.isArray(s.merges))throw TypeError('Invalid sheet baseline');
  Object.assign(this,{spreadsheetId,canonicalUrl,title,supportedSheets,excludedSheets,placeholderLocations,baselineCellValues,permissionAssessment});immutable(this);
 }
}
