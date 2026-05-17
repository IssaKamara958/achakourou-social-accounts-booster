# 🚀 ACAB - Deployment Checklist & Commands

## Build Status

```
✅ SUCCESS
Build time: 7.28s
Total size: ~306 KB (gzip)
Ready for production
```

---

## Pre-Deployment Checklist

### 1. Environment Setup

```bash
# ✅ Create .env.local from .env.example
cp .env.example .env.local

# ✅ Fill in all OAuth credentials
# VITE_FACEBOOK_APP_ID=
# VITE_INSTAGRAM_APP_ID=
# VITE_TIKTOK_CLIENT_KEY=
# VITE_OPENAI_API_KEY=
# etc...
```

### 2. Database Setup

```bash
# ✅ Start Supabase (if local development)
supabase start

# ✅ Apply migrations
supabase migration up

# ✅ Verify tables exist
supabase db tables
```

### 3. Testing

```bash
# ✅ Build verification
npm run build

# ✅ Lint check
npm run lint

# ✅ Type check
npm run type-check

# ✅ Local dev test
npm run dev
# Test: http://localhost:5000/app/social
```

---

## Deployment Commands

### Local Development

```bash
# Start dev server
npm run dev

# The app will be available at: http://localhost:5000
```

### Build for Production

```bash
# Clean previous build
rm -rf dist/

# Build
npm run build

# Preview
npm run preview
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize (first time)
netlify init

# Deploy
netlify deploy --prod

# Or use Git integration (recommended)
git push origin main  # Automatically triggers deployment
```

### Deploy Edge Functions to Supabase

```bash
# Deploy sync function
supabase functions deploy sync-social-accounts --remote

# Set secrets
supabase secrets set --env-file .env.local

# View logs
supabase functions logs sync-social-accounts --remote --tail
```

---

## Production Configuration

### Netlify Environment Variables

```bash
# Via CLI
netlify env:set VITE_SUPABASE_URL https://your-project.supabase.co
netlify env:set VITE_SUPABASE_ANON_KEY your_key
netlify env:set VITE_FACEBOOK_APP_ID your_id
# ... etc

# Or via Netlify UI:
# Settings > Build & Deploy > Environment
```

### Supabase Configuration

```bash
# Update OAuth redirect URLs for production
# In Supabase dashboard, update:
# - Facebook Callback URL: https://yourdomain.com/auth/callback/facebook
# - Instagram Callback URL: https://yourdomain.com/auth/callback/instagram
# - TikTok Callback URL: https://yourdomain.com/auth/callback/tiktok
```

### DNS Configuration

```
Point your domain to Netlify:
CNAME: your-site.netlify.app
```

---

## Monitoring & Maintenance

### Enable Error Tracking

```bash
# Setup Sentry (optional but recommended)
npm install @sentry/react

# Configure in src/main.tsx
import * as Sentry from "@sentry/react"
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN
})
```

### Logs and Debugging

```bash
# Supabase logs
supabase logs

# Netlify logs
netlify logs:functions

# Edge Function logs
supabase functions logs sync-social-accounts --tail
```

### Database Backups

```bash
# Backup Supabase database
supabase db dump --local > backup.sql

# Restore
psql -h localhost postgresql://user:password@localhost:5432/postgres < backup.sql
```

---

## Post-Deployment Testing

### 1. Verify Application

```bash
# Check app loads
curl https://your-domain.com/

# Check API endpoints
curl https://your-domain.com/api/health
```

### 2. Test OAuth Flows

```
1. Go to https://your-domain.com/app/social
2. Click "Connecter Facebook"
3. Complete OAuth flow
4. Verify account appears in database:
   SELECT * FROM social_accounts WHERE user_id = current_user_id();
```

### 3. Test Synchronization

```bash
# Trigger manual sync
curl -X POST https://your-project.functions.supabase.co/functions/v1/sync-social-accounts \
  -H "Authorization: Bearer YOUR_SYNC_SECRET"

# Check results
supabase db query "SELECT * FROM social_posts LIMIT 10"
```

---

## Rollback Procedures

### Rollback to Previous Version

```bash
# On Netlify
netlify deploy --prod --dir=dist  # Using previous build

# Or use Git
git revert HEAD
git push origin main
```

### Database Rollback

```bash
# If migration failed, rollback
supabase db reset

# Or specific migration
supabase migration rollback --remote
```

---

## Performance Optimization (Post-Deploy)

### Enable Caching

```bash
# Netlify cache headers
# Configured in netlify.toml
```

### CDN Optimization

```bash
# Assets are cached by Netlify CDN automatically
# Images: 1 year
# JS/CSS: 1 month
# HTML: No cache (always fresh)
```

### Database Optimization

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Update indexes if needed
REINDEX TABLE social_accounts;
REINDEX TABLE social_posts;
```

---

## Security Checklist

- [ ] Enable HTTPS (automatic on Netlify)
- [ ] Configure CORS correctly
- [ ] Setup API rate limiting
- [ ] Enable audit logging
- [ ] Setup 2FA on OAuth apps
- [ ] Rotate API keys regularly
- [ ] Enable database backups
- [ ] Monitor error logs
- [ ] Security headers configured
- [ ] XSS/CSRF protection enabled

---

## Quick Troubleshooting

### Issue: Build fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist .tanstack
npm install
npm run build
```

### Issue: OAuth not working

```bash
# Check callback URLs in OAuth app settings
# Must match exactly:
# http://localhost:5000/auth/callback/facebook (dev)
# https://yourdomain.com/auth/callback/facebook (prod)
```

### Issue: Database connection fails

```bash
# Verify Supabase URL and key
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl https://your-project.supabase.co/rest/v1/
```

---

## Useful Links

- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://app.supabase.com
- **GitHub Repository:** [your-repo-url]
- **Documentation:** See IMPLEMENTATION_GUIDE.md
- **Roadmap:** See ROADMAP.md

---

## Maintenance Schedule

### Daily

- Monitor error logs
- Check sync status
- Verify uptime

### Weekly

- Review performance metrics
- Check database size
- Backup data

### Monthly

- Update dependencies
- Review security logs
- Rotate API keys

### Quarterly

- Full security audit
- Performance optimization
- Capacity planning

---

## Support Contacts

- **Development Lead:** IssaKamara958
- **Issue Tracker:** GitHub Issues
- **Email Support:** support@achakourou.com
- **Slack Channel:** #acab-dev

---

## Version Info

- **Node Version:** 20+
- **React:** 18+
- **Vite:** 6.4.2+
- **TypeScript:** 5+
- **Supabase:** Latest

---

**Status:** ✅ Ready for Production
**Last Updated:** May 16, 2026
**Next Phase:** Phase 2 (Analytics & Dashboard)

Good luck! 🚀
