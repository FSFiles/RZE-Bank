"use client";

import { useTransition } from "react";
import {
  Bell,
  BellOff,
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCheck,
} from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

function iconFor(title: string) {
  const t = title.toLowerCase();
  if (t.includes("deposit")) return ArrowDownToLine;
  if (t.includes("withdraw")) return ArrowUpFromLine;
  if (t.includes("sent")) return ArrowUpRight;
  if (t.includes("received") || t.includes("credit")) return ArrowDownLeft;
  return Landmark;
}

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-lg">
      {unreadCount > 0 && (
        <div className="mb-4 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={isPending}
            onClick={() => startTransition(() => markAllNotificationsRead())}
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        </div>
      )}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <div className="p-6 flex flex-col items-center text-center gap-2">
              <BellOff className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up — no notifications.</p>
            </div>
          </Card>
        ) : (
          notifications.map((n) => {
            const Icon = iconFor(n.title);
            return (
              <Card
                key={n.id}
                onClick={() => !n.is_read && startTransition(() => markNotificationRead(n.id))}
                className={cn("p-4 cursor-pointer", !n.is_read && "border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5")}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[hsl(var(--gold))]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-[hsl(var(--gold))] mt-1.5 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {new Date(n.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
