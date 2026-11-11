# Phase 1 environment — 2026-11-11

Node 24.17.0; npm 11.13.0; Windows local.

{
  "backend": {
    "name": "classroomquiz-backend",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "engines": {
      "node": ">=24 <25"
    },
    "scripts": {
      "dev": "node --watch src/server.js",
      "start": "node src/server.js",
      "test": "node --test tests/unit/*.test.js tests/integration/*.test.js"
    },
    "dependencies": {
      "exceljs": "4.4.0",
      "express": "5.3.0",
      "fast-xml-parser": "5.12.0",
      "jszip": "3.10.2",
      "multer": "2.5.0",
      "socket.io": "4.8.4",
      "socket.io-client": "4.8.4"
    },
    "devDependencies": {
      "supertest": "7.3.2"
    },
    "overrides": {
      "exceljs": {
        "uuid": "11.1.1"
      }
    }
  },
  "frontend": {
    "name": "classroomquiz-frontend",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "engines": {
      "node": ">=24 <25"
    },
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "test": "node --test tests/*.test.js",
      "test:e2e": "playwright test --config ../tests/e2e/playwright.config.js"
    },
    "dependencies": {
      "react": "19.3.1",
      "react-dom": "19.3.1",
      "socket.io-client": "4.8.4"
    },
    "devDependencies": {
      "@playwright/test": "1.65.0",
      "@vitejs/plugin-react": "6.3.0",
      "vite": "8.3.8"
    }
  }
}
