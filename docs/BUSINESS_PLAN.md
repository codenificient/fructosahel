# FructoSahel Business Plan

## 1. Executive Summary

**Company:** FructoSahel
**Product:** AI-powered farm management SaaS platform for fruit producers in the Sahel region of West Africa
**Markets:** Burkina Faso, Mali, Niger
**Stage:** Product-complete, deployed to production (v1.2.1), pre-revenue
**Website:** https://fructosahel.vercel.app

FructoSahel is a bilingual (French/English) web and mobile-ready platform that helps smallholder and commercial fruit farmers manage their operations end-to-end: farm and crop tracking, task management, financial record-keeping, team coordination, and AI-powered advisory services for agronomy, marketing, and finance. The platform is purpose-built for the Sahel's climate, crops, currency (XOF), and market conditions.

The product is fully developed across 12 implementation phases, deployed on Vercel with Neon PostgreSQL, and features PWA/offline capability critical for areas with unreliable internet connectivity.

---

## 2. Problem Statement

Fruit farming in the Sahel faces compounding challenges:

- **Limited access to expertise.** Extension services are underfunded. Most smallholder farmers rely on oral knowledge transfer and have no access to agronomists, market analysts, or financial advisors.
- **Poor record-keeping.** Farm operations, expenses, and revenues are tracked on paper or not at all, making it impossible to assess profitability or secure financing.
- **Climate severity.** Semi-arid conditions (400-900mm annual rainfall), extreme heat (35-45°C), and Harmattan winds require specialized cultivation techniques (zai pits, half-moon planting, drip irrigation) that many farmers don't know.
- **Fragmented market information.** Farmers lack visibility into current prices, buyer networks, and export channels, leaving them vulnerable to exploitative intermediaries.
- **Connectivity gaps.** Rural areas have intermittent internet, making cloud-only tools impractical.

These problems result in low yields, wasted harvests, thin margins, and an inability to attract investment into a sector with significant growth potential.

---

## 3. Solution

FructoSahel addresses each of these problems with a single integrated platform:

| Problem | FructoSahel Solution |
|---------|---------------------|
| No expert access | 3 AI advisors (Agronomist, Marketing, Finance) powered by Claude, trained on Sahel-specific knowledge |
| Poor record-keeping | Digital farm, crop, task, and financial management with XOF-native accounting |
| Climate complexity | Growing guides for 6 key crops adapted to Sahel conditions, with AI recommendations |
| Market opacity | AI marketing advisor with knowledge of local markets (Ouagadougou, Bamako, Niamey), cooperatives, and export channels |
| Connectivity | PWA with full offline support via IndexedDB, background sync when reconnected |

**Key differentiators:**

- Sahel-first design (not a generic global ag-tech product localized as an afterthought)
- XOF currency native throughout (not USD/EUR with conversion)
- Bilingual French/English (French is the primary business language across all 3 target countries)
- AI agents with deep contextual knowledge of Sahel agriculture, including microfinance options (RCPB, FAARF), local wage rates (2,000-3,500 XOF/day), and agricultural loan rates (8-15%)
- Works offline in areas with poor connectivity

---

## 4. Market Analysis

### 4.1 Market Size

| Metric | Estimate |
|--------|----------|
| Population (BF + Mali + Niger) | ~70 million |
| Agricultural workforce (% of population) | 70-80% |
| Fruit-producing households (subset) | Est. 2-5 million |
| Addressable market (smartphone-owning, literate farmers, cooperatives, commercial farms) | Est. 200,000-500,000 |

The West African agricultural technology market is nascent but growing rapidly, driven by smartphone penetration (projected 75%+ by 2030 in urban areas), mobile money adoption, and government digitization programs.

### 4.2 Target Customer Segments

