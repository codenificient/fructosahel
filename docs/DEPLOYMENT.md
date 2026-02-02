# FructoSahel Deployment Guide

This guide provides comprehensive instructions for deploying the FructoSahel application to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Production Optimizations](#production-optimizations)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedure](#rollback-procedure)

## Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 20.x or later installed
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Git repository connected to Vercel
- [ ] Database provisioned (Neon PostgreSQL recommended)
- [ ] Anthropic API key for Claude integration
- [ ] Analytics endpoint configured

## Environment Variables

### Required Environment Variables

The following environment variables must be configured in your Vercel project settings:

#### Database Configuration

```bash
DATABASE_URL=@database_url
```

**Setup Instructions:**
1. Navigate to your Vercel project dashboard
2. Go to Settings > Environment Variables
3. Click "Add New" > "Secret"
4. Create a secret named `database_url` with your Neon connection string
5. The format should be: `postgresql://user:password@host/database?sslmode=require`

#### AI/ML Configuration

```bash
ANTHROPIC_API_KEY=@anthropic_api_key
```

**Setup Instructions:**
1. Obtain your API key from https://console.anthropic.com
2. In Vercel project settings, create a secret named `anthropic_api_key`
3. Add the API key value (starts with `sk-ant-`)

#### Analytics Configuration

```bash
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_API_KEY=proj_fructosahel_key
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://analytics-dashboard-phi-six.vercel.app/api
```

**Setup Instructions:**
1. These are public environment variables (prefixed with `NEXT_PUBLIC_`)
2. Add them directly in the Vercel dashboard
3. They will be exposed to the browser, so ensure they contain no sensitive data

### Optional Environment Variables

```bash
# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
```

### Sentry Error Monitoring Configuration

Sentry is configured for comprehensive error tracking and performance monitoring. Follow these steps to set it up:

#### 1. Create a Sentry Project

1. Sign up at https://sentry.io
2. Create a new project:
   - Platform: Next.js
   - Project name: `fructosahel`
3. Note your DSN from Settings > Projects > fructosahel > Client Keys (DSN)

#### 2. Required Environment Variables

Add these to your Vercel project settings:

```bash
# Client-side DSN (exposed to browser)
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_PUBLIC_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID

# Server-side DSN
SENTRY_DSN=https://YOUR_PUBLIC_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID

# Organization and project for source map uploads
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=fructosahel

# Auth token for source map uploads (create at Settings > Account > Auth Tokens)
# Required scopes: project:read, project:releases, org:read
SENTRY_AUTH_TOKEN=sntrys_YOUR_AUTH_TOKEN
```

#### 3. Vercel Integration (Recommended)

For seamless integration:

1. Go to Vercel Dashboard > Integrations
2. Search for "Sentry" and install
3. Connect your Sentry organization
4. Select the FructoSahel project
5. Environment variables will be auto-configured

#### 4. Error Tracking Features

The following are automatically tracked:

- **Client Errors**: JavaScript errors, unhandled rejections
- **Server Errors**: API route errors, SSR errors
- **Edge Errors**: Middleware errors
- **Performance**: Page loads, API response times
- **User Context**: Authenticated user info for error correlation

#### 5. Custom Error Categories

Errors are categorized for easier filtering:

| Category | Description |
|----------|-------------|
| `api` | API route errors |
| `ai` | AI/LLM request failures |
| `auth` | Authentication failures |
| `database` | Database query errors |
| `validation` | Input validation errors |
| `network` | Network/connectivity issues |
| `ui` | Client-side UI errors |

#### 6. Verifying Sentry Setup

After deployment, verify Sentry is working:

```bash
# Trigger a test error (in development)
curl -X POST https://your-app.vercel.app/api/sentry-example-api

# Or in the browser console:
throw new Error("Sentry Test Error");
```

Check your Sentry dashboard for the error.

#### 7. Recommended Sentry Dashboard Setup

1. **Create Alerts:**
   - New issue alert for production errors
   - Spike detection for error rate increases
   - Performance regression alerts

2. **Set Up Teams:**
   - Assign errors to team members
   - Configure notification preferences

3. **Create Custom Dashboards:**
   - Error rate by endpoint
   - AI request failures
   - Performance by page

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests pass (`npm test` or equivalent)
- [ ] Linting passes (`npm run lint`)
- [ ] Code formatting is consistent (`npm run format`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No console errors or warnings in development

### Performance

- [ ] Images are optimized (WebP/AVIF format)
- [ ] Unused dependencies removed
- [ ] Bundle size is acceptable (check with `npm run build`)
- [ ] API routes are optimized
- [ ] Database queries are efficient

### Security

- [ ] All environment variables are set as secrets (not plaintext)
- [ ] API keys are not committed to repository
- [ ] Security headers are configured (see `next.config.ts`)
- [ ] CORS is properly configured
- [ ] Input validation is implemented

### SEO & Accessibility

- [ ] Meta tags are complete (Open Graph, Twitter Cards)
- [ ] Sitemap is generated (`/sitemap.xml`)
- [ ] Robots.txt is configured (`/robots.txt`)
- [ ] PWA manifest is present (`/manifest.json`)
- [ ] Alt text on all images
- [ ] Semantic HTML structure
- [ ] Accessible forms with proper labels

### Content

- [ ] All copy is finalized
- [ ] Internationalization (i18n) is complete for both EN and FR
- [ ] Placeholder content is replaced
- [ ] Legal pages are complete (Privacy Policy, Terms of Service)

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended for First Deployment)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "chore: prepare for Vercel deployment"
   git push origin main
   ```

2. **Create New Project**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select "FructoSahel" repository

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Set Environment Variables**
   - Add all required environment variables (see above)
   - Ensure sensitive values are stored as secrets

5. **Configure Region**
   - Primary region: `cdg1` (Paris, France - closest to Sahel)
   - This is configured in `vercel.json`

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (typically 2-5 minutes)
   - Vercel will provide a preview URL

### Method 2: Deploy via Vercel CLI

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Link Project** (first time only)
   ```bash
   vercel link
   ```
   - Select or create a new project
   - Link to existing Git repository

3. **Set Environment Variables** (first time only)
   ```bash
   # Add environment variables
   vercel env add DATABASE_URL production
   vercel env add ANTHROPIC_API_KEY production
   vercel env add NEXT_PUBLIC_ANALYTICS_ENABLED production
   vercel env add NEXT_PUBLIC_ANALYTICS_API_KEY production
   vercel env add NEXT_PUBLIC_ANALYTICS_ENDPOINT production
   ```

4. **Deploy to Production**
   ```bash
   # Deploy to production
   vercel --prod
   ```

5. **Monitor Deployment**
   - Watch the deployment logs
   - Verify build completes successfully
   - Check for any errors or warnings

### Method 3: Automatic Deployments (After Initial Setup)

Once configured, Vercel will automatically deploy:
- **Production**: Every push to `main` branch
- **Preview**: Every push to feature branches
- **Pull Requests**: Automatic preview deployments for PRs

## Post-Deployment Verification

### Functional Testing

1. **Homepage Loading**
   - [ ] Visit https://fructosahel.vercel.app
   - [ ] Verify page loads without errors
   - [ ] Check both `/en` and `/fr` routes

2. **Navigation**
   - [ ] Test all navigation links
   - [ ] Verify language switching works
   - [ ] Check mobile navigation

3. **Features**
   - [ ] Test AI chat functionality
   - [ ] Verify form submissions work
   - [ ] Check database connectivity
   - [ ] Test image loading and optimization

4. **API Routes**
   - [ ] Test `/api/chat` endpoint
   - [ ] Verify analytics tracking
   - [ ] Check error handling

### Performance Testing

1. **Core Web Vitals**
   - [ ] Run Lighthouse audit (target: 90+ score)
   - [ ] Check PageSpeed Insights
   - [ ] Verify WebPageTest results

2. **Metrics to Monitor**
   - Largest Contentful Paint (LCP): < 2.5s
   - First Input Delay (FID): < 100ms
   - Cumulative Layout Shift (CLS): < 0.1
   - Time to First Byte (TTFB): < 800ms

3. **Tools**
   ```bash
   # Run Lighthouse
   npx lighthouse https://fructosahel.vercel.app --view

   # Check bundle size
   npm run build
   ```

### Security Verification

1. **Headers Check**
   ```bash
   # Verify security headers
   curl -I https://fructosahel.vercel.app
   ```

   Expected headers:
   - `Strict-Transport-Security`
   - `X-Frame-Options`
   - `X-Content-Type-Options`
   - `X-XSS-Protection`
   - `Referrer-Policy`

2. **SSL/TLS**
   - [ ] HTTPS is enforced
   - [ ] Valid SSL certificate
   - [ ] No mixed content warnings

3. **Security Scan**
   - [ ] Run security audit: `npm audit`
   - [ ] Check for vulnerable dependencies
   - [ ] Verify no exposed secrets in source code

### SEO Verification

1. **Meta Tags**
   - [ ] View page source and verify meta tags
   - [ ] Test Open Graph preview: https://www.opengraph.xyz/
   - [ ] Test Twitter Card preview: https://cards-dev.twitter.com/validator

2. **Sitemap**
   - [ ] Verify sitemap: https://fructosahel.vercel.app/sitemap.xml
   - [ ] Validate sitemap format
   - [ ] Submit to Google Search Console

3. **Robots.txt**
   - [ ] Check robots.txt: https://fructosahel.vercel.app/robots.txt
   - [ ] Verify crawl rules

4. **Structured Data**
   - [ ] Test with Google Rich Results Test
   - [ ] Validate schema.org markup

### Analytics Verification

1. **Event Tracking**
   - [ ] Verify page view events
   - [ ] Test custom event tracking
   - [ ] Check analytics dashboard

2. **Error Tracking**
   - [ ] Trigger a test error
   - [ ] Verify error is logged
   - [ ] Check error reporting dashboard

## Production Optimizations

### Image Optimization

The application uses Next.js Image Optimization:

```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**",
    },
  ],
  formats: ["image/avif", "image/webp"],
}
```

**Best Practices:**
- Use `next/image` component for all images
- Provide `width` and `height` props
- Use appropriate `sizes` attribute for responsive images
- Leverage lazy loading (enabled by default)

### Caching Strategy

**Static Assets:**
- Images, fonts, CSS, JS are automatically cached
- CDN caching via Vercel Edge Network

**API Routes:**
- Implement appropriate cache headers
- Use Vercel Edge Functions for low latency

**Database Queries:**
- Implement query result caching where appropriate
- Use Neon's connection pooling

### Bundle Optimization

**Current Setup:**
- Tree shaking enabled (automatic in production)
- Code splitting by route (automatic with Next.js)
- Compression enabled (`compress: true`)

**Recommendations:**
```bash
# Analyze bundle
npm run build

