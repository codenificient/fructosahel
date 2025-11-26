# Deployment Guide

## Prerequisites

- Node.js 18+ or Bun runtime
- Neon PostgreSQL database
- Anthropic API key
- Stack Auth account (optional)
- Vercel account (recommended)

## Environment Setup

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure Variables

```env
# Database (Neon)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Stack Auth (optional)
STACK_PROJECT_ID=your-project-id
STACK_SECRET_SERVER_KEY=your-secret-key
STACK_PUBLISHABLE_CLIENT_KEY=your-publishable-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Database Setup

### 1. Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### 2. Run Migrations

```bash
# Install dependencies
bun install

# Push schema to database
bun drizzle-kit push
```

### 3. Verify Schema

```bash
# Open Drizzle Studio
bun drizzle-kit studio
```

## Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Select "Next.js" as framework preset

### 2. Configure Environment Variables

Add all environment variables in Vercel dashboard:
- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### 3. Configure Build Settings

```json
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "framework": "nextjs"
}
```

### 4. Deploy

Vercel will automatically deploy on push to main branch.

## Alternative Deployments

### Docker

```dockerfile
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "server.js"]
```

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy

### Self-Hosted

```bash
# Build
bun run build

# Start production server
bun run start
```

## Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test AI agents functionality
- [ ] Check i18n routing (en/fr)
- [ ] Verify all pages load correctly
- [ ] Test form submissions
- [ ] Check responsive design
- [ ] Enable error monitoring (Sentry)
- [ ] Set up analytics (optional)

## Performance Optimization

### 1. Database

- Enable connection pooling in Neon
- Add database indexes (see DATABASE_SCHEMA.md)

### 2. Caching

- Vercel Edge caching for static pages
- ISR for blog pages

### 3. Images

- Use Next.js Image component
- Configure image optimization

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking
- **Neon Dashboard**: Database metrics

### Health Checks

Add health endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "ok" });
}
```

## Scaling Considerations

1. **Database**: Neon auto-scales, but consider read replicas for high traffic
2. **AI API**: Implement rate limiting and caching
3. **CDN**: Vercel Edge Network handles this automatically
4. **Serverless Functions**: Consider cold start optimization

## Security

### Production Checklist

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables secured
- [ ] API routes protected
- [ ] CORS configured
- [ ] Rate limiting on AI endpoints
- [ ] Input validation
- [ ] SQL injection prevention (Drizzle ORM handles this)

## Backup Strategy

### Database

- Neon provides automatic backups
- Configure point-in-time recovery
- Export critical data periodically

### Code

- Git repository as source of truth
- Tag releases for easy rollback

## Rollback Procedure

### Vercel

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." menu
4. Select "Promote to Production"

### Database

- Use Neon's branching feature for safe migrations
- Keep migration scripts versioned