1. **Commercial fruit farms** (5-100+ hectares) - Highest willingness to pay. Need multi-farm, multi-team coordination. Estimated 5,000-10,000 across the 3 countries.
2. **Agricultural cooperatives** - Umbrella organizations managing dozens of member farms. Purchasing decision made centrally. Strong distribution channel.
3. **Progressive smallholder farmers** (1-5 hectares) - Price-sensitive but growing in digital literacy. Highest volume segment. Reach via cooperatives, NGO partnerships, and mobile-first UX.
4. **NGOs and development organizations** - Operating agricultural development programs. Could license FructoSahel for beneficiary farmers as part of aid programs.
5. **Government agricultural agencies** - Potential for bulk licensing or public-private partnerships.

### 4.3 Competitive Landscape

| Competitor | Focus | Weakness vs FructoSahel |
|-----------|-------|------------------------|
| FarmLogs / Granular | US/EU large-scale row crops | No Sahel presence, wrong crops, wrong language, wrong currency |
| Agrivi | Global crop management | Generic; no Sahel-specific AI, no XOF, no French |
| mAgri solutions (Esoko, Farmerline) | West Africa SMS-based market prices | Limited to price alerts; no farm management, no AI advisory |
| Local spreadsheet/paper-based | Manual tracking | No intelligence, no collaboration, not scalable |

FructoSahel occupies a distinct niche: a full-featured SaaS farm management platform built specifically for Sahel fruit production with AI advisory capabilities. No direct competitor offers this combination.

---

## 5. Product Overview

### 5.1 Core Modules (All Built)

- **Farm & Crop Management** - Track farms, fields, and crops through full lifecycle (planning to harvested). GPS coordinates, soil types, irrigation methods, crop activities.
- **AI Advisory System** - 3 specialized agents (Agronomist, Marketing, Finance) with streaming chat, conversation persistence, and Sahel-specific system prompts.
- **Task Management** - CRUD with priority levels, calendar view, team assignment, due date alerts, push notifications for overdue tasks.
- **Financial Tracking** - Income/expense recording, sales tracking (buyer, quantity in kg, price per kg), revenue vs expense charting, monthly reports, CSV export.
- **Team Management** - Role-based access (admin, manager, worker, viewer), member profiles, task assignment.
- **Knowledge Base** - 6 complete growing guides (pineapple, cashew, mango, avocado, banana, papaya) with Sahel-specific adaptations.
- **Analytics Dashboard** - 8 chart types covering revenue, crop distribution, task status, sales trends, farm productivity, and crop performance.
- **PWA & Offline** - Installable on mobile, IndexedDB storage, mutation queuing, background sync, offline indicator.
- **Push Notifications** - Cron-scheduled task reminders, overdue alerts, daily digest, user preference controls.
- **Demo Mode** - Full dashboard experience without authentication, using realistic mock data from farms across Burkina Faso, Mali, and Niger.

### 5.2 Technical Architecture

- **Frontend/Backend:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** Neon serverless PostgreSQL, Drizzle ORM, 15 tables
- **Auth:** Stack Auth
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Deployment:** Vercel (EU region), with Sentry error monitoring and custom analytics
- **Testing:** 55 unit tests (Vitest), 84 E2E tests (Playwright), CI/CD via GitHub Actions

---

## 6. Business Model

### 6.1 Revenue Model: Freemium SaaS with Tiered Pricing

| Tier | Price (Monthly) | Target | Includes |
|------|----------------|--------|----------|
| **Free** | 0 XOF | Smallholder farmers, trial users | 1 farm, 2 crops, basic task management, knowledge base, limited AI queries (10/month) |
| **Pro** | 5,000 XOF (~7.60 EUR) | Progressive farmers, small commercial operations | Up to 5 farms, unlimited crops, full financial tracking, 50 AI queries/month, push notifications |
| **Business** | 25,000 XOF (~38 EUR) | Commercial farms, cooperatives | Unlimited farms, full team management (up to 20 users), unlimited AI queries, reports & CSV export, priority support |
| **Enterprise** | Custom | NGOs, government agencies, large cooperatives | Custom deployment, bulk user licensing, API access, dedicated support, training |

### 6.2 Additional Revenue Streams

