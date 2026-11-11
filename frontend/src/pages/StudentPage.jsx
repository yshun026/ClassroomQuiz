import React,{useEffect,useState} from 'react';
import {api} from '../services/api.js';
import {getToken,saveToken} from '../services/session.js';
export default function StudentPage(){
 const [view,setView]=useState(null),[options,setOptions]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function load(){if(getToken()){const s=await api('/session');if(s.role!=='student')throw Error('請使用獨立的瀏覽器設定檔進入學生端');setView(await api('/activity'));setOptions(null);}else{setView(null);setOptions(await api('/activity/join-options'));}}
 useEffect(()=>{load().catch(e=>setError(e.message));const refresh=()=>load().catch(e=>setError(e.message));window.addEventListener('storage',refresh);return ()=>window.removeEventListener('storage',refresh);},[]);
 async function join(groupNumber){setBusy(true);setError('');try{const result=await api('/activity/groups/claim',{method:'POST',body:{activityId:options.activityId,groupNumber}});if(result.token)saveToken(result.token);setView(result.view);setOptions(null);}catch(e){setError(e.message);if(e.code==='GROUP_OCCUPIED')await load();}finally{setBusy(false);}}
 async function refresh(){setBusy(true);setError('');try{await load();}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <section><h2>學生端</h2>{error&&<p role="alert">{error}</p>}{view?<><p>目前組別：第 {view.ownGroupNumber} 組</p><p role="status">第 {view.currentQuestionNumber} 題 · {view.phase} · 共 {view.questionCount} 題</p><p>{view.ownSubmission.submitted?'本題已提交':'本題尚未提交'}</p>{view.ownSubmission.answerText&&<p>自己的答案：{view.ownSubmission.answerText}</p>}</>:options?<><p>選擇尚未占用的組別，不需要註冊帳號。</p><div className="groups">{[...options.availableGroupNumbers,...options.occupiedGroupNumbers].sort((a,b)=>a-b).map(n=>{const occupied=options.occupiedGroupNumbers.includes(n);return <button key={n} disabled={busy||occupied} onClick={()=>join(n)}>{occupied?`第 ${n} 組（已占用）`:`加入第 ${n} 組`}</button>;})}</div></>:<p>等待活動準備完成。</p>}<button className="secondary" onClick={refresh} disabled={busy}>重新取得目前狀態</button></section>;
}
