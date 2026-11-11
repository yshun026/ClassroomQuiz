import React,{useEffect,useState} from 'react';
import {api} from '../services/api.js';
import {getToken,saveToken,clearToken} from '../services/session.js';
import {connectRealtime,acceptSnapshot} from '../services/realtime.js';
import Results from '../components/Results.jsx';
export default function TeacherPage(){
 const [ready,setReady]=useState(false),[password,setPassword]=useState(''),[groups,setGroups]=useState('3'),[view,setView]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[connection,setConnection]=useState('connecting');
 const token=getToken();
 async function refresh(){const s=await api('/session');if(s.role!=='teacher')throw Error('此瀏覽器已是學生身分，可返回學生端；老師請使用其他瀏覽器設定檔登入');setView(await api('/activity'));setReady(true);}
 useEffect(()=>{if(getToken())refresh().catch(e=>{setError(e.message);setReady(false);});},[]);
 useEffect(()=>{if(!ready||!token)return;return connectRealtime(token,'teacher',{onView:v=>setView(old=>acceptSnapshot(old,v,'teacher')),onStatus:setConnection,onInvalid:()=>{clearToken();setReady(false);setError('身分已失效，請重新登入');}});},[ready,token]);
 async function act(work){setBusy(true);setError('');try{await work();}catch(e){setError(e.message);if(e.code==='SESSION_INVALID')setReady(false);}finally{setBusy(false);}}
 async function login(e){e.preventDefault();await act(async()=>{if(getToken()){const current=await api('/session');if(current.role==='student')throw Error('此瀏覽器已是學生身分，可返回學生端；老師請使用其他瀏覽器設定檔登入');}const result=await api('/teacher/login',{method:'POST',body:{password}});saveToken(result.token);setPassword('');await refresh();});}
 async function command(operation){await act(async()=>{await api('/activity/questions/'+operation,{method:'POST',body:{activityId:view.activityId,questionNumber:view.currentQuestionNumber}});await refresh();});}
 return <section><h2>老師端</h2>{error&&<p role="alert">{error}</p>}{!ready?<form onSubmit={login}><label>管理密碼<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button disabled={busy}>登入</button></form>:<>
 <p role="status">{view?.phase?`第 ${view.currentQuestionNumber} 題 · ${view.phase} · 共 ${view.questionCount} 題`:'活動尚未準備完成'}</p>
 <p className="connection" data-testid="connection">{connection==='connected'?'即時同步已連線':connection==='connecting'?'正在連線…':'連線已中斷，請重新整理取得目前狀態'}</p>
 {!view?.phase?<><form onSubmit={e=>{e.preventDefault();act(async()=>{await api('/preparation/groups',{method:'PUT',body:{groupCount:Number(groups)}});await refresh();});}}><label>參與組數<input type="number" min="1" step="1" value={groups} onChange={e=>setGroups(e.target.value)} required/></label><button disabled={busy}>設定組數</button></form><p>已設定組數：{view?.groupCount??'尚未設定'}</p><label>匯入 Guided Notes（.xlsx）<input type="file" accept=".xlsx" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(!file)return;act(async()=>{const body=new FormData();body.append('file',file);await api('/preparation/guided-notes',{method:'POST',body});await refresh();});e.target.value='';}}/></label><p>文件：{view?.documentValidated?'已驗證':'尚未匯入'}</p></>:<>
 <div className="controls">{view.phase==='WAITING'&&<button disabled={busy||connection!=='connected'} onClick={()=>command('start')}>開始搶答</button>}{view.phase==='ANSWERING'&&<button disabled={busy||connection!=='connected'} onClick={()=>command('close')}>結束搶答</button>}</div>
 <h3>當題提交紀錄</h3><table aria-label="當題提交紀錄"><thead><tr><th>組別</th><th>提交狀態</th><th>順位</th><th>答案</th></tr></thead><tbody>{view.groups.map(g=>{const submission=view.currentSubmissions.find(s=>s.groupNumber===g.groupNumber);return <tr key={g.groupNumber}><td>第 {g.groupNumber} 組</td><td>{g.submitted?'已提交':'尚未提交'}</td><td>{submission?.receiveRank??'—'}</td><td className="answer">{submission?.answerText??'—'}</td></tr>;})}</tbody></table>
 <Results results={view.publishedResults}/>{view.phase==='COMPLETED'&&<p>所有題目已完成。</p>}
 </>}
 </>}{busy&&<p role="status">處理中…</p>}</section>;
}
