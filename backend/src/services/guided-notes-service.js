import {AppError} from '../api/errors.js';
import {PlaceholderLocation} from '../models/placeholder-location.js';
import {GuidedNotesSource} from '../models/guided-notes-source.js';
export function parseSheetsUrl(input){
 try{
  if(typeof input!=='string'||/[\\\u0000-\u0020]/.test(input))throw Error();
  const decoded=decodeURIComponent(input.split(/[?#]/)[0]);
  if(/(?:^|\/)\.{1,2}(?:\/|$)/.test(decoded))throw Error();
  const url=new URL(input),match=/^\/spreadsheets\/d\/([A-Za-z0-9_-]+)(?:\/.*)?$/.exec(url.pathname);
  if(url.protocol!=='https:'||url.hostname!=='docs.google.com'||url.username||url.password||url.port||!match||match[1]==='e')throw Error();
  return {spreadsheetId:match[1],canonicalUrl:`https://docs.google.com/spreadsheets/d/${match[1]}/edit`};
 }catch{throw new AppError('SHEETS_URL_INVALID');}
}
function rangeFor(raw,sheet,strict=false){
 const id=raw?.sheetId??sheet.sheetId;if(!raw||id!==sheet.sheetId)return null;
 const r={sheetId:id,startRowIndex:raw.startRowIndex??0,endRowIndex:raw.endRowIndex??sheet.rowCount,startColumnIndex:raw.startColumnIndex??0,endColumnIndex:raw.endColumnIndex??sheet.columnCount};
 if(!Object.values(r).every(n=>Number.isSafeInteger(n)&&n>=0)||r.startRowIndex>=r.endRowIndex||r.startColumnIndex>=r.endColumnIndex||r.endRowIndex>sheet.rowCount||r.endColumnIndex>sheet.columnCount)return null;
 if(strict&&(raw.endRowIndex===undefined||raw.endColumnIndex===undefined))return null;return r;
}
const contains=(range,row,col)=>row>=range.startRowIndex&&row<range.endRowIndex&&col>=range.startColumnIndex&&col<range.endColumnIndex;
const sourceIssue=(code,location)=>new AppError(code,{locations:[location]});
export class GuidedNotesService{
 constructor(sheetsAccess){this.sheetsAccess=sheetsAccess;}
 async loadSource(url){const parsed=parseSheetsUrl(url);const raw=await this.sheetsAccess.getSource(parsed.spreadsheetId);return this.parseSource(raw,parsed.canonicalUrl);}
 parseSource(raw,url){
  const parsed=parseSheetsUrl(url);
  if(raw?.spreadsheetId!==parsed.spreadsheetId||typeof raw.properties?.title!=='string'||!Array.isArray(raw.sheets))throw new AppError('SOURCE_UNSUPPORTED');
  const supportedSheets=new Map(),excludedSheets=[],locations=new Map(),baselineCellValues=new Map();
  for(const wire of raw.sheets){
   const p=wire.properties;if(!p||!Number.isSafeInteger(p.sheetId)||p.sheetId<0||typeof p.title!=='string')throw new AppError('SOURCE_UNSUPPORTED');
   if((p.sheetType??'GRID')!=='GRID'){excludedSheets.push({sheetId:p.sheetId,title:p.title,sheetType:p.sheetType});continue;}
   const sheet={sheetId:p.sheetId,title:p.title,index:p.index??0,sheetType:'GRID',hidden:p.hidden??false,rowCount:p.gridProperties?.rowCount,columnCount:p.gridProperties?.columnCount};
   if(supportedSheets.has(sheet.sheetId)||!Number.isInteger(sheet.index)||sheet.index<0||typeof sheet.hidden!=='boolean'||![sheet.rowCount,sheet.columnCount].every(n=>Number.isSafeInteger(n)&&n>0))throw new AppError('SOURCE_UNSUPPORTED');
   sheet.merges=(wire.merges??[]).map(m=>{const r=rangeFor(m,sheet,true);if(!r)throw new AppError('SOURCE_UNSUPPORTED');return r;});supportedSheets.set(sheet.sheetId,sheet);
   for(const grid of wire.data??[]){
    const startRow=grid.startRow??0,startColumn=grid.startColumn??0;
    if(![startRow,startColumn].every(n=>Number.isSafeInteger(n)&&n>=0))throw new AppError('SOURCE_UNSUPPORTED');
    for(const [ri,row] of (grid.rowData??[]).entries())for(const [ci,cell] of (row.values??[]).entries()){
     const rowIndex=startRow+ri,columnIndex=startColumn+ci;
     if(rowIndex>=sheet.rowCount||columnIndex>=sheet.columnCount)throw new AppError('SOURCE_UNSUPPORTED');
     const value=cell.userEnteredValue;if(value&&Object.keys(value).length)baselineCellValues.set(`${sheet.sheetId}/${rowIndex}/${columnIndex}`,structuredClone(value));
     const merge=sheet.merges.find(m=>contains(m,rowIndex,columnIndex));if(merge&&(merge.startRowIndex!==rowIndex||merge.startColumnIndex!==columnIndex))continue;
     const text=typeof value?.stringValue==='string'?value.stringValue:JSON.stringify(value??'');
     const match=value?.formulaValue===undefined&&typeof value?.stringValue==='string'?/^\{\{Q([1-9][0-9]*)\}\}$/.exec(text):null;
     const {questionNumber:_number,originalPlaceholder:_placeholder,...location}=PlaceholderLocation.fromGrid(1,sheet,rowIndex,columnIndex,merge??null);
     if(!match){if(/\{\{?\s*[Qq]|[Qq]\s*\d+\s*\}\}?/.test(text))throw sourceIssue('PLACEHOLDER_INVALID',location);continue;}
     const number=Number(match[1]);if(!Number.isSafeInteger(number))throw sourceIssue('PLACEHOLDER_INVALID',location);
     const target=PlaceholderLocation.fromGrid(number,sheet,rowIndex,columnIndex,merge??null);
     if(cell.textFormatRuns?.length||cell.chipRuns?.length)throw sourceIssue('ANSWER_CELL_FORMAT_UNSUPPORTED',target);
     if(locations.has(number))throw sourceIssue('PLACEHOLDER_DUPLICATE',target);locations.set(number,target);
    }
   }
  }
  if(!locations.size)throw new AppError('PLACEHOLDER_MISSING');
  const sorted=[...locations.keys()].sort((a,b)=>a-b);if(sorted.some((n,i)=>n!==i+1))throw new AppError('QUESTION_GAP',{locations:[...locations.values()]});
  for(const location of locations.values()){
   const sheet=supportedSheets.get(location.sheetId),wire=raw.sheets.find(s=>s.properties.sheetId===sheet.sheetId);
   for(const protection of wire.protectedRanges??[]){
    if(protection.warningOnly===true||protection.requestingUserCanEdit!==false)continue;
    const reference=protection.range??(protection.namedRangeId?raw.namedRanges?.find(n=>n.namedRangeId===protection.namedRangeId)?.range:wire.tables?.find(t=>t.tableId===protection.tableId)?.range);
    const range=rangeFor(reference,sheet);if(!range||!contains(range,location.rowIndex,location.columnIndex))continue;
    const wholeSheet=range.startRowIndex===0&&range.startColumnIndex===0&&range.endRowIndex===sheet.rowCount&&range.endColumnIndex===sheet.columnCount;
    const exceptions=wholeSheet?(protection.unprotectedRanges??[]).map(r=>rangeFor(r,sheet)):[];
    if(exceptions.some(r=>!r))continue; // Cannot resolve exceptions: UNKNOWN, not a guessed denial.
    if(!exceptions.some(r=>contains(r,location.rowIndex,location.columnIndex)))throw sourceIssue('SHEETS_NOT_EDITABLE',location);
   }
  }
  return new GuidedNotesSource({spreadsheetId:raw.spreadsheetId,canonicalUrl:parsed.canonicalUrl,title:raw.properties.title,supportedSheets,excludedSheets,placeholderLocations:new Map(sorted.map(n=>[n,locations.get(n)])),baselineCellValues,permissionAssessment:'UNKNOWN'});
 }
}
