# Exam Management System

A full-stack web application for managing examination timetables and classroom allocations. The system provides separate student and administrator interfaces, allowing administrators to schedule exams and manage rooms while students can view their personalized examination timetable.

Built using the **MERN stack** with React, Vite, Express.js, MongoDB, and Mongoose.

## Features

### Authentication & Authorization

* Separate student registration and login.
* Dedicated administrator login and account provisioning.
* Secure password hashing using bcrypt.
* HTTP-only JWT session cookies.
* Server-side role-based access control.
* Protected routes and authenticated sessions.

### Admin Dashboard

* Create, view, update, and delete examination schedules.
* Manage examination rooms and their capacities.
* Assign rooms to examinations.
* View room inventory and examination details.
* Validate room availability before scheduling an exam.

### Room Allocation & Validation

* Prevent room allocation when the number of registered students exceeds room capacity.
* Prevent overlapping examinations from being scheduled in the same room on the same date.
* Calculate expected attendance using registered students' academic year and section.
* Require valid room assignments for examinations.
* Prevent deletion of rooms that are assigned to examinations.

### Student Dashboard

* View the examination timetable relevant to the student's academic year and section.
* See examination dates, timings, subjects, and assigned room details.
* Access examination information through an authenticated student account.

### Responsive Interface

* Modern, responsive user interface.
* Dashboard navigation for administrators and students.
* Mobile-friendly navigation and layouts.
* Form validation and clear feedback for user actions.

## Tech Stack

| Layer             | Technologies                 |
| ----------------- | ---------------------------- |
| Frontend          | React, Vite, JavaScript, CSS |
| Backend           | Node.js, Express.js          |
| Database          | MongoDB, Mongoose            |
| Authentication    | JWT, HTTP-only cookies       |
| Password Security | bcrypt                       |
| API Communication | REST API                     |
| Development Tools | npm, Git, GitHub             |

## System Architecture

The application follows a client-server architecture.

1. **Frontend:** React provides the authentication pages, admin dashboard, room management, exam scheduling, and student timetable.
2. **Backend:** Express.js exposes REST API endpoints, validates requests, enforces authorization, and applies scheduling rules.
3. **Database:** MongoDB stores user accounts, examination records, and room information.
4. **Authentication:** JWT-based sessions are maintained using HTTP-only cookies.
5. **Validation:** The backend checks room capacity and scheduling conflicts before accepting exam assignments.

## Project Structure

```text
exam-management-system/
├── client/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── AppShell.jsx
│   │   ├── AuthPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── app.js
│   ├── test/
│   │   └── validation.test.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

*The structure above highlights the main application files; individual files and folders may vary as the project evolves.*

## Prerequisites

Install the following before running the project:

* [Node.js](https://nodejs.org/) 20 or newer
* npm
* [MongoDB](https://www.mongodb.com/) local installation or a MongoDB Atlas database
* [Git](https://git-scm.com/)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Samyak26K/exam-management-system.git
cd exam-management-system
```

### 2. Install dependencies

Install the backend dependencies:

```bash
cd server
npm install
```

Install the frontend dependencies:

```bash
cd ../client
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root using `.env.example` as a reference.

Configure the required values:

```dotenv
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
ADMIN_SETUP_KEY=your_private_admin_setup_key

CLIENT_URL=http://localhost:5173
```

For local development, configure the database URI to point to your local MongoDB instance or MongoDB Atlas database.

**Security notes:**

* Never commit `.env` or expose database credentials.
* Use a strong, unique `JWT_SECRET`.
* Keep `ADMIN_SETUP_KEY` private and share it only with the authorized administrator setting up the application.
* Use separate, secure environment variables for production.

### 4. Start the backend

Open a terminal in the project directory:

```bash
cd server
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 5. Start the frontend

Open a second terminal:

