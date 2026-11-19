import {createFakeSheetsAccess} from '../../backend/tests/helpers/fake-sheets-access.js';
import {syntheticSheetA,syntheticSheetB} from '../fixtures/google-sheets/sources.js';
import {attachRealtime} from '../../backend/src/realtime/socket-server.js';
import {createServer} from 'node:http';
import {createApp} from '../../backend/src/app.js';
import {loadConfig} from '../../backend/src/config.js';
const config={...loadConfig(),port:Number(process.env.E2E_BACKEND_PORT||3000),origin:process.env.E2E_BASE_URL||'http://localhost:5173'};
const invalid=syntheticSheetA();invalid.spreadsheetId='synthetic-invalid';invalid.sheets[0].data[0].rowData[0].values[0].textFormatRuns=[{startIndex:0,format:{bold:true}}];
const app=createApp({config,sheetsAccess:createFakeSheetsAccess({sources:[syntheticSheetA(),syntheticSheetB(),invalid]})});const server=createServer(app);attachRealtime(server,app.locals.context);server.listen(config.port,config.host);