# Check for duplicate dependencies
npx depcheck

# Optimize dependencies
npm prune --production
```

### Database Optimization

**Connection Pooling:**
```typescript
// lib/db.ts should use connection pooling
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
```

**Query Optimization:**
- Add indexes for frequently queried fields
- Use prepared statements
- Implement pagination for large datasets
- Monitor slow queries

## Troubleshooting

### Common Issues

#### Build Failures

**Problem:** Build fails with TypeScript errors
```bash
Solution:
1. Run `npm run build` locally
2. Fix all TypeScript errors
3. Ensure all dependencies are in package.json
4. Check for missing environment variables
```

**Problem:** Build timeout
```bash
Solution:
1. Optimize build process
2. Remove unused dependencies
3. Check for infinite loops in build scripts
4. Contact Vercel support for build limits
```

#### Runtime Errors

**Problem:** 500 Internal Server Error
```bash
Solution:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test API routes locally
4. Check database connectivity
```

**Problem:** Database connection errors
```bash
Solution:
1. Verify DATABASE_URL is correct
2. Check database is accessible from Vercel
3. Ensure SSL mode is enabled
4. Check connection pool settings
```

**Problem:** API rate limiting
```bash
Solution:
1. Implement request throttling
2. Add caching for API responses
3. Use Vercel Edge Functions
4. Contact API provider for limits
```

#### Performance Issues

**Problem:** Slow page loads
```bash
Solution:
1. Run Lighthouse audit
2. Optimize images
3. Implement code splitting
4. Use ISR for static content
5. Check database query performance
```

**Problem:** High memory usage
```bash
Solution:
1. Check for memory leaks
2. Optimize large data processing
3. Implement pagination
4. Use streaming for large responses
```

### Debugging Tools

**Vercel Logs:**
```bash
# View logs
vercel logs <deployment-url>

