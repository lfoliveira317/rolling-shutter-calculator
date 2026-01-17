import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../server/routers';
import { createContext } from '../server/_core/context';

const app = express();

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC endpoint
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// OAuth callback endpoint
app.get('/api/oauth/callback', async (req, res) => {
  // Note: Manus OAuth won't work on Vercel
  // You need to implement alternative authentication
  res.status(501).json({ 
    error: 'OAuth not configured for Vercel deployment',
    message: 'Please implement alternative authentication (Clerk, Auth0, etc.)'
  });
});

// Export as serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
};
