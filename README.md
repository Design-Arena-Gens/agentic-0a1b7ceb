<div align="center">

# 🍽️ Karmic Canteen Platform

Mindful meal planning and waste reduction hub for Karmic Solutions employees and canteen operations.

Built with **Next.js 16**, **Tailwind CSS 4**, and a lightweight in-memory data service that powers authentication, real-time meal confirmations, inventory intelligence, and admin analytics.

</div>

## ✨ Features

- **Secure authentication** with role-based access (employee & admin demo credentials provided on the login screen).
- **Employee experience**
  - Live daily menu with nutritional insights and allergen transparency.
  - One-tap meal confirmations with notes for remote days.
  - Feedback capture loop mapped to future menu decisions.
  - Personal nutrition snapshots and historical meal timeline.
- **Admin cockpit**
  - Operational metrics (opt-ins, waste estimates, satisfaction).
  - Engagement trend and top menu analytics (Recharts visualisations).
  - Menu builder with dish + macro management.
  - Inventory controls with smart reorder nudges.
  - Broadcast centre for proactive notifications.
- **Notifications layer** with read tracking to keep teams informed.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev

# Visit the app
open http://localhost:3000
```

> Demo logins are surfaced on the `/login` page so you can explore both employee and admin journeys immediately.

## 🧱 Project Structure

```
src/
  app/               // Next.js App Router entrypoints
    (auth)/login     // Authentication flow
    (protected)/     // Authenticated dashboards & layouts
  components/        // UI building blocks (employee + admin)
  hooks/             // Custom hooks (notifications, etc.)
  lib/               // In-memory datastore, auth/session helpers
```

## 🛡️ Architecture Notes

- Session tokens issued via signed JWTs stored in httpOnly cookies.
- In-memory datastore (`lib/store.ts`) models users, menus, feedback, inventory, and notifications. This mimics the behaviour of a backing service and can be swapped for a persistent database.
- API layer built with App Router Route Handlers (`app/api/*`), enabling quick migration to serverless data services (Supabase, Postgres, etc.).
- Tailwind CSS v4 provides theming, while Recharts powers interactive admin visualisations.

## 🔒 Environment

Set `AUTH_SECRET` when deploying to production to rotate signing keys:

```bash
AUTH_SECRET="super-secure-random-string"
```

Without this variable the app falls back to a sensible demo secret.

---

Happy meal planning! Reduce waste, delight employees, and keep chefs informed with the Karmic Canteen platform.
