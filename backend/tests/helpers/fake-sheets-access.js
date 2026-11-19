import {syntheticSheetA,syntheticSheetB} from '../../../tests/fixtures/google-sheets/sources.js';
import {AppError} from '../../src/api/errors.js';

// In-memory API boundary substitute. Hooks may await a test gate or return controlled failures.
export function createFakeSheetsAccess({sources=[syntheticSheetA(),syntheticSheetB()],beforeRead,beforeWrite,afterApply}={}){
 const documents=new Map(sources.map(s=>[s.spreadsheetId,structuredClone(s)])),calls=[],attempts=new Map();
 async function read(id,method,operation){
  calls.push({method,sourceId:id});if(beforeRead)await beforeRead({id,method,operation,documents});
  if(!documents.has(id))throw new AppError('SHEETS_ACCESS_UNAVAILABLE');return structuredClone(documents.get(id));
 }
 return {calls,documents,getSource:id=>read(id,'getSource'),verify:(id,operation)=>read(id,'verify',operation),
  async writeValues(id,fills,attemptId){
   if(attempts.has(attemptId))return attempts.get(attemptId);
   const promise=(async()=>{
    calls.push({method:'writeValues',sourceId:id,attemptId,targetCount:fills.length});
    const refused=await beforeWrite?.({id,fills,attemptId,documents});if(refused)return refused;
    if(!documents.has(id))return {attemptId,sent:true,transportState:'SETTLED',remoteOutcome:'KNOWN_REJECTED',error:{code:'SHEETS_ACCESS_UNAVAILABLE'}};
    if(!fills.length)return {attemptId,sent:false,transportState:'NOT_SENT',remoteOutcome:'NOT_SENT'};
    for(const {location,answerText} of fills){
     const sheet=documents.get(id).sheets.find(s=>s.properties.sheetId===location.sheetId);
     if(!sheet)throw new AppError('INVALID_INPUT');
     sheet.data??=[];
     let block=sheet.data.find(g=>location.rowIndex>=(g.startRow??0)&&location.rowIndex<(g.startRow??0)+(g.rowData?.length??0)&&location.columnIndex>=(g.startColumn??0));
     if(!block){block={startRow:location.rowIndex,startColumn:location.columnIndex,rowData:[{values:[]}]};sheet.data.push(block);}
     const row=block.rowData[location.rowIndex-(block.startRow??0)];row.values??=[];
     const column=location.columnIndex-(block.startColumn??0);
     while(row.values.length<=column)row.values.push({});
     row.values[column]={...row.values[column],userEnteredValue:{stringValue:answerText}};
    }
    const changed=await afterApply?.({id,fills,attemptId,documents});
    return changed??{attemptId,sent:true,transportState:'SETTLED',remoteOutcome:'APPLIED'};
   })();attempts.set(attemptId,promise);return promise;
  }
 };
}
