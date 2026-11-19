import {createServer} from 'node:http';
import {createApp} from '../../src/app.js';
import {loadConfig} from '../../src/config.js';
import {attachRealtime} from '../../src/realtime/socket-server.js';
import {createFakeSheetsAccess} from './fake-sheets-access.js';
const config=loadConfig(),app=createApp({config,sheetsAccess:createFakeSheetsAccess()}),server=createServer(app);
attachRealtime(server,app.locals.context);
server.listen(0,'localhost',()=>process.send({port:server.address().port}));
