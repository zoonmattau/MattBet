# Golf Trip Bookmaker - Setup Guide

## Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Then run `supabase/seed.sql` to populate initial data
4. Go to **Settings > API** and copy your project URL and anon key

### 3. Create admin user

In Supabase Dashboard:
1. Go to **Authentication > Users**
2. Click **Add User**
3. Create a user with email `matthew.parker@live.com.au` and your chosen password
4. The RLS policies are configured to grant this email admin access

### 4. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations like sheet sync)

### 5. Run the app

```bash
npm run dev
```

Visit:
- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login

## Google Sheets Integration

### Setting up leaderboard sync

1. Create a Google Sheet with leaderboard data
2. **Individual sheet** columns: `player_name, team_name, handicap, round_1_score, round_1_points, round_2_score, round_2_points, round_3_score, round_3_points, round_4_score, round_4_points, total_points, position`
3. **Team sheet** columns: `team_name, round_1_points, round_2_points, round_3_points, round_4_points, total_points, position`
4. Go to **File > Share > Publish to web**
5. Select the specific sheet tab, choose **CSV** format
6. Copy the published URL
7. In the admin panel, go to **Settings** and paste the URL(s)
8. Go to **Leaderboard** and click **Sync from Sheet**

## Project Structure

```
src/
  app/
    (public)/           # Public-facing pages
      page.tsx          # Home
      markets/          # Markets listing and detail
      teams/            # Teams page
      leaderboard/      # Leaderboard page
      rules/            # Rules page
      my-bets/          # User bet lookup
    admin/
      login/            # Admin login
      (authenticated)/  # Protected admin routes
        page.tsx        # Dashboard
        markets/        # Market management (CRUD, odds, settlement)
        bets/           # Bet management
        exposure/       # Risk/exposure analysis
        leaderboard/    # Leaderboard management and sync
        settings/       # App settings
    api/
      leaderboard/sync/ # Sheet sync API endpoint
  components/
    public-layout.tsx   # Public site layout with nav
    admin-layout.tsx    # Admin layout with nav
    market-card.tsx     # Market display card
    bet-slip.tsx        # Bet slip component
    odds-button.tsx     # Odds display button
    status-badge.tsx    # Status/category badges
    ui/                 # shadcn/ui components
  lib/
    types.ts            # TypeScript types
    constants.ts        # Trip data, categories
    exposure.ts         # Liability calculations
    sheets-sync.ts      # Google Sheets CSV parser
    supabase/           # Supabase client setup
supabase/
  schema.sql            # Database schema
  seed.sql              # Seed data (teams, players, markets, sample bets)
```

## Key Features

### Public Site
- Browse all betting markets by category
- Place bets with name-based identification
- View teams, leaderboard, and rules
- Look up your bets by name
- Mobile-first responsive design

### Admin Panel
- Dashboard with KPIs (total bets, handle, liability, active bettors)
- Full market CRUD (create, edit odds, add/remove selections)
- Quick market status changes (open/suspend/settle/void)
- Market settlement with winner selection (auto-updates all bets)
- Market duplication
- Bet management with void capability
- Per-market exposure analysis (liability, net result per selection)
- Portfolio-level risk overview (riskiest markets, most profitable)
- Leaderboard editing (inline for both individual and team)
- Google Sheet sync with logging
- Settings management

## Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Future Improvements

- Real-time updates via Supabase subscriptions for live odds changes
- Multi-leg / accumulator bets
- User authentication for bettors (not just name-based)
- Push notifications for market changes
- Automated settlement based on leaderboard data
- Profit/loss reporting over time
- Bet limits per market/user
- OAuth-based Google Sheets API integration (instead of published CSV)
- Auto-sync polling with configurable intervals
- Export bets/exposure data to CSV
