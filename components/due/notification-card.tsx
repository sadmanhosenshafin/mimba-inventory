import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  CircleDollarSign,
  PackageMinus
} from "lucide-react";
import type { AppNotification, NotificationSeverity } from "@/lib/due/types";
import { cn } from "@/lib/utils";

const severityMap: Record<NotificationSeverity, { label: string; className: string }> = {
  info: { label: "খবর", className: "bg-secondary text-primary ring-primary/10" },
  warning: { label: "সতর্ক", className: "bg-amber-50 text-amber-700 ring-amber-100" },
  critical: { label: "জরুরি", className: "bg-rose-50 text-rose-700 ring-rose-100" },
  success: { label: "পেমেন্ট", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" }
};

export function NotificationCard({
  notification
}: {
  notification: AppNotification;
}) {
  const Icon =
    notification.type === "stock-warning"
      ? PackageMinus
      : notification.type === "payment-received"
        ? CheckCircle2
        : notification.type === "overdue-alert"
          ? AlertTriangle
          : CircleDollarSign;
  const severity = severityMap[notification.severity];

  return (
    <div className="flex gap-3 rounded-lg border bg-card p-4 shadow-soft">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold leading-6">{notification.message}</p>
          <span
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
              severity.className
            )}
          >
            {severity.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{notification.time}</p>
      </div>
    </div>
  );
}

export function NotificationIcon() {
  return <BellRing className="size-5" />;
}