```bash
cd client
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Open the frontend URL in your browser to use the application.

## User Roles

### Administrator

An administrator can:

* Access the protected admin dashboard.
* Create and manage examination rooms.
* Set room names and capacities.
* Create and update examination schedules.
* Assign available rooms to examinations.
* Delete examinations and manage room records subject to allocation constraints.

### Student

A student can:

* Register an account and log in.
* Access the student dashboard.
* View examinations matching their academic year and section.
* Check the date, time, and room assigned to each examination.

Students cannot access administrator-only management operations.

## Scheduling Rules

The backend enforces the following business rules:

| Rule              | Expected behavior                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Required fields   | Required room and examination fields must be provided.                                         |
| Room capacity     | An examination cannot be assigned to a room when the expected attendance exceeds its capacity. |
| Room clashes      | The same room cannot host overlapping examinations on the same date.                           |
| Room assignment   | An examination must reference a valid room.                                                    |
| Room deletion     | A room assigned to an examination cannot be deleted.                                           |
| Student timetable | Students see examinations matching their academic year and section.                            |
| Admin access      | Room and examination management operations require administrator authorization.                |

**Example:** If an examination has 35 registered students and a room has a capacity of 30, the allocation is rejected.

If Room A is already booked from 10:00 AM to 12:00 PM, another examination cannot use Room A during an overlapping time interval on the same date.

## API Overview

The backend exposes REST API endpoints under `/api`.

### Authentication

| Method | Endpoint                     | Purpose                                        |
| ------ | ---------------------------- | ---------------------------------------------- |
| POST   | `/api/auth/student/register` | Register a student                             |
| POST   | `/api/auth/admin/register`   | Provision an administrator using the setup key |
| POST   | `/api/auth/login`            | Authenticate a student or administrator        |
| POST   | `/api/auth/logout`           | End the authenticated session                  |
| GET    | `/api/auth/me`               | Retrieve the current authenticated user        |

The login endpoint accepts an email, password, and role (`student` or `admin`).

### Examinations

| Method | Endpoint         | Access                                     |
| ------ | ---------------- | ------------------------------------------ |
| GET    | `/api/exams`     | Authenticated user; results depend on role |
| POST   | `/api/exams`     | Admin only                                 |
| PUT    | `/api/exams/:id` | Admin only                                 |
| DELETE | `/api/exams/:id` | Admin only                                 |

Administrators can manage examination schedules. Students receive only examinations relevant to their academic year and section.

### Rooms

| Method | Endpoint         | Access                                        |
| ------ | ---------------- | --------------------------------------------- |
| GET    | `/api/rooms`     | Admin only                                    |
| POST   | `/api/rooms`     | Admin only                                    |
| PUT    | `/api/rooms/:id` | Admin only                                    |
| DELETE | `/api/rooms/:id` | Admin only, subject to allocation constraints |

All protected endpoints rely on server-side authentication and authorization.

## Testing

The project includes backend validation tests.

Run the validation test suite from the `server` directory:

```bash
node --test test/validation.test.js
```

Build the frontend to verify that the production bundle compiles:

```bash
cd client
npm run build
```

When testing scheduling functionality, verify at least the following cases:

* A valid room can be created and assigned to an examination.
* An examination exceeding room capacity is rejected.
* Overlapping bookings for the same room and date are rejected.
* Non-overlapping bookings can be scheduled when the room is available.
* Students see only examinations for their academic year and section.
* Students cannot perform administrator-only operations.

## Initial Account Setup

### Student account

1. Open the application.
2. Navigate to student registration.
3. Enter the required details, including the academic year and section.
4. Register and log in.

### Administrator account

1. Configure `ADMIN_SETUP_KEY` in the local environment.
2. Open the administrator registration or provisioning page.
3. Provide the setup key and required account details.
4. Log in through the administrator login page.

Administrator provisioning should be performed only by the authorized person. Do not publish the setup key or real account credentials in this repository.

## Deployment

The frontend and backend can be deployed separately.

### Backend

Configure the production environment variables:

* `NODE_ENV=production`
* `PORT` — the port provided by the hosting platform, when applicable
* `MONGODB_URI`
* `JWT_SECRET`
* `ADMIN_SETUP_KEY`
* `CLIENT_URL` — the deployed frontend origin

Deploy the Express server to a Node.js-compatible hosting platform and ensure that the MongoDB database is accessible to it.

### Frontend

Configure the frontend build environment variable:

```dotenv
VITE_API_BASE_URL=https://your-backend-domain.example
```

Replace the example value with the actual deployed backend origin. Configure the frontend's allowed origin and cookie settings appropriately for the deployment.

Build the production frontend:

```bash
cd client
npm run build
```

Deploy the generated `client/dist` directory to a static hosting provider.

**Deployment checklist:**

* Configure production environment variables securely.
* Use HTTPS for deployed frontend and backend.
* Configure cross-origin requests and credentialed cookies for the actual frontend origin.
* Ensure the database is not publicly exposed.
* Never place private secrets in frontend environment variables or client-side code.

## Security Considerations

* Passwords are hashed before storage.
* Authentication uses HTTP-only session cookies.
* Role-based access is enforced on the backend.
* Administrator provisioning requires a private setup key.
* Exam and room operations are validated server-side.
* Environment files containing secrets must remain outside version control.

## Future Enhancements

Potential improvements include:

* Automated timetable generation.
* Email notifications for examination schedules.
* Exporting timetables to PDF.
* Examination calendar views.
* Audit logs for administrative changes.
* More detailed room utilization reports.

## Author

**Samyak Khobragade**

* GitHub: [@Samyak26K](https://github.com/Samyak26K)
* Project Repository: [Exam Management System](https://github.com/Samyak26K/exam-management-system)

## License

No license has been specified for this repository. Add a `LICENSE` file if you intend to grant others explicit permissions to use, modify, and distribute the project.
