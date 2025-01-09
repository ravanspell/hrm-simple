import { Injectable } from '@nestjs/common';
import { EmailSettings } from 'src/email-settings/entities/email-setting.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class EmailSettingsRepository extends Repository<EmailSettings> {
  constructor(dataSource: DataSource) {
    super(EmailSettings, dataSource.createEntityManager());
  }

  async createEmailSettings(
    data: Partial<EmailSettings>,
  ): Promise<EmailSettings> {
    const newEmailSettings = this.create(data);
    return this.save(newEmailSettings);
  }

  async findEmailSettingsByOrganization(
    organizationId: string,
  ): Promise<EmailSettings[]> {
    return this.find({
      select: [
        'id',
        'emailHost',
        'emailPort',
        'defaultFromEmail',
        'isPrimary',
        'emailHostUsername',
        'useTLS',
        'useSSL',
        'displayName',
        'emailSendTimeout',
      ],
      where: { organizationId },
    });
  }

  async findPrimaryEmailSettings(
    organizationId: string,
  ): Promise<EmailSettings> {
    return this.findOne({
      where: {
        organizationId,
        isPrimary: true,
      },
    });
  }

  async getEmailSettingsById(
    emailSettingId: string,
    organizationId: string = null,
  ): Promise<EmailSettings> {
    const where = {};
    if (emailSettingId) {
      where['id'] = emailSettingId;
    }
    if (organizationId) {
      where['organizationId'] = organizationId;
    }
    return this.findOne({ where });
  }

  async updateEmailSettings(
    id: string,
    data: Partial<EmailSettings>,
  ): Promise<EmailSettings> {
    await this.update(id, data);
    return this.getEmailSettingsById(id);
  }

  async deleteEmailSettings(id: string): Promise<void> {
    await this.delete(id);
  }
}