- **NGO/Development partnerships** - Per-beneficiary licensing for agricultural development programs (e.g., World Bank, USAID, AFD projects).
- **Data insights** (anonymized, aggregate) - Crop yield benchmarks, regional price trends, and agricultural intelligence sold to government agencies, research institutions, and commodity traders.
- **Premium AI add-ons** - Specialized AI modules for pest identification (photo-based), weather-integrated planting schedules, or irrigation optimization.
- **Mobile money integration fees** - Transaction processing for marketplace features (connecting farmers to buyers) at 1-2% commission.

### 6.3 Pricing Rationale

- 5,000 XOF/month is approximately the cost of 2 days of farm labor (2,000-3,500 XOF/day) - affordable for a tool that demonstrably improves productivity.
- Enterprise/NGO licensing provides high-value contracts that reduce dependence on individual subscriptions.
- Free tier serves as the acquisition funnel and aligns with the social mission.

---

## 7. Go-to-Market Strategy

### Phase 1: Validation & Early Adoption (Months 1-6)

- **Pilot with 5-10 cooperatives** in Ouagadougou and Bobo-Dioulasso (Burkina Faso) - the most stable of the 3 target markets.
- **Free tier launch** to build user base and gather feedback.
- **Partner with 1-2 agricultural NGOs** operating in Burkina Faso for credibility and distribution.
- **Content marketing** in French: growing guides, crop pricing updates, farming tips via WhatsApp groups and Facebook (dominant social platform in West Africa).
- **Demo mode** as primary sales tool - let prospects experience the full platform without signup friction.

### Phase 2: Monetization & Expansion (Months 7-18)

- Launch paid tiers based on validated willingness-to-pay from pilot.
- Expand to Bamako (Mali) and Niamey (Niger).
- Mobile money payment integration (Orange Money, Moov Money, MTN Mobile Money).
- Hire local agricultural extension agents as sales representatives (commission-based).
- Apply for agricultural technology grants and accelerator programs (e.g., CTA, CGIAR, AfDB agricultural innovation fund).

### Phase 3: Scale (Months 18-36)

- Expand crop coverage beyond fruit (vegetables, cereals) to increase addressable market.
- Expand geography to Senegal, Cote d'Ivoire, Ghana, and other ECOWAS countries.
- Marketplace feature connecting farmers directly to buyers.
- Mobile money integration for in-app transactions.
- Pursue government contracts for national agricultural digitization programs.

---

## 8. Operations Plan

### 8.1 Team Requirements

| Role | Priority | Timing |
|------|----------|--------|
| Founder/CEO | Existing | Now |
| Full-stack developer (1-2) | High | Months 1-3 |
| Agricultural domain expert (Sahel) | High | Months 1-3 |
| Community/growth manager (French-speaking, based in Burkina Faso) | High | Months 3-6 |
| Sales/partnerships lead (West Africa-based) | Medium | Months 6-12 |
| Customer support (French-speaking) | Medium | Months 6-12 |
| Data/AI engineer | Medium | Months 12-18 |

### 8.2 Infrastructure Costs (Monthly)

| Item | Estimated Cost |
|------|---------------|
| Vercel Pro (hosting) | $20-150 |
| Neon PostgreSQL (database) | $19-69 |
| Anthropic API (AI queries) | $50-500 (usage-based) |
| Stack Auth | $0-25 |
| Sentry (error monitoring) | $0-26 |
| Domain & DNS | ~$15 |
| **Total (early stage)** | **~$100-800/month** |

Infrastructure costs scale with usage, keeping the burn rate low during validation.

---

## 9. Financial Projections

### Year 1 (Validation)

- **Users:** 500-2,000 (mostly free tier)
- **Paying customers:** 50-200
- **Revenue:** 3-12M XOF (4,500-18,000 EUR)
- **Costs:** Infrastructure + 1-2 staff -> ~30,000-60,000 EUR
- **Net:** Operating at a loss; funded by grants, savings, or seed investment

### Year 2 (Growth)

- **Users:** 5,000-15,000
- **Paying customers:** 500-2,000 + 2-5 enterprise/NGO contracts
- **Revenue:** 30-100M XOF (45,000-150,000 EUR)
- **Costs:** Team of 5-8, infrastructure, marketing -> ~100,000-180,000 EUR
- **Net:** Approaching break-even with enterprise contracts

