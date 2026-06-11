---
name: Supabase direct DB connection
description: Replit blocks outbound port 5432; can't use psql or pg to connect to Supabase DB directly.
---

**Rule:** Never attempt direct psql/pg connections to Supabase from Replit — port 5432 is blocked by the sandbox.

**Why:** Replit's network sandbox blocks outbound TCP connections to arbitrary hosts on PostgreSQL port 5432. Both psql and pg Node.js library fail with ENOTFOUND/connection refused.

**How to apply:** For DDL migrations against a Supabase project, generate the SQL file and instruct the user to paste it in the Supabase SQL Editor (dashboard → SQL Editor → New query). For DML (inserts/updates), use the supabase-js client over HTTP (port 443) which works fine.
