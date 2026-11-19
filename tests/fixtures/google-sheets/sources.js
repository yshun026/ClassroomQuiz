// Synthetic Google wire data only. These IDs never identify real spreadsheets.
const marker=n=>({userEnteredValue:{stringValue:`{{Q${n}}}`},userEnteredFormat:{backgroundColor:{red:0.9},textFormat:{bold:true}}});
const sheet=(sheetId,title,hidden=false)=>({properties:{sheetId,title,index:0,sheetType:'GRID',hidden,gridProperties:{rowCount:60,columnCount:20}},merges:[],data:[]});
const grid=(row,column,values)=>({startRow:row,startColumn:column,rowData:[{values}]});
export function syntheticSheetA(){
 const notes=sheet(0,'Notes A');
 notes.data=[grid(3,2,[marker(1),{},marker(2)]),grid(8,1,[{userEnteredValue:{formulaValue:'=1+2'},userEnteredFormat:{numberFormat:{type:'NUMBER'}}}]),grid(10,0,[{userEnteredValue:{stringValue:'non-answer rich text'},textFormatRuns:[{startIndex:0,format:{bold:true}}]}])];
 const hidden=sheet(2,'Hidden A',true);hidden.properties.index=1;hidden.data=[grid(6,4,[marker(3)])];
 return {spreadsheetId:'synthetic-A',properties:{title:'Synthetic A'},sheets:[notes,hidden],namedRanges:[]};
}
export function syntheticSheetB(){
 const first=sheet(7,"Teacher's Notes B");first.data=[grid(1,6,[marker(1)])];
 const hidden=sheet(9,'Hidden B',true);hidden.properties.index=1;hidden.data=[grid(5,0,[marker(2)]),grid(10,2,[marker(3),{}])];
 hidden.merges=[{sheetId:9,startRowIndex:10,endRowIndex:11,startColumnIndex:2,endColumnIndex:4}];
 const excluded={properties:{sheetId:11,title:'Excluded synthetic object',index:2,sheetType:'OBJECT'}};
 return {spreadsheetId:'synthetic-B',properties:{title:'Synthetic B'},sheets:[first,hidden,excluded],namedRanges:[]};
}
export function syntheticCases(){
 const duplicate=syntheticSheetA();duplicate.sheets[1].data[0].rowData[0].values[0]=marker(1);
 const formula=syntheticSheetA();formula.sheets[0].data[0].rowData[0].values[0]={userEnteredValue:{formulaValue:'="{{Q1}}"'}};
 const rich=syntheticSheetA();rich.sheets[0].data[0].rowData[0].values[0].textFormatRuns=[{startIndex:0,format:{bold:true}}];
 const protectedSource=syntheticSheetA();protectedSource.sheets[0].protectedRanges=[{protectedRangeId:1,range:{sheetId:0},warningOnly:false,requestingUserCanEdit:false,unprotectedRanges:[{sheetId:0,startRowIndex:20,endRowIndex:25}]}];
 return {duplicate,formula,rich,protectedSource,unknown:syntheticSheetA()};
}

// Pure-domain fixture for existing synchronous quiz tests; NOT the production parser.
export function syntheticDomainSource(count=1){
 const properties={sheetId:0,title:'Synthetic quiz',index:0,sheetType:'GRID',hidden:false,rowCount:Math.max(60,count),columnCount:20,merges:[]};
 const locations=new Map(Array.from({length:count},(_,i)=>[i+1,Object.freeze({questionNumber:i+1,sheetId:0,sheetTitle:properties.title,rowIndex:i,columnIndex:6,cellAddress:`G${i+1}`,originalPlaceholder:`{{Q${i+1}}}`,mergeRange:null})]));
 return Object.freeze({spreadsheetId:'synthetic-quiz',canonicalUrl:'https://docs.google.com/spreadsheets/d/synthetic-quiz/edit',title:'Synthetic quiz',supportedSheets:new Map([[0,properties]]),excludedSheets:[],placeholderLocations:locations,permissionAssessment:'UNKNOWN',baselineCellValues:new Map([...locations].map(([n,l])=>[`0/${l.rowIndex}/${l.columnIndex}`,{stringValue:`{{Q${n}}}`}]))});
}

export function syntheticQuizWire(count=1){
 if(!Number.isSafeInteger(count)||count<1)throw TypeError('Invalid synthetic question count');
 const notes=sheet(0,'Synthetic quiz');notes.properties.gridProperties.rowCount=Math.max(60,count);
 notes.data=[{startRow:0,startColumn:6,rowData:Array.from({length:count},(_,i)=>({values:[marker(i+1)]}))}];
 return {spreadsheetId:'synthetic-quiz',properties:{title:'Synthetic quiz'},sheets:[notes],namedRanges:[]};
}
