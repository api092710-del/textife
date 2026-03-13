# Textife — Production-Ready AI WhatsApp Business SaaS

**Stack:** Next.js 14 · PostgreSQL (Supabase) · Prisma · OpenAI · PayPal · NOWPayments · Vercel

---

## ✅ What's Fully Real (No Mocks)

| Feature | API Used |
|---------|----------|
| Auth (register/login) | JWT + bcrypt → Supabase DB |
| AI Chat | OpenAI GPT API (enforces plan limits from DB) |
| Dashboard Analytics | Reads live data from DB |
| Bot Management | DB CRUD with plan-based limits |
| Templates | DB-backed, 6 seeded system templates |
| PayPal Payments | PayPal Orders API v2 (full capture flow) |
| Crypto Payments | NOWPayments Invoice API + HMAC webhook |
| Plan Auto-Upgrade | DB transaction upgrades user on payment |
| Admin Panel | Real user list + ban/unban |

---

## 🚀 Complete Deployment Guide

### Step 1 — Supabase Database (Free)

1. Go to **https://supabase.com** → Sign up
2. Click **"New Project"** → Enter name, password, choose region
3. Wait ~2 minutes for setup
4. Go to: **Project → Settings → Database**
5. Scroll to **"Connection string"** → select **"URI"** tab
6. You'll see two URLs needed:
   - **Transaction pooler** (port 6543) → use for `DATABASE_URL`
   - **Direct connection** (port 5432) → use for `DIRECT_URL`

### Step 2 — Configure .env

```bash
cp .env.example .env
```

Fill in your `.env`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
JWT_SECRET="run: openssl rand -base64 32"
NEXT_PUBLIC_APP_URL="https://your-vercel-app.vercel.app"
OPENAI_API_KEY="sk-proj-..."
PAYPAL_CLIENT_ID="AX..."
PAYPAL_SECRET="EX..."
PAYPAL_MODE="sandbox"   # change to "live" for real money
NOWPAYMENTS_API_KEY="..."
NOWPAYMENTS_IPN_SECRET="..."
```

### Step 3 — Initialize Database

```bash
npm install
npm run db:push      # creates all tables in Supabase
npm run db:seed      # seeds admin + demo user + templates
```

**Test accounts after seeding:**
| Account | Email | Password |
|---------|-------|----------|
| Admin | admin@textife.com | Admin@123456 |
| Demo (Pro) | demo@textife.com | Demo@123456 |

### Step 4 — Deploy to Vercel

```bash
npm i -g vercel
vercel
```

**Then in Vercel dashboard → Settings → Environment Variables, add ALL your .env values.**

Or connect GitHub:
1. Push to GitHub: `git init && git add . && git commit -m "init" && git push`
2. Go to vercel.com → "New Project" → Import from GitHub
3. Add environment variables
4. Deploy ✅

### Step 5 — Payment Webhook URLs

After getting your Vercel URL (e.g. `https://textife.vercel.app`):

**PayPal:**
- Go to developer.paypal.com → Your App → Edit
- Return URL: `https://textife.vercel.app/api/payments/paypal/success`
- Cancel URL: `https://textife.vercel.app/dashboard/billing?cancelled=1`

**NOWPayments:**
- Go to nowpayments.io → Store Settings → IPN Settings
- IPN Callback URL: `https://textife.vercel.app/api/payments/nowpayments/webhook`

---

## 💳 Getting Your API Keys

### OpenAI
1. https://platform.openai.com/api-keys
2. "Create new secret key" → copy it
3. Add $5+ billing at platform.openai.com/billing
4. Models: `gpt-3.5-turbo` (cheap) or `gpt-4o-mini` (smarter, same price)

### PayPal
1. https://developer.paypal.com → Log in
2. "Apps & Credentials" → "Create App" → name it Textife
3. Copy **Client ID** and **Secret Key**
4. For sandbox testing: use as-is
5. For live: switch to "Live" tab credentials + set `PAYPAL_MODE=live`

### NOWPayments
1. https://nowpayments.io → Sign up + verify
2. Dashboard → API → Create API Key
3. Store Settings → IPN Settings → Set IPN Secret (any string)
4. Set webhook callback URL (your Vercel URL + `/api/payments/nowpayments/webhook`)

---

## 🔒 Security Checklist Before Going Live

- [ ] Change `PAYPAL_MODE` from `sandbox` to `live`
- [ ] Use a real 32+ char random `JWT_SECRET`
- [ ] Set `NEXT_PUBLIC_APP_URL` to your real domain
- [ ] Verify NOWPayments webhook URL is correct
- [ ] Verify PayPal return URL is correct
- [ ] Make your admin account: `admin@textife.com`

---

## 📁 API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | None | Create account |
| POST | /api/auth/login | None | Login |
| GET | /api/auth/me | JWT | Get current user |
| POST | /api/chat | JWT | Send AI message |
| GET | /api/chat | JWT | List sessions |
| GET | /api/analytics | JWT | Real analytics data |
| GET | /api/bots | JWT | List user's bots |
| POST | /api/bots | JWT | Create bot |
| PATCH | /api/bots/:id | JWT | Update/toggle bot |
| DELETE | /api/bots/:id | JWT | Delete bot |
| GET | /api/templates | JWT | List templates |
| POST | /api/templates | JWT | Create template |
| POST | /api/payments/create | JWT | Init PayPal or crypto |
| GET | /api/payments/paypal/success | None | PayPal callback |
| POST | /api/payments/nowpayments/webhook | None | Crypto IPN |
| GET | /api/users | ADMIN | List all users |
| PATCH | /api/users/:id/ban | ADMIN | Ban/unban user |

---

## 🏗️ VPS Deployment (Alternative)

```bash
# On your server
git clone your-repo
npm install
npm run db:push
npm run db:seed
npm run build

# With PM2
npm i -g pm2
pm2 start npm --name textife -- start
pm2 save && pm2 startup

# Nginx config
server {
    listen 80;
    server_name textife.com;
    location / { proxy_pass http://localhost:3000; }
}
```
