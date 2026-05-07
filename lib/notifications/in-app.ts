import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export interface CreateInAppNotificationOptions {
  userId: string;
  tenantId: string;
  title: string;
  message: string;
  importance?: "low" | "medium" | "high";
}

export const inAppNotifications = {
  async create({
    userId,
    tenantId,
    title,
    message,
    importance = "low",
  }: CreateInAppNotificationOptions) {
    try {
      await db.insert(notifications).values({
        userId,
        tenantId,
        title,
        message,
        importance,
      });
    } catch (error) {
      console.error("Failed to create in-app notification:", error);
    }
  },

  async markAsRead(notificationId: string) {
    try {
      // Logic to mark as read
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }
};
