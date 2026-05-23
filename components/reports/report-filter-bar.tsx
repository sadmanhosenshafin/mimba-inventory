"use client";

import { useMemo, useState } from "react";
import { useCustomers } from "@/components/customers/customer-provider";
import { useProducts } from "@/components/products/product-provider";
import type { ReportFilters } from "@/services/api/reports";

type DatePreset = "today" | "week" | "month" | "year" | "custom";

export function ReportFilterBar({
  filters,
  onFiltersChange
}: {
  filters?: ReportFilters;
  onFiltersChange?: (filters: ReportFilters) => void;
}) {
  const { products } = useProducts();
  const { customers } = useCustomers();
  const [datePreset, setDatePreset] = useState<DatePreset>(filters?.period || "month");

  const dateRanges = useMemo(() => {
    const today = new Date();
    const toIso = (date: Date) => date.toISOString().slice(0, 10);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      today: { date_from: toIso(today), date_to: toIso(today) },
      week: { date_from: toIso(weekStart), date_to: toIso(today) },
      month: { date_from: toIso(monthStart), date_to: toIso(today) },
      year: {
        date_from: toIso(new Date(today.getFullYear(), 0, 1)),
        date_to: toIso(new Date(today.getFullYear(), 11, 31))
      },
      custom: {
        date_from: filters?.date_from,
        date_to: filters?.date_to
      }
    };
  }, [filters?.date_from, filters?.date_to]);

  const updateFilters = (next: ReportFilters) => {
    onFiltersChange?.({
      ...filters,
      ...next
    });
  };

  return (
    <div className="sticky top-16 z-20 -mx-4 grid gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 tablet:top-20 tablet:-mx-6 tablet:grid-cols-3 tablet:px-6 laptop:static laptop:mx-0 laptop:border-0 laptop:bg-transparent laptop:p-0">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">তারিখ</span>
        <select
          value={datePreset}
          onChange={(event) => {
            const preset = event.target.value as DatePreset;
            setDatePreset(preset);
            updateFilters({ period: preset, ...dateRanges[preset] });
          }}
          className="h-12 w-full rounded-md border bg-card px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
        >
          <option value="today">আজ</option>
          <option value="week">সাপ্তাহিক</option>
          <option value="month">মাসিক</option>
          <option value="year">বার্ষিক</option>
          <option value="custom">কাস্টম</option>
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">পণ্য</span>
        <select
          value={filters?.product_id || ""}
          onChange={(event) => updateFilters({ product_id: event.target.value || undefined })}
          className="h-12 w-full rounded-md border bg-card px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
        >
          <option value="">সব পণ্য</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.productName}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">দোকান</span>
        <select
          value={filters?.customer_id || ""}
          onChange={(event) => updateFilters({ customer_id: event.target.value || undefined })}
          className="h-12 w-full rounded-md border bg-card px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
        >
          <option value="">সব দোকান</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.shopName}
            </option>
          ))}
        </select>
      </label>

      {datePreset === "custom" ? (
        <div className="grid gap-3 tablet:col-span-3 tablet:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold">শুরুর তারিখ</span>
            <input
              type="date"
              value={filters?.date_from || ""}
              onChange={(event) => updateFilters({ period: "custom", date_from: event.target.value })}
              className="h-12 w-full rounded-md border bg-card px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">শেষ তারিখ</span>
            <input
              type="date"
              value={filters?.date_to || ""}
              onChange={(event) => updateFilters({ period: "custom", date_to: event.target.value })}
              className="h-12 w-full rounded-md border bg-card px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
