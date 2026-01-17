# Deploying Rolling Shutter Calculator to Render

This guide provides complete instructions for deploying the Rolling Shutter Price Calculator to Render. **Render is the recommended platform** for this application as it's designed for full-stack Node.js apps.

---

## Why Render is Better Than Vercel

✅ **Traditional Node.js** - No serverless limitations  
✅ **Built-in MySQL** - Database included in configuration  
✅ **Zero code changes** - Works out of the box  
✅ **Simpler setup** - 10 minutes vs 2-3 hours  
✅ **Better for full-stack** - Designed for apps like this  
✅ **WebSocket support** - If you need real-time features later  
✅ **Persistent storage** - For file uploads if needed  

---

## Prerequisites

- **Render Account**: Sign up at https://render.com (free)
- **GitHub Repository**: https://github.com/lfoliveira317/rolling-shutter-calculator
- **10 minutes of time**: That's it!

---

## Deployment Methods

### Method 1: Blueprint (Automatic - Recommended)

This method uses `render.yaml` to automatically set up everything.

#### Step 1: Connect GitHub to Render

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account if not already connected
4. Select repository: `lfoliveira317/rolling-shutter-calculator`

#### Step 2: Review Blueprint Configuration

Render will detect `render.yaml` and show:

**Services to be created:**
- ✅ Web Service: `rolling-shutter-calculator`
- ✅ MySQL Database: `rolling-shutter-db`

**Environment Variables (auto-configured):**
- `DATABASE_URL` - Auto-linked to MySQL database
- `JWT_SECRET` - Auto-generated secure random string
- `NODE_ENV` - Set to `production`
- `VITE_APP_TITLE` - Set to "Rolling Shutter Calculator"

#### Step 3: Deploy

1. Click **"Apply"**
2. Wait 3-5 minutes for:
   - Database provisioning
   - Application build
   - First deployment
3. Render provides your URL: `https://rolling-shutter-calculator.onrender.com`

#### Step 4: Run Database Migrations

After first deployment, you need to create database tables:

**Option A: Using Render Shell (Easiest)**

1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run migration command:
```bash
pnpm db:push
```

**Option B: Using Render Dashboard**

1. Go to web service → **"Environment"** tab
2. Add temporary environment variable:
   - Key: `RUN_MIGRATIONS`
   - Value: `true`
3. Trigger manual deploy
4. Remove the variable after successful migration

**Option C: Using Local Machine**

```bash
# Get DATABASE_URL from Render dashboard
# Go to Database → Connection String (External)

# On your local machine:
export DATABASE_URL="mysql://user:pass@host/db"
pnpm db:push
```

#### Step 5: Test Your Application

Visit your Render URL and verify:
- ✅ Calculator loads
- ✅ Product prices display
- ✅ Calculations work
- ✅ Quotations save
- ✅ PDF generation works

---

### Method 2: Manual Setup (Alternative)

If you prefer manual control:

#### Step 1: Create MySQL Database

1. Go to Render Dashboard → **"New +"** → **"PostgreSQL"** or **"MySQL"**
   - **Note**: Render doesn't offer managed MySQL on free tier
   - Use **PostgreSQL** instead (requires minor code changes)
   - Or use external MySQL (PlanetScale, Railway)

2. For external MySQL:
   - Use PlanetScale (recommended): https://planetscale.com
   - Or Railway MySQL: https://railway.app

#### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect repository: `lfoliveira317/rolling-shutter-calculator`
3. Configure:
   - **Name**: `rolling-shutter-calculator`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

#### Step 3: Add Environment Variables

In the web service settings, add:

