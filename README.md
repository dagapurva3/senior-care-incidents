
# Senior Care Incidents

A production-ready, full-stack application for managing and reporting incidents in senior care facilities.

---

## Project Structure

```
root/
  backend/
    src/
      app.ts
      models/
      repositories/
      services/
      controllers/
      routes/
      middleware/
      config/
      types/
    tests/
    ...
  frontend/
    src/
      app/
      components/
      lib/
      types/
      tests/
    ...
  .env.example (backend & frontend)
  CONTRIBUTING.md
  README.md
```

## Setup

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (for backend)
- Firebase project (for auth)

### Backend
1. Copy `.env.example` to `.env` and fill in your values.
2. Install dependencies:
   ```sh
   cd backend
   npm install
   ```
3. Start the backend:
   ```sh
   npm run dev
   ```

### Frontend
1. Copy `.env.example` to `.env.local` and fill in your values.
2. Install dependencies:
   ```sh
   cd frontend
   npm install
   ```
3. Start the frontend:
   ```sh
   npm run dev
   ```

## Environment Variables
- See `.env.example` in both `backend/` and `frontend/` for required variables.
- Never commit secrets or credentials.

## Testing
- **Backend:**
  - Run all tests: `npm test`
  - Unit, integration, and repository tests are included.
- **Frontend:**
  - Run all tests: `npm test`
  - Tests for all main components and edge cases.

## Architecture Overview
- **Backend:**
  - Follows MVC + repository pattern for maintainability and scalability.
  - Models, repositories, services, controllers, and routes are separated.
  - Uses Sequelize ORM, PostgreSQL, and Firebase for authentication.
  - All business logic and validation are in the service layer.
- **Frontend:**
  - Modular React components with TypeScript.
  - API and Firebase logic separated in `lib/`.
  - All main components are tested.

## Production Readiness
- Linting and formatting with ESLint and Prettier.
- Environment variable management.
- Security middleware (helmet, CORS, etc.).
- Example CI/CD and deployment instructions (see below).

## CI/CD Example (GitHub Actions)
Add a `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install backend dependencies
        run: cd backend && npm install
      - name: Install frontend dependencies
        run: cd frontend && npm install
      - name: Run backend tests
        run: cd backend && npm test
      - name: Run frontend tests
        run: cd frontend && npm test
```

---

For any questions or issues, please open an issue or pull request.
