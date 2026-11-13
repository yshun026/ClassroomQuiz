import React,{useEffect,useRef,useState} from 'react';
import {api} from '../services/api.js';
import {saveToken,clearToken,getSessionContext,isCurrentSession} from '../services/session.js';
import {connectRealtime,acceptSnapshot} from '../services/realtime.js';
import Results from '../components/Results.jsx';
export default function StudentPage(){
 const [view,setView]=useState(null),[options,setOptions]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[answer,setAnswer]=useState(''),[connection,setConnection]=useState('connecting');
 const viewSession=useRef(null),operation=useRef(0),identity=getSessionContext(),token=identity.token;
 function showView(incoming,session){
  if(!isCurrentSession(session))return;
  const reset=viewSession.current?.generation!==session.generation;viewSession.current=session;
  setView(old=>isCurrentSession(session)?acceptSnapshot(old,incoming,'student',{reset}):old);
 }
 function invalidate(session){if(clearToken(session)){viewSession.current=null;setView(null);setOptions(null);setConnection('disconnected');setError('身分已失效，請重新確認活動');}}
 function showError(e){if(e.code==='STALE_RESPONSE'||(e.session&&!isCurrentSession(e.session)))return;if(e.code==='SESSION_INVALID')invalidate(e.session);else setError(e.message);}
 async function load(session=getSessionContext()){
  if(session.token){const s=await api('/session',{session});if(s.role!=='student')throw Object.assign(Error('請使用獨立的瀏覽器設定檔進入學生端'),{session});const next=await api('/activity',{session});if(isCurrentSession(session)){showView(next,session);setOptions(null);}}
  else{const next=await api('/activity/join-options',{session});if(isCurrentSession(session)){viewSession.current=null;setView(null);setOptions(next);}}
 }
 useEffect(()=>{
  load().catch(showError);
  const changed=e=>{if(e.key!==null&&e.key!=='classroomquiz.session')return;operation.current++;viewSession.current=null;setBusy(false);setView(null);setOptions(null);setAnswer('');setError('');setConnection('connecting');load().catch(showError);};
  window.addEventListener('storage',changed);return ()=>window.removeEventListener('storage',changed);
 },[]);
 useEffect(()=>{setAnswer('');},[view?.activityId,view?.currentQuestionNumber]);
 useEffect(()=>{if(!view||!token)return;const session=getSessionContext();return connectRealtime(token,'student',{onView:v=>showView(v,session),onStatus:setConnection,onInvalid:()=>invalidate(session)});},[!!view,token,identity.generation]);
 async function run(work){const id=++operation.current,session=getSessionContext();setBusy(true);setError('');try{await work(session);}catch(e){showError(e);}finally{if(operation.current===id)setBusy(false);}}
 async function join(groupNumber){await run(async session=>{
  try{const result=await api('/activity/groups/claim',{method:'POST',body:{activityId:options.activityId,groupNumber},session});if(result.token)saveToken(result.token);showView(result.view,getSessionContext());setOptions(null);}
  catch(e){if(e.code==='GROUP_OCCUPIED'&&isCurrentSession(session))await load(session);throw e;}
 });}
 async function refresh(){await run(session=>load(session));}
 async function submit(e){e.preventDefault();if(!answer.trim()||connection!=='connected'||!isCurrentSession(viewSession.current))return;await run(async session=>{
  try{await api('/activity/submissions',{method:'POST',body:{activityId:view.activityId,questionNumber:view.currentQuestionNumber,answerText:answer},session});await load(session);if(isCurrentSession(session))setAnswer('');}
  catch(error){if(isCurrentSession(session))try{await load(session);}catch{/* preserve original error and never resend */}throw error;}
 });}
 return <section><h2>學生端</h2>{error&&<p role="alert">{error}</p>}{view?<><p>目前組別：第 {view.ownGroupNumber} 組</p><p role="status">第 {view.currentQuestionNumber} 題 · {view.phase} · 共 {view.questionCount} 題</p>
 <p className="connection" data-testid="connection">{connection==='connected'?'即時同步已連線':connection==='connecting'?'正在連線…':'連線已中斷，正在重新同步…'}</p>
 <p>{view.ownSubmission.submitted?'本題已提交':'本題尚未提交'}</p>{view.ownSubmission.answerText&&<p className="answer">自己的答案：{view.ownSubmission.answerText}</p>}
 {view.phase==='WAITING'&&<p>等待老師開始搶答。</p>}{view.phase==='ANSWERING'&&!view.ownSubmission.submitted&&<form onSubmit={submit}><label>答案<textarea value={answer} onChange={e=>setAnswer(e.target.value)} disabled={busy||connection!=='connected'}/></label><button disabled={busy||!answer.trim()||connection!=='connected'}>提交答案</button></form>}
 <Results results={view.publishedResults}/>{view.phase==='COMPLETED'&&<p>所有題目已完成。</p>}
 </>:options?<><p>選擇尚未占用的組別，不需要註冊帳號。</p><div className="groups">{[...options.availableGroupNumbers,...options.occupiedGroupNumbers].sort((a,b)=>a-b).map(n=>{const occupied=options.occupiedGroupNumbers.includes(n);return <button key={n} disabled={busy||occupied} onClick={()=>join(n)}>{occupied?`第 ${n} 組（已占用）`:`加入第 ${n} 組`}</button>;})}</div></>:<p>等待活動準備完成。</p>}<button className="secondary" onClick={refresh} disabled={busy}>重新取得目前狀態</button></section>;
}
