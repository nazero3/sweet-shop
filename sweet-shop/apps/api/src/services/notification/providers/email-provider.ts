import type { NotificationPayload, NotificationProvider } from "../types";

export class EmailProvider implements NotificationProvider {
  channel = "email" as const;

  async send(_payload: NotificationPayload): Promise<void> {
    if (!process.env.SENDGRID_API_KEY && !process.env.RESEND_API_KEY) {
      throw new Error("Email provider credentials missing");
    }
    // Integration point: SendGrid or Resend SDK email send.
  }
}
