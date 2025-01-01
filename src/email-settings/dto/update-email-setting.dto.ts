import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailSettingsDto } from './create-email-setting.dto';

export class UpdateEmailSettingDto extends PartialType(
  CreateEmailSettingsDto,
) {}
