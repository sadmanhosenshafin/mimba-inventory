"use client";

import { useState } from "react";
import { Download, ReceiptText, TrendingUp, WalletCards } from "lucide-react";
import { ReportFilterBar } from "@/components/reports/report-filter-bar";
import { StatCard } from "@/components/reports/stat-card";
import { SummaryCard } from "@/components/reports/summary-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { useReportEndpoint } from "@/lib/reports/use-live-reports";
import { reportsApi, type ReportFilters } from "@/services/api/reports";

const takaFormatter = new Intl.NumberFormat("bn-BD");
type DailyReport = {
  summary: {
    sales: number;
    due: number;
    profit: number;
    expense: number;
  };
  activities: string[];
};

export default function DailyReportPage() {
  const [filters, setFilters] = useState<ReportFilters>({ period: "today" });
  const [isExporting, setIsExporting] = useState(false);
  const { data } = useReportEndpoint<DailyReport>("daily", filters, {
    summary: { sales: 0, due: 0, profit: 0, expense: 0 },
    activities: []
  });
  const summary = data?.summary || { sales: 0, due: 0, profit: 0, expense: 0 };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await reportsApi.exportPdf({ ...filters, period: "today" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "daily-report.pdf";
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
      title="দৈনিক রিপোর্ট"
      description="আজকের বিক্রি, লাভ, বাকি ও খরচ।"
      action={
        <Button variant="secondary" size="lg" onClick={handleExportPdf} disabled={isExporting}>
          <Download className="size-5" />
          {isExporting ? "রিপোর্ট তৈরি হচ্ছে" : "রিপোর্ট প্রিন্ট করুন"}
        </Button>
      }
    >
      <ReportFilterBar filters={filters} onFiltersChange={setFilters} />
      <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <StatCard title="আজকের বিক্রি" value={`৳ ${takaFormatter.format(summary.sales)}`} hint="লাইভ হিসাব" icon={ReceiptText} />
        <StatCard title="আজকের লাভ" value={`৳ ${takaFormatter.format(summary.profit)}`} hint="বিক্রির লাভ" icon={TrendingUp} />
        <StatCard title="আজ বাকি" value={`৳ ${takaFormatter.format(summary.due)}`} hint="নতুন বাকি" icon={WalletCards} />
        <StatCard title="আজকের খরচ" value={`৳ ${takaFormatter.format(summary.expense)}`} hint="রাত ১২টার পর নতুন হিসাব" icon={WalletCards} />
      </div>
      <SummaryCard title="সাম্প্রতিক কার্যক্রম">
        <div className="space-y-3">
          {(data?.activities || []).map((item) => (
            <div key={item} className="flex gap-3 rounded-md bg-muted/60 p-3">
              <span className="mt-1 size-2 rounded-full bg-primary" />
              <p className="font-medium leading-6">{item}</p>
            </div>
          ))}
          {(data?.activities || []).length === 0 ? (
            <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">আজ এখনো কোনো কাজ নেই</p>
          ) : null}
        </div>
      </SummaryCard>
    </PageContainer>
  );
}
