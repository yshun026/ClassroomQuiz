import {randomBytes} from 'node:crypto';
import {defineConfig} from '../../frontend/node_modules/@playwright/test/index.mjs';
process.env.ADMIN_PASSWORD ||= randomBytes(24).toString('hex');
export default defineConfig({testDir:'.',testMatch:'*.spec.js',workers:1,use:{baseURL:'http://localhost:5173'},outputDir:'../../test-results',webServer:[{command:'npm --prefix backend start',url:'http://localhost:3000/api/health',cwd:'../..',env:{ADMIN_PASSWORD:process.env.ADMIN_PASSWORD||randomBytes(24).toString('hex')},reuseExistingServer:false},{command:'npm --prefix frontend run dev',url:'http://localhost:5173',cwd:'../..',reuseExistingServer:false}]});
