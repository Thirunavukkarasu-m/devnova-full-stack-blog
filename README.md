# DevNova — Complete Full-Stack Technology Blog Platform

> **Tagline:** *Explore. Learn. Build.*

DevNova is a modern, production-grade technology blogging platform and developer community platform where engineers, architects, and innovators read and publish technical articles, upload real images, search and filter content, react with likes, bookmark articles, engage in threaded discussions, follow authors, and access personalized author and administrative analytics dashboards.

---

## 🚀 Features

- **Developer-Centric Visual Identity**: Modern UI with dark/light mode persistence, glassmorphism cards, custom typography, code highlighting, and skeleton loaders.
- **Full Authentication System**:
  - Secure registration & login with Bcrypt password hashing.
  - JWT access tokens (short-lived) + refresh tokens with automatic token rotation.
  - Role-Based Access Control (RBAC): `USER`, `AUTHOR`, `ADMIN` with backend middleware enforcement.
  - Google OAuth 2.0 & GitHub OAuth 2.0 integration.
  - Password reset flow with cryptographic tokens and email dispatching.
- **Technical Blog Publishing Engine**:
  - Full article editor with live markdown preview, word count, and automatic reading-time calculation.
  - URL slug generation and validation.
  - Drafts, published posts, and archived states.
  - Real image upload integration (Cloudinary or local static storage fallback).
  - Categorization across technologies (FastAPI, React, Python, PostgreSQL, AI/ML, DevOps, Architecture, etc.).
  - Tag system with multi-tag filtering.
- **Community & Reader Engagement**:
  - Threaded comment system with nested replies, like reactions, and moderation reports.
  - Live like/unlike and bookmark/unbookmark system.
  - Debounced view tracking.
  - Author follow/unfollow system with live follower counts.
  - Real-time in-app notifications for reactions, comments, replies, and new articles.
  - Social sharing (Copy link, X, LinkedIn, WhatsApp, Facebook) with interactive feedback.
- **Personalized Dashboards**:
  - **Author Dashboard**: KPI cards, publication drafts/published management, views and likes trends over time (interactive SVG charts), recent article tracking.
  - **Admin Control Console**: Global platform telemetry, user management (search, filter, role reassignment, account activation/deactivation, removal), blog moderation, category lifecycle management, report processing, and platform-wide analytics.
- **Search & Filtering**:
  - Full-text backend search across title, content, excerpt, author, and tags.
  - Faceted filters (category, tag, author, sort by latest, oldest, most viewed, most liked).
  - Numbered pagination.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Routing**: React Router v6
- **Styling**: Bootstrap 5 + Bootstrap Icons + Custom DevNova Modern CSS Theme (No Tailwind CSS)
- **HTTP Client**: Centralized Axios with automatic Bearer token interceptor and 401 refresh queue

### Backend
- **Language**: Python 3.11+
- **Web Framework**: FastAPI (Asynchronous REST API)
- **Data Validation**: Pydantic V2 schemas (`pydantic>=2.6.4`)
- **ORM**: SQLAlchemy 2.0 (`sqlalchemy>=2.0.28`)
- **Database Migrations**: Alembic
- **Authentication**: Python-Jose (JWT HS256), Passlib (Bcrypt), OAuth 2.0
- **Image Storage**: Cloudinary SDK + Local Static Uploads Fallback
- **Testing**: Pytest + Starlette TestClient + HTTPX

### Database
- **Primary Target**: PostgreSQL (`psycopg2-binary`)
- **Development Fallback**: SQLite (`devnova.db` for instant local evaluation when PostgreSQL credentials are placeholder `xxxx`)

---

## 🏗️ Architecture

```
React (Vite)
     │
     ▼
Axios (Centralized Interceptors & Token Refresh Queue)
     │
     ▼
FastAPI REST API (/api/v1)
     │
     ├── OAuth 2.0 (Google / GitHub)
     ├── JWT Auth & Role Middleware (ADMIN, AUTHOR, USER)
     ├── Cloudinary / Local Image Storage
     │
     ▼
SQLAlchemy 2.0 ORM & Alembic Migrations
     │
     ▼
PostgreSQL Database (or dev SQLite fallback)
```

---

## 📂 Project Structure

