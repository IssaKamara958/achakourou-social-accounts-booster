# ACAB - Quick Start Guide for Developers

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Node.js 20+
- Supabase account (project created)
- OAuth app credentials (Facebook, Instagram, TikTok)

---

## Step 1: Setup Repository

```bash
# Clone project
git clone <repository-url>
cd achakourou-social-accounts-booster

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

---

## Step 2: Configure Environment

Edit `.env.local` with your credentials:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_key

# OAuth Apps (get from developer platforms)
VITE_FACEBOOK_APP_ID=your_id
VITE_FACEBOOK_APP_SECRET=your_secret
VITE_INSTAGRAM_APP_ID=your_id
VITE_INSTAGRAM_APP_SECRET=your_secret
VITE_TIKTOK_CLIENT_KEY=your_key
VITE_TIKTOK_CLIENT_SECRET=your_secret

# AI
VITE_OPENAI_API_KEY=your_api_key

# Sync
SYNC_CRON_SECRET=any_random_secret
```

---

## Step 3: Setup Database

```bash
# Apply migrations to Supabase
supabase migration up --remote

# Verify tables were created
supabase db tables --remote
```

---

## Step 4: Deploy Edge Functions

```bash
# Deploy sync function
supabase functions deploy sync-social-accounts

# Set environment variables for function
supabase secrets set --env-file .env.local
```

---

## Step 5: Run Locally

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:5000

# Navigate to
http://localhost:5000/app/social
```

---

## 📝 First Steps - What to Test

### 1. Connect an Account

```
1. Go to http://localhost:5000/app/social
2. Click "Connecter Facebook" button
3. Complete OAuth flow
4. Account should appear in list
```

### 2. Create a Post

```
1. Select account from list
2. Click "Nouvelle Publication"
3. Enter caption and hashtags
4. Click "Créer"
```

### 3. Check Synchronization

```bash
# Trigger manual sync
curl -X POST http://localhost:5000/functions/v1/sync-social-accounts \
  -H "Authorization: Bearer YOUR_SYNC_SECRET"
```

---

## 🔍 Key Directories

### Frontend

```
src/
├── components/social/        # UI Components
├── hooks/use-social-accounts.ts  # React hooks
├── lib/social/               # Business logic
│   ├── oauth.ts             # OAuth flows
│   ├── platforms.ts         # API clients
│   ├── database.ts          # Supabase CRUD
│   ├── sync.ts              # Sync logic
│   └── ai-optimization.ts   # AI features
└── routes/app.social.tsx    # Page
```

### Backend

```
supabase/
├── migrations/              # SQL migrations
├── functions/               # Edge Functions
└── config.toml             # Supabase config
```

---

## 💻 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code style

# Supabase
supabase start       # Start local DB
supabase db pull     # Sync remote schema
supabase functions deploy sync-social-accounts

# Testing
npm test            # Run tests (if configured)
```

---

## 🐛 Debugging

### Check Logs

```bash
# Supabase logs
supabase functions logs sync-social-accounts

# Browser console
http://localhost:5000/ -> Press F12

# Network requests
DevTools -> Network tab (check API calls)
```

### Common Issues

#### OAuth redirect not working

```
Problem: "Redirect URL mismatch"
Solution:
1. Check VITE_*_CALLBACK_URL in .env.local
2. Update OAuth app settings with correct URL
3. Ensure port 5000 is accessible
```

#### Token expired

```
Problem: "Token has expired"
Solution: Automatic refresh is implemented
Check sync.ts for refresh logic
```

#### RLS permission denied

```
Problem: "new row violates row level security policy"
Solution:
1. Verify user is authenticated (check auth.uid())
2. Check RLS policies in supabase/migrations
3. Ensure user_id matches authenticated user
```

---

## 📚 Important Files to Know

| File                                | Purpose                  |
| ----------------------------------- | ------------------------ |
| `src/lib/social/types.ts`           | All TypeScript types     |
| `src/lib/social/oauth.ts`           | OAuth 2.0 implementation |
| `src/lib/social/platforms.ts`       | API client wrappers      |
| `src/lib/social/database.ts`        | Supabase queries         |
| `src/lib/social/sync.ts`            | Data synchronization     |
| `src/lib/social/ai-optimization.ts` | AI recommendations       |
| `supabase/migrations/*.sql`         | Database schema          |
| `IMPLEMENTATION_GUIDE.md`           | Full documentation       |
| `ROADMAP.md`                        | Project roadmap          |

---

## 🎯 Understanding the Architecture

### Data Flow

```
User
  ↓
React Component
  ↓
Hook (useSocialAccounts)
  ↓
Service (SocialAccountsService)
  ↓
Supabase (PostgreSQL + RLS)
```

### OAuth Flow

```
App (localhost:5000)
  ↓
OAuth Provider (Facebook/Instagram/TikTok)
  ↓
OAuth Callback Route
  ↓
Exchange Code for Token
  ↓
Store Account in DB
  ↓
Redirect to /app/social
```

### Sync Flow

```
Cron Job (Supabase)
  ↓
Edge Function
  ↓
Fetch from Social APIs
  ↓
Transform Data
  ↓
Store in DB
  ↓
Complete
```

---

## ✅ Checklist - First Day

- [ ] Clone repository
- [ ] Configure .env.local
- [ ] Setup Supabase project
- [ ] Apply migrations
- [ ] Deploy Edge Functions
- [ ] Start dev server
- [ ] Test OAuth with Facebook
- [ ] Create test post
- [ ] Check database
- [ ] Review code structure

---

## 🚨 Before Production

- [ ] Verify all OAuth URLs
- [ ] Test all three platforms (Facebook, Instagram, TikTok)
- [ ] Check error handling
- [ ] Enable RLS on all tables
- [ ] Setup monitoring (Sentry)
- [ ] Configure rate limiting
- [ ] Setup backups
- [ ] Perform load testing
- [ ] Security audit
- [ ] Get security review approval

---

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [Supabase Docs](https://supabase.io/docs)
- [OAuth 2.0](https://oauth.net/2/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API](https://developers.instagram.com/docs)
- [TikTok API](https://developers.tiktok.com/doc)

---

## 💬 Need Help?

1. Check `IMPLEMENTATION_GUIDE.md` for detailed API docs
2. Review `ROADMAP.md` for architecture overview
3. Check `PHASE1_SUMMARY.md` for status
4. Search existing GitHub issues
5. Ask team leads (IssaKamara958)

---

## 🎉 You're Ready!

Now you have:

- ✅ Running development server
- ✅ Connected database
- ✅ OAuth configured
- ✅ Sample data
- ✅ Documentation

**Next:** Start implementing Phase 2 features (Analytics & Dashboard)

---

**Happy Coding! 🚀**

_Last Updated: May 16, 2026_
