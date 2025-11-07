"use client";

import useSWR from "swr";
import { useAuth } from "@/components/providers/auth-provider";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch notifications");
    }
    return res.json();
  });

export const useNotifications = () => {
  const { user } = useAuth();
  const scope = user?.role === "admin" ? "admin" : "employee";
  const { data, error, mutate, isLoading } = useSWR<{ notifications: NotificationItem[] }>(
    `/api/notifications?scope=${scope}`,
    fetcher,
    { refreshInterval: 30000 },
  );

  const notifications = data?.notifications ?? [];
  const unread = notifications.filter(
    (notification) => !notification.readBy.includes(user?.id ?? ""),
  );

  const markAsRead = async (notificationId: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", notificationId }),
    });
    await mutate();
  };

  const createNotification = async (payload: {
    title: string;
    message: string;
    type: "info" | "warning" | "success";
    scope: "employee" | "admin" | "all";
  }) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...payload }),
    });
    await mutate();
  };

  return {
    notifications,
    unread,
    isLoading,
    error,
    markAsRead,
    createNotification,
  };
};

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  scope: "employee" | "admin" | "all";
  createdAt: string;
  readBy: string[];
}
