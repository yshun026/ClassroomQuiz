export class WritebackEvidence{
 constructor({activityId,spreadsheetId,questionNumber,location,exactText,operationId}){
  if(typeof activityId!=='string'||typeof spreadsheetId!=='string'||!Number.isSafeInteger(questionNumber)||questionNumber<1||typeof exactText!=='string'||typeof operationId!=='string'||![location.sheetId,location.rowIndex,location.columnIndex].every(n=>Number.isSafeInteger(n)&&n>=0))throw TypeError('Invalid writeback evidence');
  Object.assign(this,{activityId,spreadsheetId,questionNumber,sheetId:location.sheetId,rowIndex:location.rowIndex,columnIndex:location.columnIndex,exactText,verifiedAt:new Date().toISOString(),operationId});Object.freeze(this);
 }
}
