# Repository Guidelines

## Project Structure & Modules
- `backend/`: Flask API (entry: `run.py`). Routes in `app/routes`, shared helpers in `app/utils`, config in `app/config.py`, env template at `.env.example`.
- `frontend/`: React app for the library management system. UI in `src` (components/pages), API calls in `src/services/api.js`, styles in `src/styles`, static assets in `public/`.
- `website/`: Separate React app for mynuk.com (public site plus admin/patron logins). Source under `website/src`; deploys independently to Railway.
- `database/`: `schema.sql` for PostgreSQL. Update here before migrating.
- Docs: `QUICKSTART.md` for setup, `ARCHITECTURE.md` for system view, `DEPLOYMENT_CHECKLIST.md` for release steps.

## Build, Test, and Development
- Backend: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cp .env.example .env` (set `DATABASE_URL`, `JWT_SECRET_KEY`, `SECRET_KEY`). Run `python run.py` (port 5000).
- Database: from repo root run `createdb nuk_library` then `psql -d nuk_library -f database/schema.sql`.
- Frontend app: `cd frontend && npm install`; dev server `npm start` (3000), production build `npm run build`.
- Website app: `cd website && npm install`; dev server `npm start`, production build `npm run build`. Uses the same API URL env pattern (`REACT_APP_API_URL`).
- Tests: CRA defaults via `npm test` for both React apps. Backend lacks automated tests—exercise endpoints with curl/Postman and note results in PRs.

## Coding Style & Naming Conventions
- Python: PEP 8; files/modules snake_case; functions snake_case; constants UPPER_SNAKE. Keep routes thin; reuse helpers in `app/utils`.
- JavaScript/React: components PascalCase, hooks/utilities camelCase. Keep API logic inside `src/services/api.js`; prefer functional components and hooks. Styles live in `src/styles` or component-local CSS.
- Env naming: backend uses `DATABASE_URL`, `JWT_SECRET_KEY`, `SECRET_KEY`; React apps use `REACT_APP_API_URL` for backend base URL.

## Testing Guidelines
- Place component tests alongside files as `Component.test.js`; mock axios/network in tests to stay deterministic. For backend changes, document manual checks and sample requests/responses. Aim for coverage on critical flows: auth, borrowing, admin actions.

## Commit & Pull Request Guidelines
- Commit style mirrors history: short, imperative statements (e.g., "Add weekend-only cowork plans"). Keep related changes together.
- PRs: describe scope, link issues, list migrations/setup, and note tests run. Include screenshots/GIFs for UI updates and sample API responses for backend changes. Call out any new env vars or Railway config changes.

## Deployment Notes
- Railway hosts both backend and frontend/website services. Backend and admin UI share the same Railway project; the public site runs at `mynuk.com`. When schema changes, rerun `database/schema.sql` on the target database and verify API URLs for both React apps.
