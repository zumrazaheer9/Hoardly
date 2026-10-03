import 'dotenv/config';

export const config = {
  port: process.env.PORT || 5000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  resendApiKey: process.env.RESEND_API_KEY,
  orderConfirmationFrom: process.env.ORDER_CONFIRMATION_FROM,
  adminLoginEmail: (process.env.ADMIN_LOGIN_EMAIL || 'admin@hoardly.example').trim().toLowerCase(),
  allowDemoCatalog: !process.env.VERCEL && process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEMO_CATALOG === 'true',
};

for (const name of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}.`);
}
if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && !process.env.CLIENT_URL?.startsWith('https://')) {
  throw new Error('CLIENT_URL must be the HTTPS storefront URL in production.');
}
