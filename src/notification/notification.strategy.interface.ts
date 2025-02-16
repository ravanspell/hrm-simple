export interface NotificationStrategy {
  readonly type: string;
  send(notificationPayload: any): Promise<void>;
}
