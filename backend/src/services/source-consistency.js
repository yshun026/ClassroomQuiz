import {isDeepStrictEqual} from 'node:util';
import {GuidedNotesService} from './guided-notes-service.js';
import {AppError} from '../api/errors.js';

const key=l=>`${l.sheetId}/${l.rowIndex}/${l.columnIndex}`;
const sameLocation=(a,b)=>a&&b&&['sheetId','rowIndex','columnIndex'].every(k=>a[k]===b[k]);
export const exactString=(value,text)=>value&&Object.keys(value).length===1&&value.stringValue===text&&typeof value.stringValue==='string';
export class SourceConflict extends Error{
 constructor(locations=[],message='來源內容或結構已變更，停止尚未送出的寫入'){
  super(message);this.code='SOURCE_CONFLICT';this.locations=locations;
 }
}
export function checkSourceConsistency(source,raw,{activityId,evidence=new Map(),pendingOperation=null}={}){
 const conflict=(location,message)=>{throw new SourceConflict(location?[location]:[],message);};
 if(raw?.spreadsheetId!==source.spreadsheetId||!Array.isArray(raw.sheets))conflict();
 const copy=structuredClone(raw),cells=new Map(),gridIds=new Set();
 for(const wire of copy.sheets){
  const p=wire.properties;if(!p)conflict();if((p.sheetType??'GRID')!=='GRID')continue;
  if(gridIds.has(p.sheetId))conflict();gridIds.add(p.sheetId);
  const baseline=source.supportedSheets.get(p.sheetId);
  if(!baseline||p.gridProperties?.rowCount!==baseline.rowCount||p.gridProperties?.columnCount!==baseline.columnCount)conflict();
  const merges=(wire.merges??[]).map(m=>({sheetId:m.sheetId??p.sheetId,startRowIndex:m.startRowIndex??0,endRowIndex:m.endRowIndex,startColumnIndex:m.startColumnIndex??0,endColumnIndex:m.endColumnIndex}));
  const sorted=items=>items.map(m=>JSON.stringify(m)).sort();if(!isDeepStrictEqual(sorted(merges),sorted(baseline.merges)))conflict();
  for(const block of wire.data??[])for(const [ri,row] of (block.rowData??[]).entries())for(const [ci,cell] of (row.values??[]).entries()){
   const coordinate={sheetId:p.sheetId,rowIndex:(block.startRow??0)+ri,columnIndex:(block.startColumn??0)+ci},id=key(coordinate);
   if(cells.has(id)||!cell||typeof cell!=='object')conflict();cells.set(id,cell);
  }
 }
 if(gridIds.size!==source.supportedSheets.size)conflict();
 const verified=new Set(),placeholders=new Set([...source.placeholderLocations.values()].map(key));
 for(const [number,location] of source.placeholderLocations){
  const cell=cells.get(key(location)),value=cell?.userEnteredValue;
  if(!cell||cell.textFormatRuns?.length||cell.chipRuns?.length)conflict(location,'原答案格遺失或含新增局部文字格式');
  const proof=evidence.get(number);
  if(proof){
   if(proof.activityId!==activityId||proof.spreadsheetId!==source.spreadsheetId||proof.questionNumber!==number||!sameLocation(proof,location)||!exactString(value,proof.exactText))conflict(location,'先前核對成功的儲存格已改變');
   verified.add(number);
  }else{
   const pending=pendingOperation?.snapshot;
   const fill=pending?.activityId===activityId&&pending.sourceId===source.spreadsheetId?pending.fills.find(f=>f.questionNumber===number&&sameLocation(f.location,location)):null;
   const wasSent=fill&&pendingOperation.attempts.some(attempt=>attempt.sent&&!['KNOWN_REJECTED','NOT_SENT'].includes(attempt.remoteOutcome)&&attempt.targetQuestionNumbers.includes(number));
   if(wasSent&&exactString(value,fill.answerText))verified.add(number);
   else if(!exactString(value,location.originalPlaceholder))conflict(location,'原標記已被無法由本活動證據解釋的值取代');
  }
  // Restore logical markers in a private copy BEFORE parsing; marker-like answers are not new questions.
  cell.userEnteredValue={stringValue:location.originalPlaceholder};
 }
 const valueKeys=new Set([...source.baselineCellValues.keys(),...cells.keys()]);
 for(const id of valueKeys)if(!placeholders.has(id)){
  const value=cells.get(id)?.userEnteredValue,baseline=source.baselineCellValues.get(id);
  const current=value&&Object.keys(value).length?value:undefined;
  if(!isDeepStrictEqual(current,baseline)){
   const [sheetId,rowIndex,columnIndex]=id.split('/').map(Number);conflict({sheetId,rowIndex,columnIndex},'非答案儲存格的原始值或公式定義已改變');
  }
 }
 let logical;
 try{logical=new GuidedNotesService().parseSource(copy,source.canonicalUrl);}
 catch(error){if(error instanceof AppError&&error.code==='SHEETS_NOT_EDITABLE')throw error;conflict(error.details?.locations?.[0]);}
 if(logical.placeholderLocations.size!==source.placeholderLocations.size)conflict();
 for(const [number,location] of source.placeholderLocations)if(!sameLocation(logical.placeholderLocations.get(number),location))conflict(location);
 // Read values from the original response, not from the marker-restored validation copy.
 const values=new Map();for(const wire of raw.sheets)for(const block of wire.data??[])for(const [ri,row] of (block.rowData??[]).entries())for(const [ci,cell] of (row.values??[]).entries())values.set(`${wire.properties.sheetId}/${(block.startRow??0)+ri}/${(block.startColumn??0)+ci}`,cell.userEnteredValue);
 return {verified,values};
}
