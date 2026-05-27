# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Running the frontend against a remote server on the same LAN

1. Start the backend on a different machine (see backend/README.md) and enable HTTPS.
2. On the client machine, set env var before starting Vite:

```powershell
$env:VITE_API_BASE_URL = 'https://<SERVER_IP>:3001'
npm run dev
```

Ensure the client machine trusts the backend certificate (mkcert or lab CA). The frontend sends the stored `accessToken` in the `Authorization` header for authenticated requests.

Troubleshooting — make the frontend reachable from your phone

- If your phone must load the dev UI (Vite) and the frontend is running on your PC, start Vite bound to the machine IP (temporary):
```powershell
cd frontend
# one-off: bind to a specific LAN IP
npm run dev -- --host 10.109.81.73
# or bind to all interfaces (0.0.0.0)
npm run dev -- --host 0.0.0.0
```

- Make this permanent by editing `package.json` or `vite.config.js`:
	- `package.json` script: `"dev": "vite --host 0.0.0.0"`
	- or in `vite.config.js`: `server: { host: '0.0.0.0' }`

- Ensure Vite's port (default `5173`) is allowed in Windows Firewall (Admin):
```powershell
New-NetFirewallRule -DisplayName 'vite-5173' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173 -Profile Any
```

- Ensure the frontend points to the right backend IP. In `frontend/.env` set:
```
VITE_API_BASE_URL=http://<SERVER_IP>:3001
VITE_WS_URL=ws://<SERVER_IP>:3001
```
Restart the frontend after changing env.

- Quick checks:
	- On the PC (server): `curl http://localhost:3001/health` and `curl http://<SERVER_IP>:3001/health`
	- On the phone (same Wi‑Fi): open `http://<SERVER_IP>:5173` to load the UI. The UI will call the backend at `VITE_API_BASE_URL`.

- If phone still cannot reach the PC:
	- Try connecting the phone to the PC's hotspot (or vice‑versa) to rule out AP/client isolation.
	- Use `ngrok http 3001` on the PC and open the provided HTTPS URL on the phone.

If you want I can add the helper script to open firewall rules and start the dev server for you; say "add helper" and I'll create it.
