---
name: Booster AI env vars and Supabase client
description: Environment variable setup and Supabase client config for the booster-ai artifact.
---

**Rule:** VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set as Replit shared env vars (not secrets) so Vite's import.meta.env picks them up. The supabase.ts client must use placeholder fallback, never throw on missing vars.

**Why:** VITE_ vars are exposed to the browser at build/dev time. If they throw on missing, the entire app crashes before HMR loads. Placeholder approach lets the app load gracefully; actual calls will fail silently at runtime until vars are set.

**How to apply:** In supabase.ts: `const supabaseUrl = env.supabaseUrl || "https://placeholder.supabase.co"`. Use setEnvVars (not requestEnvVar) to set them as they are not sensitive enough to require the secret vault.
