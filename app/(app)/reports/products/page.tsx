"use client";

import { useState } from "react";
import { Boxes, Download, PackageMinus, TrendingUp } from "lucide-react";
import { ReportFilterBar } from "@/components/reports/report-filter-bar";
import { StatCard } from "@/components/reports/stat-card";
import { TopListCard } from "@/components/reports/top-list-card";
import { TrendChartCard } from "@/components/reports/trend-chart-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { useReportEndpoint, type ReportItem } from "@/lib/reports/use-live-reports";
import { reportsApi, type ReportFilters } from "@/services/api/reports";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

type ProductReport = {
  summary: {
    top_product: string;
    low_product: string;
    total_stock: number;
  };
  items: ReportItem[];
};

function toChartPercent(items: ReportItem[]) {
  const max = Math.max(...items.map((item) => Number(item.quantity || 0)), 1);
  return items.slice(0, 6).map((item) => ({
    label: String(item.name || "পণ্য").slice(0, 5),
    value: Math.round((Number(item.quantity || 0) / max) * 100)
  }));
}

export default function ProductPerformancePage() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [isExporting, setIsExporting] = useState(false);
  const { data } = useReportEndpoint<ProductReport>("products", filters, {
    summary: { top_product: "-", low_product: "-", total_stock: 0 },
    items: []
  });
  const summary = data?.summary || { top_product: "-", low_product: "-", total_stock: 0 };
  const items = data?.items || [];
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await reportsApi.exportPdf(filters);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "product-report.pdf";
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
      title="পণ্য পারফরম্যান্স"
      description="কোন পণ্য বেশি চলছে, কোন পণ্য কম চলছে।"
      action={
        <Button variant="secondary" size="lg" onClick={handleExportPdf} disabled={isExporting}>
          <Download className="size-5" />
          {isExporting ? "রিপোর্ট তৈরি হচ্ছে" : "রিপোর্ট প্রিন্ট করুন"}
        </Button>
      }
    >
      <ReportFilterBar filters={filters} onFiltersChange={setFilters} />
      <div className="grid gap-4 tablet:grid-cols-3">
        <StatCard title="সেরা পণ্য" value={summary.top_product} hint="বিক্রির ভিত্তিতে" icon={TrendingUp} />
        <StatCard title="কম বিক্রি" value={summary.low_product} hint="নজর দরকার" icon={PackageMinus} />
        <StatCard title="মোট স্টক" value={`${numberFormatter.format(summary.total_stock)} বস্তা`} hint="সব পণ্য" icon={Boxes} />
      </div>
      <div className="grid gap-4 laptop:grid-cols-2">
        <TrendChartCard
          title="পণ্য বিক্রি"
          data={toChartPercent(items)}
        />
        <TopListCard
          title="পণ্যের তালিকা"
          items={items.map((item) => ({
            label: String(item.name || "পণ্য"),
            value: `৳ ${takaFormatter.format(Number(item.revenue || 0))}`,
            hint: `${numberFormatter.format(Number(item.quantity || 0))} বস্তা · স্টক ${numberFormatter.format(Number(item.stock || 0))}`
          }))}
        />
      </div>
    </PageContainer>
  );
}
