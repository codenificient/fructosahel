# FructoSahel

[![FructoSahel Preview](https://api.microlink.io/?url=https://fructosahel.vercel.app&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1200&viewport.height=630)](https://fructosahel.vercel.app)

A modern farm management platform designed for agricultural operations in the Sahel region of West Africa. FructoSahel empowers farmers in Burkina Faso, Mali, and Niger with AI-driven insights, comprehensive crop tracking, and financial management tools.

## Features

### Farm Management
- Track multiple farms with detailed location data and field mapping
- Monitor crops through their complete lifecycle (planning, planting, growing, flowering, fruiting, harvesting)
- Manage fields with soil type and irrigation tracking
- Record crop activities including watering, fertilizing, and pest control

### AI Advisors
- **Agronomist Agent**: Get expert advice on crop care, pest management, and yield optimization
- **Marketing Agent**: Receive market insights and pricing recommendations
- **Finance Agent**: Financial planning and budget analysis assistance
- Powered by Claude AI with streaming responses

### Task Management
- Create and assign tasks to team members
- Priority levels (low, medium, high, urgent)
- Calendar view for scheduling
- Track task completion across farms and crops

### Financial Tracking
- Record income and expenses in West African CFA franc (XOF)
- Track sales by crop type with buyer information
- Visual analytics with revenue vs expenses charts
- Monthly financial performance reports

### Knowledge Base
- Detailed growing guides for Sahel-specific crops
- Bilingual content (English and French)
- Crop-specific tips for:
  - Pineapple
  - Cashew
  - Avocado
  - Mango
  - Banana
  - Papaya

### Analytics Dashboard
- Revenue and expense trends
- Crop distribution visualization
- Task status overview
- Sales trends by crop type

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4, Radix UI
- **Database**: Neon (PostgreSQL) with Drizzle ORM
- **Authentication**: Stack Auth
- **AI**: Anthropic Claude SDK
- **Charts**: Recharts
- **Internationalization**: next-intl (English/French)
- **Testing**: Vitest with React Testing Library
- **Linting/Formatting**: Biome
- **Release**: Semantic Release with Conventional Commits

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Neon database account
- Anthropic API key (for AI features)
- Stack Auth project (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/codenificient/fructosahel.git
cd fructosahel
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
# Database
DATABASE_URL=your_neon_database_url

# Authentication (Stack Auth)
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_client_key
STACK_SECRET_SERVER_KEY=your_server_key

# AI
ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. Run database migrations:
```bash
pnpm drizzle-kit push
```

5. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
fructosahel/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── dashboard/      # Protected dashboard pages
│   │   ├── demo/           # Demo mode (no auth required)
│   │   ├── blog/           # Knowledge base
│   │   └── ...
│   └── api/                # API routes
│       ├── ai/             # AI chat endpoints
│       ├── farms/          # Farm CRUD
│       ├── crops/          # Crop management
│       ├── tasks/          # Task operations
│       └── ...
├── components/
│   ├── ui/                 # Base UI components
│   ├── layout/             # Header, footer, sidebars
│   ├── charts/             # Analytics visualizations
│   └── calendar/           # Calendar components
├── lib/
│   └── db/                 # Database schema and client
├── messages/               # i18n translations
└── public/                 # Static assets
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |
| `pnpm test` | Run tests |
| `pnpm test:ui` | Run tests with UI |
| `pnpm test:coverage` | Run tests with coverage |

## Demo Mode

Access the demo at `/demo` to explore features without authentication. Demo mode uses mock data to showcase:
- Farm and crop management interface
- Task calendar and management
- Financial tracking dashboards
- AI advisor conversations
- Team management

## Deployment

The application is configured for deployment on Vercel with Neon database integration.

```bash
vercel deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

---

Built with care for Sahel farmers.
