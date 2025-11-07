"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "../providers/auth-provider";
import { useNotifications } from "@/hooks/use-notifications";

const navItems = [
  { label: "Dashboard", href: "/", roles: ["employee", "admin"] as const },
  { label: "Admin", href: "/admin", roles: ["admin"] as const },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unread, notifications, markAsRead } = useNotifications();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes((user?.role ?? "employee") as never),
  );

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md border border-slate-700 p-2 text-slate-200 hover:bg-slate-800 lg:hidden"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Karmic Canteen
            </p>
            <p className="text-lg font-semibold text-white">Meal Experience Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unread.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-emerald-900">
                  {unread.length}
                </span>
              )}
            </button>
            {notificationsOpen && notifications.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900/95 shadow-xl backdrop-blur">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-300">Latest updates</p>
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto px-2 pb-3">
                  {notifications.map((note) => (
                    <button
                      type="button"
                      key={note.id}
                      onClick={() => markAsRead(note.id)}
                      className={clsx(
                        "w-full rounded-lg border px-3 py-2 text-left text-sm",
                        note.type === "warning"
                          ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                          : note.type === "success"
                            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                            : "border-slate-700 bg-slate-800/70 text-slate-200",
                        !note.readBy.includes(user?.id ?? "")
                          ? "ring-2 ring-emerald-500/50"
                          : "",
                      )}
                    >
                      <p className="font-semibold">{note.title}</p>
                      <p className="mt-1 text-xs opacity-80">{note.message}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="hidden flex-col text-right text-sm lg:flex">
            <span className="font-medium text-white">{user?.name}</span>
            <span className="text-slate-400">
              {user?.department} · {user?.role === "admin" ? "Administrator" : "Employee"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-emerald-500 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="flex">
        <aside
          className={clsx(
            "fixed inset-y-16 left-0 z-40 w-64 border-r border-slate-800 bg-slate-950/95 px-4 py-6 shadow-lg backdrop-blur-lg transition-transform lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <nav className="space-y-1">
            {allowedNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition",
                  pathname === item.href
                    ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/50"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 px-4 py-6 lg:ml-64">
          <div className="mx-auto max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
