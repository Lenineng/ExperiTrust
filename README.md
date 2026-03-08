# ExperiTrust

ExperiTrust is a role-based platform for students, employers, and admins to manage verified experience and hiring workflows.

## Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT cookie auth
- Frontend: HTML/CSS/vanilla JS

## Local Setup

### 1. Backend
```bash
cd backend
npm install
```

Create `.env` from `backend/.env.example`.

Run backend:
```bash
npm run dev
```

### 2. Frontend
```bash
https://experitrust.netlify.app
```
## Environment Variables
Use `backend/.env.example` as reference.

Important keys:
- `MONGODB_URI` (required)
- `JWT_SECRET` (required)
- `ALLOWED_ORIGINS` (required for browser API calls with cookies)

## Security Notes
- Helmet enabled
- Rate limiting enabled globally and stricter on `/api/auth`
- CORS controlled through `ALLOWED_ORIGINS`

## Admin Seeding
Set in `.env`:
- `ADMIN_FULL_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Run:
```bash
cd backend
npm run seed:admin
```

## Tests
Backend integration tests:
```bash
cd backend
npm test
```

Frontend smoke tests:
```bash
node --test frontend/test/smoke.test.js
```

## CI
GitHub Actions workflow:
- `.github/workflows/ci.yml`
- runs backend tests and frontend smoke tests on push/PR to `main`

## API Base
Frontend defaults to:
- `http://<current-host>:5001/api`

You can override in browser console:
```js
localStorage.setItem("experitrust_api_base", "http://localhost:5001/api")
```

## Existing Assets
- Figma: https://www.figma.com/design/OtvUJceeilcPUilRI4cAEe/ExperiTrust?node-id=0-1&p=f&t=MUxBUenoVVA5g5tO-0
- Demo videos:
- ```bash
   1:https://www.loom.com/share/b9b7e347cc14491a811d0b3a3ac2a22f
  2: https://www.loom.com/share/9ca5ecea500c488580206af7fd494d54
  ```
-   and screenshots are kept in the repo.
