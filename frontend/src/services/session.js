const KEY='classroomquiz.session';
let generation=0,observedToken;
export function getSessionContext(){
 const token=localStorage.getItem(KEY);
 if(token!==observedToken){observedToken=token;generation++;}
 return Object.freeze({token,generation});
}
export const getToken=()=>getSessionContext().token;
export const isCurrentSession=context=>{const current=getSessionContext();return !!context&&context.token===current.token&&context.generation===current.generation;};
export function assertCurrentSession(context){if(!isCurrentSession(context))throw Object.assign(new Error('已忽略過期回覆'),{code:'STALE_RESPONSE'});}
export function saveToken(token){localStorage.setItem(KEY,token);observedToken=token;generation++;}
export function clearToken(context){if(context&&!isCurrentSession(context))return false;localStorage.removeItem(KEY);observedToken=null;generation++;return true;}
if(typeof window!=='undefined')window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){observedToken=localStorage.getItem(KEY);generation++;}});
