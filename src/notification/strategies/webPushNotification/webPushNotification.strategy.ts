import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationStrategy } from '../../notification.strategy.interface';
import { SessionService } from '@/auth/session.service';

@Injectable()
export class WebPushNotificationStrategy implements NotificationStrategy {
    readonly type: string = 'webPush';
    constructor(private readonly sessionService: SessionService) {}

    async send(to: string, data: any): Promise<void> {
        console.log("excuted--->");
        const sessionuserFound = await this.sessionService.findByUserId(to);
        console.log("sessionuserFound--->", sessionuserFound);
    }
}
