import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/responseTransform.interceptor';
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

async function bootstrap() {
  // initialize transactional context to handle transactions
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
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
    origin: 'http://localhost:3000',
    credentials: true, // Allow cookies or authorization headers
  });
  app.use(
    session({
      secret: process.env.SESSION_TOKEN_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        secure: process.env.ENV === 'production',
        httpOnly: true,
        sameSite: false,
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3001);
}

bootstrap();
