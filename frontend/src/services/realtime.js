import {io} from 'socket.io-client';
export function acceptSnapshot(current,incoming,role){
  if(!current||current.activityId!==incoming.activityId)return incoming;
  const key=role==='teacher'?'stateRevision':'studentViewRevision';
  if(typeof incoming[key]!=='number')return current;
  if(typeof current[key]==='number'&&incoming[key]<=current[key])return current;
  return incoming;
}
export function connectRealtime(token,role,{onView,onStatus,onInvalid}){
  // Polling is a Socket.IO transport; no application polling timer or answer replay.
  const socket=io({auth:{token},transports:['polling'],reconnection:false,autoConnect:false});
  socket.on('connect',()=>onStatus('connected'));
  socket.on('state:snapshot',view=>onView(view));
  socket.on('disconnect',()=>onStatus('disconnected'));
  socket.on('connect_error',error=>{onStatus('disconnected');if(error.data?.code==='SESSION_INVALID')onInvalid();});
  socket.on('session:invalid',()=>{onInvalid();socket.disconnect();});
  socket.connect();
  return ()=>{socket.removeAllListeners();socket.disconnect();};
}
