import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const backend=process.env.E2E_BACKEND_URL||'http://localhost:3000';
export default defineConfig({plugins:[react()],server:{host:'localhost',port:5173,strictPort:true,proxy:{'/api':backend,'/socket.io':{target:backend,ws:true}}}});
