import {randomBytes} from 'node:crypto';
export const testPassword=()=>randomBytes(24).toString('hex');
