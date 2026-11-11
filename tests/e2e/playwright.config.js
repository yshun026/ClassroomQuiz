import {randomBytes} from 'node:crypto';
import {defineConfig} from '../../frontend/node_modules/@playwright/test/index.mjs';
process.env.ADMIN_PASSWORD ||= randomBytes(24).toString('hex');
const frontendPort=process.env.E2E_FRONTEND_PORT||'5173';
const backendPort=process.env.E2E_BACKEND_PORT||'3000';
process.env.E2E_BASE_URL=`http://localhost:${frontendPort}`;
export default defineConfig({testDir:'.',testMatch:'*.spec.js',workers:1,use:{baseURL:process.env.E2E_BASE_URL},outputDir:'../../test-results',webServer:[{command:'node tests/e2e/start-backend.mjs',url:`http://localhost:${backendPort}/api/health`,cwd:'../..',env:{ADMIN_PASSWORD:process.env.ADMIN_PASSWORD,E2E_BACKEND_PORT:backendPort,E2E_BASE_URL:process.env.E2E_BASE_URL},reuseExistingServer:false},{command:`npm --prefix frontend run dev -- --port ${frontendPort}`,url:process.env.E2E_BASE_URL,cwd:'../..',env:{E2E_BACKEND_URL:`http://localhost:${backendPort}`},reuseExistingServer:false}]});
