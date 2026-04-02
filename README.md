# ExperiTrust

ExperiTrust is a role-based graduate employability platform for students, employers, and admins. It helps students submit academic, volunteer, internship, and project-based experiences, allows admins to verify those experiences, and enables employers to discover and manage early-career talent.

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT with cookies
- Testing: Node test runner and `supertest`

## Project Structure

```text
Experitrust/
|-- backend/
|   |-- scripts/
|   |-- src/
|   |-- test/
|   |-- package.json
|   `-- .env.example
|-- frontend/
|   |-- images/
|   |-- icons/
|   |-- test/
|   |-- index.html
|   |-- login.html
|   |-- signup.html
|   |-- student-dashboard.html
|   |-- employer-dashboard.html
|   |-- admin-dashboard.html
|   |-- script.js
|   `-- styles.css
|-- Screenshots/
`-- README.md
```

## Features

- Role-based signup and login
- Student experience submission
- Admin verification and rejection workflow
- Employer job posting and applicant management
- Interview scheduling
- Frontend dashboards for student, employer, and admin roles

## Prerequisites

Before running the project, install:

- Node.js 18 or later
- npm
- MongoDB locally or a MongoDB Atlas connection
- A static server for the frontend, such as VS Code Live Server

## Installation

Clone the repository and install backend dependencies:

```bash
git clone <your-repository-url>
cd Experitrust
cd backend
npm install
```

The frontend does not have a separate `package.json`, so there are no frontend dependencies to install.

## Environment Setup

Create a `.env` file inside `backend` using [`backend/.env.example`](/C:/Users/Hp/Documents/Experitrust/backend/.env.example) as a guide.

Minimum required variables:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/experitrust
JWT_SECRET=your_secret_key
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:5173
```

Optional variables:

```env
CLOUDINAR_CLOUD_NAME=
CLOUDINAR_API_KEY=
CLOUDINAR_API_SECRET=

ADMIN_FULL_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## How To Run The Project

### 1. Start the backend

From the `backend` folder:

```bash
npm run dev
```

The backend should run on:

```text
http://localhost:5001
```

### 2. Start the frontend

Serve the `frontend` folder with a static server such as VS Code Live Server, then open:

```text
http://localhost:5500/frontend/index.html
```

or:

```text
http://127.0.0.1:5500/frontend/index.html
```

## Live Demo

- Frontend: `https://experitrust.netlify.app/`
- Backend API: `https://experitrust.onrender.com`

For moderators, the local setup steps above are still recommended if they want to inspect the full environment configuration and run the project end-to-end on their own machine.

## Frontend API Base

The frontend uses:

```text
http://<current-host>:5001/api
```

If needed, you can override it in the browser console:

```js
localStorage.setItem("experitrust_api_base", "http://localhost:5001/api");
```

To remove the override:

```js
localStorage.removeItem("experitrust_api_base");
```

## Admin Seeding

To create an admin account, set these values in `backend/.env`:

- `ADMIN_FULL_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `MONGODB_URI`

Then run:

```bash
cd backend
npm run seed:admin
```

## Main User Flows

### Student

- Sign up or log in
- Submit experiences
- Track verification status
- Browse jobs
- Apply for jobs

### Employer

- Log in
- Post jobs
- Review applicants
- Search candidates
- Schedule interviews

### Admin

- Log in through the seeded admin account
- Review pending experiences
- Verify or reject submissions
- View verified experiences and student records

## Tests

### Backend tests

From the `backend` folder:

```bash
npm test
```

### Frontend smoke test

From the repository root:

```bash
node --test frontend/test/smoke.test.js
```

## Troubleshooting

### Backend does not start

Check that:

- `backend/.env` exists
- `MONGODB_URI` is valid
- MongoDB is running
- dependencies were installed with `npm install`

### Browser CORS errors

Make sure the frontend URL is included in `ALLOWED_ORIGINS`.

### Login redirects back to login page

Check that:

- backend is running on port `5001`
- frontend is calling the correct API base
- cookies are enabled in the browser

## Assets

- Screenshots are available in the `Screenshots/` folder
- Figma: `https://www.figma.com/design/OtvUJceeilcPUilRI4cAEe/ExperiTrust?node-id=0-1&p=f&t=MUxBUenoVVA5g5tO-0`
- Demo video 1: `https://www.loom.com/share/b9b7e347cc14491a811d0b3a3ac2a22f`
- Demo video 2: `https://www.loom.com/share/9ca5ecea500c488580206af7fd494d54`
- Deployed frontend: `https://experitrust.netlify.app`

## Quick Commands

Install backend dependencies:

```bash
cd backend
npm install
```

Run backend:

```bash
cd backend
npm run dev
```

Seed admin:

```bash
cd backend
npm run seed:admin
```

Run backend tests:

```bash
cd backend
npm test
```

Run frontend smoke test:

```bash
node --test frontend/test/smoke.test.js
```
