import JSZip from 'jszip';
import {XMLParser} from 'fast-xml-parser';
import {isDeepStrictEqual} from 'node:util';
import {AppError} from '../api/errors.js';
const parser=new XMLParser({ignoreAttributes:false,parseTagValue:false,parseAttributeValue:false,trimValues:false});
function semanticXML(bytes){
 const tree=parser.parse(bytes.toString('utf8'));const data=tree.worksheet?.sheetData;
 if(data&&data.row){const rows=Array.isArray(data.row)?data.row:[data.row];
 // Empty default rows have no values or formatting; all other attributes remain compared.
 data.row=rows.filter(r=>r.c!==undefined||Object.keys(r).some(k=>!['@_r','@_spans','@_x14ac:dyDescent'].includes(k))||(r['@_x14ac:dyDescent']!==undefined&&r['@_x14ac:dyDescent']!=='0.25'));}
 return tree;
}
export async function verifyWorkbookFidelity(source,roundtrip){
 const a=await JSZip.loadAsync(source),b=await JSZip.loadAsync(roundtrip);
 const names=z=>Object.keys(z.files).filter(n=>!z.files[n].dir).sort();
 const left=names(a),right=names(b);
 if(!isDeepStrictEqual(left,right))throw new AppError('WORKBOOK_UNSUPPORTED',{reason:'工作簿封裝部件有增減'});
 for(const name of left){const x=await a.file(name).async('nodebuffer'),y=await b.file(name).async('nodebuffer');
  if(name.endsWith('.xml')||name.endsWith('.rels')){
   if(!isDeepStrictEqual(semanticXML(x),semanticXML(y)))throw new AppError('WORKBOOK_UNSUPPORTED',{reason:'工作簿部件往返後內容不同',part:name});
  }else if(!x.equals(y))throw new AppError('WORKBOOK_UNSUPPORTED',{reason:'工作簿二進位部件不同',part:name});
 }
}
