"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  Download,
  Search,
  X,
  ReceiptText,
  Scale,
  TrendingUp,
  UserPlus,
  WalletCards
} from "lucide-react";
import { ReportFilterBar } from "@/components/reports/report-filter-bar";
import { StatCard } from "@/components/reports/stat-card";
import { TopListCard } from "@/components/reports/top-list-card";
import { TrendChartCard } from "@/components/reports/trend-chart-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportSummary, type ChartPoint } from "@/lib/reports/use-live-reports";
import { reportsApi, type ReportFilters } from "@/services/api/reports";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

type DueCustomer = {
  id: number;
  shop_name: string;
  owner_name: string;
  phone: string;
  total_due: number | string;
  last_sale_date?: string | null;
};

const defaultFilters: ReportFilters = {
  period: "month"
};

function toChartPercent(data: ChartPoint[]) {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);
  return data.map((item) => ({
    label: item.label,
    value: Math.round((Number(item.value || 0) / max) * 100)
  }));
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const [isDueOpen, setIsDueOpen] = useState(false);
  const [dueSearch, setDueSearch] = useState("");
  const [dueSort, setDueSort] = useState<"highest" | "latest">("highest");
  const [duePage, setDuePage] = useState(1);
  const [dueCustomers, setDueCustomers] = useState<DueCustomer[]>([]);
  const [dueMeta, setDueMeta] = useState({ current_page: 1, last_page: 1 });
  const [isExporting, setIsExporting] = useState(false);
  const { summary, charts, topProducts, lowProfitProducts, breakdown } = useReportSummary(filters);

  const loadDueCustomers = useCallback(async () => {
    if (!isDueOpen) return;
    const response = await reportsApi.dueCustomers({
      search: dueSearch || undefined,
      sort: dueSort,
      page: duePage,
      per_page: 8
    });
    const payload = response.data.data;
    setDueCustomers(payload.data || []);
    setDueMeta({
      current_page: payload.current_page || 1,
      last_page: payload.last_page || 1
    });
  }, [duePage, dueSearch, dueSort, isDueOpen]);

  useEffect(() => {
    void loadDueCustomers();
  }, [loadDueCustomers]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await reportsApi.exportPdf(filters);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "mimba-report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer
      title="রিপোর্ট"
      description="বিক্রি, লাভ, বাকি, স্টক ও সেরা দোকান সহজভাবে দেখুন।"
      action={
        <Button variant="secondary" size="lg" onClick={handleExportPdf} disabled={isExporting}>
            <Download className="size-5" />
            {isExporting ? "রিপোর্ট তৈরি হচ্ছে" : "রিপোর্ট প্রিন্ট করুন"}
        </Button>
      }
    >
      <ReportFilterBar filters={filters} onFiltersChange={setFilters} />

      <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-5">
        <StatCard
          title={`${summary.period_label || "মাসিক"} বিক্রি`}
          value={`৳ ${takaFormatter.format(summary.month_sales)}`}
          hint={summary.period_label || "মাসিক"}
          icon={ReceiptText}
        />
        <StatCard
          title={`${summary.period_label || "মাসিক"} লাভ`}
          value={`৳ ${takaFormatter.format(summary.month_profit)}`}
          hint="বাস্তব হিসাব"
          icon={TrendingUp}
        />
        <StatCard
          title={`${summary.period_label || "মাসিক"} খরচ`}
          value={`৳ ${takaFormatter.format(summary.month_expenses)}`}
          hint="ব্যবসার খরচ"
          icon={WalletCards}
        />
        <StatCard
          title="নিট লাভ"
          value={`৳ ${takaFormatter.format(summary.net_profit)}`}
          hint="লাভ থেকে খরচ বাদ"
          icon={Scale}
        />
        <StatCard
          title={`${summary.period_label || "মাসিক"} মোট বাকি`}
          value={`৳ ${takaFormatter.format(summary.period_due)}`}
          hint="নির্বাচিত সময়"
          icon={CircleDollarSign}
          onClick={() => setIsDueOpen(true)}
        />
        <StatCard
          title="নতুন কাস্টমার"
          value={`${numberFormatter.format(summary.new_customers)} জন`}
          hint="নির্বাচিত সময়"
          icon={UserPlus}
        />
      </div>

      <div className="grid gap-4 laptop:grid-cols-3">
        <TrendChartCard title="লাভের ট্রেন্ড" data={toChartPercent(charts.profit_trend)} variant="line" />
        <TrendChartCard title="খরচের ট্রেন্ড" data={toChartPercent(charts.expense_trend)} />
        <TrendChartCard title="মাসিক তুলনা চার্ট" data={toChartPercent(charts.monthly_comparison)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>বিস্তারিত আর্থিক হিসাব</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
          <Breakdown label="আজকের খরচ" value={breakdown.today_expense} />
          <Breakdown label="মাসিক খরচ" value={breakdown.monthly_expense} />
          <Breakdown label="গাড়ি ভাড়া" value={breakdown.vehicle_rent} />
          <Breakdown label="শ্রমিক খরচ" value={breakdown.labor_cost} />
          <Breakdown label="বিদ্যুৎ bill" value={breakdown.electricity_bill} />
          <Breakdown label="দোকান ভাড়া" value={breakdown.shop_rent} />
          <Breakdown label="অন্যান্য" value={breakdown.other_expense} />
          <div className="rounded-md bg-muted/65 p-3">
            <p className="text-xs text-muted-foreground">খরচ পেজ</p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/expenses">খরচ ব্যবস্থাপনা</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 laptop:grid-cols-2">
        <TopListCard
          title="সেরা বিক্রিত পণ্য"
          items={topProducts.map((item) => ({
            label: String(item.name || "পণ্য"),
            value: `৳ ${takaFormatter.format(Number(item.profit || 0))}`,
            hint: `${numberFormatter.format(Number(item.quantity || 0))} বস্তা · বিক্রি ৳ ${takaFormatter.format(Number(item.revenue || 0))}`
          }))}
        />
        <TopListCard
          title="কম লাভ পণ্য"
          items={lowProfitProducts.map((item) => ({
            label: String(item.name || "পণ্য"),
            value: `৳ ${takaFormatter.format(Number(item.profit || 0))}`,
            hint: `${numberFormatter.format(Number(item.quantity || 0))} বস্তা · বিক্রি ৳ ${takaFormatter.format(Number(item.revenue || 0))}`
          }))}
        />
      </div>

      <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-5">
        {[
          ["/reports/daily", "দৈনিক রিপোর্ট"],
          ["/reports/monthly", "মাসিক রিপোর্ট"],
          ["/reports/products", "পণ্য পারফরম্যান্স"],
          ["/reports/customers", "কাস্টমার পারফরম্যান্স"],
          ["/reports/export", "এক্সপোর্ট"]
        ].map(([href, label]) => (
          <Button key={href} asChild variant="outline" size="lg">
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </div>

      {isDueOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-foreground/30 p-0 backdrop-blur-sm tablet:items-center tablet:justify-center tablet:p-6">
          <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-lg border bg-background p-4 shadow-soft tablet:max-w-3xl tablet:rounded-lg tablet:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-semibold">বাকি কাস্টমার</h2>
                <p className="text-sm text-muted-foreground">যাদের এখনো টাকা বাকি আছে।</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsDueOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="mt-4 grid gap-3 tablet:grid-cols-[1fr_190px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={dueSearch}
                  onChange={(event) => {
                    setDuePage(1);
                    setDueSearch(event.target.value);
                  }}
                  placeholder="দোকান, মালিক বা মোবাইল খুঁজুন"
                  className="h-12 w-full rounded-md border bg-card pl-10 pr-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <select
                value={dueSort}
                onChange={(event) => {
                  setDuePage(1);
                  setDueSort(event.target.value as "highest" | "latest");
                }}
                className="h-12 w-full rounded-md border bg-card px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                <option value="highest">বেশি বাকি আগে</option>
                <option value="latest">শেষ লেনদেন আগে</option>
              </select>
            </div>

            <div className="mt-4 space-y-3">
              {dueCustomers.map((customer) => (
                <div key={customer.id} className="grid gap-3 rounded-md border p-3 tablet:grid-cols-[1fr_auto] tablet:items-center">
                  <div className="min-w-0">
                    <p className="font-heading text-lg font-semibold">{customer.shop_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {customer.owner_name} · {customer.phone}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      শেষ লেনদেন: {customer.last_sale_date || "-"}
                    </p>
                  </div>
                  <p className="font-heading text-2xl font-semibold text-primary">
                    ৳ {takaFormatter.format(Number(customer.total_due || 0))}
                  </p>
                </div>
              ))}
              {dueCustomers.length === 0 ? (
                <p className="rounded-md bg-muted/60 p-4 text-center text-sm text-muted-foreground">
                  বাকি কাস্টমার পাওয়া যায়নি
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={dueMeta.current_page <= 1}
                onClick={() => setDuePage((page) => Math.max(page - 1, 1))}
              >
                আগের
              </Button>
              <span className="text-sm text-muted-foreground">
                পেজ {numberFormatter.format(dueMeta.current_page)} / {numberFormatter.format(dueMeta.last_page)}
              </span>
              <Button
                variant="outline"
                disabled={dueMeta.current_page >= dueMeta.last_page}
                onClick={() => setDuePage((page) => page + 1)}
              >
                পরের
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function Breakdown({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-md bg-muted/65 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-semibold">
        ৳ {takaFormatter.format(Number(value || 0))}
      </p>
    </div>
  );
}
