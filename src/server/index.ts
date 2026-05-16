import express, { Express } from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';

const PORT = 3000;

export const createServer = (): Express => {
  const app = express();

  // Middleware
  app.use(express.json());

  // tRPC router
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
};

export const startServer = async (): Promise<void> => {
  const app = createServer();

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] tRPC endpoint at http://localhost:${PORT}/trpc`);
  });
};

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((err) => {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  });
}
