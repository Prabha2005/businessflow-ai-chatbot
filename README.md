# BusinessFlow AI - Cloud Infrastructure & Conversational AI Platform

[![React](https://img.shields.io/badge/React-18%2F19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-MariaDB-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-v1beta-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**BusinessFlow AI** is a full-stack enterprise cloud services management platform with an integrated, context-aware AI assistant powered by Google Gemini. The platform allows businesses and clients to explore enterprise cloud infrastructure (Web Hosting, Cloud Storage, and Professional Business Email), manage active subscriptions, track resource usage, and interact in real-time with an intelligent AI chatbot that understands user accounts, service tiers, and pricing.

---

## 🌐 Live Demo & Testing Credentials

- **Live Application URL**: [https://businessflowai.freedev.app](https://businessflowai.freedev.app)

### Demo Testing Account

The live application is available at the link above. For account-specific features, sign in with an authorized demo account or create a test account through the registration page.

Do not use real personal information or production credentials when testing the application.
You can sign in using this pre-configured demonstration account to retrieve existing profile data, manage subscriptions, and test the context-aware AI assistant:

| Field | Credentials |
| :--- | :--- |
| **Email** | `demouser@domain.com` |
| **Password** | `DemoUser1` |

> [!TIP]
> After logging in with these credentials, open the AI assistant drawer to test account-aware inquiries:
> - *"Which plan am I using?"*
> - *"What are my active subscriptions?"*
> - *"Tell me about my renewal date."*

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                              Client Layer (React / Vite)                          |
|  - Cloud Catalog Grid       - Split & Modal Auth       - Customer Dashboard       |
|  - Plan Explorer            - Real-time Floating AI Chatbot Drawer                |
+-----------------------------------------------------------------------------------+
                                        |
                            HTTP / REST (JSON with CORS)
                                        v
+-----------------------------------------------------------------------------------+
|                            Backend Gateway (PHP 8.2+)                             |
|  - cors.php             : Origin whitelist, SameSite=None credentials        |
|  - api/login.php / register : Bcrypt password verify, secure session state       |
|  - api/subscriptions.php    : User plan retrieval & simulated usage metrics       |
|  - api/services.php         : Dynamic catalog endpoints                           |
+-----------------------------------------------------------------------------------+
                  |                                             |
                  v                                             v
+----------------------------------+          +-------------------------------------+
|        Database (MySQL)          |          |     Google Gemini API (v1beta)      |
|  - users (id, email, hash)       |          |  - gemini-3-flash-preview (Primary) |
|  - subscriptions (plan, pricing) |          |  - gemini-3.1-flash-lite (Fallback) |
|  - PDO prepared statements       |          |  - Multi-tier retry & quota safety  |
+----------------------------------+          +-------------------------------------+
```

---

## Key Features

### 1. Interactive Cloud Infrastructure Suite
- **Web Hosting**: NVMe storage plans, SSL encryption, cPanel dashboards, and automated backup specs.
- **Cloud Storage**: Scalable encrypted object storage, access tokens, and collaborative quotas.
- **Business Email**: Custom domain relays, anti-spam filters, and storage allocations.
- **Interactive Detail Pages**: Full specification breakdown, pay-as-you-go rules, and sample invoice projections.

### 2. Context-Aware AI Chatbot
- **Account-Aware Intelligence**: Recognizes logged-in users and answers personalized questions (e.g., *"Which plan am I using?"*, *"What are my storage limits?"*).
- **Service Catalog Knowledge**: Explains base prices, add-on costs, and feature comparisons.
- **Resilient AI Pipeline**: Automatically falls back between Gemini models (`gemini-3-flash-preview`, `gemini-3.1-flash-lite-preview`) to prevent downtime during rate limits.
- **Unicode & Markdown Sanitization**: Automatically strips messy Markdown syntax into clean bullets (`•`) and arrows (`→`).

### 3. Authentication & Security
- **Bcrypt Hashing**: Passwords stored using industry-standard PHP `password_hash()`.
- **Session Protection**: Hardened cookies with `SameSite=None`, `Secure`, and `HttpOnly`.
- **Cross-Origin Resource Sharing (CORS)**: Strict origin validation supporting local development and remote deployments.
- **SQL Injection Prevention**: 100% parameterized queries via PDO.

### 4. Customer Dashboard
- Real-time display of subscribed cloud services, plan names, billing frequencies, and renewal dates.
- Interactive usage gauges and quick-action shortcuts to service management.

---

## Repository Structure

```text
businessflow-ai/
├── frontend/                     # React + Vite Single Page Application
│   ├── public/                   # Static icons and vector graphics
│   ├── src/
│   │   ├── components/           # Modular UI Components
│   │   │   ├── AppHeader.jsx          # Top navigation & session status
│   │   │   ├── AuthModal.jsx          # Overlay sign-in & sign-up modal
│   │   │   ├── AuthPage.jsx           # Dedicated split-screen auth view
│   │   │   ├── ChatbotLauncher.jsx    # Floating trigger button
│   │   │   ├── ChatbotPanel.jsx       # Floating conversation drawer
│   │   │   ├── DashboardView.jsx      # Subscriptions & metrics dashboard
│   │   │   ├── ServiceDetailPage.jsx  # Detailed specifications & plan picker
│   │   │   └── ServicesSection.jsx    # Interactive services catalog
│   │   ├── services/             # API client handlers
│   │   │   ├── authApi.js             # Authentication endpoints
│   │   │   ├── chatApi.js             # Chatbot request handling
│   │   │   ├── serviceApi.js          # Service catalog loader
│   │   │   ├── serviceCatalog.js      # Authoritative catalog definition
│   │   │   └── subscriptionApi.js     # Subscription querying
│   │   ├── App.css               # Component styling and design tokens
│   │   ├── App.jsx               # Main state controller & router
│   │   ├── index.css             # Global reset and typography
│   │   └── main.jsx              # React DOM initialization
│   ├── .env.example              # Frontend environment variables template
│   ├── index.html                # Vite HTML shell
│   ├── package.json              # Dependencies and build scripts
│   └── vite.config.js            # Vite configuration
│
├── backend/                      # PHP REST API Backend
│   ├── api/
│   │   ├── .htaccess             # URL rewrites and server security rules
│   │   ├── assistant.php         # AI chatbot conversation engine (Gemini)
│   │   ├── chat.php              # Chat routing endpoint
│   │   ├── cors.php              # CORS origin validation and session headers
│   │   ├── login.php             # User authentication handler
│   │   ├── logout.php            # Session invalidation handler
│   │   ├── me.php                # Authenticated session user verification
│   │   ├── register.php          # User registration and password hashing
│   │   ├── services.php          # Service catalog endpoint
│   │   └── subscriptions.php     # User active subscriptions endpoint
│   ├── businessflow_db_public.sql # Database schema (no user records)
│   ├── config.php                # Environment loader (Gemini & API credentials)
│   ├── db.php                    # PDO database connection setup
│   └── .env.example              # Backend environment template
│
├── .gitignore                    # Git ignore file (excludes secrets & dependencies)
└── README.md                     # Project documentation
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/login.php` | Authenticates user with email and password, creates session cookie |
| `POST` | `/api/register.php` | Creates a new user account with bcrypt password hashing |
| `GET` | `/api/me.php` | Returns currently logged-in user profile from active session |
| `POST` | `/api/logout.php` | Destroys current user session |
| `GET` | `/api/services.php` | Returns available cloud services and pricing tiers |
| `GET` | `/api/subscriptions.php` | Fetches active subscriptions for the authenticated user |
| `POST` | `/api/assistant.php` | Submits user message to Google Gemini AI and returns contextual reply |

---

## Database Setup

1. Open your MySQL administration tool (e.g., **phpMyAdmin** in XAMPP).
2. Create a database named `businessflow_db`:
   ```sql
   CREATE DATABASE businessflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import the provided schema file:
   ```text
   backend/businessflow_db_public.sql
   ```

---

## Local Development Setup

### 1. Backend Setup (XAMPP / PHP)
1. Place the backend project inside your server root (e.g., `C:\xampp\htdocs\businessflow-api`).
2. Copy `backend/.env.example` to `backend/.env`:
   ```ini
   DB_HOST=localhost
   DB_NAME=businessflow_db
   DB_USER=root
   DB_PASS=
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```
3. Start **Apache** and **MySQL** in the XAMPP Control Panel.
4. Verify backend health by visiting:
   ```text
   http://localhost/businessflow-api/api/services.php
   ```

### 2. Frontend Setup (React / Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create a local environment file:
   ```bash
   cp .env.example .env
   ```
3. Set the backend URL in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost/businessflow-api/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:5173`.

---

## Production Deployment

### Live Frontend (InfinityFree / Static Hosting)
1. Run `npm run build` inside `frontend/`.
2. Upload the contents of `frontend/dist/` (`index.html` and the `assets/` folder) directly to the public web root (`htdocs/`).

### Live Backend (PHP Host / InfinityFree)
1. Upload the `backend/` files to your server (e.g., `htdocs/businessflow-api/`).
2. Ensure your `.env` file on the server contains your live database credentials and `GEMINI_API_KEY`.
3. Verify that [backend/api/cors.php](backend/api/cors.php) includes your live frontend domain in `$allowedOrigins`.

---

## License

This project is licensed under the **MIT License**.
