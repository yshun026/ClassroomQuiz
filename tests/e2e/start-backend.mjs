import {attachRealtime} from '../../backend/src/realtime/socket-server.js';
import {createServer} from 'node:http';
import {createApp} from '../../backend/src/app.js';
import {loadConfig} from '../../backend/src/config.js';
const config={...loadConfig(),port:Number(process.env.E2E_BACKEND_PORT||3000),origin:process.env.E2E_BASE_URL||'http://localhost:5173'};
const app=createApp({config});const server=createServer(app);attachRealtime(server,app.locals.context);server.listen(config.port,config.host);