```
Dev Nova/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic Settings & environment loader
│   │   │   ├── security.py         # Passlib hashing & JWT encoding/decoding
│   │   │   └── oauth.py            # Google & GitHub OAuth client helpers
│   │   ├── db/
│   │   │   ├── database.py         # SQLAlchemy engine & session factory
│   │   │   └── base.py             # Declarative Base metadata registry
│   │   ├── models/                 # SQLAlchemy database entities
│   │   │   ├── user.py             # User, SocialAccount, PasswordResetToken, RefreshToken
│   │   │   ├── profile.py          # Profile
│   │   │   ├── category.py         # Category
│   │   │   ├── tag.py              # Tag
│   │   │   ├── blog.py             # Blog, blog_tags association table
│   │   │   ├── comment.py          # Comment & CommentLike
│   │   │   ├── like.py             # BlogLike & CommentLike
│   │   │   ├── bookmark.py         # Bookmark
│   │   │   ├── follow.py           # Follow
│   │   │   ├── notification.py     # Notification
│   │   │   └── report.py           # Report
│   │   ├── schemas/                # Pydantic V2 input/output schemas
│   │   ├── routers/                # FastAPI endpoint controllers
│   │   │   ├── auth.py             # Registration, login, JWT refresh, OAuth
│   │   │   ├── users.py            # User profiles, follow system, author lists
│   │   │   ├── blogs.py            # Articles CRUD, views, likes, bookmarks, search
│   │   │   ├── comments.py         # Threaded comments, replies, reactions
│   │   │   ├── categories.py       # Categories & tracks
│   │   │   ├── tags.py             # Tags taxonomy
│   │   │   ├── notifications.py    # Notification inbox & read receipts
│   │   │   ├── admin.py            # User oversight, blog review, moderation
│   │   │   └── upload.py           # Real image upload handler
│   │   ├── services/               # Business logic & services
│   │   │   ├── auth_service.py     # Token rotation, credentials verification
│   │   │   ├── blog_service.py     # Reading-time, slug generation, tags sync
│   │   │   ├── email_service.py    # Password reset emailer (SMTP/Console)
│   │   │   ├── image_service.py    # Cloudinary & local storage coordinator
│   │   │   └── analytics_service.py# Author & platform telemetry calculators
│   │   ├── dependencies/
│   │   │   └── auth.py             # Current user, author, & admin dependencies
│   │   └── main.py                 # FastAPI application, CORS, static mounts
│   ├── alembic/                    # Database migration environment
│   │   ├── versions/               # Generated migration scripts
│   │   └── env.py                  # Alembic runtime configuration
│   ├── tests/
│   │   └── test_api.py             # Comprehensive Pytest test suite
│   ├── uploads/                    # Local storage fallback directory
│   ├── requirements.txt            # Python dependencies
│   ├── seed.py                     # Rich technical seed script
│   ├── alembic.ini                 # Alembic configuration file
│   ├── .env.example                # Backend environment template
│   └── .env                        # Local backend environment
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.jsx          # Brand, search, notifications, theme toggle
│   │   │   ├── Footer.jsx          # Brand, categories, dispatch newsletter
│   │   │   ├── BlogCard.jsx        # Article card with interactions
│   │   │   ├── BlogList.jsx        # Responsive grid with skeletons & empty state
│   │   │   ├── CommentSection.jsx  # Nested comments with reply & report dialogs
│   │   │   ├── SearchBar.jsx       # Keyword search input
│   │   │   ├── Pagination.jsx      # Numbered pagination component
│   │   │   ├── ProtectedRoute.jsx  # Authenticated route guard
│   │   │   ├── AdminRoute.jsx      # Admin role route guard
│   │   │   └── Skeleton.jsx        # Shimmer skeleton loaders
│   │   ├── pages/                  # Public and view pages
│   │   │   ├── Home.jsx            # Hero, featured posts, categories, authors
│   │   │   ├── Explore.jsx         # Faceted filters, tag pills, sorting
│   │   │   ├── BlogDetails.jsx     # Full article, author card, reactions, share
│   │   │   ├── Category.jsx        # Category header and related articles
│   │   │   ├── Search.jsx          # Full search query results
│   │   │   ├── Login.jsx           # Email/password & Google/GitHub OAuth
│   │   │   ├── Register.jsx        # Full signup with image upload and bio
│   │   │   ├── ForgotPassword.jsx  # Recovery email request
│   │   │   ├── ResetPassword.jsx   # Token-based password renewal
│   │   │   ├── Profile.jsx         # Public developer profile & statistics
│   │   │   ├── CreateBlog.jsx      # Technical article editor with live preview
│   │   │   ├── EditBlog.jsx        # Article update editor
│   │   │   ├── Bookmarks.jsx       # User saved reading list
│   │   │   └── NotFound.jsx        # 404 error page
│   │   ├── dashboard/              # Author and User dashboard
│   │   │   ├── DashboardLayout.jsx # Dashboard sidebar layout
│   │   │   ├── Dashboard.jsx       # KPI cards, trend charts, recent blogs
│   │   │   ├── MyBlogs.jsx         # Articles table with status filters
│   │   │   ├── Analytics.jsx       # Author analytics & engagement charts
│   │   │   ├── Notifications.jsx   # Notifications inbox
│   │   │   ├── ProfileSettings.jsx # Profile edit, avatar upload, bio, links
│   │   │   └── Settings.jsx        # Appearance theme toggle & account info
│   │   ├── admin/                  # Admin Control Console
│   │   │   ├── AdminLayout.jsx     # Admin sidebar layout
│   │   │   ├── AdminDashboard.jsx  # Platform KPI overview
│   │   │   ├── Users.jsx           # User management, role switching, disable
│   │   │   ├── Blogs.jsx           # Blog moderation, status switching, deletion
│   │   │   ├── Categories.jsx      # Category creation, editing, safe deletion
│   │   │   ├── Reports.jsx         # Report moderation (resolve/reject)
│   │   │   └── Analytics.jsx       # Platform analytics & growth trends
│   │   ├── services/               # API clients
│   │   │   ├── api.js              # Centralized Axios with JWT interceptors
│   │   │   ├── authApi.js          # Authentication service calls
│   │   │   ├── blogApi.js          # Blog, comment, category, and upload calls
│   │   │   ├── userApi.js          # User profile, follow, and notification calls
│   │   │   └── adminApi.js         # Administration endpoint calls
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User state, login, register, logout
│   │   │   └── ThemeContext.jsx    # Dark/light theme provider
│   │   ├── utils/
│   │   │   └── helpers.js          # Date, number, and initials formatting
│   │   ├── App.jsx                 # Route definition
│   │   ├── main.jsx                # Application entrypoint
│   │   └── index.css               # Global developer styling and themes
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── README.md
└── .gitignore
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create `backend/.env` based on `backend/.env.example`:

```env
# Database Connection (Replace xxxx with PostgreSQL credentials)
DATABASE_URL=postgresql://postgres:xxxx@localhost:5432/devnova

