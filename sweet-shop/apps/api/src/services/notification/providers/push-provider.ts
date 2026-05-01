import type { NotificationPayload, NotificationProvider } from "../types";

export class PushProvider implements NotificationProvider {
  channel = "push" as const;

  async send(_payload: NotificationPayload): Promise<void> {
    if (!process.env.FCM_PROJECT_ID) {
      throw new Error("FCM_PROJECT_ID missing");
    }
    // Integration point: initialize firebase-admin and send FCM message.
  }
}
