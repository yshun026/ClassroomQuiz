import React,{useEffect,useRef,useState} from 'react';
import {api} from '../services/api.js';
import {saveToken,clearToken,getSessionContext,isCurrentSession} from '../services/session.js';
import {connectRealtime,acceptSnapshot} from '../services/realtime.js';
import Results from '../components/Results.jsx';
import {createGuidedNotesClient} from '../services/guided-notes.js';
export default function TeacherPage(){
 const [ready,setReady]=useState(false),[password,setPassword]=useState(''),[groups,setGroups]=useState('3'),[view,setView]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[connection,setConnection]=useState('connecting');
 const viewSession=useRef(null),operation=useRef(0),identity=getSessionContext(),token=identity.token;
 const [spreadsheetUrl,setSpreadsheetUrl]=useState(''),[notes,setNotes]=useState(null);
 const [writeback,setWriteback]=useState(null),[writeBusy,setWriteBusy]=useState(false);
 const notesClient=useRef(null);if(!notesClient.current)notesClient.current=createGuidedNotesClient();
 const refreshGeneration=useRef(0);
 function showView(incoming,session){
  if(!isCurrentSession(session))return;
  const reset=viewSession.current?.generation!==session.generation;viewSession.current=session;
  setView(old=>isCurrentSession(session)?acceptSnapshot(old,incoming,'teacher',{reset}):old);
 }
 function invalidate(session){if(clearToken(session)){notesClient.current.reset();setNotes(null);setWriteback(null);setWriteBusy(false);viewSession.current=null;setReady(false);setView(null);setConnection('disconnected');setError('身分已失效，請重新登入');}}
 function showError(e){if(e.code==='STALE_RESPONSE'||(e.session&&!isCurrentSession(e.session)))return;if(e.code==='SESSION_INVALID')invalidate(e.session);else {const locations=e.details?.locations??[];setError(e.message+(locations.length?'：'+locations.map(l=>[l.sheetTitle,l.cellAddress].filter(Boolean).join(' / ')).join('、'):''));}}
 async function refresh(session=getSessionContext()){
  if(!session.token)return;
  const epoch=++refreshGeneration.current,check=()=>{if(epoch!==refreshGeneration.current||!isCurrentSession(session))throw Object.assign(Error('已忽略過期來源回覆'),{code:'STALE_RESPONSE',session});};
  const s=await api('/session',{session});if(s.role!=='teacher')throw Object.assign(Error('此瀏覽器已是學生身分，可返回學生端；老師請使用其他瀏覽器設定檔登入'),{session});
  check();const next=await api('/activity',{session});check();showView(next,session);setReady(true);
  if(next.activityId){const source=await notesClient.current.getSource(next.activityId,session);check();setNotes(source);setWriteback(source.latestWriteback);}else {setNotes(null);setWriteback(null);}
 }
 useEffect(()=>{
  refresh().catch(showError);
  const changed=e=>{if(e.key!==null&&e.key!=='classroomquiz.session')return;operation.current++;notesClient.current.reset();setNotes(null);setWriteback(null);setWriteBusy(false);viewSession.current=null;setBusy(false);setReady(false);setView(null);setError('');setConnection('connecting');refresh().catch(showError);};
  window.addEventListener('storage',changed);return ()=>window.removeEventListener('storage',changed);
 },[]);
 useEffect(()=>{if(!ready||!token)return;const session=getSessionContext();return connectRealtime(token,'teacher',{onView:v=>showView(v,session),onStatus:setConnection,onInvalid:()=>invalidate(session)});},[ready,token,identity.generation]);
 async function act(work){const id=++operation.current,session=getSessionContext();setBusy(true);setError('');try{await work(session);}catch(e){showError(e);}finally{if(operation.current===id)setBusy(false);}}
 async function login(e){e.preventDefault();await act(async session=>{
  if(session.token){const current=await api('/session',{session});if(current.role==='student')throw Object.assign(Error('此瀏覽器已是學生身分，可返回學生端；老師請使用其他瀏覽器設定檔登入'),{session});}
  const result=await api('/teacher/login',{method:'POST',body:{password},session});saveToken(result.token);setPassword('');await refresh();
 });}
 async function command(name){if(!isCurrentSession(viewSession.current))return;await act(async session=>{await api('/activity/questions/'+name,{method:'POST',body:{activityId:view.activityId,questionNumber:view.currentQuestionNumber},session});await refresh(session);});}
 async function fetchWriteback(){const session=getSessionContext();try{const source=await notesClient.current.getSource(view.activityId,session);if(isCurrentSession(session)){setNotes(source);setWriteback(source.latestWriteback);}}catch(e){showError(e);}}
 async function startWriteback(reconcile=false){
  const session=getSessionContext();setWriteBusy(true);setError('');
  try{const result=await (reconcile?notesClient.current.reconcile(view.activityId,writeback.operationId,session):notesClient.current.writeback(view.activityId,session));if(isCurrentSession(session))setWriteback(result);}catch(e){showError(e);}finally{if(isCurrentSession(session))setWriteBusy(false);}
 }
 useEffect(()=>{
  if(!ready||!view?.activityId||!writeback?.running)return;
  let cancelled=false,timer;const session=getSessionContext(),id=view.activityId,opId=writeback.operationId;
  async function poll(){try{const result=await notesClient.current.getOperation(id,opId,session);if(!cancelled&&isCurrentSession(session))setWriteback(result);}catch(e){if(!cancelled)showError(e);}finally{if(!cancelled)timer=setTimeout(poll,1000);}}
  timer=setTimeout(poll,1000);return()=>{cancelled=true;clearTimeout(timer);};
 },[ready,view?.activityId,writeback?.operationId,writeback?.running,identity.generation]);
 const writeLabels={PRECHECKING:'正在核對原試算表',WRITING:'正在寫回',VERIFYING:'正在讀回核對',PENDING_VERIFICATION:'結果待核對',SUCCEEDED:'已讀回核對完成',NO_CHANGES:'無可寫回答案',FAILED:'寫回未完成',CONFLICT:'來源衝突'};
 const itemLabels={NOT_WRITTEN:'未寫入',VERIFIED:'已核對',SKIPPED_VERIFIED:'已同步，略過',CONFLICT:'衝突',UNKNOWN:'尚未核對'};
 return <section><h2>老師端</h2>{error&&<p role="alert">{error}</p>}{!ready?<form onSubmit={login}><label>管理密碼<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button disabled={busy}>登入</button></form>:<>
 <p role="status">{view?.phase?`第 ${view.currentQuestionNumber} 題 · ${view.phase} · 共 ${view.questionCount} 題`:'活動尚未準備完成'}</p>
 <p className="connection" data-testid="connection">{connection==='connected'?'即時同步已連線':connection==='connecting'?'正在連線…':'連線已中斷，正在重新同步…'}</p>
 {!view?.phase?<><form onSubmit={e=>{e.preventDefault();act(async session=>{await api('/preparation/groups',{method:'PUT',body:{groupCount:Number(groups)},session});await refresh(session);});}}><label>參與組數<input type="number" min="1" step="1" value={groups} disabled={busy} onChange={e=>setGroups(e.target.value)} required/></label><button disabled={busy}>設定組數</button></form><p>已設定組數：{view?.groupCount??'尚未設定'}</p>
 <form onSubmit={e=>{e.preventDefault();act(async session=>{const incoming=await notesClient.current.importSource(spreadsheetUrl.trim(),session);showView(incoming,session);await refresh(session);});}}><label>Google Sheets 網址<input type="url" value={spreadsheetUrl} disabled={busy||!view?.groupCount} onChange={e=>setSpreadsheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/…/edit" required/></label><button disabled={busy||!view?.groupCount}>讀取 Guided Notes</button></form><p>請先設定組數，並將每份試算表分享給後端服務帳號編輯；系統內不需要登入 Google。</p><p>若來源已寫入答案，確認舊寫入已結束後，先手動還原完整標記或複製乾淨範本再讀取；重啟不會取消遠端寫入。</p></>:<>
 {notes&&<aside aria-label="Guided Notes 來源"><p>來源：{notes.source.title} · 已納入 {notes.source.supportedSheetCount} 個工作表</p><p role="note">{notes.source.permissionMessage}</p>{notes.source.excludedSheets.length>0&&<p>未納入工作表：{notes.source.excludedSheets.map(s=>`${s.title}（${s.sheetType}）`).join('、')}</p>}</aside>}
 {notes&&<aside aria-label="Google Sheets 寫回" aria-live="polite">
 <button disabled={writeBusy||writeback?.running||writeback?.canReconcile||writeback?.status==='PENDING_VERIFICATION'} onClick={()=>startWriteback()}>寫回 Google Sheets</button><button disabled={writeBusy} onClick={fetchWriteback}>重新取得寫回狀態</button>
 {writeback?.canReconcile&&<button disabled={writeBusy||writeback.running} onClick={()=>startWriteback(true)}>核對原寫回操作</button>}
 {writeback&&<><p data-testid="writeback-status" data-operation-id={writeback.operationId}>{writeLabels[writeback.status]}</p><p>{writeback.message}</p>{writeback.status==='PENDING_VERIFICATION'&&<p>請保留活動，不要重送或以重啟企圖取消。</p>}
 {writeback.canReconcile&&<p>手動核對只處理原操作，不保證能重送；舊結果不明且仍有原標記時，會保持待核對。請勿以重啟企圖取消。</p>}
 {['FAILED','CONFLICT','PENDING_VERIFICATION'].includes(writeback.status)&&<p>Google 認證或分享／保護範圍有誤時，請管理者修正；不需重新登入 Google。</p>}
 {writeback.items.length>0&&<table aria-label="寫回逐題結果"><thead><tr><th>題號</th><th>位置</th><th>結果</th></tr></thead><tbody>{writeback.items.map(item=><tr key={item.questionNumber}><td>Q{item.questionNumber}</td><td>{item.sheetTitle} / {item.cellAddress}</td><td>{itemLabels[item.state]}{item.reason&&`：${item.reason}`}</td></tr>)}</tbody></table>}</>}
 </aside>}
 <div className="controls">{view.phase==='WAITING'&&<button disabled={busy||connection!=='connected'} onClick={()=>command('start')}>開始搶答</button>}{view.phase==='ANSWERING'&&<button disabled={busy||connection!=='connected'} onClick={()=>command('close')}>結束搶答</button>}{view.phase==='RESULTS'&&<button disabled={busy||connection!=='connected'} onClick={()=>command('next')}>下一題</button>}</div>
 <h3>當題提交紀錄</h3><table aria-label="當題提交紀錄"><thead><tr><th>組別</th><th>提交狀態</th><th>順位</th><th>答案</th></tr></thead><tbody>{view.groups.map(g=>{const submission=view.currentSubmissions.find(s=>s.groupNumber===g.groupNumber);return <tr key={g.groupNumber}><td>第 {g.groupNumber} 組</td><td>{g.submitted?'已提交':'尚未提交'}</td><td>{submission?.receiveRank??'—'}</td><td className="answer">{submission?.answerText??'—'}</td></tr>;})}</tbody></table>
 <Results results={view.publishedResults}/>{view.phase==='COMPLETED'&&<p>所有題目已完成。</p>}
 </>}
 </>}{busy&&<p role="status">處理中…</p>}</section>;
}
