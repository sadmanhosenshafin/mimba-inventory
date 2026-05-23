"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { ReportFilterBar } from "@/components/reports/report-filter-bar";
import { SummaryCard } from "@/components/reports/summary-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { reportsApi, type ReportFilters } from "@/services/api/reports";

export default function ExportReportPage() {
  const [filters, setFilters] = useState<ReportFilters>({ period: "month" });
  const [isExporting, setIsExporting] = useState(false);
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
    <PageContainer title="রিপোর্ট এক্সপোর্ট" description="নির্বাচিত সময়ের রিপোর্ট PDF হিসেবে প্রিন্ট করুন।">
      <ReportFilterBar filters={filters} onFiltersChange={setFilters} />
      <SummaryCard title="রিপোর্ট প্রিন্ট">
        <Button type="button" size="lg" className="w-full" onClick={handleExportPdf} disabled={isExporting}>
          <Download className="size-5" />
          {isExporting ? "রিপোর্ট তৈরি হচ্ছে" : "রিপোর্ট প্রিন্ট করুন"}
        </Button>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          নির্বাচিত ফিল্টার অনুযায়ী বাস্তব ডাটাবেস হিসাব দিয়ে PDF তৈরি হবে।
        </p>
      </SummaryCard>
    </PageContainer>
  );
}
