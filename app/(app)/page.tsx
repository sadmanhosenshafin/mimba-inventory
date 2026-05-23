"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  CircleDollarSign,
  TrendingUp,
  UsersRound
} from "lucide-react";
import { NotificationPanel } from "@/components/due/notification-panel";
import { useCustomers } from "@/components/customers/customer-provider";
import { useProducts } from "@/components/products/product-provider";
import { useSales } from "@/components/sales/sales-provider";
import { MetricCard } from "@/components/shared/metric-card";
import { PageContainer } from "@/components/shared/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDueCustomers, getDueNotifications } from "@/lib/due/utils";
import { subscribeBusinessDataChanged } from "@/lib/live-data/events";
import { useReportSummary } from "@/lib/reports/use-live-reports";
import { activitiesApi } from "@/services/api/activities";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

type ActivityItem = {
  id: number | string;
  title: string;
  description?: string | null;
  subject_name?: string | null;
  created_at?: string;
};

function formatActivityTime(value?: string) {
  if (!value) return "এইমাত্র";
  return new Date(value).toLocaleString("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default function DashboardPage() {
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { payments } = useSales();
  const { summary } = useReportSummary();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const dueCustomers = getDueCustomers(customers);
  const notifications = getDueNotifications({ dueCustomers, products, payments });

  const loadActivities = useCallback(async () => {
    try {
      const response = await activitiesApi.list({ per_page: 8 });
      setActivities(response.data.data?.data || []);
    } catch {
      setActivities([]);
    }
  }, []);

  useEffect(() => {
    void loadActivities();
    const timer = window.setInterval(() => void loadActivities(), 15000);
    const unsubscribe = subscribeBusinessDataChanged(() => void loadActivities());

    return () => {
      window.clearInterval(timer);
      unsubscribe();
    };
  }, [loadActivities]);

  return (
    <PageContainer
      title="ড্যাশবোর্ড"
      description="আজকের বিক্রি, লাভ, বাকি ও কাস্টমার এক নজরে দেখুন।"
    >
      <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <MetricCard
          title="আজকের বিক্রি"
          value={`৳ ${takaFormatter.format(summary.today_sales)}`}
          hint="লাইভ হিসাব"
          icon={CircleDollarSign}
        />
        <MetricCard
          title="আজকের লাভ"
          value={`৳ ${takaFormatter.format(summary.today_profit)}`}
          hint="বিক্রির লাভ"
          icon={TrendingUp}
        />
        <MetricCard
          title="আজকের বাকি"
          value={`৳ ${takaFormatter.format(summary.today_due)}`}
          hint="আজকের বিক্রি থেকে"
          icon={ArrowDownLeft}
          tone="warning"
        />
        <MetricCard
          title="মোট কাস্টমার"
          value={`${numberFormatter.format(summary.total_customers)} জন`}
          hint="সক্রিয় দোকান"
          icon={UsersRound}
        />
      </div>

      <div className="grid gap-4 laptop:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক কার্যক্রম</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-md bg-muted/60 p-3"
              >
                <span className="mt-1 size-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium leading-6">{activity.title}</p>
                  {activity.description ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {activity.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatActivityTime(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
            {activities.length === 0 ? (
              <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
                এখনো কোনো কার্যক্রম নেই
              </p>
            ) : null}
          </CardContent>
        </Card>

        <NotificationPanel notifications={notifications} compact />
      </div>
    </PageContainer>
  );
}
