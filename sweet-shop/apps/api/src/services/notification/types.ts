export type NotificationChannel = "push" | "email";

export type NotificationPayload = {
  orderNumber: string;
  storeState: string;
  orderType: string;
  customerName: string;
  items: unknown;
  total: unknown;
};

export interface NotificationProvider {
  channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<void>;
}
