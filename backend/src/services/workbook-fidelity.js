import JSZip from 'jszip';
import {XMLParser} from 'fast-xml-parser';
import {isDeepStrictEqual} from 'node:util';
import {AppError} from '../api/errors.js';
import ExcelJS from 'exceljs';
const parser=new XMLParser({ignoreAttributes:false,parseTagValue:false,parseAttributeValue:false,trimValues:false});
function semanticXML(bytes){
 const tree=parser.parse(bytes.toString('utf8'));const data=tree.worksheet?.sheetData;
 if(data&&data.row){const rows=Array.isArray(data.row)?data.row:[data.row];
 // Empty default rows have no values or formatting; all other attributes remain compared.
 data.row=rows.filter(r=>r.c!==undefined||Object.keys(r).some(k=>!['@_r','@_spans','@_x14ac:dyDescent'].includes(k))||(r['@_x14ac:dyDescent']!==undefined&&r['@_x14ac:dyDescent']!=='0.25'));}
 return tree;
}
export async function verifyWorkbookFidelity(source,roundtrip,{allowedCells=[],expectedFills=[]}={}){
 if(expectedFills.length){
  const workbook=new ExcelJS.Workbook();
  try{await workbook.xlsx.load(roundtrip);}catch{throw new AppError('WORKBOOK_UNSUPPORTED',{reason:'匯出檔無法重新驗證'});}
  for(const {location,answerText} of expectedFills){
   const sheet=workbook.getWorksheet(location.worksheetId),cell=sheet?.getCell(location.cellAddress);
   if(sheet?.name!==location.worksheetName||cell?.type!==ExcelJS.ValueType.String||cell.value!==answerText)
    throw new AppError('WORKBOOK_UNSUPPORTED',{reason:'回填答案文字無法保真',worksheet:location.worksheetName,cell:location.cellAddress});
  }
 }
 const a=await JSZip.loadAsync(source),b=await JSZip.loadAsync(roundtrip);
 const names=z=>Object.keys(z.files).filter(n=>!z.files[n].dir).sort();
 const left=names(a),right=names(b);
 if(!isDeepStrictEqual(left,right))throw new AppError('WORKBOOK_UNSUPPORTED',{reason:'工作簿封裝部件有增減'});
 const strings=async z=>{const part=z.file('xl/sharedStrings.xml');if(!part)return [];const si=semanticXML(await part.async('nodebuffer')).sst?.si;return si===undefined?[]:Array.isArray(si)?si:[si];};
 const tables=allowedCells.length?await Promise.all([strings(a),strings(b)]):null;
 const normalize=(tree,name,table)=>{
  const rows=tree.worksheet?.sheetData?.row;if(!rows)return tree;
  const targets=new Set(allowedCells.filter(l=>name===`xl/worksheets/sheet${l.worksheetId}.xml`).map(l=>l.cellAddress));
  for(const row of Array.isArray(rows)?rows:[rows])for(const cell of row.c?(Array.isArray(row.c)?row.c:[row.c]):[]){
   if(targets.has(cell['@_r'])){delete cell.v;delete cell.is;delete cell['@_t'];}
   else if(cell['@_t']==='s'){const index=Number(cell.v);if(!Number.isInteger(index)||!table[index])throw new AppError('WORKBOOK_UNSUPPORTED');cell.v=table[index];}
  }
  return tree;
 };
 for(const name of left){const x=await a.file(name).async('nodebuffer'),y=await b.file(name).async('nodebuffer');
  // Shared-string indices may change after filling an answer. Compare resolved values and rich-text
  // formatting at every non-answer cell instead of treating indices as user content.
  if(tables&&name==='xl/sharedStrings.xml')continue;
  if(name.endsWith('.xml')||name.endsWith('.rels')){
   const tx=semanticXML(x),ty=semanticXML(y);
   if(tables&&name.startsWith('xl/worksheets/')){normalize(tx,name,tables[0]);normalize(ty,name,tables[1]);}
   if(!isDeepStrictEqual(tx,ty))throw new AppError('WORKBOOK_UNSUPPORTED',{reason:'工作簿部件往返後內容不同',part:name});
  }else if(!x.equals(y))throw new AppError('WORKBOOK_UNSUPPORTED',{reason:'工作簿二進位部件不同',part:name});
 }
}