### Year 3 (Scale)

- **Users:** 20,000-50,000
- **Paying customers:** 3,000-10,000 + 10+ enterprise contracts
- **Revenue:** 200-500M XOF (300,000-760,000 EUR)
- **Net:** Profitable if enterprise channel develops; reinvesting into expansion

---

## 10. Funding Requirements

### Seed Round: 50,000-150,000 EUR

**Use of funds:**

- 40% - Team (local hires in Burkina Faso, part-time developers)
- 25% - Market validation and pilot programs
- 20% - Infrastructure and API costs
- 15% - Marketing and partnerships

**Target sources:**

- Agricultural technology grants (AfDB, World Bank Digital Agriculture programs, EU development funds)
- Francophone African tech accelerators (Orange Fab, Afric'innov, CcHub)
- Angel investors with West African agricultural exposure
- Impact investment funds focused on food security and climate adaptation

---

## 11. Risk Analysis

| Risk | Severity | Mitigation |
|------|----------|------------|
| Low smartphone/internet penetration in rural areas | High | PWA/offline support already built; USSD or SMS interface as future fallback |
| Willingness to pay for digital tools is low | High | Free tier for adoption; demonstrate ROI via pilot programs; NGO subsidies |
| Political instability in Mali/Niger | High | Start in Burkina Faso; modular country expansion; cloud infrastructure has no local dependency |
| Competition from global ag-tech entering the market | Medium | Deep Sahel specialization is defensible; local language, currency, and market knowledge are hard to replicate |
| AI API costs scale faster than revenue | Medium | Usage limits per tier; caching common queries; potential migration to smaller/cheaper models for basic queries |
| User adoption requires in-person training | Medium | Demo mode reduces onboarding friction; partner with cooperatives for group training; invest in video tutorials in French |
| Currency fluctuation (XOF is pegged to EUR) | Low | XOF-EUR peg provides stability; all pricing in XOF |

---

## 12. Social Impact & Mission Alignment

FructoSahel is positioned as a social enterprise with measurable impact:

- **Food security** - Improving yields and reducing post-harvest losses in one of the world's most food-insecure regions.
- **Financial inclusion** - Digital record-keeping enables farmers to demonstrate creditworthiness for loans.
- **Climate adaptation** - AI-guided cultivation techniques help farmers adapt to worsening Sahel conditions.
- **Knowledge democratization** - Expert-level agricultural, marketing, and financial advice accessible to any farmer with a phone.
- **Youth engagement** - A modern tech platform that makes agriculture appealing to younger generations who might otherwise leave rural areas.

This mission alignment opens doors to impact investors, development agencies, and CSR partnerships that pure commercial ventures cannot access.

---

## 13. Key Milestones

| Timeline | Milestone |
|----------|-----------|
| Q1 2026 | Product complete (done), begin pilot program with 5 cooperatives in Burkina Faso |
| Q2 2026 | 500 registered users, first NGO partnership signed, mobile money payment integration |
| Q3 2026 | Launch paid tiers, 100 paying customers, apply to 2+ ag-tech accelerators |
| Q4 2026 | Expand to Mali, first enterprise contract, 2,000 users |
| Q1 2027 | Expand to Niger, seed funding closed, team of 5+ |
| Q3 2027 | 10,000 users, marketplace feature beta, approaching break-even |
| 2028 | ECOWAS expansion (Senegal, Cote d'Ivoire), Series A consideration |

---

## 14. Conclusion

FructoSahel has a rare advantage: the product is already built and deployed. The 12-phase development is complete, the platform supports offline operation critical for the target market, and the AI advisory system provides genuine value that no competitor offers in this region.

The path forward is execution-focused: validate with real farmers, sign cooperative and NGO partnerships, and build a lean local team. The addressable market is large, the competitive landscape is empty, and the social impact potential makes this attractive to a wide range of funders beyond traditional VC.

The question is not whether Sahel farmers need better tools - they do. The question is whether FructoSahel can reach them through the right distribution channels and pricing. The infrastructure to answer that question is already live.
