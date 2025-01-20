export interface NotificationStrategy {
  readonly type: string;
  send(to: string, data: any): Promise<void>;
}
