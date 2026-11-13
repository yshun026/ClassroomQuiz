import React,{useEffect,useRef,useState} from 'react';
import {api} from '../services/api.js';
import {saveToken,clearToken,getSessionContext,isCurrentSession} from '../services/session.js';
import {connectRealtime,acceptSnapshot} from '../services/realtime.js';
import Results from '../components/Results.jsx';
import {downloadGuidedNotes} from '../services/download.js';
export default function TeacherPage(){
 const [ready,setReady]=useState(false),[password,setPassword]=useState(''),[groups,setGroups]=useState('3'),[view,setView]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[connection,setConnection]=useState('connecting');
 const viewSession=useRef(null),operation=useRef(0),identity=getSessionContext(),token=identity.token;
 function showView(incoming,session){
  if(!isCurrentSession(session))return;
  const reset=viewSession.current?.generation!==session.generation;viewSession.current=session;
  setView(old=>isCurrentSession(session)?acceptSnapshot(old,incoming,'teacher',{reset}):old);
 }
 function invalidate(session){if(clearToken(session)){viewSession.current=null;setReady(false);setView(null);setConnection('disconnected');setError('身分已失效，請重新登入');}}
 function showError(e){if(e.code==='STALE_RESPONSE'||(e.session&&!isCurrentSession(e.session)))return;if(e.code==='SESSION_INVALID')invalidate(e.session);else setError(e.message);}
 async function refresh(session=getSessionContext()){
  if(!session.token)return;
  const s=await api('/session',{session});if(s.role!=='teacher')throw Object.assign(Error('此瀏覽器已是學生身分，可返回學生端；老師請使用其他瀏覽器設定檔登入'),{session});
  const next=await api('/activity',{session});if(isCurrentSession(session)){showView(next,session);setReady(true);}
 }
 useEffect(()=>{
  refresh().catch(showError);
  const changed=e=>{if(e.key!==null&&e.key!=='classroomquiz.session')return;operation.current++;viewSession.current=null;setBusy(false);setReady(false);setView(null);setError('');setConnection('connecting');refresh().catch(showError);};
  window.addEventListener('storage',changed);return ()=>window.removeEventListener('storage',changed);
 },[]);
 useEffect(()=>{if(!ready||!token)return;const session=getSessionContext();return connectRealtime(token,'teacher',{onView:v=>showView(v,session),onStatus:setConnection,onInvalid:()=>invalidate(session)});},[ready,token,identity.generation]);
 async function act(work){const id=++operation.current,session=getSessionContext();setBusy(true);setError('');try{await work(session);}catch(e){showError(e);}finally{if(operation.current===id)setBusy(false);}}
 async function login(e){e.preventDefault();await act(async session=>{
  if(session.token){const current=await api('/session',{session});if(current.role==='student')throw Object.assign(Error('此瀏覽器已是學生身分，可返回學生端；老師請使用其他瀏覽器設定檔登入'),{session});}
  const result=await api('/teacher/login',{method:'POST',body:{password},session});saveToken(result.token);setPassword('');await refresh();
 });}
 async function command(name){if(!isCurrentSession(viewSession.current))return;await act(async session=>{await api('/activity/questions/'+name,{method:'POST',body:{activityId:view.activityId,questionNumber:view.currentQuestionNumber},session});await refresh(session);});}
 return <section><h2>老師端</h2>{error&&<p role="alert">{error}</p>}{!ready?<form onSubmit={login}><label>管理密碼<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button disabled={busy}>登入</button></form>:<>
 <p role="status">{view?.phase?`第 ${view.currentQuestionNumber} 題 · ${view.phase} · 共 ${view.questionCount} 題`:'活動尚未準備完成'}</p>
 <p className="connection" data-testid="connection">{connection==='connected'?'即時同步已連線':connection==='connecting'?'正在連線…':'連線已中斷，正在重新同步…'}</p>
 {!view?.phase?<><form onSubmit={e=>{e.preventDefault();act(async session=>{await api('/preparation/groups',{method:'PUT',body:{groupCount:Number(groups)},session});await refresh(session);});}}><label>參與組數<input type="number" min="1" step="1" value={groups} onChange={e=>setGroups(e.target.value)} required/></label><button disabled={busy}>設定組數</button></form><p>已設定組數：{view?.groupCount??'尚未設定'}</p><label>匯入 Guided Notes（.xlsx）<input type="file" accept=".xlsx" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(!file)return;act(async session=>{const body=new FormData();body.append('file',file);await api('/preparation/guided-notes',{method:'POST',body,session});await refresh(session);});e.target.value='';}}/></label><p>文件：{view?.documentValidated?'已驗證':'尚未匯入'}</p></>:<>
 <div className="controls">{view.phase==='WAITING'&&<button disabled={busy||connection!=='connected'} onClick={()=>command('start')}>開始搶答</button>}{view.phase==='ANSWERING'&&<button disabled={busy||connection!=='connected'} onClick={()=>command('close')}>結束搶答</button>}{view.phase==='RESULTS'&&<button disabled={busy||connection!=='connected'} onClick={()=>command('next')}>下一題</button>}</div>
 <button disabled={busy} onClick={()=>act(session=>downloadGuidedNotes(view.activityId,session))}>匯出 Guided Notes</button>
 <h3>當題提交紀錄</h3><table aria-label="當題提交紀錄"><thead><tr><th>組別</th><th>提交狀態</th><th>順位</th><th>答案</th></tr></thead><tbody>{view.groups.map(g=>{const submission=view.currentSubmissions.find(s=>s.groupNumber===g.groupNumber);return <tr key={g.groupNumber}><td>第 {g.groupNumber} 組</td><td>{g.submitted?'已提交':'尚未提交'}</td><td>{submission?.receiveRank??'—'}</td><td className="answer">{submission?.answerText??'—'}</td></tr>;})}</tbody></table>
 <Results results={view.publishedResults}/>{view.phase==='COMPLETED'&&<p>所有題目已完成。</p>}
 </>}
 </>}{busy&&<p role="status">處理中…</p>}</section>;
}
