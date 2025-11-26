# Repository Guidelines

## Project Structure & Modules
- `backend/`: Flask API (`run.py`). Routes in `app/routes`, helpers in `app/utils`, config in `app/config.py`, env template at `.env.example`.
- `frontend/`: React app for the library management system. UI in `src` (components/pages), API calls in `src/services/api.js`, styles in `src/styles`, assets in `public/`.
- `website/`: Separate React app for mynuk.com (public site plus admin/patron logins). Source in `website/src`; deploys independently to Railway.
- `database/`: `schema.sql` for PostgreSQL. Update here before migrating.
- Docs: `QUICKSTART.md` (setup), `ARCHITECTURE.md` (system view), `DEPLOYMENT_CHECKLIST.md` (release steps).

## Build, Test, and Development
- Backend: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cp .env.example .env` (set `DATABASE_URL`, `JWT_SECRET_KEY`, `SECRET_KEY`). Run `python run.py` (port 5000).
- Database: from repo root `createdb nuk_library` then `psql -d nuk_library -f database/schema.sql`.
- Frontend app: `cd frontend && npm install`; dev `npm start` (3000); production `npm run build`.
- Website app: `cd website && npm install`; dev `npm start`; production `npm run build`. Uses `REACT_APP_API_URL` to reach backend.
- Tests: CRA defaults via `npm test` for both React apps. Backend lacks automated tests; verify endpoints with curl/Postman and note results in PRs.

## Coding Style & Naming
- Python: PEP 8; files/modules snake_case; functions snake_case; constants UPPER_SNAKE. Keep routes thin; reuse helpers in `app/utils`.
- JavaScript/React: components PascalCase, hooks/utilities camelCase. Keep API logic in `src/services/api.js`; prefer functional components and hooks. Styles stay in `src/styles` or component-local CSS.
- Env vars: backend uses `DATABASE_URL`, `JWT_SECRET_KEY`, `SECRET_KEY`; React apps use `REACT_APP_API_URL` for backend base URL.

## Testing Guidelines
- Place component tests alongside files as `Component.test.js`; mock axios/network to stay deterministic. For backend changes, document manual checks and sample requests/responses. Prioritize auth, borrowing, and admin flows.

## Commit & Pull Request Guidelines
- Commits follow short, imperative summaries (e.g., "Add weekend-only cowork plans"). Keep related changes together.
- PRs: describe scope, link issues, list migrations/setup, and note tests run. Include screenshots/GIFs for UI updates and sample API responses for backend changes. Call out new env vars or Railway config changes.

## Deployment Notes
- Railway hosts backend plus both React apps; the website is served at `mynuk.com`. When schema changes, rerun `database/schema.sql` on the target DB and confirm API URLs for both React apps before deploying.
