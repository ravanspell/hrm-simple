import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/responseTransform.interceptor';
import * as session from 'express-session';
import * as passport from 'passport';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // session store is a mysql db table where user session data
  // is being stored. Typically Redis would be a ideal solution here.
  const sessionStore = new PrismaSessionStore(new PrismaClient(),
    {
      checkPeriod: 2 * 60 * 1000,  //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  );
  app.enableCors();
  // apply 'api' prefix for all API endpoints
  app.setGlobalPrefix('api');
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
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen(3001);
}
bootstrap();
