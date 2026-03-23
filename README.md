# JHost

Public record archive for the Epstein federal case.

## Setup

### 1. Clone & configure env

cp .env.example .env

Fill in your Supabase credentials in `.env`:

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key

### 2. Supabase — create the table

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
create table stars (
  ip text primary key,
  created_at timestamp default now()
);

-- Allow public reads and inserts, block updates
alter table stars enable row level security;

create policy "anyone can read" on stars for select using (true);
create policy "anyone can insert" on stars for insert with check (true);
create policy "anyone can delete own" on stars for delete using (true);
```

### 3. Inject env vars

Since this is plain HTML/JS (no build tool), you have two options:

**Option A — Use Vite (recommended)**
- Run: `npm create vite@latest`
- Rename vars to `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Access via `import.meta.env.VITE_SUPABASE_URL` in config.js

**Option B — Simple Node server**
- Use a small Express server to serve `index.html` with vars injected via template
- Or use `envsubst` to replace placeholders before deploying

### 4. Serve

Any static host works once env vars are injected: Vercel, Netlify, Cloudflare Pages.

## File Structure

```
jhost/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js   ← env vars live here
│   ├── star.js     ← Supabase star logic
│   └── main.js     ← age gate + init
├── .env            ← your real keys (never commit)
├── .env.example    ← safe to commit
└── .gitignore
```
