import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const startDev = (): void => {
  console.log('[Dev] Starting server and client with concurrently...');
  console.log('[Dev] Client will be available at http://localhost:5173');
  console.log('[Dev] Server will be available at http://localhost:3000');

  // Use concurrently to run both processes
  const proc = spawn(
    'concurrently',
    [
      '--names', 'server,client',
      'node --import tsx src/server/index.ts',
      'vite',
    ],
    {
      stdio: 'inherit',
      cwd: rootDir,
      shell: true,
    }
  );

  proc.on('error', (err) => {
    console.error('[Dev] Error:', err);
    process.exit(1);
  });

  proc.on('exit', (code) => {
    process.exit(code ?? 0);
  });
};

startDev();
