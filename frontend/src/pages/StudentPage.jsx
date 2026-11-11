import React,{useEffect,useState} from 'react';
import {api} from '../services/api.js';
import {getToken,saveToken,clearToken} from '../services/session.js';
import {connectRealtime,acceptSnapshot} from '../services/realtime.js';
import Results from '../components/Results.jsx';
export default function StudentPage(){
 const [view,setView]=useState(null),[options,setOptions]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[answer,setAnswer]=useState(''),[connection,setConnection]=useState('connecting');
 const token=getToken();
 async function load(){if(getToken()){const s=await api('/session');if(s.role!=='student')throw Error('請使用獨立的瀏覽器設定檔進入學生端');setView(await api('/activity'));setOptions(null);}else{setView(null);setOptions(await api('/activity/join-options'));}}
 useEffect(()=>{load().catch(e=>setError(e.message));const refresh=()=>load().catch(e=>setError(e.message));window.addEventListener('storage',refresh);return ()=>window.removeEventListener('storage',refresh);},[]);
 useEffect(()=>{if(!view||!token)return;return connectRealtime(token,'student',{onView:v=>setView(old=>acceptSnapshot(old,v,'student')),onStatus:setConnection,onInvalid:()=>{clearToken();setView(null);setError('身分已失效，請重新確認活動');}});},[!!view,token]);
 async function join(groupNumber){setBusy(true);setError('');try{const result=await api('/activity/groups/claim',{method:'POST',body:{activityId:options.activityId,groupNumber}});if(result.token)saveToken(result.token);setView(result.view);setOptions(null);}catch(e){setError(e.message);if(e.code==='GROUP_OCCUPIED')await load();}finally{setBusy(false);}}
 async function refresh(){setBusy(true);setError('');try{await load();}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function submit(e){e.preventDefault();if(!answer.trim()||connection!=='connected')return;setBusy(true);setError('');try{await api('/activity/submissions',{method:'POST',body:{activityId:view.activityId,questionNumber:view.currentQuestionNumber,answerText:answer}});await load();setAnswer('');}catch(e){setError(e.message);try{await load();}catch{/* preserve original error and never resend */}}finally{setBusy(false);}}
 return <section><h2>學生端</h2>{error&&<p role="alert">{error}</p>}{view?<><p>目前組別：第 {view.ownGroupNumber} 組</p><p role="status">第 {view.currentQuestionNumber} 題 · {view.phase} · 共 {view.questionCount} 題</p>
 <p className="connection" data-testid="connection">{connection==='connected'?'即時同步已連線':connection==='connecting'?'正在連線…':'連線已中斷，請重新整理取得目前狀態'}</p>
 <p>{view.ownSubmission.submitted?'本題已提交':'本題尚未提交'}</p>{view.ownSubmission.answerText&&<p className="answer">自己的答案：{view.ownSubmission.answerText}</p>}
 {view.phase==='WAITING'&&<p>等待老師開始搶答。</p>}{view.phase==='ANSWERING'&&!view.ownSubmission.submitted&&<form onSubmit={submit}><label>答案<textarea value={answer} onChange={e=>setAnswer(e.target.value)} disabled={busy||connection!=='connected'}/></label><button disabled={busy||!answer.trim()||connection!=='connected'}>提交答案</button></form>}
 <Results results={view.publishedResults}/>{view.phase==='COMPLETED'&&<p>所有題目已完成。</p>}
 </>:options?<><p>選擇尚未占用的組別，不需要註冊帳號。</p><div className="groups">{[...options.availableGroupNumbers,...options.occupiedGroupNumbers].sort((a,b)=>a-b).map(n=>{const occupied=options.occupiedGroupNumbers.includes(n);return <button key={n} disabled={busy||occupied} onClick={()=>join(n)}>{occupied?`第 ${n} 組（已占用）`:`加入第 ${n} 組`}</button>;})}</div></>:<p>等待活動準備完成。</p>}<button className="secondary" onClick={refresh} disabled={busy}>重新取得目前狀態</button></section>;
}
