import { ApiProperty } from "@nestjs/swagger";

export class NotificationResponseDto {
    @ApiProperty({ description: 'Notification ID', example: 'notification-1-id' })
    id: string;

    @ApiProperty({ description: 'Notification title', example: 'Order Update' })
    title: string;

    @ApiProperty({ description: 'Notification body', example: 'Your order has been shipped.' })
    body: string;

    @ApiProperty({ description: 'Notification data (JSON)', example: { orderId: '12345' } })
    data: Record<string, any>;

    @ApiProperty({ description: 'Read status of the notification', example: false })
    isRead: boolean;

    @ApiProperty({ description: 'Timestamp when the notification was created' })
    createdAt: Date;
}