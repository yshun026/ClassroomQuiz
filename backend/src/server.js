import {attachRealtime} from './realtime/socket-server.js';
import {createServer} from 'node:http';
import {createApp} from './app.js';
import {loadConfig} from './config.js';
const config=loadConfig();const app=createApp({config});const server=createServer(app);attachRealtime(server,app.locals.context);
server.listen(config.port,config.host,()=>console.log(`ClassroomQuiz: http://localhost:${config.port}`));
