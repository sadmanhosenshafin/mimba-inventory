import { apiClient } from "./client";

export type ReportFilters = {
  period?: "today" | "week" | "month" | "year" | "custom";
  date_from?: string;
  date_to?: string;
  date?: string;
  month?: string;
  customer_id?: number | string;
  product_id?: number | string;
  per_page?: number;
  expenses?: number;
};

export const reportsApi = {
  summary: (params?: ReportFilters) => apiClient.get("/reports/summary", { params }),
  daily: (params?: ReportFilters) => apiClient.get("/reports/daily", { params }),
  monthly: (params?: ReportFilters) => apiClient.get("/reports/monthly", { params }),
  products: (params?: ReportFilters) => apiClient.get("/reports/products", { params }),
  customers: (params?: ReportFilters) => apiClient.get("/reports/customers", { params }),
  profit: (params?: ReportFilters) => apiClient.get("/reports/profit", { params }),
  dueCustomers: (params?: ReportFilters & { search?: string; sort?: "highest" | "latest"; page?: number }) =>
    apiClient.get("/reports/due-customers", { params }),
  exportPdf: (params?: ReportFilters) =>
    apiClient.get("/reports/export/pdf", { params, responseType: "blob" })
};
