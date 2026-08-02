# NFL Pick'em (Against the Spread)

A private NFL pick'em pool for 15–20 friends. Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

- Email/password auth with invite-code signup (keeps the pool private)
- Weekly game board with spreads — tap a team to pick
- Picks lock at kickoff (configurable per game)
- Season standings (W-L-P, win %)
- Admin panel to manage seasons, weeks, games, spreads, and final scores

## Quick start

### 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the migration:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Copy your project URL and anon key from **Settings → API**

### 2. Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
INVITE_CODE=pick-a-secret-code-for-your-group
```

### 3. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. First admin user

1. Sign up with your invite code
2. In Supabase SQL Editor, promote yourself to admin:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

3. Go to **Admin** → create a season (check "Set active") → add weeks → add games

## Spread convention

Spread is stored from the **home team's perspective**:

| Value | Meaning |
|-------|---------|
| `-3.5` | Home favored by 3.5 |
| `+2.5` | Home is 2.5-point underdog |

Home covers when: `home_score + spread > away_score`

## Project structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # UI components
└── lib/           # Supabase clients, scoring, queries, actions
supabase/
└── migrations/    # Database schema + RLS
```

## Deploy

Deploy to [Vercel](https://vercel.com) and add the same env vars. Set your Supabase **Site URL** and **Redirect URLs** to include your production domain (`/auth/callback`).

## Optional: disable email confirmation

For a small private pool, you may want instant sign-ups:

**Supabase → Authentication → Providers → Email → Confirm email = off**
