"use client";

import { useState } from "react";
import { CircleDollarSign, Download, PackageCheck, TrendingUp, WalletCards } from "lucide-react";
import { ReportFilterBar } from "@/components/reports/report-filter-bar";
import { StatCard } from "@/components/reports/stat-card";
import { TrendChartCard } from "@/components/reports/trend-chart-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { useReportEndpoint, type ChartPoint, type ReportItem } from "@/lib/reports/use-live-reports";
import { reportsApi, type ReportFilters } from "@/services/api/reports";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

type MonthlyReport = {
  summary: {
    sales: number;
    profit: number;
    due: number;
    expense: number;
    best_day: string;
    worst_day: string;
  };
  trend: ChartPoint[];
  products: ReportItem[];
};

function toChartPercent(data: ChartPoint[]) {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);
  return data.map((item) => ({
    label: item.label,
    value: Math.round((Number(item.value || 0) / max) * 100)
  }));
}

export default function MonthlyReportPage() {
  const [filters, setFilters] = useState<ReportFilters>({ period: "month" });
  const [isExporting, setIsExporting] = useState(false);
  const { data } = useReportEndpoint<MonthlyReport>("monthly", filters, {
    summary: { sales: 0, profit: 0, due: 0, expense: 0, best_day: "-", worst_day: "-" },
    trend: [],
    products: []
  });
  const summary = data?.summary || { sales: 0, profit: 0, due: 0, expense: 0, best_day: "-", worst_day: "-" };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await reportsApi.exportPdf({ ...filters, period: "month" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "monthly-report.pdf";
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
      title="মাসিক রিপোর্ট"
      description="এই মাসের বিক্রি, লাভ, বাকি, খরচ ও পণ্যভিত্তিক বিক্রি।"
      action={
        <Button variant="secondary" size="lg" onClick={handleExportPdf} disabled={isExporting}>
          <Download className="size-5" />
          {isExporting ? "রিপোর্ট তৈরি হচ্ছে" : "রিপোর্ট প্রিন্ট করুন"}
        </Button>
      }
    >
      <ReportFilterBar filters={filters} onFiltersChange={setFilters} />
      <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <StatCard title="এই মাসের বিক্রি" value={`৳ ${takaFormatter.format(summary.sales)}`} hint="মাসের ১ তারিখ থেকে" icon={CircleDollarSign} />
        <StatCard title="এই মাসের লাভ" value={`৳ ${takaFormatter.format(summary.profit)}`} hint="বাস্তব হিসাব" icon={TrendingUp} />
        <StatCard title="এই মাসের বাকি" value={`৳ ${takaFormatter.format(summary.due)}`} hint="মাসিক বাকি" icon={WalletCards} />
        <StatCard title="এই মাসের খরচ" value={`৳ ${takaFormatter.format(summary.expense)}`} hint="মাসিক খরচ" icon={PackageCheck} />
      </div>
      <TrendChartCard title="মাসিক বিক্রি ট্রেন্ড" data={toChartPercent(data?.trend || [])} />

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">এই মাসে বিক্রিত পণ্য</h2>
        <div className="grid gap-3">
          {(data?.products || []).map((item) => (
            <div key={String(item.id)} className="grid gap-3 rounded-lg border bg-card p-4 shadow-soft tablet:grid-cols-[1fr_auto] tablet:items-center">
              <div>
                <p className="font-heading text-lg font-semibold">{String(item.name || "পণ্য")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  বিক্রিত পরিমাণ {numberFormatter.format(Number(item.quantity || 0))} বস্তা
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-right">
                <Info label="মোট বিক্রি" value={`৳ ${takaFormatter.format(Number(item.revenue || 0))}`} />
                <Info label="আনুমানিক লাভ" value={`৳ ${takaFormatter.format(Number(item.profit || 0))}`} />
              </div>
            </div>
          ))}
          {(data?.products || []).length === 0 ? (
            <p className="rounded-lg border bg-card p-5 text-center text-sm text-muted-foreground">এই মাসে কোনো পণ্য বিক্রি হয়নি</p>
          ) : null}
        </div>
      </section>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/65 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-lg font-semibold">{value}</p>
    </div>
  );
}
