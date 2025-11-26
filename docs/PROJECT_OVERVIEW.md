# FructoSahel - Project Overview

## Introduction

FructoSahel is a comprehensive farm management platform designed specifically for fruit production in the Sahel region of West Africa, focusing on Burkina Faso, Mali, and Niger. The platform combines modern web technology with AI-powered advisory services to help farmers optimize their operations.

## Core Features

### 1. Public Website
- **Landing Page**: Showcases the platform's value proposition
- **Knowledge Base/Blog**: Detailed growing guides for 6 tropical fruits
- **About & Contact Pages**: Company information and contact forms
- **Multilingual Support**: Full French and English localization

### 2. Admin Dashboard
- **Farm Management**: Track farms, fields, and crops across multiple locations
- **Task Management**: Assign and track farm activities
- **Financial Tracking**: Record income, expenses, and sales
- **Team Management**: Manage workers, managers, and their roles

### 3. AI Advisory System
Three specialized AI agents powered by Claude API:
- **Agronomist Advisor**: Crop science, planting, irrigation, pest control
- **Marketing Advisor**: Market analysis, pricing, buyer networks
- **Finance Advisor**: Budgeting, investment analysis, financing options

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Neon PostgreSQL + Drizzle ORM |
| Authentication | Stack Auth |
| AI | Anthropic Claude API |
| Internationalization | next-intl |
| Package Manager | Bun |
| Linting | Biome |

## Target Crops

1. **Pineapple** (Ananas) - Year-round with irrigation
2. **Cashew** (Noix de cajou) - Drought-tolerant, 25+ year production
3. **Mango** (Mangue) - Major export crop
4. **Avocado** (Avocat) - Requires reliable irrigation
5. **Banana** (Banane) - High water needs, oasis cultivation
6. **Papaya** (Papaye) - Fast return, 9-month fruiting

## Regional Context

### Sahel Climate Challenges
- Semi-arid (400-900mm annual rainfall)
- Distinct rainy (June-October) and dry seasons
- High temperatures (often 35-45°C)
- Harmattan winds and dust

### Local Currency
- XOF (West African CFA franc)
- 1 EUR ≈ 656 XOF

### Key Markets
- Ouagadougou (Burkina Faso)
- Bobo-Dioulasso (Burkina Faso)
- Bamako (Mali)
- Niamey (Niger)
- Export to Europe and Middle East

## Project Structure

```
fructosahel/
├── app/
│   ├── [locale]/           # Localized pages
│   │   ├── page.tsx        # Landing page
│   │   ├── about/          # About page
│   │   ├── blog/           # Knowledge base
│   │   ├── contact/        # Contact page
│   │   └── dashboard/      # Admin dashboard
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn components
│   ├── layout/             # Layout components
│   └── ...                 # Feature components
├── lib/
│   ├── db/                 # Database schema
│   ├── ai-agents/          # AI configuration
│   └── utils/              # Utilities
├── messages/               # i18n translations
├── docs/                   # Documentation
└── blogs/                  # Blog content (future)
```

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in values
3. Install dependencies: `bun install`
4. Run migrations: `bun drizzle-kit push`
5. Start development: `bun dev`

## Environment Variables

- `DATABASE_URL` - Neon PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude API key for AI agents
- `STACK_PROJECT_ID` - Stack Auth project ID
- `STACK_SECRET_SERVER_KEY` - Stack Auth server key
- `STACK_PUBLISHABLE_CLIENT_KEY` - Stack Auth client key
- `NEXT_PUBLIC_APP_URL` - Application URL

## License

Proprietary - FructoSahel
