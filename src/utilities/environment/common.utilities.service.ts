import { Injectable } from '@nestjs/common';
import { ENVIRONMENT } from '../../constants/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service for environment-related utilities
 */
@Injectable()
export class CommonUtilitiesService {
  constructor(private configService: ConfigService) {}
  /**
   * Get the current environment from process.env.ENV
   * Defaults to LOCAL if not set
   */
  public getCurrentEnvironment(): string {
    const env = this.configService.get('ENV');

    if (env === ENVIRONMENT.DEVELOPMENT) {
      return ENVIRONMENT.DEVELOPMENT;
    }
    return ENVIRONMENT.LOCAL;
  }

  /**
   * Check if the current environment is local
   */
  public isLocalEnvironment(): boolean {
    return this.getCurrentEnvironment() === ENVIRONMENT.LOCAL;
  }

  /**
   * Check if the current environment is development
   */
  public isDevelopmentEnvironment(): boolean {
    return this.getCurrentEnvironment() === ENVIRONMENT.DEVELOPMENT;
  }

  /**
   * Get the current environment name as a string
   * This can be used for any service that needs the environment name
   */
  public getEnvironmentName(): string {
    return this.getCurrentEnvironment();
  }
}
