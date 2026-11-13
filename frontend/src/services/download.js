import {getSessionContext,assertCurrentSession} from './session.js';
export async function downloadGuidedNotes(activityId,session=getSessionContext()){
 try{
 assertCurrentSession(session);
 const response=await fetch('/api/activity/guided-notes/export?'+new URLSearchParams({activityId}),{headers:{Authorization:'Bearer '+session.token}});
 assertCurrentSession(session);
 if(!response.ok){const data=await response.json();assertCurrentSession(session);throw Object.assign(new Error(data.error?.message||'匯出失敗'),{code:data.error?.code,session});}
 const blob=await response.blob();assertCurrentSession(session);
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='ClassroomQuiz-guided-notes.xlsx';document.body.append(link);
 try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }catch(error){assertCurrentSession(session);error.session=session;throw error;}
}
