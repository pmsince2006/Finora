# Finora

### Your money. Under investigation.

**Finora** is a personal finance tracking and analysis platform designed to help individuals understand their spending habits, monitor recurring payments, identify unusual expenses, and discover potential savings opportunities.

Rather than simply displaying transaction records, Finora turns financial activity into meaningful insights through an intuitive dashboard and a collection of analytical tools.

**Live Application:** [https://finoratrack.vercel.app/](https://finoratrack.vercel.app/)

---

## Overview

Managing personal finances involves more than recording income and expenses. Understanding where money goes, identifying recurring commitments, and recognizing unusual spending patterns are equally important.

Finora brings these activities together in one platform.

Users can maintain a transaction ledger, analyze spending patterns, review recurring payments, investigate spending anomalies, and explore potential savings opportunities.

The platform supports both demo mode and authenticated accounts, allowing users to explore the application while also providing persistent, user-specific financial records.

## Features

### 1. Money Ledger

A centralized interface for managing financial transactions.

- Record, edit, and delete income and expense entries.
- Import transactions through CSV files.
- Map CSV columns to the application's transaction fields.
- Detect duplicate imported transactions.
- Filter, sort, and paginate transaction records.
- Undo supported transaction actions.

### 2. Recurring Payment Detective

Identify recurring financial commitments from transaction history.

- Detect potentially recurring payments.
- Analyze transaction frequency and cadence.
- Review recurring payment patterns.
- Maintain review states for identified recurring charges.

### 3. Spending Anomaly Radar

Identify unusual spending activity by comparing transactions against historical patterns.

- Establish historical spending baselines.
- Use median and Median Absolute Deviation (MAD) to identify unusual values.
- Account for partial periods when comparing spending.
- Review and exclude identified anomalies where appropriate.

### 4. Savings Opportunity Lab

Explore potential ways to reduce discretionary spending.

- Evaluate eligible discretionary spending categories.
- Use a configurable 10% savings target for eligible categories.
- Identify potential savings opportunities.
- Separate planned savings from estimated potential savings.
- Provide merchant concentration insights.

Savings figures are estimates based on recorded transactions and application assumptions. They should not be interpreted as realized savings.

### 5. Financial Overview

A centralized dashboard that brings important financial information together.

- Review financial activity.
- Understand income and expenses.
- Access key financial analysis modules.
- Navigate between the platform's major features.

### 6. Authentication and Data Persistence

Finora supports both demo and authenticated experiences.

- User registration and login.
- Secure, HTTP-only authentication cookies.
- User-specific financial records stored in MongoDB.
- Persistent review states for supported analytical modules.
- Browser-based local storage for demo-mode data.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router |
| Animations | Framer Motion |
| Data Visualization | Recharts |
| Visual Effects | OGL |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT, HTTP-only cookies |
| Testing | Vitest |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Version Control | Git and GitHub |

---

## Architecture

Finora follows a frontend-backend architecture with MongoDB as its persistent database.

```text
                 User
                  |
                  v
          Finora Web Application
              (React + Vite)
                  |
                  v
              Vercel
          Frontend Hosting
                  |
                  v
            /api/* Requests
                  |
                  v
           Vercel Reverse Proxy
                  |
                  v
           Express.js Backend
               (Render)
                  |
          +-------+-------+
          |               |
          v               v
    Authentication    Application
       Cookies          Logic
          |               |
          +-------+-------+
                  |
                  v
             Mongoose
                  |
                  v
             MongoDB Atlas
```

### Deployment Architecture

- **Frontend:** Deployed on Vercel.
- **Backend:** Deployed on Render.
- **Database:** Hosted on MongoDB Atlas.
- **API communication:** Frontend API requests are routed through a Vercel reverse proxy to the Render backend.
- **Authentication:** HTTP-only cookies are used for authenticated browser sessions.

The reverse proxy allows the frontend to communicate with the backend through its own origin, helping avoid common cross-origin cookie restrictions.

---

## Security Considerations

Finora incorporates several security practices:

- Password-based authentication.
- JWT-based session authentication.
- HTTP-only cookies to prevent direct JavaScript access to authentication tokens.
- Secure cookie settings in production.
- User-specific data access.
- Restricted backend CORS configuration.
- Environment variables for sensitive configuration.
- No authentication tokens stored in browser local storage or session storage.

Users should never commit database credentials, authentication secrets, or production environment files to version control.

---

## Demo Mode and Authenticated Mode

Finora supports two ways to explore the application.

**Demo Mode**

- Uses browser local storage.
- Allows users to explore financial tracking and analysis features.
- Keeps demo data separate from authenticated database records.

**Authenticated Mode**

- Requires user registration or login.
- Stores supported financial records in MongoDB Atlas.
- Maintains user-specific data and review states across sessions.

---

## Deployment

The production application is hosted using the following services:

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend API | Render |
| Database | MongoDB Atlas |

The application uses environment-based configuration to separate local development settings from production deployment settings.

---

## Project Goals

Finora was developed to explore how full-stack web technologies can be used to build a practical personal finance application.

The project focuses on:

- Building a complete frontend and backend architecture.
- Implementing secure authentication and persistent data storage.
- Developing transaction-based financial analysis.
- Creating meaningful data visualizations.
- Designing a clean and accessible user experience.
- Deploying a full-stack application using cloud hosting services.

---

## Future Improvements

Potential areas for future development include:

- Enhanced financial reports and export options.
- More advanced spending trend analysis.
- Improved recurring payment detection.
- Additional savings analysis and budgeting tools.
- Expanded financial insights and visualizations.

---

## Live Project

Explore Finora:

**[https://finoratrack.vercel.app/](https://finoratrack.vercel.app/)**

---

*Finora — Your money. Under investigation.*
