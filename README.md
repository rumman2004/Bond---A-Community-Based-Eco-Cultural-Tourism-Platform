<div align="center">

# 🌿 Bond
### A Community-Based Eco-Cultural Tourism Platform

*Connecting conscious travellers with authentic local communities.*

[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

1. [About the Project](#-about-the-project)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture Overview](#-architecture-overview)
5. [Role System](#-role-system)
6. [API Reference](#-api-reference)
7. [Database Schema](#-database-schema)
8. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Clone the Repository](#clone-the-repository)
   - [Server Setup](#server-setup)
   - [Client Setup](#client-setup)
   - [Database Setup](#database-setup)
9. [Environment Variables](#-environment-variables)
10. [Project Structure](#-project-structure)
11. [Scripts](#-scripts)
12. [Status Enums](#-status-enums)
13. [Contributing](#-contributing)
14. [License](#-license)

---

## 🌍 About the Project

**Bond** is a full-stack, role-based eco-cultural tourism web platform built to bridge the gap between responsible travellers and indigenous or rural communities. It allows local communities to list unique cultural experiences, tourists to discover and book them, and platform administrators and security officers to oversee quality and safety.

The platform is designed with a strong emphasis on:
- **Sustainability** — communities can tag experiences with sustainability attributes.
- **Authenticity** — community profiles are verified by security officers before going live.
- **Trust & Safety** — a dedicated security module enables real-time moderation of users, experiences, and reports.
- **Earnings Transparency** — community hosts can track booking-based earnings from their dashboard.

---

## ✨ Key Features

### 🧳 For Tourists
- Browse and search cultural experiences on an interactive map
- Book experiences and track booking history & status
- Leave reviews and ratings for experiences
- Save favourites and manage personal interests
- Receive in-app notifications for booking updates

### 🏘️ For Community Hosts
- Register and set up a verified community profile
- Create, publish, and manage cultural experiences
- Accept or decline tourist bookings
- Share cultural stories and photo journals
- View earnings and payout breakdown

### 🛡️ For Security Officers
- Review and verify/reject new community registrations
- Monitor and moderate user accounts (flag / suspend / reinstate)
- Monitor and moderate experiences (flag / approve / suspend)
- Handle user-submitted reports (assign / resolve / dismiss)
- Access a centralised security dashboard with live stats

### ⚙️ For Admins
- Full user management (create, update, delete, role changes)
- Manage and promote/demote security officers
- View platform-wide analytics
- Access complete activity & audit logs
- Generate and export reports

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router v7 |
| **Animations** | GSAP 3 |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express 5 |
| **Database** | PostgreSQL (hosted on Supabase) |
| **Authentication** | JWT (Access + Refresh tokens), HTTP-only cookies |
| **File Uploads** | Multer (memory storage) → Cloudinary |
| **Email** | Nodemailer (SMTP / Gmail) |
| **Security** | Helmet, CORS, express-rate-limit, bcrypt |
| **Logging** | Winston + Morgan |
| **Validation** | express-validator |

---

## 🏛️ Architecture Overview

```
Bond/
├── client/          ← React + Vite frontend (SPA)
├── server/          ← Node.js + Express REST API
└── database/        ← SQL schema, migrations, seeders & views
```

The frontend communicates exclusively with the backend REST API over `VITE_API_BASE_URL` (default `http://localhost:5000/api`). The backend connects to a PostgreSQL database provisioned on Supabase with SSL enabled.

```
Browser (React SPA)
      │  HTTP/JSON
      ▼
Express REST API  (:5000/api)
      │
      ├── JWT Auth Middleware
      ├── Role Middleware (tourist | community | security | admin)
      ├── Rate Limiter
      └── Controllers → Models → Supabase PostgreSQL
                              └── Cloudinary (media uploads)
                              └── Nodemailer (transactional email)
```

---

## 👥 Role System

Bond uses a four-role access control system enforced both on the frontend (role-based routes) and backend (role middleware):

| Role | Description | Dashboard |
|---|---|---|
| `tourist` | End traveller — browse, book, review | `TouristLayout` |
| `community` | Local host — manage experiences & bookings | `CommunityLayout` |
| `security` | Platform moderator — verify & moderate | `SecurityLayout` |
| `admin` | Platform administrator — full control | `AdminLayout` |

Each role has a dedicated layout, navbar, sidebar (where applicable), and a completely isolated set of routes.

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login and receive access + refresh tokens |
| `POST` | `/auth/refresh` | No | Refresh the access token using the refresh token |
| `POST` | `/auth/logout` | Yes | Invalidate session and clear cookies |
| `POST` | `/auth/forgot-password` | No | Send password reset email |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | Yes | Get current user profile |
| `PUT` | `/users/me` | Yes | Update current user profile |
| `PUT` | `/users/me/avatar` | Yes | Upload/update profile avatar |

### Communities — `/api/communities`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/communities` | No | List all verified communities |
| `GET` | `/communities/:id` | No | Get a single community |
| `POST` | `/communities` | community | Create/register a community |
| `PUT` | `/communities/:id` | community | Update community profile |

### Experiences — `/api/experiences`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/experiences` | No | List published experiences |
| `GET` | `/experiences/:id` | No | Get experience details |
| `POST` | `/experiences` | community | Create a new experience |
| `PUT` | `/experiences/:id` | community | Update an experience |
| `DELETE` | `/experiences/:id` | community | Delete an experience |

### Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/bookings` | tourist | Create a booking |
| `GET` | `/bookings/my` | tourist | Get tourist's booking history |
| `GET` | `/bookings/incoming` | community | Get incoming bookings for host |
| `PATCH` | `/bookings/:id/status` | community | Accept or decline a booking |
| `PATCH` | `/bookings/:id/cancel` | tourist | Cancel a booking |

### Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/reviews` | tourist | Submit a review |
| `GET` | `/reviews/experience/:id` | No | Get reviews for an experience |

### Reports — `/api/reports`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/reports` | Yes | Submit a report |
| `GET` | `/reports` | security \| admin | List all reports |
| `PATCH` | `/reports/:id/assign` | security \| admin | Assign a report |
| `PATCH` | `/reports/:id/resolve` | security \| admin | Resolve a report |
| `PATCH` | `/reports/:id/dismiss` | security \| admin | Dismiss a report |

### Stories — `/api/stories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/stories` | No | Browse community stories |
| `POST` | `/stories` | community | Publish a story |
| `PUT` | `/stories/:id` | community | Edit a story |
| `DELETE` | `/stories/:id` | community | Delete a story |

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | Yes | List user notifications |
| `PATCH` | `/notifications/:id/read` | Yes | Mark notification as read |

### Upload — `/api/upload`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/upload/image` | Yes | Upload image to Cloudinary |

### Security — `/api/security` *(security \| admin only)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/security/stats` | Dashboard statistics |
| `GET` | `/security/communities/pending` | List pending communities |
| `GET` | `/security/communities/:id` | Get community detail |
| `PATCH` | `/security/communities/:id/verify` | Approve a community |
| `PATCH` | `/security/communities/:id/reject` | Reject a community |
| `GET` | `/security/users` | List all users (filterable) |
| `GET` | `/security/users/suspended` | List suspended users |
| `PATCH` | `/security/users/:id/flag` | Flag a user account |
| `PATCH` | `/security/users/:id/suspend` | Suspend a user account |
| `PATCH` | `/security/users/:id/unsuspend` | Reinstate a user account |
| `GET` | `/security/experiences` | List all experiences (filterable) |
| `PATCH` | `/security/experiences/:id/flag` | Flag an experience |
| `PATCH` | `/security/experiences/:id/approve` | Approve an experience |
| `PATCH` | `/security/experiences/:id/suspend` | Suspend an experience |

### Admin — `/api/admin` *(admin only)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/users` | List all platform users |
| `PUT` | `/admin/users/:id` | Update any user |
| `DELETE` | `/admin/users/:id` | Remove a user |
| `GET` | `/admin/analytics` | Platform-wide analytics |
| `GET` | `/admin/logs` | Activity & audit logs |
| `GET` | `/admin/reports` | All reports overview |

---

## 🗄️ Database Schema

The database consists of **11 tables** with PostgreSQL ENUM types for status fields.

```
users
communities
experiences
bookings
reviews
stories
reports
favorites
messages
logs
notifications
```

### Key ENUM Types

| Type | Values |
|---|---|
| `user_status` | `active`, `suspended`, `banned`, `pending`, `flagged` |
| `community_status` | `pending`, `verified`, `rejected` |
| `experience_status` | `draft`, `active`, `paused`, `archived` |
| `report_status` | `open`, `assigned`, `resolved`, `dismissed` |

### PostgreSQL Functions & Triggers

| File | Purpose |
|---|---|
| `booking_status_trigger.sql` | Auto-updates booking status on changes |
| `rating_average.sql` | Recalculates experience rating on review insert/delete |
| `update_timestamp.sql` | Auto-updates `updated_at` on any row change |

### Computed Views

| View | Description |
|---|---|
| `booking_summary` | Aggregated booking data per community |
| `popular_experiences` | Experiences ranked by bookings and rating |
| `top_communities` | Communities ranked by revenue and reviews |

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed on your system:

| Tool | Version |
|---|---|
| Node.js | v18+ |
| npm | v9+ |
| Git | Latest |

You will also need accounts for:
- **[Supabase](https://supabase.com)** — PostgreSQL database hosting
- **[Cloudinary](https://cloudinary.com)** — Image and media CDN
- **Gmail** (or any SMTP provider) — Transactional email

---

### Clone the Repository

```bash
git clone https://github.com/rumman2004/Bond---A-Community-Based-Eco-Cultural-Tourism-Platform.git
cd Bond---A-Community-Based-Eco-Cultural-Tourism-Platform
```

---

### Server Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Copy the environment template and fill in your values
cp .env.example .env
```

> Edit `server/.env` with your Supabase, Cloudinary, JWT and SMTP credentials (see [Environment Variables](#-environment-variables) below).

```bash
# Start the development server (with hot reload via nodemon)
npm run dev
```

The API will be available at **`http://localhost:5000`**.

---

### Client Setup

Open a **new terminal** and run:

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

> Edit `client/.env` if your backend is running on a different port.

```bash
# Start the Vite development server
npm run dev
```

The frontend will be available at **`http://localhost:5173`**.

---

### Database Setup

1. Go to your [Supabase dashboard](https://supabase.com/dashboard) and open the **SQL Editor**.
2. For a **fresh installation**, paste and run `database/full_setup.sql`. This runs the full schema and seeds sample data in one shot.
3. For **incremental changes only**, run the numbered files inside `database/migrations/` in order (`001_` → `005_`).
4. To **reset** the database completely, run `database/reset.sql` first, then re-run the setup.

---

## 🔐 Environment Variables

### `server/.env`

```env
# ── Server ────────────────────────────────────────────────────
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# ── Database (Supabase PostgreSQL) ────────────────────────────
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
DB_HOST=db.[PROJECT_ID].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR_DB_PASSWORD]
DB_SSL=true

# ── JWT ───────────────────────────────────────────────────────
JWT_SECRET=your_strong_jwt_secret_here
JWT_REFRESH_SECRET=your_strong_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Cloudinary ────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Email (SMTP) ──────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
EMAIL_FROM=Bond <no-reply@bond.com>
```

> ⚠️ **Never commit your real `.env` file.** Only `.env.example` should be tracked by Git.

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

<details>
<summary><strong>client/</strong> — React + Vite frontend</summary>

```
client/src/
├── components/
│   ├── common/          # Shared cross-feature components (Explore)
│   ├── features/        # Feature-specific components
│   │   ├── auth/        # LoginForm, RegisterForm
│   │   ├── booking/     # BookingCard, BookingForm, PaymentForm…
│   │   ├── chat/        # ChatBox, MessageList
│   │   ├── community/   # CommunityCard, CommunityProfile…
│   │   ├── experience/  # ExperienceCard, ExperienceDetails…
│   │   ├── map/         # MapView, LocationPicker, CommunityMarker
│   │   ├── notification/# NotificationBell, NotificationList
│   │   ├── report/      # ReportForm, ReportList
│   │   ├── review/      # ReviewCard, ReviewForm, RatingStars
│   │   └── story/       # StoryCard, StoryEditor, StoryFeed
│   ├── layouts/         # Role-based layouts with GSAP sidebars
│   ├── sections/        # Landing page sections (Hero, CTA…)
│   └── ui/              # Design system components (Button, Card…)
│
├── context/             # React Context (Auth, Theme, Toast)
├── hooks/               # Custom hooks (useAuth, useFetch, useMap…)
├── pages/               # Page components grouped by role
│   ├── admin/
│   ├── auth/
│   ├── community/
│   ├── public/
│   ├── security/
│   └── tourist/
├── routes/              # Role-based route guards
├── services/            # Axios API wrappers (one file per domain)
├── store/               # Zustand global stores
└── utils/               # Helpers (formatters, validators, tokenUtils…)
```

</details>

<details>
<summary><strong>server/</strong> — Node.js + Express API</summary>

```
server/src/
├── config/              # Cloudinary, CORS, DB pool, env validation
├── controllers/         # Request handlers (one per domain)
├── middlewares/         # Auth, role, rate-limit, upload, error handler
├── models/              # Raw SQL query functions (no ORM)
├── routes/              # Express routers (aggregated in index.js)
├── services/            # Business logic (email, upload, analytics…)
├── utils/               # ApiError, ApiResponse, asyncHandler, logger
└── validators/          # express-validator rule sets
```

</details>

<details>
<summary><strong>database/</strong> — PostgreSQL SQL files</summary>

```
database/
├── schema/              # Table definitions (01_users.sql … 11_notifications.sql)
├── migrations/          # Incremental ALTER TABLE changes (001 … 005)
├── seeders/             # Sample data for all tables
├── functions/           # PG functions & triggers
├── views/               # Computed SQL views
├── queries/             # Utility queries (analytics, reports)
├── full_setup.sql       # One-shot: schema + seeds
└── reset.sql            # Drop all types & tables
```

</details>

---

## 📜 Scripts

### Server

| Command | Description |
|---|---|
| `npm run dev` | Start with `nodemon` (hot reload) |
| `npm start` | Start in production mode |

### Client

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production (`dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🔖 Status Enums

| Entity | Database Values | Notes |
|---|---|---|
| **User** | `active`, `suspended`, `banned`, `pending`, `flagged` | `pending` = registered but unverified |
| **Community** | `pending`, `verified`, `rejected` | Must be `verified` to appear publicly |
| **Experience** | `draft`, `active`, `paused`, `archived` | Only `active` experiences are bookable |
| **Report** | `open`, `assigned`, `resolved`, `dismissed` | Lifecycle managed by security officers |
| **Booking** | Managed by trigger | Auto-updated on status change |

---

## 🤝 Contributing

Contributions, bug reports and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <strong>Rumman Ahmed & Ashis Chetia & Naman Burakia</strong> &nbsp;·&nbsp; BCA Final Year Project — April 2026

  Profiles:
  - Rumman Ahmed: https://github.com/rumman2004 
  - Ashis Chetia: https://github.com/AshisChetia07
  - Naman Burakia: https://github.com/Naman2004
</div>
