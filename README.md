# ⚡ PadelPro — Tournament Management Platform

A full-stack web application for managing padel tournaments, built with **React.js + Node.js + MongoDB**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), Bootstrap 5, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) + bcryptjs |

---

## Pages (12 total — 4 students × 3 pages each)

| # | Page | Route | Description |
|---|------|-------|-------------|
| 1 | Home | `/` | Landing page with features, categories, how-it-works |
| 2 | Login | `/login` | Login form with validation |
| 3 | Register | `/register` | Registration form with validation |
| 4 | Dashboard | `/dashboard` | Player stats, points history, my tournaments |
| 5 | Tournaments | `/tournaments` | Browse & filter all tournaments, register to join |
| 6 | Tournament Detail | `/tournaments/:id` | Full details, bracket, registered players |
| 7 | Leaderboard | `/leaderboard` | Global rankings with podium display |
| 8 | Profile | `/profile` | Edit profile, view full points history |
| 9 | Admin Dashboard | `/admin` | Platform stats, category breakdown, quick actions |
| 10 | Admin — Players | `/admin/players` | Search players, award points manually |
| 11 | Admin — Tournaments | `/admin/tournaments` | Create, start, and complete tournaments |
| 12 | Admin — Matches | `/admin/matches` | Record match results per tournament |

---

## Features

- **Authentication** — JWT-based login/register with protected routes
- **Player Categories** — Beginner (0–499 pts), D (500–1199 pts), C (1200+ pts)
- **2v2 Partner Registration** — Players register as a team; category eligibility based on average points of both players
- **Points System** — Automatic points award on tournament completion
- **Leaderboard** — Real-time global rankings with podium
- **Admin Panel** — Full CRUD for tournaments, matches, manual point awards
- **Responsive** — Works on desktop, tablet, and mobile (Bootstrap 5)
- **Form Validation** — All forms validated on both frontend and backend

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local install or MongoDB Atlas free tier)

---

### 1. Clone / open the project folder

```
padel/
├── backend/
└── frontend/
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` if needed (default uses local MongoDB):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/padelpro
JWT_SECRET=padelpro_secret_key_2024
```

**Seed the database with demo data:**
```bash
node seed.js
```

**Start the backend server:**
```bash
npm run dev        # with nodemon (auto-restart)
# or
npm start          # with node
```

Server runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:3000`

---

### 4. Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@padel.com | admin |
| Rank 1 — C (2800 pts) | seddik@padel.com | 123 |
| Player C (1450 pts) | badea@padel.com | 123 |
| Player D (1100 pts) | yakout@padel.com | 123 |
| Beginner (380 pts) | nader@padel.com | 123 |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | All players (leaderboard) |
| GET | `/api/users/me` | Current user profile |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/users/:id/history` | Player points history |
| POST | `/api/users/:id/award` | Award points (admin only) |

### Tournaments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tournaments` | All tournaments |
| GET | `/api/tournaments/:id` | Single tournament |
| POST | `/api/tournaments` | Create tournament (admin) |
| PUT | `/api/tournaments/:id/status` | Update status (admin) |
| POST | `/api/tournaments/:id/complete` | Complete & award points (admin) |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | All matches (filter by tournament) |
| POST | `/api/matches` | Add match result (admin) |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/registrations` | All registrations (filter by tournament/player) |
| POST | `/api/registrations` | Register current user for tournament |

---

## Project Structure

```
padel/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Tournament.js
│   │   ├── Match.js
│   │   ├── Registration.js
│   │   └── PointsHistory.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── tournaments.js
│   │   ├── matches.js
│   │   └── registrations.js
│   ├── .env
│   ├── package.json
│   ├── seed.js                  # Demo data seeder
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── Footer.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Tournaments.jsx
    │   │   ├── TournamentDetail.jsx
    │   │   ├── Leaderboard.jsx
    │   │   ├── Profile.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminPlayers.jsx
    │   │   ├── AdminTournaments.jsx
    │   │   └── AdminMatches.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```
