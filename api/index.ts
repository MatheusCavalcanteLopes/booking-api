import { buildApp } from '../src/app';

// Vercel's Node.js runtime treats a default-exported Express app as a
// request handler directly — no separate serverless-http wrapper needed.
export default buildApp();
