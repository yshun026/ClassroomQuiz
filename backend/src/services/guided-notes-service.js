import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import {XMLParser} from 'fast-xml-parser';
import {AppError} from '../api/errors.js';
import {GuidedNotesDocument} from '../models/guided-notes-document.js';
import {PlaceholderLocation} from '../models/placeholder-location.js';
import {verifyWorkbookFidelity} from './workbook-fidelity.js';
export class GuidedNotesService{
 async validateAndImport(buffer,filename){
  if(typeof filename!=='string'||!filename.toLowerCase().endsWith('.xlsx'))throw new AppError('FILE_TYPE_INVALID');
  const workbook=new ExcelJS.Workbook();
  try{await workbook.xlsx.load(buffer);}catch{throw new AppError('FILE_UNREADABLE');}
  const locations=new Map();
  for(const sheet of workbook.worksheets)sheet.eachRow(row=>row.eachCell(cell=>{
   if(cell.isMerged&&cell.master.address!==cell.address)return;
   const v=cell.value;const text=typeof v==='string'?v:JSON.stringify(v??'');
   const match=typeof v==='string'?/^\{\{Q([1-9][0-9]*)\}\}$/.exec(v):null;
   const details={worksheet:sheet.name,cell:cell.address};
   if(!match){if(/\{\{?\s*[Qq]|[Qq]\s*\d+\s*\}\}?/.test(text))throw new AppError('PLACEHOLDER_INVALID',details);return;}
   const number=Number(match[1]);if(!Number.isSafeInteger(number))throw new AppError('PLACEHOLDER_INVALID',details);
   if(locations.has(number))throw new AppError('PLACEHOLDER_DUPLICATE',{...details,questionNumber:number});
   locations.set(number,new PlaceholderLocation(number,sheet,cell.address));
  }));
  if(!locations.size)throw new AppError('PLACEHOLDER_MISSING');
  const sorted=[...locations.keys()].sort((a,b)=>a-b);if(sorted.some((n,i)=>n!==i+1))throw new AppError('QUESTION_GAP');
  // ExcelJS reader injects print defaults. Restore absent optional source properties,
  // rather than ignoring changed print settings in the fidelity comparison.
  const zip=await JSZip.loadAsync(buffer);const parser=new XMLParser({ignoreAttributes:false});
  for(const sheet of workbook.worksheets){const part=zip.file(`xl/worksheets/sheet${sheet.id}.xml`);if(!part)continue;const original=parser.parse(await part.async('string')).worksheet?.pageSetup||{};for(const key of ['firstPageNumber','useFirstPageNumber','copies']){if(!Object.hasOwn(original,'@_'+key))delete sheet.pageSetup[key];}}
  const roundtrip=await workbook.xlsx.writeBuffer();await verifyWorkbookFidelity(buffer,roundtrip);
  return new GuidedNotesDocument(buffer,workbook,new Map(sorted.map(n=>[n,locations.get(n)])));
 }
}
