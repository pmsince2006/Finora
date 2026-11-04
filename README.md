# Finora — Personal Finance Intelligence Platform

> **"Your money. Under investigation."**  
> Finora is an analytical personal finance intelligence platform for students, interns, and early-career professionals in India.

---

## 1. Architecture Overview

Finora uses an npm workspaces monorepo structure consisting of a client application and an Express/MongoDB backend service:

```text
finora/
├── client/                     # Frontend Application (React 19 + TypeScript + Vite 8)
│   ├── src/
│   │   ├── components/         # Design system & forensic UI components
│   │   ├── context/            # AuthContext, FinanceContext, ToastContext
│   │   ├── lib/                # Pure analytical engines (Recurring, Anomaly, Savings) & API client
│   │   ├── pages/              # Route views (Overview, Ledger, Recurring, Anomaly, Savings, Settings)
│   │   └── types/              # Canonical finance schemas (Transaction, Anomaly, Candidate, Savings)
│   └── vite.config.ts          # Dev proxy mapping /api -> http://localhost:5000
│
├── server/                     # Backend Service (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/             # Environment validation (env.ts) and MongoDB connection (db.ts)
│   │   ├── controllers/        # Auth, Transaction, and Review state controllers
│   │   ├── middleware/         # Auth verification (JWT in HttpOnly cookie), rate limiting, errorHandler
│   │   ├── models/             # Mongoose schemas (User, Transaction, ReviewState)
│   │   ├── routes/             # Express routers (/api/auth, /api/transactions, /api/reviews)
│   │   ├── __tests__/          # Automated Vitest integration test suite
│   │   ├── app.ts              # Express application setup, CORS, parsers
│   │   └── server.ts           # Server bootstrap and graceful shutdown
│   ├── .env.example            # Environment configuration template
│   └── package.json            # Server dependencies and scripts
│
├── docs/                       # Project documentation & roadmap status
├── package.json                # Root npm workspace configuration
└── package-lock.json           # Canonical root lockfile
```

---

## 2. Prerequisites

- **Node.js**: `v20.0.0` or higher (verified on Node.js `v24.13.0`)
- **npm**: `v10.0.0` or higher (verified on npm `11.6.2`)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (e.g., MongoDB Community Server v7+ or v8+)

---

## 3. Environment Configuration

The backend requires configuration variables for port, MongoDB connection, JWT signing secret, and allowed CORS origins.

### Setting up the Server Environment
Create `server/.env` based on `server/.env.example`:

```bash
# Server port
PORT=5000

# Environment mode
NODE_ENV=development

# MongoDB Connection String (Local default)
MONGODB_URI=mongodb://127.0.0.1:27017/finora

# JWT Secret Key (Use a minimum 16-character secret for signing session cookies)
JWT_SECRET=finora_local_development_secret_key_change_me_32chars

# Allowed Frontend Origin for CORS
FRONTEND_ORIGIN=http://localhost:5173
```

> [!NOTE]
> `.env` files are ignored by `.gitignore` to prevent credential leaks.

---

## 4. Installation & Local Execution

### Install All Dependencies
From the repository root:
```bash
npm install
```

### Start Local Development Servers
In separate terminal windows:

**Terminal 1 (Backend Server):**
```bash
# Runs server with auto-reload at http://localhost:5000
npm run dev:server
```

**Terminal 2 (Frontend Client):**
```bash
# Runs Vite dev server at http://localhost:5173
npm run dev
```

The frontend Vite server automatically proxies `/api` calls to `http://localhost:5000`.

---

## 5. Verification Commands

Run all checks from the root directory:

| Task | Command | Description |
| :--- | :--- | :--- |
| **Full Test Suite** | `npm test` | Runs both client (76 tests) and server (17 tests) Vitest suites |
| **Client Tests** | `npm run test:client` | Runs client regression, math, and API tests |
| **Server Tests** | `npm run test:server` | Runs backend auth, transactions, and user isolation tests |
| **Linting** | `npm run lint` | Runs `oxlint` with zero errors or warnings |
| **Frontend Build** | `npm run build` | Runs `tsc -b` type check and Vite production bundle |
| **Backend Build** | `npm run build --prefix server` | Runs `tsc` to verify backend TypeScript compilation |

