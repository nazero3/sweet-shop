import { EmailProvider } from "./providers/email-provider";
import { PushProvider } from "./providers/push-provider";
import type { NotificationChannel, NotificationPayload, NotificationProvider } from "./types";

export class NotificationService {
  private readonly providers: Record<NotificationChannel, NotificationProvider>;

  constructor() {
    this.providers = {
      push: new PushProvider(),
      email: new EmailProvider()
    };
  }

  async send(channel: NotificationChannel, payload: NotificationPayload): Promise<void> {
    const provider = this.providers[channel];
    await provider.send(payload);
  }
}
