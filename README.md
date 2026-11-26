# 🗳️ DigiVote — Secure Online Campus Voting Platform

A full-stack academic election platform built to handle secure, role-based digital voting — from voter registration through real-time result tabulation — built solo end-to-end.

---

## Overview

DigiVote is a campus voting system designed to digitize academic elections while enforcing strict voter identity validation, role-based access, and automated election lifecycle management. It covers the full election flow: registration, OTP-verified signup, balloting, live tabulation, and admin oversight.

---

## Key Features

- **Role-Based Access Control (RBAC)** — multi-tier permissions separating voters, candidates, and admins across registration, balloting, and tabulation phases
- **Secure authentication** — stateless JWT-based sessions combined with OTP verification at signup to enforce unique-voter validation and prevent duplicate registrations
- **Automated election lifecycle** — polls open and close automatically at scheduled times using Spring TaskScheduler, with no manual intervention needed
- **Admin control panel** — dynamic dashboard for managing candidate profiles, election configuration, and system logs for full voting transparency
- **Live result tabulation** — responsive frontend with real-time synchronization timers that render backend results instantly upon poll completion
- **Glassmorphic UI** — modern, responsive frontend design

---

## Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | React, Vite |
| **Backend** | Java, Spring Boot |
| **Database** | PostgreSQL |
| **Auth** | JWT, OTP |
| **Build Tool** | Maven |

---

## Architecture

```
                ┌─────────────────────┐
                │   React (Vite) UI    │
                │  Glassmorphic Frontend│
                └──────────┬───────────┘
                           │ REST API
                           ▼
                ┌─────────────────────┐
                │   Spring Boot Backend │
                │  ┌─────────────────┐ │
                │  │  RBAC + JWT Auth │ │
                │  ├─────────────────┤ │
                │  │  OTP Verification│ │
                │  ├─────────────────┤ │
                │  │ Spring TaskSched. │ │
                │  │ (Poll Open/Close) │ │
                │  └─────────────────┘ │
                └──────────┬───────────┘
                           ▼
                ┌─────────────────────┐
                │     PostgreSQL       │
                │  Voters / Candidates │
                │  / Elections / Votes │
                └─────────────────────┘
```

---

## Election Flow

1. **Registration** — voter signs up, identity confirmed via OTP
2. **Authentication** — JWT issued for the session, enforcing single-account-per-voter rules
3. **Balloting** — voters cast ballots during the scheduled open window
4. **Auto-close** — Spring TaskScheduler closes the poll automatically at the configured end time
5. **Tabulation** — results computed and rendered live on the frontend with synchronized timers
6. **Admin oversight** — election setup, candidate management, and audit logs available throughout

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL
- Maven

### Backend Setup

```bash
cd backend
mvn clean install
```

Configure your database and secrets in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/digivote
spring.datasource.username=your_username
spring.datasource.password=your_password
jwt.secret=your_jwt_secret
```

Run the backend:
```bash
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Status

Currently a locally-run full-stack project (not deployed to a public host). All core election flows — registration, OTP auth, balloting, scheduled poll lifecycle, and live tabulation — are functional end-to-end.

---

## Roadmap / Future Improvements

- Deploy to a public host (e.g. Render/Vercel + managed PostgreSQL)
- Add automated tests for auth and voting-integrity edge cases (duplicate votes, token replay)
- Support for multiple concurrent elections
- Audit-trail export for election transparency

---

## Author

**Siddanth Sarath**
B.Tech CSE, National Institute of Technology, Warangal
[GitHub](https://github.com/24csb0b71) · [LinkedIn](https://www.linkedin.com/in/siddanth-sarath-150887352/)