# JWT Security
SECRET_KEY=xxxx
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# OAuth 2.0 Credentials (Replace xxxx with Google Cloud / GitHub Developer credentials)
GOOGLE_CLIENT_ID=xxxx
GOOGLE_CLIENT_SECRET=xxxx
GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx

# Cloudinary Real Image Storage (Replace xxxx with Cloudinary credentials)
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

# Email / SMTP Configuration (Replace xxxx with SMTP credentials)
SMTP_HOST=xxxx
SMTP_PORT=587
SMTP_USERNAME=xxxx
SMTP_PASSWORD=xxxx
SMTP_FROM_EMAIL=xxxx

# Service URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

> **Smart Local Fallback**: If `CLOUDINARY_*` or `DATABASE_URL` contain placeholder credentials `xxxx`, DevNova gracefully falls back to local static image storage in `backend/uploads/` and local SQLite `devnova.db`. Once valid PostgreSQL and Cloudinary credentials are provided, it automatically connects to them!

### Frontend (`frontend/.env`)
Create `frontend/.env` based on `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

---

## 🐘 PostgreSQL Setup

1. Install PostgreSQL and start the service:
   ```bash
   # Windows (via Services or installer)
   net start postgresql-x64-16
   ```
2. Create the `devnova` database:
   ```sql
   CREATE DATABASE devnova;
   ```
3. Update `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/devnova
   ```

---

## 📦 Installation & Setup

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed database with realistic technical articles, authors, and categories
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite React development server
npm run dev
```

The frontend will run at `http://localhost:5173`.
The backend REST API will run at `http://localhost:8000`.

---

## 🔑 Default Seed Credentials

After running `python seed.py`, the following demo accounts are available:

| Role | Username | Email | Password |
|---|---|---|---|
| **ADMIN** | `devnova_admin` | `admin@devnova.io` | `Password@123` |
| **AUTHOR** | `alex_rivera` | `alex.rivera@devnova.io` | `Password@123` |
| **AUTHOR** | `sophia_chen` | `sophia.chen@devnova.io` | `Password@123` |
| **AUTHOR** | `marcus_vance` | `marcus.vance@devnova.io` | `Password@123` |
| **USER** | `elena_r` | `elena.rostova@devnova.io` | `Password@123` |

---

## 🌐 OAuth 2.0 Configuration

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Set Authorized Redirect URI: `http://localhost:5173/login`
4. Add client credentials to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### GitHub OAuth
1. Go to **GitHub Settings > Developer Settings > OAuth Apps**.
2. Register a new OAuth application.
3. Set Authorization Callback URL: `http://localhost:5173/login`
4. Add client credentials to `backend/.env`:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

---

## 📸 Real Image Storage Setup (Cloudinary)

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/).
2. Copy your Cloud Name, API Key, and API Secret from the Cloudinary dashboard.
3. Add credentials to `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

When uploaded, user photos and blog covers are uploaded to Cloudinary. In development mode without Cloudinary credentials, images are uploaded directly to `backend/uploads/` and served at `http://localhost:8000/uploads/...`.

---

## 🧪 Testing

Run automated tests using Pytest:

```bash
cd backend
.\venv\Scripts\pytest -v tests
```

The test suite covers:
- API health check
- Categories & tags retrieval
- Article listing, category filtering, and keyword search
- User registration, login, and `/api/auth/me` verification
- Admin login and telemetry access
- Full Blog CRUD lifecycle (creation, details, update, like, bookmark, comment, delete)

---

## 📖 API Documentation

Interactive OpenAPI / Swagger documentation is generated automatically by FastAPI:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🚀 Deployment

- **Backend**: Can be containerized with Docker and deployed to AWS ECS, GCP Cloud Run, or Render with PostgreSQL (e.g., Supabase / RDS).
- **Frontend**: Can be built with `npm run build` and deployed to Vercel, Netlify, or AWS S3 + CloudFront.

---

## 📜 License

MIT License. Designed and built for the developer community.
Explore. Learn. Build.
