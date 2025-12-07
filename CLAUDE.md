# Time Management Platform - Project Documentation

## Project Overview

A modular time management web service that provides various independent time management systems. Users can enable/disable multiple systems based on their preferences. Each system is completely isolated with its own data structure.

---

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Framework      | Next.js 14+ (App Router, no src folder) |
| Language       | TypeScript (strict mode)                |
| Authentication | Clerk (Google OAuth + Email/Password)   |
| Database       | Supabase (PostgreSQL)                   |
| Styling        | Tailwind CSS + shadcn/ui                |

---

## Project Structure

```
├── app/
│   ├── api/webhooks/clerk/       # Clerk webhook handler
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main dashboard & systems
│   │   └── [system-name]/        # Each system has its own folder
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── shared/                   # Shared custom components
│
├── lib/
│   ├── supabase/                 # Supabase clients (client, server, admin)
│   └── systems/
│       ├── registry.ts           # System registry
│       └── [system-name]/        # System-specific logic (types, queries, actions)
│
├── types/
│   └── index.ts                  # Shared types
│
└── middleware.ts                 # Clerk authentication middleware
```

---

## Architecture Principles

### 1. Modular Isolated Systems

- Each system is completely independent
- No data sharing between systems
- Own database tables, types, queries, UI components per system

### 2. System Registry Pattern

- All available systems defined in `lib/systems/registry.ts`
- Controls system availability (available / coming_soon / beta)
- Single source of truth for system metadata

### 3. User System Enablement

- No systems enabled by default
- Dashboard shows all systems as cards
- Users enable systems they want to use
- Enabled systems appear in sidebar navigation

---

## Database Design

### Core Tables

| Table          | Purpose                                    |
| -------------- | ------------------------------------------ |
| `users`        | User data synced from Clerk via webhook    |
| `user_systems` | Tracks which systems each user has enabled |

### System-Specific Tables

Each system follows naming convention:

- `[system_name]_settings` → User preferences
- `[system_name]_[entity]` → Main data tables

All tables must have:

- RLS enabled
- `user_id` column referencing `users.clerk_id`
- `created_at` and `updated_at` timestamps

---

## Code Conventions

| Category      | Convention                                                      |
| ------------- | --------------------------------------------------------------- |
| Types         | Use `type` keyword, avoid `any`, use `unknown` with type guards |
| Files         | kebab-case (e.g., `system-card.tsx`)                            |
| Components    | PascalCase (e.g., `SystemCard`)                                 |
| Functions     | camelCase (e.g., `getUserSystems`)                              |
| Database      | snake_case (e.g., `user_systems`)                               |
| Env variables | SCREAMING_SNAKE_CASE (e.g., `CLERK_SECRET_KEY`)                 |

---

## Important Technical Notes

### Clerk + Supabase Integration (April 2025+)

- Using native third-party auth integration (NOT deprecated JWT templates)
- No need to share Supabase JWT secret with Clerk
- Use `session?.getToken()` directly
- Clerk domain configured in Supabase as third-party provider

### Bot Protection

- Include `<div id="clerk-captcha" />` in custom sign-up forms
- Or disable bot protection in Clerk Dashboard during development

### RLS Policies

- Always use `auth.jwt()->>'sub'` to get Clerk user ID
- All tables must restrict access to owner's data only

---

## User Flow

```
Landing Page → Auth Page → Dashboard (System Selector)
                              │
                              ├── Enable System → System appears in sidebar
                              │
                              └── Open System → System-specific UI
```

---

## Adding a New System (Checklist)

1. Plan system data structure and features
2. Create database tables with RLS policies
3. Create types in `lib/systems/[system-name]/types.ts`
4. Create queries in `lib/systems/[system-name]/queries.ts`
5. Create actions in `lib/systems/[system-name]/actions.ts`
6. Create UI in `app/dashboard/[system-name]/`
7. Register system in `lib/systems/registry.ts`
8. Test all functionality

---

## Project Completion Checklist

### Phase 1: Foundation ✅

- [x] Next.js project setup
- [x] Tailwind CSS + shadcn/ui setup
- [x] Clerk authentication (Google OAuth + Email/Password)
- [x] Supabase connection
- [x] User table + webhook sync
- [x] Middleware for protected routes
- [x] Auth page (combined sign-in/sign-up)

### Phase 2: Core Platform

- [ ] `user_systems` table + RLS policies
- [ ] System registry (`lib/systems/registry.ts`)
- [ ] Dashboard layout with sidebar navigation
- [ ] System selector page (cards grid)
- [ ] Enable/disable system functionality
- [ ] Dynamic sidebar based on enabled systems

### Phase 3: First System

- [ ] Choose first system to build
- [ ] Database tables + RLS policies
- [ ] Types, queries, actions
- [ ] UI pages and components
- [ ] Register as "available" in registry

### Phase 4: Additional Systems

- [ ] Repeat Phase 3 for each new system
- [ ] Add to registry as "coming_soon" first
- [ ] Change to "available" when complete

### Phase 5: Polish

- [ ] Dashboard home with overview/stats
- [ ] Settings page
- [ ] Mobile responsive design
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Empty states

---

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Run linter
npx shadcn@latest add [component]   # Add shadcn component
```
