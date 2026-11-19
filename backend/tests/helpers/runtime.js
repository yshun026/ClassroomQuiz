import {randomBytes} from 'node:crypto';
import {createApp} from '../../src/app.js';
import {loadConfig} from '../../src/config.js';
import {createFakeSheetsAccess} from './fake-sheets-access.js';
export const testPassword=()=>randomBytes(24).toString('hex');
export function createTestRuntime(options={}){
 const sheetsAccess=options.sheetsAccess??createFakeSheetsAccess();
 const app=createApp({config:loadConfig({ADMIN_PASSWORD:testPassword()}),...options,sheetsAccess});
 return {app,context:app.locals.context,sheetsAccess};
}
