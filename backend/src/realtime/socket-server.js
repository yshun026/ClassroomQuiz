import {Server} from 'socket.io';
import {randomUUID} from 'node:crypto';
import {AppError} from '../api/errors.js';
export function attachRealtime(server,c){
  const io=new Server(server,{cors:{origin:c.config.origin},allowRequest:(req,done)=>done(null,!req.headers.origin||req.headers.origin===c.config.origin)});
  const clients=new Map();
  const sessionFor=socket=>{
    const s=c.auth.validate(socket.handshake.auth?.token);
    if(s.role==='student')c.auth.validateBinding(s);
    return s;
  };
  io.use((socket,next)=>{try{sessionFor(socket);next();}catch(e){const error=new Error(e.message);error.data={code:e.code||'SESSION_INVALID'};next(error);}});
  function send(socket,force=false){
    const session=sessionFor(socket),view=c.sync.resumeView(session),serialized=JSON.stringify(view);
    if(force||clients.get(socket)!==serialized){clients.set(socket,serialized);socket.emit('state:snapshot',view);}
  }
  const changed=()=>{
    for(const socket of clients.keys())try{send(socket);}catch{socket.emit('session:invalid',{code:'SESSION_INVALID',message:'身分已失效，請重新確認'});socket.disconnect(true);}
  };
  c.sync.on('change',changed);
  io.on('connection',socket=>{
    // Synchronous subscription and snapshot: no await or mutation may interleave here.
    try{clients.set(socket,null);send(socket,true);}catch{socket.disconnect(true);return;}
    socket.on('state:request',(body,ack)=>{
      if(typeof ack!=='function')return;
      try{const session=sessionFor(socket);if(body?.activityId&&body.activityId!==c.store.activity?.id)throw new AppError('STALE_ACTIVITY');ack({ok:true,view:c.sync.resumeView(session)});}
      catch(e){ack({ok:false,error:{code:e.code||'SESSION_INVALID',message:e instanceof AppError?e.message:'身分驗證失敗',requestId:randomUUID()}});}
    });
    socket.on('disconnect',()=>clients.delete(socket));
  });
  server.once('close',()=>c.sync.off('change',changed));
  return io;
}
