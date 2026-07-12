<div align="center">

# EcoSphere

### Enterprise-Grade ESG Management Platform

Track, measure, and report your organization's environmental, social, and governance impact with precision.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)
![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)

</div>

---

## Overview

EcoSphere is a comprehensive ESG management platform designed to help organizations navigate the complex landscape of sustainability reporting, regulatory compliance, and stakeholder transparency. Built with modern architecture and data-driven insights, it transforms raw sustainability data into actionable intelligence.

## Key Features

### Environmental
- **Carbon Footprint Tracking** — Scope 1, 2, and 3 emissions calculation with real DB-backed goals
- **Energy Management** — Consumption monitoring and optimization recommendations
- **Waste & Water Analytics** — Resource utilization dashboards with trend analysis
- **Climate Risk Assessment** — 5x5 risk heat map with scoring and mitigation tracking

### Social
- **Workforce Analytics** — Diversity, equity, and inclusion metrics
- **Community Impact** — CSR activity tracking with approval workflow and XP rewards
- **Supply Chain Monitoring** — Supplier ESG scorecards with 0-100 scoring and assessment history
- **Gamification** — Challenges, badges, leaderboards, XP system, and real-time rankings

### Governance
- **Policy Management** — Policy CRUD with status tracking and audit trail
- **Ethics & Compliance** — Compliance calendar, deadline tracker, and auto-reminders
- **Audit Trail** — Full activity log with entity/action filters
- **Stakeholder Engagement** — Materiality matrix, executive portal, and reporting workflows

### Platform Capabilities
- **Multi-Framework Reporting** — GRI, SASB, TCFD alignment with coverage scoring
- **CSV Data Import** — Drag-and-drop bulk entity upload with PapaParse
- **AI-Powered Insights** — Rules-based ESG recommendations with priority scoring
- **Custom Dashboards** — Widget customizer, role-based views, and real-time polling
- **Export Engine** — PDF (jsPDF + html2canvas), Excel (xlsx), and CSV downloads
- **Dark Mode** — System preference detection with localStorage persistence
- **Global Search** — Ctrl+K modal searching 8 data sources + 15 pages
- **Keyboard Shortcuts** — G+D/R/S/A navigation, ? for help

## Architecture

```
ecosphere/
├── prisma/
│   ├── schema.prisma         # 33 models, 8 enums, full relations
│   └── seed.ts               # Database seeding (18 users, 6 depts, etc.)
├── src/
│   ├── app/                  # 54 routes (Next.js App Router)
│   │   ├── (auth)/           # Login, Register
│   │   ├── (dashboard)/      # All 50+ authenticated pages
│   │   ├── api/              # tRPC + NextAuth API routes
│   │   └── page.tsx          # Landing page
│   ├── components/           # Shared UI components
│   ├── lib/
│   │   ├── auth.ts           # NextAuth v5 beta config
│   │   ├── db.ts             # Prisma singleton
│   │   ├── scoring.ts        # Department score calculator + badge auto-award
│   │   └── trpc/
│   │       ├── server.ts     # tRPC server with protectedProcedure
│   │       ├── client.ts     # tRPC React client
│   │       └── routers/      # 28 tRPC routers
│   ├── middleware.ts          # Auth middleware (public routes: /, /register)
│   └── providers.tsx          # Client providers (tRPC, Theme, Session, Search)
├── .env                       # MySQL connection, NextAuth secret
└── package.json               # Dependencies + seed script config
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| ORM | Prisma 5 (`prisma-client-js`) |
| Database | MySQL 8.4 |
| API | tRPC (type-safe end-to-end) |
| Auth | NextAuth v5 beta (Credentials + JWT) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 2.x |
| PDF Export | jsPDF + html2canvas |
| Excel Export | xlsx (SheetJS) |
| CSV Import | PapaParse |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.4

### Installation

```bash
# Clone the repository
git clone https://github.com/shivv23/EcoSphere.git
cd EcoSphere

# Install dependencies
npm install

# Configure environment
# Edit .env with your MySQL connection string
# Default: DATABASE_URL="mysql://root:password@localhost:3306/ecosphere"

# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecosphere.com | admin123 |
| User | user@ecosphere.com | user123 |

## Database Schema

33 models across 8 entity groups:

| Group | Models |
|-------|--------|
| Core | User, Department, Category, Session, Account, VerificationToken |
| Emissions | EmissionFactor, CarbonTransaction, EnvironmentalGoal |
| Governance | Policy, Audit, Compliance |
| Social | CSRActivity, Challenge, Participation |
| Gamification | Badge, UserBadge, Reward, RewardRedemption, Leaderboard |
| Platform | Notification, Report, DashboardWidget, ThresholdConfig, AuditLog |
| Analytics | IndustryBenchmark, Recommendation, TimelineEvent |
| Supply Chain | Supplier, SupplierAssessment, CarbonOffsetProject, CarbonOffsetPurchase |
| Settings | OrganizationProfile |

## tRPC Routers

28 routers with 80+ procedures:

| Router | Key Procedures |
|--------|----------------|
| `user` | list, getById, create, update, delete |
| `department` | list, create, update, delete |
| `category` | list, create, update, delete |
| `emissionFactor` | list, create, update, delete |
| `policy` | list, create, update, delete |
| `audit` | list, create, update, delete |
| `compliance` | list, create, update, delete |
| `badge` | list, create, update, delete |
| `challenge` | list, approve, reject |
| `csrActivity` | list, approve, reject |
| `carbonTransaction` | list, create |
| `reward` | list, create, redeem |
| `notification` | list, unreadCount, markRead |
| `dashboard` | overview, carbonTrend, departmentScores, myStats, trends |
| `report` | generate, list |
| `settings` | getProfile, updateProfile |
| `import` | importData |
| `benchmark` | list, getCompanyMetrics |
| `threshold` | list, create, delete, checkBreaches |
| `recommendation` | generate |
| `timeline` | list, create |
| `supplier` | list, create, update, delete, getAssessments, createAssessment |
| `offset` | projects, purchase, stats |
| `calendar` | events, create |
| `goal` | list, create, update, delete |
| `auditLog` | list |
| `widget` | list, update |
| `register` | register (public) |

## Compliance Frameworks

| Framework | Status |
|-----------|--------|
| GRI Standards | Supported |
| SASB | Supported |
| TCFD | Supported |
| CSRD / ESRS | In Progress |
| SEC Climate Disclosure | In Progress |
| CDP | In Progress |

## License

This project is licensed under the MIT License.

---

<div align="center">
Built for organizations committed to a sustainable future.
</div>
