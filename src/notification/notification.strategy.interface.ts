export interface NotificationStrategy {
  send(to: string, data: any): Promise<void>;
}