---

## 6. API Endpoint Contract

All endpoints are prefixed with `/api`. Protected routes require a valid session via `finora_session` HttpOnly cookie or `Authorization: Bearer <token>` header.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public (Rate-limited) | Validates email, hashes password with bcrypt, creates account, sets session cookie |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticates credentials, sets HttpOnly cookie |
| `POST` | `/api/auth/logout` | Public | Clears `finora_session` cookie |
| `GET` | `/api/auth/me` | Protected | Returns current authenticated user profile (`id`, `email`, `fullName`) |

### Transactions (`/api/transactions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | Protected | Returns all transactions owned by authenticated user, sorted by date descending |
| `POST` | `/api/transactions` | Protected | Creates a new transaction with validated INR amount, date, type, and category |
| `POST` | `/api/transactions/batch` | Protected | Batch imports multiple transactions (used by CSV import flow) |
| `PUT` | `/api/transactions/:id` | Protected | Updates transaction owned by authenticated user |
| `DELETE` | `/api/transactions/:id` | Protected | Deletes transaction owned by authenticated user |
| `DELETE` | `/api/transactions` | Protected | Clears all transactions for authenticated user |

### Financial Decisions & Review State (`/api/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews` | Protected | Retrieves user's review records (recurring candidates, anomalies, savings plans) |
| `POST` | `/api/reviews/sync` | Protected | Synchronizes review state between client and cloud |
| `POST` | `/api/reviews/recurring` | Protected | Confirms or dismisses a recurring payment candidate |
| `DELETE` | `/api/reviews/recurring/:key` | Protected | Reinstates an unreviewed recurring payment candidate |
| `DELETE` | `/api/reviews/recurring` | Protected | Resets recurring payment review decisions |
| `POST` | `/api/reviews/anomaly` | Protected | Reviews or dismisses a spending anomaly finding |
| `DELETE` | `/api/reviews/anomaly/:key` | Protected | Reinstates an anomaly finding |
| `DELETE` | `/api/reviews/anomaly` | Protected | Resets anomaly review decisions |
| `POST` | `/api/reviews/savings` | Protected | Saves, plans, or dismisses a savings opportunity |
| `DELETE` | `/api/reviews/savings/:key` | Protected | Reinstates a savings opportunity |
| `DELETE` | `/api/reviews/savings` | Protected | Resets savings opportunity review decisions |

---

## 7. Data Storage vs. Client-Derived Intelligence

To ensure performance, auditability, and immediate responsiveness, Finora cleanly separates persistent raw evidence from derived analytical insights:

| Data Layer | Storage Location | Responsibility |
| :--- | :--- | :--- |
| **User Identity** | MongoDB (`users` collection) | Authenticated credentials, hashed passwords, profile |
| **Canonical Ledger** | MongoDB (`transactions` collection) | Concrete financial debits/credits (amount, date, description, type, category) |
| **User Review Decisions** | MongoDB (`reviewstates` collection) | Explicit user decisions (recurring confirmations, anomaly dismissals, savings targets) |
| **Cadence & Recurring Detection** | **Client-Derived** (In-Memory) | Deterministic cycle detection computed by `recurringDetection.ts` |
| **Anomaly Radar Forensics** | **Client-Derived** (In-Memory) | Statistical MAD/Z-Score deviation models computed by `anomalyDetection.ts` |
| **Savings Opportunity Lab** | **Client-Derived** (In-Memory) | Discretionary category trims and projections computed by `savingsDetection.ts` |
| **Guest / Demo Mode** | `localStorage` | Isolated preview dataset when unauthenticated (`finora.transactions.v1`) |

---

## 8. Current Scope & Known Limitations

- **Local Development Focus**: Phase 07 focuses exclusively on local development with Node.js, Express, and MongoDB. Production cloud deployment (Render, Atlas, Vercel API) is slated for future phases.
- **Bank Integrations**: Financial data is input via manual entry or standard bank statement CSV parsing (HDFC, ICICI, SBI). Live Account Aggregator (AA) integrations are intentionally out of scope for Phase 07.
- **Offline / Demo Resilience**: Users can enter the interactive demo workspace without an account (`/app`). Real user accounts require sign-in to persist to MongoDB.
