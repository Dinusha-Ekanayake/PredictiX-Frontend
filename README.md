# PredictiX — Frontend

> AI-powered predictive maintenance and smart asset management system for industrial operations.

PredictiX is a role-based web application that combines machine learning failure predictions, real-time asset health monitoring, intelligent ticket categorization, and warehouse operations management into a unified dashboard experience.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Routes & Pages](#routes--pages)
- [Authentication & Authorization](#authentication--authorization)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Component Architecture](#component-architecture)
- [Theming](#theming)

---

## Overview

PredictiX is built for operations and maintenance teams managing large fleets of industrial assets across multiple warehouses. The system surfaces AI-generated insights from XGBoost and BERT models running on the backend, presenting failure predictions, cost forecasts, maintenance schedules, and health scores in an intuitive dashboard.

Two roles are supported:

- **Admin** — full access to dashboards, asset management, ticket management, user management, and warehouse reports.
- **User** — limited access to their own profile and the users list.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 + Radix UI |
| Charts | Recharts |
| Auth Backend | Supabase (`@supabase/supabase-js`) |
| Notifications | Sonner (toast) |
| Theme | next-themes |
| PDF Export | html2pdf.js |
| Icons | lucide-react |
| Build | Turbopack (via Next.js) |
| Linting | ESLint 9 |

---

## Project Structure

```
predictix_frontend/
├── public/                          # Static assets
└── src/
    ├── app/                         # Next.js App Router
    │   ├── (admin)/                 # Admin route group
    │   │   └── admin/
    │   │       ├── layout.tsx       # Admin layout with navbar
    │   │       ├── dashboard/       # Operations dashboard
    │   │       ├── assets/          # Asset inventory & details
    │   │       ├── tickets/         # Maintenance ticket management
    │   │       ├── users/           # User management
    │   │       └── warehouse/       # Warehouse ops + AI reports
    │   ├── (auth)/                  # Authentication route group
    │   │   └── login/               # Role-select + login form
    │   ├── (user)/                  # User route group
    │   │   └── user/
    │   │       ├── layout.tsx       # User layout with navbar
    │   │       ├── dashboard/       # Redirects to profile
    │   │       ├── profile/         # User profile settings
    │   │       └── users/           # Users list view
    │   ├── help-desk/               # Help & support page
    │   ├── layout.tsx               # Root layout (providers, fonts)
    │   ├── page.tsx                 # Root → redirects to /login
    │   ├── loading.tsx              # Global loading state
    │   └── globals.css              # Global styles & CSS variables
    ├── components/
    │   ├── admin/
    │   │   ├── assets/              # Asset table, panel, toolbar, summary
    │   │   ├── dashboard/           # KPI cards, charts, insights, alerts
    │   │   ├── warehouse/           # Warehouse cards, schedule, reports
    │   │   ├── users/               # User dialogs & management UI
    │   │   ├── dialogs/             # Shared dialog components
    │   │   └── common/              # Stat cards, section cards
    │   ├── auth/
    │   │   ├── RoleSelectCards.tsx  # Role picker (Admin / User)
    │   │   └── RouteGuard.tsx       # Client-side auth protection
    │   ├── navigation/
    │   │   ├── AdminNavbar.tsx      # Admin nav with breadcrumbs & user menu
    │   │   ├── UserNavbar.tsx       # User nav
    │   │   └── useNavRouter.ts      # Navigation hook
    │   ├── chat/
    │   │   └── FloatingChatbot.tsx  # Draggable AI chatbot widget
    │   ├── theme/
    │   │   ├── ThemeProvider.tsx    # Dark/light mode + scroll accent
    │   │   └── ThemeToggle.tsx      # Theme toggle button
    │   ├── background/
    │   │   ├── AntigravityDotsBackground.tsx  # Interactive particle effect
    │   │   └── WaveBackground.tsx             # Animated wave effect
    │   ├── loading/
    │   │   └── PredictiXLoader.tsx  # Branded loading screen
    │   ├── brand/
    │   │   └── PredictiXLogo.tsx    # Logo component
    │   └── ui/                      # shadcn/ui base components
    ├── hooks/
    │   ├── useAuth.ts               # Auth check + role-based redirect
    │   └── useMinDelay.ts           # Minimum delay for loading screens
    ├── lib/
    │   ├── authService.ts           # Login, logout, token helpers
    │   ├── apiClient.ts             # Authenticated HTTP client
    │   ├── supabaseBrowserClient.ts # Supabase client initialisation
    │   ├── warehouseService.ts      # Warehouse API calls
    │   ├── pdfExport.ts             # PDF generation helpers
    │   ├── utils.ts                 # Utility functions (cn, etc.)
    │   └── api/
    │       └── userProfileApi.ts    # User profile endpoints
    └── middleware.ts                # Next.js route protection middleware
```

---

## Features

### Asset Health Monitoring
- Real-time health scores across the fleet (0–100 scale).
- Health bands: **Excellent**, **Good**, **Moderate**, **Poor**, **Critical**.
- Per-asset deep-dive panel with maintenance history and assigned tickets.

### ML Failure Prediction
- XGBoost model surfaces failure probability (%) and days-to-failure estimates.
- Risk-ranked asset list to prioritise inspection order.
- Trigger on-demand predictions per asset.

### Cost Forecasting
- Predicted maintenance cost per asset (currency: LKR).
- Aggregated cost trends across the fleet.

### Smart Maintenance Tickets
- BERT-powered automatic ticket categorisation and priority assignment.
- Ticket status tracking: open, in-progress, resolved.
- Recent tickets visible on the main dashboard.

### Critical Alerts
- Severity levels: **Critical**, **Warning**, **Info**.
- Alert feed on the main dashboard with timestamps and affected assets.

### Warehouse Operations
- Multi-warehouse overview with inventory and capacity metrics.
- Predictive maintenance schedules per warehouse.
- AI-generated insight cards: failure clusters, performance alerts, cost risk.

### AI Warehouse Reports
- Generate comprehensive warehouse analysis reports via the backend.
- Export reports as PDF directly from the browser.

### AI Chatbot
- Floating, draggable chat widget available on all pages.
- Connects to a dedicated chatbot service (FastAPI, port 8002).
- Persists chat position in `localStorage`.

### Reporting & Export
- PDF export of warehouse dashboards using `html2pdf.js`.

### Role-Based Access Control
- Admin and User roles with distinct route groups and layouts.
- Route protection at both middleware (server) and hook (client) levels.

---

## Routes & Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Redirects to `/login` |
| `/login` | Public | Role selector + email/password login |
| `/admin/dashboard` | Admin | Main KPI dashboard, charts, alerts, and tickets |
| `/admin/assets` | Admin | Asset inventory table with filters, search, and detail panel |
| `/admin/tickets` | Admin | Full maintenance ticket list and management |
| `/admin/users` | Admin | User management: create, edit, assign roles and assets |
| `/admin/warehouse` | Admin | Warehouse overview, maintenance schedule, AI insights |
| `/admin/warehouse/report` | Admin | AI-generated warehouse report with PDF export |
| `/user/dashboard` | User | Redirects to `/user/profile` |
| `/user/profile` | User | View and edit personal profile |
| `/user/users` | User | Read-only users list |
| `/help-desk` | All | Help and support page |

---

## Authentication & Authorization

### Login Flow
1. User selects a role (Admin or User) on the login screen.
2. Credentials (email, password, role) are sent to `POST /auth/login` on the backend.
3. The backend validates credentials and that the role matches the account.
4. A JWT access token and user object are returned and stored in `localStorage`.

### Storage Keys
| Key | Content |
|---|---|
| `predictix.access_token` | JWT bearer token |
| `predictix.user` | Serialised user object (id, email, role, full_name) |

### Route Protection
- **Server-side**: `middleware.ts` matches `/admin/*` and `/user/*` and verifies the presence of the token.
- **Client-side**: `useAuth()` hook redirects unauthenticated or unauthorised users to `/login`.
- **Component-level**: `<RouteGuard>` wrapper for granular protection inside pages.

### Token Lifecycle
- Every API request attaches `Authorization: Bearer {token}` automatically via `apiClient`.
- A `401` response from the backend triggers an immediate logout and redirect to `/login`.

---

## API Integration

The frontend communicates with two backend services:

| Service | Default URL | Purpose |
|---|---|---|
| Main API | `http://127.0.0.1:8000` | All app data (assets, tickets, users, warehouse, auth) |
| Chatbot API | `http://localhost:8002` | AI chat responses |

### API Client (`src/lib/apiClient.ts`)

A thin authenticated fetch wrapper exposing:

```ts
apiGet<T>(path: string): Promise<T>
apiPost<T>(path: string, body: unknown): Promise<T>
apiPut<T>(path: string, body: unknown): Promise<T>
apiDelete<T>(path: string): Promise<T>
askChatbot(message: string): Promise<string>
```

All methods automatically attach the stored JWT token. A `401` response triggers logout.

### Key API Endpoints (consumed by the frontend)

| Module | Method | Endpoint |
|---|---|---|
| Auth | POST | `/auth/login` |
| Assets | GET | `/assets` |
| Asset detail | GET | `/assets/{id}` |
| Failure prediction | GET | `/assets/{id}/prediction` |
| Cost prediction | GET | `/assets/{id}/cost-prediction` |
| Run prediction | POST | `/assets/{id}/predict` |
| Asset status | PUT | `/assets/{id}/status` |
| Delete asset | DELETE | `/assets/{id}` |
| Warehouse summary | GET | `/warehouse/summary` |
| Maintenance schedule | GET | `/warehouse/maintenance-schedule` |
| Critical assets | GET | `/warehouse/critical-assets` |
| User profile | GET/PUT | `/users/me` |
| Chatbot | POST | `{CHATBOT_URL}/chat` |

---

## State Management

PredictiX does not use a global state library. State is managed at three levels:

| Level | Mechanism | Used For |
|---|---|---|
| Persistent | `localStorage` | JWT token, user object, chatbot widget position |
| Global UI | React Context (`ThemeProvider`) | Light/dark theme |
| Local | `useState` / `useReducer` hooks | Forms, filters, modals, pagination, loading states |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** or **yarn**
- Backend API running on `http://127.0.0.1:8000`
- (Optional) Chatbot service on `http://localhost:8002`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd predictix_frontend

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000) using Turbopack.

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Backend API base URL (no trailing slash)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Chatbot service base URL
NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:8002

# Supabase (optional — only required if Supabase auth features are used)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle.

---

## Component Architecture

### Admin Dashboard Components

| Component | Location | Purpose |
|---|---|---|
| `KpiCards` | `components/admin/dashboard/` | 6 top-level KPIs: Total Assets, Critical Alerts, Open Tickets, Fleet Health, Predicted Failures, Maintenance Cost |
| `OperationalCharts` | `components/admin/dashboard/` | Tabbed recharts: health trend, ticket volume, maintenance cost |
| `RecentAlerts` | `components/admin/dashboard/` | Alert table with severity badges |
| `LatestTickets` | `components/admin/dashboard/` | Recent ticket list with status/priority |
| `WarehouseInsightsSection` | `components/admin/dashboard/` | AI insight panels: failure clusters, performance alerts, cost risks |

### Asset Components

| Component | Location | Purpose |
|---|---|---|
| `AssetsTable` | `components/admin/assets/` | Searchable, filterable asset table with health band indicators |
| `AssetsToolbar` | `components/admin/assets/` | Search input + filters: status, health band, warehouse |
| `AssetsSummary` | `components/admin/assets/` | Asset count breakdown by category |
| `AssetDetailsPanel` | `components/admin/assets/` | Slide-in panel: predictions, maintenance history, tickets, assignments |

### Warehouse Components

| Component | Location | Purpose |
|---|---|---|
| `WarehouseOverviewCards` | `components/admin/warehouse/` | High-level warehouse metrics |
| `WarehouseMaintenanceSchedule` | `components/admin/warehouse/` | Scheduled maintenance task table |
| `WarehouseAssetInsights` | `components/admin/warehouse/` | Per-asset insight cards |
| `WarehouseReportModal` | `components/admin/warehouse/` | AI report generation dialog with PDF export |

### Floating Chatbot

The `FloatingChatbot` widget (`components/chat/FloatingChatbot.tsx`) is injected into every layout. It is:
- Draggable across the viewport (position saved to `localStorage`).
- Collapsible (icon-only vs full chat window).
- Connected to the chatbot microservice at `NEXT_PUBLIC_CHATBOT_API_URL`.
- Maintains message history with timestamps within the current session.

---

## Theming

PredictiX supports **light** and **dark** modes via `next-themes`.

- The `ThemeProvider` wraps the root layout and reads the user's system preference on first load.
- A `ThemeToggle` button is present in both `AdminNavbar` and `UserNavbar`.
- Accent colours shift dynamically based on scroll position (defined in `ThemeProvider`).
- All components are built with Tailwind `dark:` variants for full dark-mode coverage.
- Tailwind CSS v4 CSS variables are used for the design token system (`--background`, `--foreground`, `--primary`, etc.).

---

## Scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start dev server with Turbopack at localhost:3000 |
| Build | `npm run build` | Production build |
| Start | `npm start` | Start production server |
| Lint | `npm run lint` | Run ESLint checks |
