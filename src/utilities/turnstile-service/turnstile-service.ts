import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

@Injectable()
export class TurnstileService {
  private readonly verifyUrl =
    'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async verify(token: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<TurnstileVerifyResponse>(
          this.verifyUrl,
          {
            secret: this.configService.get('CLOUDFLARE_TURNSTILE_SECRET_KEY'),
            response: token,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (!response.data.success) {
        throw new HttpException(
          'Invalid CAPTCHA verification',
          HttpStatus.BAD_REQUEST,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'CAPTCHA verification failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
