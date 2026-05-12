# Web Deployment

This dashboard is now designed for Vercel + Supabase, not public GitHub Pages.

## Required Services

- Vercel hosts `web/` and the serverless `api/` functions.
- Supabase provides Google Auth and the whitelist database.

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Enable Google as an Auth provider in Supabase.
4. Add your deployed Vercel URL to Supabase Auth redirect URLs.
5. Insert your first admin into `members` with `role = 'admin'` and `status = 'active'`.

## Vercel Environment Variables

Add these in Vercel Project Settings:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADMIN_EMAILS=you@example.com
```

`VITE_SUPABASE_ANON_KEY` is safe to expose to the browser. `SUPABASE_SERVICE_ROLE_KEY` must stay server-only in Vercel.

## Data Protection

- `api/_data` contains dashboard data and is not loaded as public static scripts.
- `api/_private/app.js` contains the private dashboard bundle and is served only after whitelist validation.
- `api/_assets` contains protected generated images served through `/api/private-asset`.
- The frontend only receives data for features enabled for the signed-in member.

## Admin Page

After signing in as an admin, open:

```text
/admin
```

From there you can add members, deactivate members, assign `member` or `admin`, and select visible feature blocks.
