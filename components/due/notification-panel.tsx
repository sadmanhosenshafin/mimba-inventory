import Link from "next/link";
import { NotificationCard } from "@/components/due/notification-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppNotification } from "@/lib/due/types";

export function NotificationPanel({
  notifications,
  compact = false
}: {
  notifications: AppNotification[];
  compact?: boolean;
}) {
  const visibleNotifications = compact ? notifications.slice(0, 3) : notifications;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>নোটিফিকেশন</CardTitle>
        {compact ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/notifications">সব দেখুন</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleNotifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </CardContent>
    </Card>
  );
}
