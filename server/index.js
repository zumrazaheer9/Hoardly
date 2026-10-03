import app from './src/app.js';
import { config } from './src/config/env.js';

const PORT = config.port;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
