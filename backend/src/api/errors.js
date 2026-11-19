import {randomUUID} from 'node:crypto';
const groups={400:['INVALID_INPUT','INVALID_GROUP_COUNT','ANSWER_BLANK'],401:['INVALID_PASSWORD','SESSION_INVALID'],403:['TEACHER_REQUIRED','STUDENT_REQUIRED','GROUP_BINDING_INVALID','ORIGIN_FORBIDDEN'],404:['ACTIVITY_NOT_READY','QUESTION_NOT_FOUND'],409:['GROUP_OCCUPIED','SESSION_ALREADY_BOUND','DUPLICATE_SUBMISSION','PHASE_CONFLICT','STALE_QUESTION','STALE_ACTIVITY','QUESTION_NOT_CLOSED','PREPARATION_LOCKED','PREPARATION_BUSY'],422:['PLACEHOLDER_MISSING','PLACEHOLDER_DUPLICATE','PLACEHOLDER_INVALID','QUESTION_GAP',],500:['INTERNAL_ERROR']};
const messages={INVALID_INPUT:'輸入格式不正確',INVALID_GROUP_COUNT:'組數必須為正整數',ANSWER_BLANK:'答案不能為空白',INVALID_PASSWORD:'管理密碼錯誤',SESSION_INVALID:'身分已失效，請重新登入或選組',TEACHER_REQUIRED:'此操作僅限老師',STUDENT_REQUIRED:'此操作僅限學生',GROUP_BINDING_INVALID:'組別身分不符',ORIGIN_FORBIDDEN:'不允許此來源連線',ACTIVITY_NOT_READY:'活動尚未準備完成',QUESTION_NOT_FOUND:'題號不存在',GROUP_OCCUPIED:'此組別已被占用',SESSION_ALREADY_BOUND:'目前身分已綁定其他組別',DUPLICATE_SUBMISSION:'此組本題已提交',PHASE_CONFLICT:'目前活動階段不允許此操作',STALE_QUESTION:'題號已變更，請重新同步',STALE_ACTIVITY:'活動已變更，請重新同步',QUESTION_NOT_CLOSED:'本題尚未結束',PREPARATION_LOCKED:'活動建立後不能變更準備設定',PREPARATION_BUSY:'檔案處理中，請稍後再試',PLACEHOLDER_MISSING:'找不到題目佔位符',PLACEHOLDER_DUPLICATE:'題號佔位符重複',PLACEHOLDER_INVALID:'題目佔位符格式錯誤',QUESTION_GAP:'題號必須從 Q1 連續排列',INTERNAL_ERROR:'系統處理失敗'};
const sheetsErrors={
 SHEETS_URL_INVALID:[400,'請貼上有效的 Google Sheets 網址'],
 WRITEBACK_NOT_FOUND:[404,'找不到此活動的寫回操作'],
 WRITEBACK_BUSY:[409,'寫回操作執行中，請查詢目前狀態'],
 WRITEBACK_PENDING:[409,'原寫回結果待核對，請先手動核對原操作'],
 WRITEBACK_NOT_PENDING:[409,'此操作目前不適用待核對處理'],
 EXCEL_FLOW_RETIRED:[410,'Excel 操作已退役，請使用 Google Sheets 手動寫回'],
 ANSWER_CELL_FORMAT_UNSUPPORTED:[422,'答案格含不支援的局部文字格式，請整理範本後重試'],
 SHEETS_NOT_EDITABLE:[422,'來源或答案格已確認無編輯權，請修正分享或保護範圍'],
 SOURCE_UNSUPPORTED:[422,'來源資料或結構無法完整驗證，未建立活動或寫入'],
 ANSWER_NOT_REPRESENTABLE:[422,'答案無法精確寫入，搶答結果已保留'],
 WRITEBACK_TOO_LARGE:[422,'寫回資料超過本次容量上限，未送出寫入'],
 SHEETS_UNAVAILABLE:[502,'Google Sheets 暫時無法使用，請稍後再試'],
 SHEETS_ACCESS_UNAVAILABLE:[502,'無法存取來源，請確認網址及服務帳號分享權限'],
 GOOGLE_AUTH_UNAVAILABLE:[503,'後端 Google 認證不可用，請管理者檢查安全設定'],
 SHEETS_RATE_LIMITED:[503,'Google Sheets 配額暫時受限，請稍後再試'],
 SHEETS_TIMEOUT:[504,'Google Sheets 等待逾時；寫入結果可能仍需核對']
};
function safeSheetsDetails(details){
 if(!details||typeof details!=='object')return undefined;
 const safe={};
 if(typeof details.operationId==='string'&&/^[\w-]{1,80}$/.test(details.operationId))safe.operationId=details.operationId;
 if(Array.isArray(details.locations))safe.locations=details.locations.map(location=>{
  const cell={};for(const key of ['sheetId','rowIndex','columnIndex','questionNumber'])if(Number.isSafeInteger(location?.[key])&&location[key]>=0)cell[key]=location[key];
  if(typeof location?.cellAddress==='string'&&/^[A-Z]+[1-9][0-9]*$/.test(location.cellAddress))cell.cellAddress=location.cellAddress;
  if(typeof location?.sheetTitle==='string')cell.sheetTitle=location.sheetTitle.slice(0,200);
  return cell;
 });
 return Object.keys(safe).length?safe:undefined;
}
export class AppError extends Error{constructor(code,details){super(sheetsErrors[code]?.[1]||messages[code]||messages.INTERNAL_ERROR);this.code=code;this.status=sheetsErrors[code]?.[0]||Number(Object.keys(groups).find(k=>groups[k].includes(code))||500);this.details=sheetsErrors[code]?safeSheetsDetails(details):details;}}
export function errorHandler(error,req,res,next){
 if(res.headersSent)return next(error);
 let e=error;
 if(!(e instanceof AppError)){
  if(error instanceof SyntaxError&&error.type==='entity.parse.failed'&&error.status===400)e=new AppError('INVALID_INPUT');
  else e=new AppError('INTERNAL_ERROR');
 }
 res.status(e.status).json({error:{code:e.code,message:e.message,requestId:randomUUID(),...(e.details?{details:e.details}:{})}});
}
