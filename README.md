# Capacity and Point Management System

A full-stack web application developed for BOTAŞ's Transmission and Market Operations Department, covering the management of natural gas transmission points, daily capacity entries, reservations, and allocation processes.

## Features

### Shipper (User) Panel
- Create new points (name + maximum capacity)
- Track point approval status
- Submit daily capacity entries for approved points (available 08:00–17:30)
- Submit next-day (G+1) reserve entries
- View history and download records as PDF

### Carrier (Admin) Panel
- Approve/reject pending point requests
- Review pending capacity entries, along with related reserve data, and approve/reject them
- Run the daily allocation process (available 10:00–12:30, applies a 2.5x multiplier)
- Fetch summary reports and download PDF reports for a given date range

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL, JWT (authentication), bcrypt, pdfkit, chartjs-node-canvas

**Frontend:** React (Vite), React Router, Tailwind CSS, Axios

**Infrastructure:** Docker, Docker Compose

## Architecture

- **Role-Based Access Control (RBAC):** `admin` (carrier) and `user` (shipper) roles are carried in the JWT and verified on every request via middleware.
- **Approval workflows:** Both point creation and daily capacity entries go through admin approval.
- **Time windows:** Capacity/reserve entry is restricted to 08:00–17:30, and the allocation process is restricted to 10:00–12:30.

## Setup

### Requirements
- Docker & Docker Compose
- PostgreSQL (local installation)
- Node.js 20+ (if running without Docker)

### Environment Variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

Required variables:
```
DB_HOST=host.docker.internal
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
```

### Running with Docker

```bash
docker compose up -d --build
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### Running locally (without Docker)

**Backend:**
```bash
npm install
node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
proje_1/
├── config/           # Database connection
├── controllers/       # Business logic (auth, point, capacity, approval, allocation, reserve, report)
├── middleware/         # JWT verification and role checks
├── models/             # PostgreSQL queries
├── routes/             # API endpoint definitions
├── server.js
├── Dockerfile
├── docker-compose.yml
└── frontend/
    ├── src/
    │   ├── api/            # Axios instance
    │   ├── context/        # Auth context
    │   ├── pages/           # Login, Register, Admin/User Dashboard
    │   ├── components/      # Point, capacity, approval, allocation, report components
    │   └── routes/          # Protected route setup
    └── Dockerfile
```

## Developer's Note

This project was built by designing the system architecture and database relationships, planning the business workflows (approval processes, time windows, role-based routing), and implementing it with AI-assisted development.
