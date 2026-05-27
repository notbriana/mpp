Backend setup and how to run from a different machine

Prerequisites
- Node.js (16+)

Install
```bash
cd backend
npm install
```

Run migrations (creates versioned schema)
```bash
npx sequelize-cli db:migrate --env development
```

Run tests (migrations are not required; tests reset DB in-memory):
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Start server (binds to all interfaces so other machines can reach it):
```bash
npm start
```

Run frontend from another machine
1. On server machine, ensure port 3001 is reachable (firewall/router).
2. On client machine, set `VITE_API_BASE_URL` to `http://<SERVER_IP>:3001` and start frontend dev server:
```powershell
#$env:VITE_API_BASE_URL = 'http://192.168.1.100:3001'
cd frontend
npm install
npm run dev
```

HTTPS / secure setup
- To run the server over HTTPS (required for the lab), provide certificate and key files and set env vars before starting:

```powershell
$env:HTTPS_KEY_PATH = 'C:\path\to\server.key'
$env:HTTPS_CERT_PATH = 'C:\path\to\server.crt'
$env:AUTH_SECRET = 'a_strong_secret'
$env:SESSION_INACTIVITY_MS = '1800000' # 30 minutes
npm start
```

Then on the client machine set `VITE_API_BASE_URL` to `https://<SERVER_IP>:<PORT>` (default `3001`) and ensure the client trusts the server certificate (use mkcert or lab CA).

Authentication tokens
- The server returns `accessToken` (JWT, short lived) and `refreshToken` (session token). The frontend stores these in session storage and sends `Authorization: Bearer <accessToken>` for API calls. Use `/api/auth/refresh` to exchange a `refreshToken` for a new access token; sessions are invalidated after the inactivity timeout.

Notes
- The DB schema is created and versioned via `sequelize-cli` migrations in `src/migrations`.
- Focus stats were split into `focus_today` and `focus_alltime` tables to be normalized (3NF).
- Roles/permissions are normalized into `roles`, `permissions`, `user_roles`, and `role_permissions` (3NF).
- If you need seed data, add seeders under `src/seeders` and run `npx sequelize-cli db:seed:all`.

Troubleshooting — connect from phone or another device on the LAN
- Find the server machine IP (use the Wi‑Fi / Ethernet adapter that the phone is on):
```powershell
# Windows
ipconfig
# look for the IPv4 address for your Wi‑Fi adapter (e.g. 10.196.181.73)
```

- Ensure the backend is listening on all interfaces (the server uses `0.0.0.0` by default). Start it:
```powershell
cd backend
# if you have HTTPS certs set, unset them for local HTTP testing or use the helper script
#$env:HTTPS_KEY_PATH=$null; $env:HTTPS_CERT_PATH=$null
npm start
```

- Allow port 3001 through Windows Firewall (run as Administrator):
```powershell
New-NetFirewallRule -DisplayName 'mpp-backend-3001' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3001 -Profile Any
```

- From the server machine verify locally:
```powershell
curl http://localhost:3001/health
curl http://<SERVER_IP>:3001/health
```

- From your phone (same Wi‑Fi) open in the browser:
```
http://<SERVER_IP>:5173  # frontend dev UI (if running vite on server machine)
http://<SERVER_IP>:3001/health  # direct backend health
```

- If it still fails:
	- Some Wi‑Fi APs enable client isolation (guest networks) — try tethering your phone to your PC's hotspot or use a different network.
	- Use `ngrok` as a quick fallback (no firewall changes required):
		```powershell
		ngrok http 3001
		# open the HTTPS ngrok URL on your phone
		```