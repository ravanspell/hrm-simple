import { Test, TestingModule } from '@nestjs/testing';
import { EmailSettingsController } from './email-settings.controller';
import { EmailSettingsService } from './email-settings.service';

describe('EmailSettingsController', () => {
  let controller: EmailSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailSettingsController],
      providers: [EmailSettingsService],
    }).compile();

    controller = module.get<EmailSettingsController>(EmailSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
