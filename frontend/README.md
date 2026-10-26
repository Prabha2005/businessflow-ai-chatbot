# BusinessFlow AI - Frontend Client

A modern, responsive single-page web application for **BusinessFlow AI**, an enterprise cloud infrastructure suite featuring an intelligent Gemini-powered customer service assistant, interactive cloud service catalog, and customer dashboard.

---

## 🌐 Live Demo & Testing Credentials

- **Live Application URL**: [https://businessflowai.freedev.app](https://businessflowai.freedev.app)

### Demo Testing Account
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

## Features

- **Enterprise Cloud Service Catalog**:
  - Browse available infrastructure tiers for Web Hosting, Cloud Storage, and Professional Business Email.
  - Interactive pricing cards with detailed specification sheets, pay-as-you-go rules, and sample invoice projections.
- **Context-Aware AI Chatbot**:
  - Powered by Google Gemini (v1beta) via backend orchestration.
  - Capable of resolving user inquiries regarding plans, subscription status, pricing, and specs.
  - Markdown-safe, Unicode-sanitized response presentation.
- **Authentication & User Management**:
  - Dedicated sign-in and registration pages with live validation.
  - Secure session management with cross-origin cookie credentials.
- **Customer Dashboard**:
  - Active subscriptions overview with plan details and renewal timers.
  - Simulated cloud metrics and usage monitoring.
  - One-click navigation to service detail exploration.

---

## Tech Stack

- **Framework**: React 18 / 19
- **Build Tool**: Vite 8
- **Styling**: Vanilla CSS (Custom tokens, glassmorphism, responsive flex/grid layouts)
- **Networking**: Native Fetch API with CORS credentials support

---

## Project Structure

```text
frontend/
├── public/                 # Static assets (favicons, icons)
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Brand logos and images
│   ├── components/         # Reusable UI components
│   │   ├── AppHeader.jsx          # Universal header navigation
│   │   ├── AuthModal.jsx          # Modal-based login/signup overlay
│   │   ├── AuthPage.jsx           # Full split-screen authentication page
│   │   ├── ChatbotLauncher.jsx    # Floating AI chatbot trigger
│   │   ├── ChatbotPanel.jsx       # Floating chat drawer interface
│   │   ├── DashboardView.jsx      # Customer subscriptions & usage dashboard
│   │   ├── ServiceDetailPage.jsx  # Detailed specifications & plan picker
│   │   └── ServicesSection.jsx    # Landing catalog grid
│   ├── services/           # API integration modules
│   │   ├── authApi.js             # Login, register, session verification
│   │   ├── chatApi.js             # AI assistant communication
│   │   ├── serviceApi.js          # Services endpoint integration
│   │   ├── serviceCatalog.js      # Authoritative static service catalog fallback
│   │   └── subscriptionApi.js     # Subscription querying & management
│   ├── App.css             # Main styling rules and variables
│   ├── App.jsx             # Root application shell and view router
│   ├── index.css           # Global reset and typography
│   └── main.jsx            # React root DOM mount point
├── .env.example            # Environment variables template
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point template
├── package.json            # Node.js dependencies and scripts
└── vite.config.js          # Vite build tool configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18.0 or higher recommended)
- **npm** (v9.0 or higher)

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Configure the backend API URL:

```env
# Point to your local Apache / XAMPP backend or live deployed API:
VITE_API_BASE_URL=http://localhost/businessflow-api/api
```

### 3. Development Server

Run the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will typically start at `http://localhost:5173`.

### 4. Production Build

Compile and bundle the application for production:

```bash
npm run build
```

The production-ready assets will be created in the `frontend/dist/` folder:
- `dist/index.html`
- `dist/assets/*.js`
- `dist/assets/*.css`

To preview the built production bundle locally:

```bash
npm run preview
```

---

## Deployment Instructions

### Deploying to InfinityFree / Apache
1. Run `npm run build`.
2. Upload the contents of `dist/` directly to your public web directory (e.g., `htdocs/`):
   - `index.html`
   - `assets/`
   - Static icons and images
3. Ensure the backend API path matches your hosting structure.

### Deploying to Vercel / Netlify
1. Connect the repository to Vercel or Netlify.
2. Set the **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Add the environment variable:
   `VITE_API_BASE_URL=https://your-api-domain.com/api`

---

## License

This project is licensed under the MIT License.