# Stream logs in real-time
vercel logs --follow
```

**Environment Variables:**
```bash
# List environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

**Preview Deployments:**
```bash
# Create preview deployment
vercel

# View preview URL
vercel ls
```

## Rollback Procedure

### Quick Rollback

1. **Via Vercel Dashboard:**
   - Go to Deployments tab
   - Find last working deployment
   - Click "..." menu > "Promote to Production"

2. **Via CLI:**
   ```bash
   # List deployments
   vercel ls

   # Promote specific deployment
   vercel promote <deployment-url>
   ```

### Manual Rollback

1. **Git Revert:**
   ```bash
   # Find commit to revert to
   git log --oneline

   # Revert to specific commit
   git revert <commit-hash>

   # Push to trigger deployment
   git push origin main
   ```

2. **Emergency Rollback:**
   ```bash
   # Force push previous commit
   git reset --hard <commit-hash>
   git push --force origin main
   ```
   **⚠️ Warning:** Only use force push in emergencies

## Monitoring and Maintenance

### Regular Checks

**Daily:**
- [ ] Monitor error rates in analytics
- [ ] Check uptime status
- [ ] Review deployment logs

**Weekly:**
- [ ] Run security audit (`npm audit`)
- [ ] Check for dependency updates
- [ ] Review performance metrics
- [ ] Monitor database growth

**Monthly:**
- [ ] Update dependencies
- [ ] Review and optimize bundle size
- [ ] Audit unused features
- [ ] Review and update documentation

### Performance Monitoring

**Tools:**
- Vercel Analytics (built-in)
- Google Analytics
- Sentry (error tracking)
- Lighthouse CI (automated performance testing)

**Key Metrics:**
- Response time: < 200ms
- Error rate: < 0.1%
- Uptime: > 99.9%
- Core Web Vitals: All green

## Support and Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Database Docs](https://neon.tech/docs)
- [Anthropic API Docs](https://docs.anthropic.com)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Vercel Community](https://vercel.com/community)

### Contact
- Technical Support: support@fructosahel.com
- Emergency: urgent@fructosahel.com

---

**Last Updated:** 2025-11-26
**Version:** 1.0.0
**Maintained by:** FructoSahel Team
