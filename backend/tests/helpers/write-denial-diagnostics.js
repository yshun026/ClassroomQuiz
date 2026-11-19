// Test-only transport observer. Never reads credentials, parses bodies, logs or retries.
// No protection/share-specific classifier: HTTP status alone cannot establish either cause.
export function createWriteDenialDiagnostics(transport){
 const events=[];let writeRequests=0;
 const note=(kind,code)=>events.push(Object.freeze({kind,code}));
 const classify=(kind,status)=>{
  if(kind==='READ')return status>=200&&status<300?'N_READ_COMPLETED':status===401?'N_AUTH_REJECTED':status===403||status===404?'N_READ_ACCESS_UNATTRIBUTED':'N_READ_FAILED';
  if(status>=200&&status<300)return 'N_UNEXPECTED_ACCEPTED'; // Not proof of application/verification.
  if(status===401)return 'N_AUTH_REJECTED';
  if(status===429)return 'N_QUOTA_REJECTED';
  if(status===400)return 'N_REQUEST_REJECTED';
  if(status===403||status===404)return 'N_REJECTED_UNATTRIBUTED';
  return 'N_OUTCOME_UNKNOWN'; // Match production conservative write outcome.
 };
 const fetch=async(input,options)=>{
  let url;try{url=new URL(input);}catch{return transport(input,options);}
  const method=(options?.method??'GET').toUpperCase();
  const kind=url.origin==='https://sheets.googleapis.com'&&/^\/v4\/spreadsheets\/[A-Za-z0-9_-]+:batchUpdate$/.test(url.pathname)&&method==='POST'?'WRITE':url.origin==='https://sheets.googleapis.com'&&/^\/v4\/spreadsheets\/[A-Za-z0-9_-]+$/.test(url.pathname)&&method==='GET'?'READ':null;
  if(!kind)return transport(input,options);
  if(kind==='WRITE')writeRequests++;
  let response;try{response=await transport(input,options);}catch(error){note(kind,kind==='WRITE'?'N_OUTCOME_UNKNOWN':'N_READ_FAILED');throw error;}
  // Observe exactly the body consumption the unchanged product already performs.
  // Do not clone, buffer a second copy, inspect private body text, or delay the request.
  let recorded=false;
  return new Proxy(response,{get(target,key){
   if(key==='text'||key==='json')return async(...args)=>{
    try{const value=await target[key](...args);if(!recorded){recorded=true;note(kind,classify(kind,target.status));}return value;}
    catch(error){if(!recorded){recorded=true;note(kind,kind==='WRITE'?'N_OUTCOME_UNKNOWN':'N_READ_FAILED');}throw error;}
   };
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  }});
 };
 return Object.freeze({fetch,snapshot:()=>({writeRequests,events:events.map(e=>({...e}))})});
}
