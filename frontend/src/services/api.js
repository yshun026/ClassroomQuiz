import {getSessionContext,assertCurrentSession} from './session.js';
export async function api(path,{method='GET',body,session=getSessionContext()}={}){
 assertCurrentSession(session);
 const token=session.token;const headers=token?{Authorization:`Bearer ${token}`}:{ };
 if(body!==undefined&&!(body instanceof FormData))headers['Content-Type']='application/json';
 try{
  const response=await fetch(`/api${path}`,{method,headers,body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});
  const data=await response.json();assertCurrentSession(session);
  if(!response.ok)throw Object.assign(new Error(data.error?.message||'請求失敗'),{code:data.error?.code});
  return data;
 }catch(error){assertCurrentSession(session);error.session=session;throw error;}
}
