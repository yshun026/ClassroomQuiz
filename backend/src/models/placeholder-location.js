export class PlaceholderLocation{
 static fromGrid(questionNumber,sheet,rowIndex,columnIndex,mergeRange=null){
  if(!Number.isSafeInteger(questionNumber)||questionNumber<1||![sheet.sheetId,rowIndex,columnIndex].every(n=>Number.isSafeInteger(n)&&n>=0))throw TypeError('Invalid placeholder location');
  let n=columnIndex+1,column='';while(n){column=String.fromCharCode(65+(n-1)%26)+column;n=Math.floor((n-1)/26);}
  return Object.freeze(Object.assign(Object.create(this.prototype),{questionNumber,sheetId:sheet.sheetId,sheetTitle:sheet.title,rowIndex,columnIndex,cellAddress:column+(rowIndex+1),originalPlaceholder:`{{Q${questionNumber}}}`,mergeRange}));
 }
}
