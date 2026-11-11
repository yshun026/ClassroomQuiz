import ExcelJS from '../../../backend/node_modules/exceljs/excel.js';
import {writeFile} from 'node:fs/promises';
const out=new URL('./',import.meta.url);
async function save(name,edit){const w=new ExcelJS.Workbook();const s=w.addWorksheet('Notes');s.getCell('A1').value='原始題目文字';s.getCell('B3').value='{{Q1}}';s.getCell('D5').value='{{Q2}}';s.getCell('F7').value='{{Q3}}';if(edit)edit(w,s);await w.xlsx.writeFile(new URL(name+'.xlsx',out).pathname.replace(/^\/([A-Z]:)/,'$1'));}
await save('valid-a');
await save('valid-b',(w,s)=>{for(const a of ['B3','D5','F7'])s.getCell(a).value=null;const t=w.addWorksheet('Other');s.getCell('J20').value='{{Q1}}';t.getCell('A9').value='{{Q2}}';t.getCell('H2').value='{{Q3}}';});
await save('fidelity',(w,s)=>{s.getCell('A1').font={bold:true,color:{argb:'FF114488'}};s.getCell('A1').border={bottom:{style:'thin'}};s.getColumn(1).width=32;s.getRow(1).height=30;s.getCell('A10').value={formula:'1+2',result:3};s.mergeCells('H10:I10');s.getCell('H10').value='保留合併內容';const image=w.addImage({base64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a/WQAAAAASUVORK5CYII=',extension:'png'});s.addImage(image,'K10:L11');});
await save('merged',(w,s)=>s.mergeCells('B3:C3'));
const invalid={gap:(w,s)=>s.getCell('D5').value=null,duplicate:(w)=>w.addWorksheet('Dup').getCell('A1').value='{{Q1}}',zero:(w,s)=>s.getCell('B3').value='{{Q0}}',leading:(w,s)=>s.getCell('B3').value='{{Q01}}',lowercase:(w,s)=>s.getCell('B3').value='{{q1}}',broken:(w,s)=>s.getCell('B3').value='{{Q1}',space:(w,s)=>s.getCell('B3').value=' {{Q1}}',mixed:(w,s)=>s.getCell('B3').value='答案：{{Q1}}',formula:(w,s)=>s.getCell('B3').value={formula:'"{{Q1}}"',result:'{{Q1}}'},empty:(w,s)=>{for(const a of ['B3','D5','F7'])s.getCell(a).value=null;}};
for(const [name,edit] of Object.entries(invalid))await save(name,edit);
await writeFile(new URL('corrupt.xlsx',out),'not a workbook');
console.log('Fixtures generated: 4 valid + 11 invalid');
