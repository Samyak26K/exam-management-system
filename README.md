# Exam Management System

B1 Software Engineering assessment application built with React, Vite, Express, MongoDB, and Mongoose.

## Features

- Separate student registration/login and admin login/provisioning pages
- Secure bcrypt password hashing and HTTP-only JWT session cookies
- Server-side role authorization
- Admin exam timetable management
- Admin room management with capacity and clash validation
- Student exam list restricted to the student's academic year and section

## Requirements

- Node.js 20 or newer
- npm
- MongoDB running locally or a MongoDB connection URI

## Setup

1. Install dependencies:

   ```powershell
   cd server
   npm install
   cd ..\client
   npm install
   ```

2. Copy `.env.example` to `.env` in the project root and set the values. Never commit `.env`.
3. Ensure MongoDB is running and that `MONGODB_URI` points to the database you want to use.
4. Start the server in one terminal:

   ```powershell
   cd server
   npm run dev
   ```

5. Start the client in another terminal:

   ```powershell
   cd client
   npm run dev
   ```

The client runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## Admin provisioning

Public users cannot create an administrator without the private `ADMIN_SETUP_KEY`. Set that value in `.env`, then use the Admin registration page once to provision an account. Keep the key out of source control and share it only with the authorized person setting up the assessment.

## API overview

- `POST /api/auth/student/register` creates a student account.
- `POST /api/auth/admin/register` provisions an admin account when the setup key is correct.
- `POST /api/auth/login` accepts `email`, `password`, and `role` (`student` or `admin`).
- `POST /api/auth/logout` clears the HTTP-only session cookie.
- `GET /api/auth/me` returns the current authenticated user.
- `GET /api/exams` returns all exams for admins, or only the authenticated student's academic year and section.
- `POST`, `PUT /:id`, and `DELETE /:id` on `/api/exams` are restricted to admins.
- `GET`, `POST`, `PUT /:id`, and `DELETE /:id` on `/api/rooms` are restricted to admins.

Exam creation and updates require a valid room. The server derives attendance from registered students in the exam's academic year and section, rejects rooms with insufficient capacity, and rejects overlapping bookings for the same room and date. A room assigned to an exam cannot be deleted.

## Test accounts

No real credentials are stored in this repository. Create a student account through the Student registration page. Create the first administrator through the Admin registration page using the local `ADMIN_SETUP_KEY` from your `.env` file.

## Deployment notes

Set production values for `MONGODB_URI`, `JWT_SECRET`, `ADMIN_SETUP_KEY`, `CLIENT_URL`, and `NODE_ENV=production`. For a separately hosted frontend, set `VITE_API_BASE_URL` in the client build environment to the backend origin. Build the client with `npm run build` inside `client`, serve the generated `client/dist` through your chosen static host, and deploy the `server` process separately.
