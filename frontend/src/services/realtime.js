import {io} from 'socket.io-client';
import {getSessionContext,isCurrentSession} from './session.js';
export function acceptSnapshot(current,incoming,role,{reset=false}={}){
  if(!current||reset||!current.activityId)return incoming;
  if(current.activityId!==incoming.activityId)return current;
  if(role==='student'&&current.ownGroupNumber!==incoming.ownGroupNumber)return current;
  const key=role==='teacher'?'stateRevision':'studentViewRevision';
  if(typeof incoming[key]!=='number')return current;
  if(typeof current[key]==='number'&&incoming[key]<=current[key])return current;
  return incoming;
}
export function connectRealtime(token,role,{onView,onStatus,onInvalid}){
  const session=getSessionContext();if(session.token!==token)return ()=>{};
  const guard=callback=>(...args)=>{if(isCurrentSession(session))callback(...args);};
  // Polling is a Socket.IO transport; no application polling timer or answer replay.
  const socket=io({auth:{token},transports:['polling'],reconnection:true,reconnectionDelay:500,reconnectionDelayMax:2000,autoConnect:false});
  // A transport connection is not synchronized until the server supplies its authorized snapshot.
  socket.on('connect',guard(()=>onStatus('connecting')));
  socket.on('state:snapshot',guard(view=>{onView(view);onStatus('connected');}));
  socket.on('disconnect',guard(()=>onStatus('disconnected')));
  socket.on('connect_error',guard(error=>{onStatus('disconnected');if(error.data?.code==='SESSION_INVALID')onInvalid();}));
  socket.on('session:invalid',guard(()=>{onInvalid();socket.disconnect();}));
  socket.connect();
  return ()=>{socket.removeAllListeners();socket.disconnect();};
}
