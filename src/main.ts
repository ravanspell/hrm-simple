// sentry integration
import './instrument';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './interceptors/response-ransform.interceptor';
import * as session from 'express-session';
import * as passport from 'passport';
import { DataSource } from 'typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { TypeormStore } from 'connect-typeorm';
import { Session } from './auth/entities/session.entity';
import { SentryInterceptor } from './interceptors/sentry.interceptor';
import { SentryService } from './utilities/sentry/sentry.service';
import helmet from 'helmet';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  /**
   * initializeTransactionalContext is used to handle transactions
   * @Transactional() decorator is used to handle transactions
   *
   * @see https://www.npmjs.com/package/typeorm-transactional
   */
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.create(AppModule);

  /**
   * Helmet is a collection of 14 middleware functions that set security-related HTTP headers
   * @see https://github.com/helmetjs/helmet
   */
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MyHRM API')
    .setDescription('The comprehensive open API documentation for MyHRM')
    .setVersion('1.0')
    .addTag('myhrm')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {});

  app.enableVersioning({
    type: VersioningType.URI,
  });
  // apply 'api' prefix for all API endpoints
  app.setGlobalPrefix('api');
  // session store is a mysql db table where user session data
  // is being stored. Typically Redis would be a ideal solution here.
  const dataSource = app.get(DataSource); // Get the DataSource instance
  const sessionRepository = dataSource.getRepository(Session);

  const sessionStore = new TypeormStore({
    cleanupLimit: 2,
    limitSubquery: false, // If using MariaDB.
    ttl: 86400,
  }).connect(sessionRepository);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.REQUEST_ORIGIN?.split(',');
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Cookie', 'X-CSRF-Token'],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Set-Cookie'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Session configuration should be before passport initialization
  const sessionConfig = {
    secret: process.env.SESSION_TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    name: 'myhrm_session',
    cookie: {
      secure: process.env.ENV === 'prod',
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
    rolling: true,
  };

  // Initialize session middleware first
  app.use(session(sessionConfig));

  // Then initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Get SentryService instance
  const sentryService = app.get(SentryService);
  const reflector = app.get(Reflector);

  // Apply global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(reflector),
    new SentryInterceptor(sentryService),
  );

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Start the application
  await app.listen(3001);
}

bootstrap();
