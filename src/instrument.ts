import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { expressIntegration, httpIntegration } from '@sentry/node';

console.log('process.env.SENTRY_DSN -->', process.env.SENTRY_DSN);
console.log(
  'process.env.SENTRY_TRACES_SAMPLE_RATE -->',
  process.env.SENTRY_TRACES_SAMPLE_RATE,
);
console.log(
  'process.env.SENTRY_PROFILES_SAMPLE_RATE -->',
  process.env.SENTRY_PROFILES_SAMPLE_RATE,
);

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

  debug: true,
});
