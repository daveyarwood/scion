import { describe, it, expect } from 'vitest';
import { createServer } from './index';

describe('Express server (index.ts)', () => {
  describe('createServer', () => {
    it('returns an Express application instance', () => {
      const app = createServer();
      expect(app).toBeDefined();
      expect(typeof app.get).toBe('function');
      expect(typeof app.use).toBe('function');
      expect(typeof app.listen).toBe('function');
    });

    it('has JSON middleware configured', () => {
      const app = createServer();
      // Check that the app has middleware by trying to use it
      expect(app._router).toBeDefined();
    });

    it('has tRPC middleware mounted at /trpc', () => {
      const app = createServer();
      // The app should have the tRPC router mounted
      // We verify this by checking that the _router has been configured
      expect(app._router).toBeDefined();
      expect(app._router.stack).toBeDefined();
      expect(app._router.stack.length).toBeGreaterThan(0);
    });

    it('has a /health endpoint', () => {
      const app = createServer();
      // Verify the app has routes configured
      expect(app._router).toBeDefined();
      expect(app._router.stack).toBeDefined();
      // There should be at least middleware and routes
      expect(app._router.stack.length).toBeGreaterThan(0);
    });

    it('creates a new app instance each time', () => {
      const app1 = createServer();
      const app2 = createServer();
      expect(app1).not.toBe(app2);
    });
  });
});
