# Cloudflare Tunneling Setup Guide

This document outlines the steps to set up and run Cloudflare Tunneling for the Animal Forest Coding project. This allows external access to the local development environment via a secure public URL.

## 1. Prerequisites

- **WSL (Windows Subsystem for Linux)**: The project commands are optimized for WSL.
- **Cloudflared Binary**: The `cloudflared` executable must be present in the project root.
- **Node.js & npm**: Required to run the frontend and backend services.

## 2. Configuration Changes

To ensure the application works correctly behind the tunnel, the following configurations are required.

### 2.1. Frontend (`frontend/.env`)
Add the following line to disable the Host header check, which blocks tunnel requests by default.

```env
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

### 2.2. Backend (`backend/src/server.ts`)
Update the CORS configuration to allow dynamic origins. This is necessary because the tunnel URL changes every time (unless using a named tunnel).

```typescript
const corsOptions = {
  // Allow any origin, reflects request origin
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### 2.3. API Client (`frontend/src/services/apiClient.ts`)
Ensure the API client uses a relative path so requests are correctly routed through the same tunnel domain.

```typescript
// Use relative path '/api' instead of absolute 'http://localhost:5000/api'
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
```

## 3. Execution Steps

### 3.1. Start the Backend
Open a terminal in the `backend` directory:
```bash
wsl npm run dev
```
*Port: 5000*

### 3.2. Start the Frontend
Open a terminal in the `frontend` directory:
```bash
wsl npm start
```
*Port: 3000*

### 3.3. Start the Tunnel
Open a new terminal in the project root and run:
```bash
wsl sh -c "chmod +x cloudflared && ./cloudflared tunnel --url http://localhost:3000"
```

The terminal will output a URL similar to:
`https://<random-name>.trycloudflare.com`

Share this URL to access the application externally.

## 4. Troubleshooting

- **Invalid Host Header**: Verify `DANGEROUSLY_DISABLE_HOST_CHECK=true` is in `frontend/.env` and the frontend server was restarted.
- **Network Error / 404**: Ensure the backend is running and the proxy settings in `frontend/package.json` or `setupProxy.js` (if applicable) are correctly forwarding `/api` requests to `http://localhost:5000`.
- **WebSocket Gateway Connection Failed**: This is expected in the free tunnel tier for HMR (Hot Module Replacement) but does not affect critical functionality.
