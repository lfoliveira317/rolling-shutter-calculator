# Deploying Rolling Shutter Calculator to Vercel

This guide provides complete instructions for deploying the Rolling Shutter Price Calculator to Vercel.

---

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Repository**: Already created at https://github.com/lfoliveira317/rolling-shutter-calculator
3. **MySQL Database**: You'll need a MySQL database (options below)

---

## Database Options for Vercel

Since this application requires MySQL, you have several options:

### Option 1: PlanetScale (Recommended)
- **Free tier available**
- MySQL-compatible serverless database
- Sign up at https://planetscale.com
- Create a new database
- Get connection string

### Option 2: Railway
- MySQL hosting with free tier
- Sign up at https://railway.app
- Create MySQL service
- Get connection string

### Option 3: AWS RDS
- Production-grade MySQL
- Requires AWS account
- More expensive but highly reliable

### Option 4: Manus Built-in Database (Current)
- **Note**: The current Manus database is NOT accessible from external deployments
- You must migrate to an external database provider

---

## Step-by-Step Deployment

### Step 1: Prepare Database

1. **Create a MySQL database** using one of the options above
2. **Get the connection string** (format: `mysql://user:password@host:port/database`)
3. **Run migrations** to create tables:

```bash
# Clone your repository locally
git clone https://github.com/lfoliveira317/rolling-shutter-calculator.git
cd rolling-shutter-calculator

# Install dependencies
pnpm install

# Set DATABASE_URL in .env
echo "DATABASE_URL=your_mysql_connection_string" > .env

# Run migrations
pnpm db:push
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `lfoliveira317/rolling-shutter-calculator`
3. Configure the project:
   - **Framework Preset**: Other
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

4. Add Environment Variables (click "Environment Variables"):

```
DATABASE_URL=your_mysql_connection_string
NODE_ENV=production
JWT_SECRET=your-secure-random-string-here
```

5. Click **"Deploy"**

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

**Required Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Secret for session signing | `your-random-32-char-string` |
| `NODE_ENV` | Environment | `production` |

**Optional Variables (for OAuth):**

If you want to keep Manus OAuth:
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`
- `VITE_APP_ID`

**Note**: For production, you may want to implement a different authentication system (e.g., Auth0, Clerk, or custom email/password).

### Step 4: Update Build Configuration

The project includes a `vercel.json` configuration file that handles:
- Building the frontend (React + Vite)
- Building the backend (Node.js + Express)
- Routing API requests to `/api/*`
- Serving static frontend files

### Step 5: Post-Deployment

After successful deployment:

1. **Test the application** at your Vercel URL (e.g., `https://rolling-shutter-calculator.vercel.app`)
2. **Verify database connection** by checking if product prices load
3. **Test calculator functionality**
4. **Test PDF generation**
5. **Configure custom domain** (optional) in Vercel Dashboard → Settings → Domains

---

## Important Considerations

### Authentication Changes

The current app uses **Manus OAuth**, which won't work on Vercel. You have two options:

**Option 1: Remove Authentication**
- Make the calculator publicly accessible
- Remove the admin panel or protect it differently

**Option 2: Implement New Auth**
- Use **Clerk** (https://clerk.com) - Easy to integrate
- Use **Auth0** (https://auth0.com) - Enterprise-grade
- Use **NextAuth.js** - Open source
- Implement custom email/password auth

### Database Migration

To migrate existing data from Manus to your new database:

```bash
# Export data from Manus (if needed)
# This would require accessing the Manus database directly

# Or start fresh with default prices
# The app will auto-create default product prices
```

### File Storage

The app currently uses Manus S3 storage. For Vercel:

**Option 1**: Use Vercel Blob Storage
```bash
npm install @vercel/blob
```

**Option 2**: Use AWS S3 directly
- Create S3 bucket
- Add AWS credentials to environment variables

**Option 3**: Store PDFs temporarily and email them
- Generate PDFs in memory
- Send via email instead of download

### Environment-Specific Code

Some Manus-specific features may need adjustment:
- OAuth authentication
- S3 storage helpers
- Built-in notification system

---

## Troubleshooting

### Build Fails

**Error**: "Cannot find module..."
- **Solution**: Ensure all dependencies are in `package.json`
- Run `pnpm install` locally to verify

**Error**: "Build exceeded time limit"
- **Solution**: Optimize build process or upgrade Vercel plan

### Database Connection Issues

**Error**: "ECONNREFUSED" or "Connection timeout"
- **Solution**: Check DATABASE_URL format
- Ensure database allows connections from Vercel IPs
- For PlanetScale: Enable "Connect from anywhere"

### API Routes Not Working

**Error**: 404 on `/api/*` routes
- **Solution**: Verify `vercel.json` routing configuration
- Check that server builds correctly

### PDF Generation Fails

**Error**: "Cannot generate PDF"
- **Solution**: PDFKit may need additional dependencies
- Consider using a PDF service (e.g., PDFMonkey, DocRaptor)

---

## Alternative: Deploy to Railway

If Vercel proves difficult, **Railway** is an excellent alternative:

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects and deploys Node.js apps
5. Add a MySQL database from Railway's service catalog
6. Environment variables are auto-configured

**Advantages of Railway:**
- Simpler for full-stack apps
- Built-in database hosting
- Better for long-running processes
- WebSocket support

---

## Recommended Approach

Given the complexity of this full-stack application with database and PDF generation, I recommend:

1. **For Production**: Use **Railway** or **Render** instead of Vercel
   - Better suited for full-stack Node.js apps
   - Simpler database integration
   - No serverless limitations

2. **For Vercel**: Significant refactoring needed
   - Split into separate frontend/backend deployments
   - Use Vercel for frontend only
   - Deploy backend to Railway/Render/Heroku
   - Update API endpoints in frontend

---

## Cost Estimates

### Vercel
- **Hobby Plan**: Free (with limitations)
- **Pro Plan**: $20/month (recommended for production)

### Database (PlanetScale)
- **Free Tier**: 5GB storage, 1 billion row reads/month
- **Scaler Plan**: $29/month (production)

### Total Monthly Cost
- **Development**: $0 (free tiers)
- **Production**: ~$50-80/month

---

## Next Steps

1. **Choose deployment platform** (Vercel, Railway, or Render)
2. **Set up external database** (PlanetScale recommended)
3. **Decide on authentication strategy**
4. **Update code for production environment**
5. **Test thoroughly before going live**

---

## Support

For deployment issues:
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **PlanetScale Docs**: https://planetscale.com/docs

---

**Note**: The application is currently optimized for the Manus platform. Deploying to Vercel requires some modifications to work with external services. Consider keeping it on Manus for the simplest deployment experience, or be prepared to refactor authentication and storage.
