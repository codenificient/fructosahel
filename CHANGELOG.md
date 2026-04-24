## [1.15.1](https://github.com/codenificient/fructosahel/compare/v1.15.0...v1.15.1) (2026-04-24)

### Bug Fixes

* **charts:** resolve Recharts Tooltip formatter type errors (ValueType | undefined) ([56781b8](https://github.com/codenificient/fructosahel/commit/56781b8de35033fefe960da36a15584ce49aacb1))

## [1.15.0](https://github.com/codenificient/fructosahel/compare/v1.14.6...v1.15.0) (2026-04-24)

### Features

* **auth:** migrate to codeniserver proxy-auth, swap DB driver to pg ([50b2192](https://github.com/codenificient/fructosahel/commit/50b219202999f229b374faf1d12221b8525c3b3b))

## [1.14.6](https://github.com/codenificient/fructosahel/compare/v1.14.5...v1.14.6) (2026-04-24)

### Bug Fixes

* **db:** switch from Neon HTTP driver to pg (node-postgres) for CNPG ([0de7c36](https://github.com/codenificient/fructosahel/commit/0de7c36e46edf218cadb04cf25d49f876b654238))

## [1.14.5](https://github.com/codenificient/fructosahel/compare/v1.14.4...v1.14.5) (2026-04-14)

### Bug Fixes

* bypass locale rewriting for all /api routes ([f2c5e53](https://github.com/codenificient/fructosahel/commit/f2c5e53ccaa9da56086402d7f480c63a4b312fc5))

## [1.14.4](https://github.com/codenificient/fructosahel/compare/v1.14.3...v1.14.4) (2026-04-14)

### Bug Fixes

* increase healthcheck start-period and show wget errors ([b0098cc](https://github.com/codenificient/fructosahel/commit/b0098ccb09ce6efe652708d9428795f46c7b6058))

## [1.14.3](https://github.com/codenificient/fructosahel/compare/v1.14.2...v1.14.3) (2026-04-14)

### Bug Fixes

* exclude /api/health from proxy auth check ([d87aeb6](https://github.com/codenificient/fructosahel/commit/d87aeb61d90db3971accf049bc040d307ef6b66a))

## [1.14.2](https://github.com/codenificient/fructosahel/compare/v1.14.1...v1.14.2) (2026-04-14)

### Bug Fixes

* add required enabled field to AnalyticsConfig ([daf751d](https://github.com/codenificient/fructosahel/commit/daf751d93ae269e0e15db1ed2bd4e5b222c96210))

## [1.14.1](https://github.com/codenificient/fructosahel/compare/v1.14.0...v1.14.1) (2026-04-14)

### Bug Fixes

* **deploy:** full-source docker build (fixes prisma postinstall / analytics config) ([a169b09](https://github.com/codenificient/fructosahel/commit/a169b09aafef580f8c1a1d83cfc9a0a2ce02cbdb))

## [1.14.0](https://github.com/codenificient/fructosahel/compare/v1.13.2...v1.14.0) (2026-04-03)

### Features

* upgrade analytics SDK v2.0 — ClickHouse + Web Vitals + error tracking ([a58f021](https://github.com/codenificient/fructosahel/commit/a58f021868307ec16777cc97a55f7af654a93008))

## [1.13.2](https://github.com/codenificient/fructosahel/compare/v1.13.1...v1.13.2) (2026-03-30)

### Bug Fixes

* enable class-based dark mode for Tailwind v4 ([5e83f3f](https://github.com/codenificient/fructosahel/commit/5e83f3f81b85aa09c0544be11e1937f280f9e009))
* remove nested html/body tags causing dark mode text color bug ([58b8e50](https://github.com/codenificient/fructosahel/commit/58b8e5077f6f02e964d739f012a85a445816dca0))

## [1.13.1](https://github.com/codenificient/fructosahel/compare/v1.13.0...v1.13.1) (2026-03-17)

### Bug Fixes

* proxy Umami analytics through app domain to bypass adblockers ([7ee1a7f](https://github.com/codenificient/fructosahel/commit/7ee1a7f7f38dc53a3d7b55c4ca7191eec12ecf34))

## [1.13.0](https://github.com/codenificient/fructosahel/compare/v1.12.2...v1.13.0) (2026-03-17)

### Features

* add seed script, error boundary, and fix build stability ([66fdcd9](https://github.com/codenificient/fructosahel/commit/66fdcd9649fbcbf2d780d7d5c04647ce02366f2f))

## [1.12.2](https://github.com/codenificient/fructosahel/compare/v1.12.1...v1.12.2) (2026-03-17)

### Bug Fixes

* update analytics endpoint to codenalytics.vercel.app ([4cfaa2f](https://github.com/codenificient/fructosahel/commit/4cfaa2f4985ad653a715327e188f6080cb18af06))

## [1.12.1](https://github.com/codenificient/fructosahel/compare/v1.12.0...v1.12.1) (2026-03-17)

### Bug Fixes

* add middleware, auth header fix, and CLAUDE.md ([f17425e](https://github.com/codenificient/fructosahel/commit/f17425eac7c83e69605553d7975cd8e860dc4cc5))

## [1.12.0](https://github.com/codenificient/fructosahel/compare/v1.11.1...v1.12.0) (2026-03-16)

### Features

* add Umami analytics tracking ([2967eb2](https://github.com/codenificient/fructosahel/commit/2967eb25ea2ff10895a32c3488410deb5904ae4c))

## [1.11.1](https://github.com/codenificient/fructosahel/compare/v1.11.0...v1.11.1) (2026-02-23)

### Bug Fixes

* resolve sidebar active link not updating with as-needed localePrefix ([5da1e7d](https://github.com/codenificient/fructosahel/commit/5da1e7d10eea3ad5f7a990aa43e129a11f4075fa))

### Documentation

* mark tasks 2.8 and 6.9 as done in implementation plan ([9d9fb71](https://github.com/codenificient/fructosahel/commit/9d9fb71771cd934a45f10bd44428ae4bf153435b))

## [1.11.0](https://github.com/codenificient/fructosahel/compare/v1.10.0...v1.11.0) (2026-02-22)

### Features

* fix auth cookie detection, add basePath, and seed database ([ae073c6](https://github.com/codenificient/fructosahel/commit/ae073c663491345e4505b190b5b97040d804bdaf))
* migrate from Stack Auth to Neon Auth ([26a4425](https://github.com/codenificient/fructosahel/commit/26a4425a10cc5654248707cfae07ef701243ab9e))
* wire up logout buttons and consolidate sidebars ([6147b2e](https://github.com/codenificient/fructosahel/commit/6147b2e6ef960ec56980b55684639c146868b5f9))

### Bug Fixes

* disambiguate user-task relations in Drizzle schema ([10dd76a](https://github.com/codenificient/fructosahel/commit/10dd76ae0b39df047cd52306a9a47cf868d2c23b))
* reconfigure Neon Auth API route and auth page ([87eeb66](https://github.com/codenificient/fructosahel/commit/87eeb66ae12460d855437ce40a15265f9491b20f))
* rename auth route back to [...path] to match handler internals ([b382c1f](https://github.com/codenificient/fructosahel/commit/b382c1ff834c8d0e2178941a16b6a70a4c742e57))
* resolve reports page DB error and flatten nested Drizzle queries ([b1f8a46](https://github.com/codenificient/fructosahel/commit/b1f8a469600e2d0ad67ad678da8a75df31eaa651))

## [1.10.0](https://github.com/codenificient/fructosahel/compare/v1.9.0...v1.10.0) (2026-02-22)

### Features

* add themed auth page layout with shared header and footer ([2e1c905](https://github.com/codenificient/fructosahel/commit/2e1c9051434c0b3061fd593a0ae887c3388051ff))

## [1.9.0](https://github.com/codenificient/fructosahel/compare/v1.8.0...v1.9.0) (2026-02-22)

### Features

* add binary dark mode toggle to shared headers ([1913199](https://github.com/codenificient/fructosahel/commit/1913199ff3a4c0c188a64c5824d64acafa090b19))

## [1.8.0](https://github.com/codenificient/fructosahel/compare/v1.7.0...v1.8.0) (2026-02-21)

### Features

* add configurable multi-currency support (XOF, USD, ECO) ([c99f5db](https://github.com/codenificient/fructosahel/commit/c99f5db7751b5282d03c9159bf7d7cebbd094c30))

## [1.7.0](https://github.com/codenificient/fructosahel/compare/v1.6.0...v1.7.0) (2026-02-21)

### Features

* add logistics system, youth training, and updated financial projections ([10f6904](https://github.com/codenificient/fructosahel/commit/10f6904b0a45e7cba1e8acf6890da41326615c16))

## [1.6.0](https://github.com/codenificient/fructosahel/compare/v1.5.0...v1.6.0) (2026-02-21)

### Features

* add roadmap/timeline feature, livestock tracking, and 17 new crop types ([8ececa7](https://github.com/codenificient/fructosahel/commit/8ececa7f853de51b4aea80b70337ba89a1df6907))

## [1.5.0](https://github.com/codenificient/fructosahel/compare/v1.4.0...v1.5.0) (2026-02-21)

### Features

* **ui:** replace language dropdown with binary flag toggle ([4b85e35](https://github.com/codenificient/fructosahel/commit/4b85e35051b14c4565b98439bd232390b192fc1c))

## [1.4.0](https://github.com/codenificient/fructosahel/compare/v1.3.0...v1.4.0) (2026-02-21)

### Features

* **ui:** redesign frontend with Sahel-inspired palette, new fonts, and refreshed copy ([6353fa1](https://github.com/codenificient/fructosahel/commit/6353fa112e048dc625b666c847f923b33a6c365a))

## [1.3.0](https://github.com/codenificient/fructosahel/compare/v1.2.1...v1.3.0) (2026-02-21)

### Features

* wire dashboard overview to real data and add demo reports page ([ce756ad](https://github.com/codenificient/fructosahel/commit/ce756ad9dc493eb26c189912a9f493624a3b4038))

### Documentation

* add business plan and The Moringa Plan master strategy ([69b2a1f](https://github.com/codenificient/fructosahel/commit/69b2a1fc2a1a6e45aa4701a632b2d16a2bd20618))

## [1.2.1](https://github.com/codenificient/fructosahel/compare/v1.2.0...v1.2.1) (2026-02-08)

### Bug Fixes

* **deps:** resolve 11 of 12 Dependabot security vulnerabilities ([07d3d31](https://github.com/codenificient/fructosahel/commit/07d3d31a06bfed383ee24d171f967b33be97d0c4))

## [1.2.0](https://github.com/codenificient/fructosahel/compare/v1.1.0...v1.2.0) (2026-02-08)

### Features

* **ai:** implement streaming responses for AI chat ([0923661](https://github.com/codenificient/fructosahel/commit/092366166e530739f194650a996d3b30e0c14dac))
* **analytics:** integrate telemetry with analytics dashboard ([5e0e2bc](https://github.com/codenificient/fructosahel/commit/5e0e2bcb4eba2346bd8ddd1eaf020f0ab8d234a9))
* **auth:** add demo link to landing page and protect dashboard routes ([699bdeb](https://github.com/codenificient/fructosahel/commit/699bdeb017758d3d5972d1e58ac7e36a1c17aea1))
* **auth:** implement Neon Auth (Stack Auth) login system ([831f7a4](https://github.com/codenificient/fructosahel/commit/831f7a42474df58e285460521f0dc700531ac4ac))
* **branding:** add favicon and improve metadata ([ab32e70](https://github.com/codenificient/fructosahel/commit/ab32e70187683d3aadc92b074db1beeef5f4db27))
* **branding:** replace Vercel template assets with custom FructoSahel icons ([daee6b7](https://github.com/codenificient/fructosahel/commit/daee6b7716b0040a747b9f7eb632748e9ccf390f))
* **dashboard:** add demo data fallbacks to all dashboard pages ([8acf607](https://github.com/codenificient/fructosahel/commit/8acf60708c609625383b69d4df649af3eceedcb1))
* **dashboard:** implement crops page with demo data ([25fa106](https://github.com/codenificient/fructosahel/commit/25fa10665d08c9daaadf702f225c403d729e8dc1))
* **demo:** create demo route with demo data, update dashboard to use real DB ([0ae4b9c](https://github.com/codenificient/fructosahel/commit/0ae4b9c79c0ae6e9666dcee398b78365f1e0575b))
* implement 9 major features from implementation plan ([49b174c](https://github.com/codenificient/fructosahel/commit/49b174cf998275a89cf9007c76a5c159fc076d8e))

### Bug Fixes

* **deploy:** remove secret references from vercel.json ([909816c](https://github.com/codenificient/fructosahel/commit/909816c243816c48b3f6c807394d1222f02c4cdf))
* **nav:** correct crops page path in dashboard sidebar ([4d40e98](https://github.com/codenificient/fructosahel/commit/4d40e981d04a6f9a8562343fa8a1166e76efd8e0))

### Documentation

* rewrite README with comprehensive project documentation ([5dc07d8](https://github.com/codenificient/fructosahel/commit/5dc07d837404cc4821aa202a2c0917982313885a))
* update implementation plan - mark 9 features as completed ([a1d1bec](https://github.com/codenificient/fructosahel/commit/a1d1bec1e9b2c80288a40fffd1fd7a19d71bbb9c))

## [1.1.0](https://github.com/codenificient/fructosahel/compare/v1.0.0...v1.1.0) (2025-11-26)

### Features

* **api:** implement Phase 8-9 API development and data integration ([bca07b2](https://github.com/codenificient/fructosahel/commit/bca07b20ed45d13cbd196709854707f1a4298227))
* **dashboard:** implement Phase 10 advanced features ([9a1b2e8](https://github.com/codenificient/fructosahel/commit/9a1b2e8342ac6ce66a07c75de06078fc66512a00))

## 1.0.0 (2025-11-26)

### Features

* Complete FructoSahel farm management platform implementation ([a68d828](https://github.com/codenificient/fructosahel/commit/a68d8286761c89aa2fa3ba06cdb7ed3309d8e670))

# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
