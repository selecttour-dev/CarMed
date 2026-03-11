---
description: How to run the CarMed development environment
---

## Prerequisites
- Node.js >= 18
- pnpm >= 8
- PostgreSQL running locally (port 5432)

## Setup (First Time)

// turbo-all

1. Install dependencies:
```bash
cd /Users/bekagogava/carmed.ge && pnpm install
```

2. Generate Prisma client:
```bash
cd /Users/bekagogava/carmed.ge/packages/backend && npx prisma generate
```

3. Push database schema:
```bash
cd /Users/bekagogava/carmed.ge/packages/backend && npx prisma db push
```

4. Seed the database:
```bash
cd /Users/bekagogava/carmed.ge/packages/backend && npx tsx prisma/seed.ts
```

## Start All Services

5. Start everything (backend + 3 portals):
```bash
cd /Users/bekagogava/carmed.ge && pnpm dev
```

## Ports
| Service          | Port  | URL                          |
|------------------|-------|------------------------------|
| Backend API      | 3001  | http://localhost:3001        |
| Client Portal    | 5174  | http://localhost:5174        |
| Manager Portal   | 5175  | http://localhost:5175        |
| Admin Portal     | 5176  | http://localhost:5176        |

## Test Credentials
| Role    | Phone           | Password    | Email             |
|---------|-----------------|-------------|-------------------|
| Admin   | +995555000001   | admin123    | admin@carmed.ge   |
| Manager | +995555000002   | manager123  | manager@carmed.ge |
| Client  | +995555000010   | client123   | client@example.com|

## Useful Commands
- Reset database: `cd packages/backend && npx prisma db push --force-reset && npx tsx prisma/seed.ts`
- Prisma Studio: `cd packages/backend && npx prisma studio`
- Health check: `curl http://localhost:3001/api/health`
