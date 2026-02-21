# 🎓 Smart Learn — Learning Management System (LMS)

A full-stack LMS built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend), supporting students, teachers, and admins.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [How to Run Locally](#-how-to-run-locally)
- [Environment Variables](#-environment-variables)
- [Admin Bootstrap](#-admin-bootstrap)
- [API Overview](#-api-overview)
- [Security & Reliability Improvements](#-security--reliability-improvements)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)

---

## ✨ Features

### 🎯 Multi-role Authentication
- Student registration/login flow
- Teacher login and teacher-side management flow
- Admin bootstrap + admin-only management routes
- JWT-based access control and role checks

### 👨‍🎓 Student Capabilities
- Dashboard and profile
- Timetable and messages
- Test discovery/submission/results flows

### 👨‍🏫 Teacher Capabilities
- Dashboard and course management
- Test creation, publishing, grading, and results
- Messaging and resource workflows

### 👨‍💼 Admin Capabilities
- Teacher/student management
- Course and timetable assignment
- Monitoring endpoints

---

## 🛠 Tech Stack

### Frontend (`lms-client`)
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Vite

### Backend (`lms-server`)
- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- File upload (`multer`)
- Email (`nodemailer`)

---

## ⚡ How to Run Locally

### 1) Backend
```bash
cd lms-server
npm install
cp .env.example .env
# update .env with valid values (required: MONGO_URI, JWT_SECRET)
npm run dev
```

Backend URL: `http://localhost:5000`  
Health check: `GET /health`

### 2) Frontend
```bash
cd lms-client
npm install
cp .env.example .env
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## 🔐 Environment Variables

### `lms-server/.env`
**Required**
- `MONGO_URI`
- `JWT_SECRET`

**Optional**
- `PORT` (default: `5000`)
- `NODE_ENV` (default: `development`)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `ENABLE_DEBUG_ENDPOINTS` (`true`/`false`, default: `false`)
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (for setup-admin script)

### `lms-client/.env`
- `VITE_API_BASE_URL` (example: `http://localhost:5000/api`)

---

## 👑 Admin Bootstrap

To create the first admin via script:
```bash
cd lms-server
# ensure ADMIN_EMAIL and ADMIN_PASSWORD exist in .env
npm run setup-admin
```

---

## 📚 API Overview

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
- Additional teacher/admin-protected routes for courses, tests, and messaging

### Admin
- `POST /api/admin/create-first-admin` (public bootstrap)
- All other `/api/admin/*` routes are admin-only
- Debug routes (`/api/admin/test`, `/api/admin/test-create`) load only when `ENABLE_DEBUG_ENDPOINTS=true`

---

## 🛡 Security & Reliability Improvements
- Admin routes protected with JWT + `authorizeRoles('admin')` (except first-admin bootstrap)
- Debug admin endpoints env-gated
- Password change endpoint bound to authenticated user identity
- Startup env validation for critical config
- Degraded startup mode support when DB is unavailable, with health endpoint visibility
- Added backend smoke tests for core auth/authorization boundaries

---

## ✅ Testing

Backend smoke tests:
```bash
cd lms-server
npm test
```

Frontend build check:
```bash
cd lms-client
npm run build
```

---

## 📁 Project Structure

```text
smart-learn-lms/
├── lms-client/
│   ├── src/
│   └── package.json
├── lms-server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── test/
│   ├── app.js
│   ├── index.js
│   └── package.json
├── LMS_Project_Documentation.md
├── INTERVIEW_NOTES.md
└── README.md
```

---

## 📈 Roadmap
- Improve integration/e2e coverage
- Add CI pipeline for lint/test/build on PRs
- Add deployment guide and environment profiles
- Add observability/logging improvements

