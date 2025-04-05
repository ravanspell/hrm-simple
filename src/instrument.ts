import * as dotenv from 'dotenv';
import { join } from 'path';
// dot env config not loaded since
// we initlize the sentry before the app config
dotenv.config({ path: join(__dirname, '../.env') });

import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { expressIntegration, httpIntegration } from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENV || 'development',

  integrations: [
    // Enable HTTP calls tracing
    httpIntegration(),
    // Enable Express.js middleware tracing
    expressIntegration(),
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 1.0,
});

console.log('\n=== SENTRY STATUS ===');
console.log({
  initialized: Sentry.isInitialized(), // This is the correct way to check
  environment: process.env.ENV || 'development',
  hasDSN: !!process.env.SENTRY_DSN,
  tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE,
  profilesSampleRate: process.env.SENTRY_PROFILES_SAMPLE_RATE,
});
