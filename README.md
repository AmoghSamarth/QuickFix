# QuickFix — Smart Maintenance & Escalation System

> **Report it. Track it. Fix it.**  
> A workplace maintenance request and escalation management platform designed for modern facilities, employees, and administrative dispatchers.

---

## 🚀 Overview

QuickFix bridges the gap between employees reporting workplace maintenance issues and facility administrators managing work order triage, technician dispatch, and SLA-driven escalation workflows.

### Key Roles
- **Employee Portal**: Report issues with category/location tags, track status milestones, view assigned technicians, and review request progression.
- **Administrator Console**: Full-facility ticket inventory, technician dispatch, status updates (Pending → In Progress → Resolved → Escalated), KPI metrics dashboard with visualization, and critical escalation triage.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Language**: JavaScript (ES6+ JSX)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Routing**: React Router DOM v7 (Role-aware route guards)
- **HTTP Client**: Axios with centralized error normalization and auth interceptors
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **State Management**: React Context API (`AuthContext`) & Custom Hooks (`useAuth`)

---

## 🎨 Design System & Brand Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Deep Forest** | `#173B32` | Primary brand identity, dark headers, sidebar |
| **Action Blue** | `#2F6FED` | Primary interactive elements, active links, focus rings |
| **Main Background** | `#F7F9FC` | Application canvas & page background |
| **Success Background** | `#DDF5E5` | Resolved badges, positive feedback |
| **Warning Background** | `#FFF0D7` | Pending review badges, caution notes |
| **Danger Background** | `#FCE8E8` | Escalated / SLA breach badges, critical alerts |
| **Main Text** | `#1E293B` | High-contrast primary typography |
| **Secondary Text** | `#5D6875` | Captions, labels, table subtext |
| **Borders** | `#D9E1E8` | Component and card borders |

---

## 📁 Repository Structure

```text
QuickFix/
├── frontend/
│   ├── public/
│   │   └── logo.svg                 # QuickFix SVG brand emblem
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Button, Input, Modal, Badges, Skeleton, Empty/Error states
│   │   │   ├── layout/              # AppLayout, Sidebar, Topbar, MobileNavigation
│   │   │   └── tickets/             # TicketCard, TicketTable, TicketTimeline
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth provider and state management
│   │   │   └── authContextDef.js     # React context definition
│   │   ├── hooks/
│   │   │   └── useAuth.js            # useAuth hook
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Authentication & Demo access
│   │   │   ├── NotFound.jsx          # 404 page
│   │   │   ├── Profile.jsx           # Account details
│   │   │   ├── employee/             # EmployeeDashboard, MyRequests, CreateRequest, TicketDetails
│   │   │   └── admin/                # AdminDashboard, AllTickets, AdminTicketDetails, Escalations
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx         # Role-aware route definitions and guards
│   │   ├── services/
│   │   │   ├── api.js                # Centralized Axios client & error handler
│   │   │   ├── authService.js        # Auth and profile API calls
│   │   │   ├── ticketService.js      # Employee ticket API calls
│   │   │   └── adminService.js       # Admin operations API calls
│   │   ├── utils/
│   │   │   ├── formatDate.js         # Date & relative time helpers
│   │   │   ├── mockData.js           # Isolated demo dataset
│   │   │   └── statusUtils.js        # Status and priority badges config
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                 # Tailwind base styles and color theme
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── package.json                      # Root workspace scripts
└── .gitignore
```

---

## 🚦 Available Routes

### Public
- `/login` — Login screen with live credentials form and 1-click Demo Mode access.

### Employee Portal
- `/employee/dashboard` — KPI cards, recent requests, and quick report action.
- `/employee/requests` — Filterable work requests list (Table / Grid views).
- `/employee/requests/new` — Maintenance request creation form with category & urgency controls.
- `/employee/requests/:id` — Single ticket details, technician assignment status, and progress timeline.

### Administrator Portal
- `/admin/dashboard` — Facilities operations dashboard, pipeline distribution chart, and escalation alerts.
- `/admin/tickets` — Global work order inventory with status/priority filtering.
- `/admin/tickets/:id` — Administrative ticket view with modal workflows to update status, assign technicians, or escalate.
- `/admin/escalations` — Critical queue for SLA breaches and safety hazards.

### Shared & Utility
- `/profile` — User account details and preferences.
- `*` — 404 Not Found fallback.

---

## 🧪 Isolated Demo Mode

For rapid frontend exploration and testing before the Node.js/PostgreSQL backend is connected, an isolated **Demo Mode** is built-in:
- Toggle between **Employee (Alex Rivera)** and **Administrator (Jordan Vance)** in 1 click via the sidebar or topbar banner.
- All views, forms, modals, tables, and charts are fully interactive.
- Seamlessly transition to live backend authentication when `VITE_API_BASE_URL` is pointed to the backend service.

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
# From workspace root
npm install --prefix frontend
```

### 2. Configure Environment
```bash
cp frontend/.env.example frontend/.env
```
Default `VITE_API_BASE_URL=http://localhost:5000/api`.

### 3. Start Development Server
```bash
npm run dev
# Or inside frontend directory:
# cd frontend && npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

### 5. Lint
```bash
npm run lint
```
