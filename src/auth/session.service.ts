import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';

/**
 * Service responsible for managing user session data.
 *
 * This service provides methods to interact with the session storage,
 * allowing retrieval and manipulation of session data stored in the database.
 *
 */
@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Find a session by user ID.
   *
   * This method retrieves a session from the database where the user ID matches
   * the specified userid value. It queries the `sessionData` JSON column to locate
   * the user ID nested inside the `passport.user` object.
   *
   * @param userId - The ID of the user whose session is being queried.
   * @returns A promise that resolves to the session entity if found, or null if no session exists.
   *
   * @example
   * const session = await sessionService.findByUserId('001d9ff0-80f3-40ba-8ffe-48e1b7dc9730');
   * console.log(session);
   */
  async findByUserId(userId: string): Promise<Session | null> {
    return this.sessionRepository
      .createQueryBuilder('session')
      .where("JSON_EXTRACT(session.json, '$.passport.user.id') = :userId", {
        userId,
      })
      .getOne();
  }
}
