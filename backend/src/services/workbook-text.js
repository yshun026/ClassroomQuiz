import {AppError} from '../api/errors.js';

// OOXML ST_Xstring escapes. Encode literal underscores first, including adjacent
// escape-like sequences, so a reader can decode once without changing the answer.
export function encodeWorkbookText(text){
 for(const character of text){
  const code=character.charCodeAt(0);
  if(character.length===1&&code>=0xd800&&code<=0xdfff)throw new AppError('EXPORT_FAILED');
 }
 return text.replace(/_/g,'_x005F_')
  .replace(/[\u0000-\u0008\u000b-\u001f\u007f\ufffe\uffff]/g,character=>'_x'+character.charCodeAt(0).toString(16).toUpperCase().padStart(4,'0')+'_');
}
