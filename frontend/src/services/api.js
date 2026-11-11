import {getToken,clearToken} from './session.js';
export async function api(path,{method='GET',body}={}){
 const token=getToken();const headers=token?{Authorization:`Bearer ${token}`}:{ };
 if(body!==undefined&&!(body instanceof FormData))headers['Content-Type']='application/json';
 const response=await fetch(`/api${path}`,{method,headers,body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});
 const data=await response.json();if(!response.ok){if(data.error?.code==='SESSION_INVALID')clearToken();throw Object.assign(new Error(data.error?.message||'請求失敗'),{code:data.error?.code});}return data;
}
