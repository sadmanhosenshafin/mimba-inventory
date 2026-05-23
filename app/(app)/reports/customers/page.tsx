"use client";

import { useState } from "react";
import { Download, ShieldAlert, Star, UsersRound } from "lucide-react";
import { ReportFilterBar } from "@/components/reports/report-filter-bar";
import { StatCard } from "@/components/reports/stat-card";
import { TopListCard } from "@/components/reports/top-list-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { useReportEndpoint, type ReportItem } from "@/lib/reports/use-live-reports";
import { reportsApi, type ReportFilters } from "@/services/api/reports";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

type CustomerReport = {
  summary: {
    top_customer: string;
    regular_customers: number;
    high_due_customers: number;
  };
  items: ReportItem[];
  high_due: {
    data: ReportItem[];
  };
};

export default function CustomerPerformancePage() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [isExporting, setIsExporting] = useState(false);
  const { data } = useReportEndpoint<CustomerReport>("customers", filters, {
    summary: { top_customer: "-", regular_customers: 0, high_due_customers: 0 },
    items: [],
    high_due: { data: [] }
  });
  const summary = data?.summary || { top_customer: "-", regular_customers: 0, high_due_customers: 0 };
  const items = data?.items || [];
  const highDueCustomers = data?.high_due?.data || [];
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await reportsApi.exportPdf(filters);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "customer-report.pdf";
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
      title="কাস্টমার পারফরম্যান্স"
      description="সেরা, নিয়মিত ও বেশি বাকি থাকা দোকান।"
      action={
        <Button variant="secondary" size="lg" onClick={handleExportPdf} disabled={isExporting}>
          <Download className="size-5" />
          {isExporting ? "রিপোর্ট তৈরি হচ্ছে" : "রিপোর্ট প্রিন্ট করুন"}
        </Button>
      }
    >
      <ReportFilterBar filters={filters} onFiltersChange={setFilters} />
      <div className="grid gap-4 tablet:grid-cols-3">
        <StatCard title="সেরা কাস্টমার" value={summary.top_customer} hint="মোট ক্রয়" icon={Star} />
        <StatCard title="নিয়মিত ক্রেতা" value={`${numberFormatter.format(summary.regular_customers)} জন`} hint="বিক্রি আছে" icon={UsersRound} />
        <StatCard title="বড় বাকি" value={`${numberFormatter.format(summary.high_due_customers)} জন`} hint="২০ হাজারের বেশি" icon={ShieldAlert} />
      </div>
      <div className="grid gap-4 laptop:grid-cols-2">
        <TopListCard
          title="সেরা কাস্টমার"
          items={items.map((item) => ({
            label: String(item.shop_name || "দোকান"),
            value: `৳ ${takaFormatter.format(Number(item.total_purchase || 0))}`,
            hint: `শেষ ক্রয় ${item.last_purchase_date || "-"}`
          }))}
        />
        <TopListCard
          title="বেশি বাকি"
          items={highDueCustomers
            .map((item) => ({
              label: String(item.shop_name || "দোকান"),
              value: `৳ ${takaFormatter.format(Number(item.total_due || 0))}`,
              hint: `${item.phone || ""}`
            }))}
        />
      </div>
    </PageContainer>
  );
}
