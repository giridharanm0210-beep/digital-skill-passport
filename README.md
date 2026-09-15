# Digital Skill Passport

A browser-first Digital Skill Passport prototype with a Node.js/Express API backend and PostgreSQL persistence.

## Live services

- Frontend: GitHub Pages for this repository
- API: https://digital-skill-passport-api.onrender.com
- Health check: https://digital-skill-passport-api.onrender.com/api/health

## Architecture

GitHub Pages frontend → HTTPS API → Express/Node.js → PostgreSQL

The frontend keeps its prototype UX and uses `frontend-bridge.js` to connect login, resume upload, and skill-gap requests to the API when available. The UI still falls back to local demo behavior if the API is unavailable.

## Development

Backend:

```bash
cd backend
npm install
npm start
```

Environment variables:

- `PORT`
- `DATABASE_URL`
- `DATABASE_SSL`
- `JWT_SECRET`
- `FRONTEND_ORIGIN`

This is a prototype deployment. Demo authentication is not real Google OAuth yet, and resume files are not persisted to object storage yet.
