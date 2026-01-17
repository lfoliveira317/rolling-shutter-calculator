import type { Request, Response } from 'express';
import { getDb } from './db';

/**
 * Health check endpoint for monitoring services like Render
 * Returns 200 OK if application and database are healthy
 */
export async function healthCheck(req: Request, res: Response) {
  try {
    // Check database connection
    const db = await getDb();
    
    if (!db) {
      return res.status(503).json({
        status: 'unhealthy',
        error: 'Database not available',
        timestamp: new Date().toISOString(),
      });
    }

    // Simple query to verify database is responsive
    await db.execute('SELECT 1');

    // All checks passed
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('[Health Check] Failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
