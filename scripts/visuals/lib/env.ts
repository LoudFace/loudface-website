import dotenv from 'dotenv';
import path from 'path';

let loaded = false;

export function loadEnv() {
  if (loaded) return;
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
  loaded = true;
}

export function requireEnv(name: string): string {
  loadEnv();
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    console.error('Set it in .env.local (gitignored).');
    process.exit(1);
  }
  return value;
}
