"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribeBusinessDataChanged } from "@/lib/live-data/events";
import { reportsApi, type ReportFilters } from "@/services/api/reports";

export type ChartPoint = {
  label: string;
  value: number;
};

export type ReportSummary = {
  period_label?: string;
  date_from?: string;
  date_to?: string;
  today_sales: number;
  today_profit: number;
  today_due: number;
  month_sales: number;
  month_profit: number;
  month_expenses: number;
  net_profit: number;
  period_due: number;
  new_customers: number;
  buying_cost: number;
  collected_amount: number;
  filtered_sales: number;
  filtered_profit: number;
  total_due: number;
  stock_value: number;
  total_customers: number;
  total_stock: number;
};

export type ReportItem = Record<string, string | number | null | undefined>;

export function useReportSummary(filters?: ReportFilters) {
  const [summary, setSummary] = useState<ReportSummary>({
    today_sales: 0,
    today_profit: 0,
    today_due: 0,
    month_sales: 0,
    month_profit: 0,
    month_expenses: 0,
    net_profit: 0,
    period_due: 0,
    new_customers: 0,
    buying_cost: 0,
    collected_amount: 0,
    filtered_sales: 0,
    filtered_profit: 0,
    total_due: 0,
    stock_value: 0,
    total_customers: 0,
    total_stock: 0
  });
  const [charts, setCharts] = useState<{
    sales_trend: ChartPoint[];
    due_trend: ChartPoint[];
    profit_trend: ChartPoint[];
    expense_trend: ChartPoint[];
    monthly_comparison: ChartPoint[];
    product_performance: ChartPoint[];
  }>({ sales_trend: [], due_trend: [], profit_trend: [], expense_trend: [], monthly_comparison: [], product_performance: [] });
  const [topProducts, setTopProducts] = useState<ReportItem[]>([]);
  const [lowProfitProducts, setLowProfitProducts] = useState<ReportItem[]>([]);
  const [topCustomers, setTopCustomers] = useState<ReportItem[]>([]);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    const response = await reportsApi.summary(filters);
    const payload = response.data.data || {};
    setSummary((current) => ({ ...current, ...(payload.summary || {}) }));
    setCharts({
      sales_trend: payload.charts?.sales_trend || [],
      due_trend: payload.charts?.due_trend || [],
      profit_trend: payload.charts?.profit_trend || [],
      expense_trend: payload.charts?.expense_trend || [],
      monthly_comparison: payload.charts?.monthly_comparison || [],
      product_performance: payload.charts?.product_performance || []
    });
    setTopProducts(payload.top_products || []);
    setLowProfitProducts(payload.low_profit_products || []);
    setTopCustomers(payload.top_customers || []);
    setBreakdown(payload.breakdown || {});
  }, [filters]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    const unsubscribe = subscribeBusinessDataChanged(() => void refresh());

    return () => {
      window.clearInterval(timer);
      unsubscribe();
    };
  }, [refresh]);

  return { summary, charts, topProducts, lowProfitProducts, topCustomers, breakdown, refresh };
}

export function useReportEndpoint<T>(endpoint: keyof typeof reportsApi, filters?: ReportFilters, initialData?: T) {
  const [data, setData] = useState<T | undefined>(initialData);

  const refresh = useCallback(async () => {
    const response = await reportsApi[endpoint](filters);
    setData(response.data.data as T);
  }, [endpoint, filters]);

  useEffect(() => {
    void refresh();
    const unsubscribe = subscribeBusinessDataChanged(() => void refresh());
    return unsubscribe;
  }, [refresh]);

  return { data, refresh };
}