```bash
# Database
DATABASE_URL=mysql://user:pass@host:3306/database

# Security
JWT_SECRET=your-random-32-char-string

# Environment
NODE_ENV=production

# Application
VITE_APP_TITLE=Rolling Shutter Calculator
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for build and deployment
3. Run migrations (see Method 1, Step 4)

---

## Configuration Details

### render.yaml Explained

```yaml
services:
  - type: web                    # Web application service
    name: rolling-shutter-calculator
    runtime: node                 # Node.js runtime
    plan: starter                 # Free tier (upgradeable)
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start      # Runs the Express server
    envVars:
      - key: DATABASE_URL
        fromDatabase:             # Auto-links to MySQL database
          name: rolling-shutter-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true       # Auto-generates secure random string

databases:
  - name: rolling-shutter-db
    databaseName: rolling_shutter
    plan: starter                 # Free tier: 1GB storage
```

### Health Checks

The application includes a health check endpoint at `/api/health` that Render uses to verify the service is running.

### Auto-Deploy

Render automatically redeploys when you push to the `main` branch on GitHub.

---

## Post-Deployment Tasks

### 1. Custom Domain (Optional)

1. Go to web service → **"Settings"** → **"Custom Domain"**
2. Add your domain: `calculator.yourdomain.com`
3. Configure DNS:
   - Type: `CNAME`
   - Name: `calculator`
   - Value: `rolling-shutter-calculator.onrender.com`
4. SSL certificate auto-generated (free)

### 2. Environment Variables

Update environment variables in:
- Web service → **"Environment"** tab
- Changes trigger automatic redeployment

### 3. Database Backups

**Free tier**: No automatic backups

**Paid tier ($7/month)**:
- Daily automatic backups
- Point-in-time recovery
- Increased storage

**Manual backup**:
```bash
# From Render Shell
mysqldump -h host -u user -p database > backup.sql
```

### 4. Monitoring

Render provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, request count
- **Alerts**: Email notifications for downtime

Access via web service dashboard.

---

## Handling Authentication

The app uses Manus OAuth which won't work on Render. Options:

### Option A: Remove Authentication (Quickest)

1. Make calculator publicly accessible
2. Remove or disable admin panel
3. Manage prices directly in database

### Option B: Implement Simple Auth

Add basic authentication for admin panel:

```typescript
// Simple admin password check
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    // Set session cookie
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});
```

Add to environment variables:
```bash
ADMIN_PASSWORD=your-secure-password
```

### Option C: Use Clerk or Auth0

See VERCEL_DEPLOYMENT.md for integration instructions.

---

## Troubleshooting

### Build Fails

**Error**: "Command not found: pnpm"

**Solution**: Render auto-detects pnpm from `package.json`. If it fails:
```yaml
buildCommand: npm install -g pnpm && pnpm install && pnpm build
```

### Database Connection Fails

**Error**: "ECONNREFUSED"

**Solution**:
1. Verify DATABASE_URL is set correctly
2. Check database is running (Databases dashboard)
3. Ensure migrations ran successfully
4. Check database logs for errors

### Application Crashes on Start

**Error**: "Port already in use"

**Solution**: Render sets `PORT` environment variable automatically. Ensure your app uses:
```typescript
const PORT = process.env.PORT || 3000;
```

### PDF Generation Slow

**Issue**: PDFs take long to generate

**Solutions**:
1. Upgrade to Starter plan ($7/month) for more CPU
2. Use external PDF service (PDFMonkey, DocRaptor)
3. Generate PDFs asynchronously

### Migrations Don't Run

**Error**: Tables don't exist

**Solution**: Manually run migrations via Render Shell:
```bash
# In Render Shell
pnpm db:push
```

---

## Pricing

### Free Tier (Starter Plan)

**Web Service:**
- ✅ 750 hours/month (enough for one service)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start: 30-60 seconds

**Database:**
- ✅ 1 GB storage
- ✅ Shared resources
- ⚠️ No automatic backups

**Total: $0/month**

### Paid Tier (Recommended for Production)

**Web Service - Starter ($7/month):**
- ✅ Always on (no spin down)
- ✅ 512 MB RAM
- ✅ Faster performance

**Database - Starter ($7/month):**
- ✅ 10 GB storage
- ✅ Daily backups
- ✅ Better performance

**Total: $14/month**

### Comparison with Other Platforms

| Platform | Cost | Setup Time | Difficulty |
|----------|------|------------|------------|
| **Render** | $0-14/mo | 10 min | ⭐ Easy |
| Vercel | $0-49/mo | 2-3 hrs | ⭐⭐⭐ Hard |
| Railway | $5-10/mo | 15 min | ⭐ Easy |
| Manus | Included | 2 min | ⭐ Easiest |

---

## Advantages of Render

✅ **Zero Code Changes** - Works immediately  
✅ **Integrated Database** - MySQL included in blueprint  
✅ **Auto-Deploy** - Push to GitHub = automatic deployment  
✅ **Free SSL** - HTTPS enabled automatically  
✅ **Shell Access** - Run commands directly on server  
✅ **Docker Support** - If you need custom environment  
✅ **Background Workers** - For async tasks  
✅ **Cron Jobs** - For scheduled tasks  

---

## Migration from Manus

If you have existing data on Manus:

### Export Data

```bash
# On Manus, export database
mysqldump -h host -u user -p database > manus_backup.sql
```

### Import to Render

```bash
# In Render Shell or locally with Render DATABASE_URL
mysql -h host -u user -p database < manus_backup.sql
```

---

## Monitoring and Logs

### View Logs

1. Go to web service dashboard
2. Click **"Logs"** tab
3. Real-time streaming logs
4. Filter by severity

### Metrics

1. Click **"Metrics"** tab
2. View:
   - Request count
   - Response time
   - CPU usage
   - Memory usage
   - Bandwidth

### Alerts

1. Go to **"Settings"** → **"Notifications"**
2. Configure email alerts for:
   - Service down
   - Deploy failed
   - High error rate

---

## Best Practices

### 1. Use Environment Variables

Never hardcode:
- Database credentials
- API keys
- Secrets

Always use environment variables.

### 2. Enable Auto-Deploy

Keep auto-deploy enabled for:
- Faster iteration
- Automatic updates
- CI/CD workflow

### 3. Monitor Logs

Check logs regularly for:
- Errors
- Performance issues
- Security concerns

### 4. Backup Database

**Free tier**: Manual backups via Shell

**Paid tier**: Automatic daily backups

### 5. Use Custom Domain

Professional appearance:
- `calculator.yourdomain.com` ✅
- `rolling-shutter-calculator.onrender.com` ⚠️

---

## Testing Checklist

After deployment:

- [ ] Application loads at Render URL
- [ ] Product prices display correctly
- [ ] Calculator performs calculations
- [ ] Quotations save to database
- [ ] Quotation history displays
- [ ] PDF generation works
- [ ] Mobile responsive design works
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (HTTPS)
- [ ] Logs show no errors

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Render Status**: https://status.render.com
- **Support**: support@render.com

---

## Quick Start Summary

```bash
# 1. Push code to GitHub (already done)
# 2. Go to Render Dashboard
# 3. New + → Blueprint
# 4. Select your repository
# 5. Click "Apply"
# 6. Wait 5 minutes
# 7. Run migrations in Shell: pnpm db:push
# 8. Visit your URL and test!
```

**Estimated Total Time: 10-15 minutes** ⏱️

---

## Recommendation

**Render is the best choice for this application** because:

1. ✅ **No code changes needed** - Works immediately
2. ✅ **Integrated database** - MySQL included
3. ✅ **Simple setup** - 10 minutes vs hours
4. ✅ **Better for full-stack** - Designed for Node.js apps
5. ✅ **Affordable** - $0-14/month vs $0-49/month on Vercel

**Alternative**: If you want the absolute simplest deployment, keep it on **Manus** where it's already working perfectly.

---

**Last Updated:** January 2026  
**Configuration Version:** 1.0 (Blueprint-based deployment)
