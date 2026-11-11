import {createServer} from 'node:http';
import {createApp} from './app.js';
import {loadConfig} from './config.js';
const config=loadConfig();const server=createServer(createApp({config}));
server.listen(config.port,config.host,()=>console.log(`ClassroomQuiz: http://localhost:${config.port}`));
