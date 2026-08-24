import { buildApp } from './app';
import { env } from './config/env';

const app = buildApp();

app.listen(env.port, () => {
  console.log(`🚀 Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
});
