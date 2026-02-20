# Smart Learn LMS

Full-stack Learning Management System with:
- React + Vite frontend (`lms-client`)
- Node.js + Express + MongoDB backend (`lms-server`)

## How to Run Locally

### 1) Backend
```bash
cd lms-server
npm install
cp .env.example .env
# update .env with your real values (at minimum MONGO_URI and JWT_SECRET)
npm run dev
```

Backend default URL: `http://localhost:5000`
Health endpoint: `GET /health`

### 2) Frontend
```bash
cd lms-client
npm install
cp .env.example .env
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Environment Variables

### `lms-server/.env`
Required:
- `MONGO_URI`
- `JWT_SECRET`

Optional:
- `PORT` (default `5000`)
- `NODE_ENV` (default `development`)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `ENABLE_DEBUG_ENDPOINTS` (`true`/`false`, default `false`)
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (for setup script)

### `lms-client/.env`
- `VITE_API_BASE_URL` (default in example: `http://localhost:5000/api`)

## Admin Bootstrap

If you need to create the first admin user via script:
```bash
cd lms-server
# ensure ADMIN_EMAIL and ADMIN_PASSWORD are set in .env
npm run setup-admin
```

## API Route Map (implemented)

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password` (authenticated)

### Student
- `POST /api/student/register`
- `POST /api/student/login`
- `POST /api/student/forgot-password`
- `POST /api/student/reset-password`
- `POST /api/student/verify-otp`
- `GET /api/student/dashboard` (student auth)
- `GET /api/student/profile` (student auth)
- `GET /api/student/study-bot` (student auth)
- `GET /api/student/timetable` (student auth)
- `GET /api/student/messages` (student auth)

### Teacher
- `POST /api/teacher/login`
- `POST /api/teacher/forgot-password`
- `POST /api/teacher/reset-password`
- `POST /api/teacher/verify-otp`
- `GET /api/teacher/student-tests` (auth)
- `POST /api/teacher/submit-test` (student auth)
- `GET /api/teacher/student-results` (auth)
- teacher/admin protected course/dashboard/messenger/profile/test management routes

### Admin
- `POST /api/admin/create-first-admin` (public bootstrap)
- all other `/api/admin/*` routes are admin-auth protected
- debug routes (`/api/admin/test`, `/api/admin/test-create`) only exist when `ENABLE_DEBUG_ENDPOINTS=true`

## Testing

Backend smoke tests:
```bash
cd lms-server
npm test
```
