# Deploying Rolling Shutter Calculator to Vercel

This guide provides complete instructions for deploying the Rolling Shutter Price Calculator to Vercel using the modern serverless approach.

---

## ⚠️ Important Notice

**This application was built for the Manus platform and requires modifications for Vercel:**

1. **Database**: Requires external MySQL (Manus database won't work)
2. **Authentication**: Manus OAuth must be replaced
3. **Architecture**: Designed for traditional Node.js, needs serverless adaptation

**Recommended Alternative**: Use **Railway** or **Render** for easier deployment with fewer modifications.

---

## Prerequisites

- **Vercel Account**: Sign up at https://vercel.com
- **GitHub Repository**: https://github.com/lfoliveira317/rolling-shutter-calculator
- **External MySQL Database**: Required (see options below)

---

## Database Setup (Required First Step)

### Option 1: PlanetScale (Recommended)

1. Sign up at https://planetscale.com
2. Create a new database: `rolling-shutter-db`
3. Get connection string from Settings → Connection Strings
4. Format: `mysql://user:password@host.planetscale.com/database?sslaccept=strict`

**Advantages:**
- Free tier: 5GB storage, 1B row reads/month
- Serverless MySQL (perfect for Vercel)
- Automatic backups
- No server management

### Option 2: Railway MySQL

1. Sign up at https://railway.app
2. Create new project → Add MySQL service
3. Copy DATABASE_URL from Variables tab
4. Format: `mysql://root:password@host.railway.app:port/railway`

### Option 3: AWS RDS

1. Create MySQL instance in AWS RDS
2. Configure security group to allow Vercel IPs
3. Get connection string
4. More expensive but production-grade

---

## Migration: Run Database Schema

Before deploying, you must create the database tables:

```bash
# Clone repository locally
git clone https://github.com/lfoliveira317/rolling-shutter-calculator.git
cd rolling-shutter-calculator

# Install dependencies
pnpm install

# Create .env file with your database URL
echo "DATABASE_URL=your_mysql_connection_string_here" > .env

# Run migrations to create tables
pnpm db:push

# This creates:
# - users table
# - product_prices table
# - quotations table
# - quotation_items table
```

---

## Vercel Deployment Steps

### Step 1: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: `lfoliveira317/rolling-shutter-calculator`
4. Click **"Import"**

### Step 2: Configure Build Settings

In the import screen, configure:

**Framework Preset:** `Other`

**Build & Development Settings:**
- **Build Command:** `pnpm build`
- **Output Directory:** `dist/client`
- **Install Command:** `pnpm install`

**Root Directory:** `.` (leave as default)

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

#### Required Variables:

```bash
# Database (CRITICAL - must be external MySQL)
DATABASE_URL=mysql://user:pass@host:3306/database

# Security
JWT_SECRET=your-random-secure-string-min-32-chars
NODE_ENV=production

# Application
VITE_APP_TITLE=Rolling Shutter Calculator
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

#### Generate JWT_SECRET:

```bash
# On your local machine, generate a secure random string:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will provide a URL: `https://rolling-shutter-calculator.vercel.app`

---

## Post-Deployment Configuration

### 1. Test the Application

Visit your Vercel URL and verify:
- ✅ Calculator page loads
- ✅ Product prices display (from database)
- ✅ Calculations work correctly
- ✅ Quotation saving works

### 2. Known Limitations

**Authentication Won't Work:**
- Manus OAuth is disabled on Vercel
- Admin panel will show error
- You need to implement alternative auth (see below)

**PDF Generation:**
- May work but could timeout on free tier
- Consider upgrading to Vercel Pro for longer function timeout

### 3. Add Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain: `calculator.yourdomain.com`
3. Configure DNS as instructed by Vercel
4. SSL certificate auto-generated

---

## Fixing Authentication

The app currently uses Manus OAuth which won't work on Vercel. Choose one option:

### Option A: Remove Authentication (Quickest)

Make the calculator public and remove admin panel:

1. Remove login requirements from calculator
2. Hide or remove admin panel
3. Manage prices directly in database

### Option B: Implement Clerk (Recommended)

```bash
# Install Clerk
pnpm add @clerk/clerk-react

# Add to Vercel environment variables:
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Update authentication in code to use Clerk instead of Manus OAuth.

### Option C: Implement Auth0

```bash
# Install Auth0
pnpm add @auth0/auth0-react

# Add to Vercel environment variables:
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
```

### Option D: Custom Email/Password

Implement your own authentication using:
- bcrypt for password hashing
- JWT for sessions
- Email verification

---

## Troubleshooting

### Build Fails with "Cannot find module"

**Solution:**
```bash
# Locally verify all dependencies are installed
pnpm install

# Check package.json includes all imports
# Commit and push any missing dependencies
```

### Database Connection Fails

**Error:** `ECONNREFUSED` or `Connection timeout`

**Solutions:**
1. Verify DATABASE_URL format is correct
2. For PlanetScale: Enable "Connect from anywhere" in settings
3. For Railway: Check that database is running
4. Test connection locally first with same DATABASE_URL

### API Routes Return 404

**Error:** `/api/trpc` not found

**Solution:**
- The `api/index.ts` file handles all API routes
- Verify `vercel.json` routing is correct
- Check Vercel build logs for errors

### PDF Generation Timeout

**Error:** Function execution timeout

**Solutions:**
1. Upgrade to Vercel Pro (60s timeout vs 10s)
2. Use external PDF service (PDFMonkey, DocRaptor)
3. Generate PDFs asynchronously and email them

### "Builds property is deprecated" Warning

**Status:** ✅ Fixed in latest version

The `vercel.json` now uses modern `rewrites` instead of deprecated `builds`.

---

## Alternative: Deploy to Railway (Easier)

If Vercel proves too complex, Railway is much simpler:

### Railway Deployment (5 minutes):

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `lfoliveira317/rolling-shutter-calculator`
4. Click **"Add MySQL"** from service catalog
5. Railway auto-configures DATABASE_URL
6. Click **"Deploy"**

**Advantages:**
- No code changes needed
- Built-in MySQL database
- Traditional Node.js (not serverless)
- WebSocket support
- Simpler for full-stack apps

**Cost:** ~$5-10/month (includes database)

---

## Cost Comparison

### Vercel + PlanetScale
- **Vercel Hobby:** Free (with limitations)
- **Vercel Pro:** $20/month (recommended)
- **PlanetScale Free:** $0
- **PlanetScale Scaler:** $29/month
- **Total:** $0-49/month

### Railway (All-in-One)
- **Starter:** $5/month
- **Developer:** $10/month (recommended)
- Includes database, no separate billing
- **Total:** $5-10/month

### Manus (Current)
- Already deployed and working
- Custom domain support
- No external database needed
- Click "Publish" in UI

---

## Project Structure for Vercel

```
rolling-shutter-calculator/
├── api/
│   └── index.ts          ← Serverless function entry point
├── client/               ← React frontend
│   ├── src/
│   └── index.html
├── server/               ← Backend logic
│   ├── routers.ts
│   ├── db.ts
│   └── _core/
├── drizzle/              ← Database schema
├── vercel.json           ← Vercel configuration
└── package.json
```

The `api/index.ts` file wraps the Express app as a serverless function.

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | MySQL connection string | `mysql://user:pass@host/db` |
| `JWT_SECRET` | ✅ Yes | Session signing key | `abc123...` (32+ chars) |
| `NODE_ENV` | ✅ Yes | Environment | `production` |
| `VITE_APP_TITLE` | ⚠️ Optional | App title | `Rolling Shutter Calculator` |
| `VITE_APP_LOGO` | ⚠️ Optional | Logo URL | `https://...` |

**Note:** OAuth-related variables (OAUTH_SERVER_URL, etc.) are not needed for Vercel as Manus OAuth won't work.

---

## Testing Checklist

After deployment, test:

- [ ] Homepage loads without errors
- [ ] Product prices display correctly
- [ ] Width/height inputs work
- [ ] Area calculation is accurate
- [ ] Price calculation updates in real-time
- [ ] VAT calculation is correct
- [ ] Discount functionality works
- [ ] Additional costs can be added
- [ ] Quotation saves to database
- [ ] Quotation history displays
- [ ] PDF generation works (or shows appropriate error)
- [ ] Mobile responsive design works

---

## Getting Help

- **Vercel Docs:** https://vercel.com/docs
- **PlanetScale Docs:** https://planetscale.com/docs
- **Railway Docs:** https://docs.railway.app
- **Vercel Discord:** https://vercel.com/discord

---

## Recommendation

Given the complexity of adapting this full-stack application to Vercel's serverless architecture:

**Best Option:** Keep on **Manus** (simplest, already working)

**Good Option:** Deploy to **Railway** (5 min setup, no code changes)

**Complex Option:** Deploy to **Vercel** (requires auth replacement, testing)

Choose based on your priorities:
- **Speed:** Manus (2 minutes)
- **Simplicity:** Railway (15 minutes)
- **Vercel Ecosystem:** Follow this guide (2-3 hours)

---

**Last Updated:** January 2026  
**Configuration Version:** 2.0 (Modern serverless approach)
