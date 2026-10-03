import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
  if (command === 'build') {
    for (const name of ['VITE_API_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']) {
      if (!env[name]) throw new Error(`Missing required build environment variable: ${name}.`);
    }
    if (process.env.VERCEL && (!env.VITE_API_URL.startsWith('https://') || !env.VITE_SUPABASE_URL.startsWith('https://'))) {
      throw new Error('Hosted API and Supabase URLs must use HTTPS.');
    }
  }
  return { plugins: [react()] };
})
