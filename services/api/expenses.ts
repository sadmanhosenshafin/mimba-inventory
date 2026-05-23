import { apiClient } from "./client";

export type ExpensePayload = {
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
};

export type ExpenseListParams = {
  search?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export const expensesApi = {
  summary: () => apiClient.get("/expenses/summary"),
  list: (params?: ExpenseListParams) => apiClient.get("/expenses", { params }),
  create: (payload: ExpensePayload) => apiClient.post("/expenses", payload),
  update: (id: number | string, payload: ExpensePayload) => apiClient.put(`/expenses/${id}`, payload),
  delete: (id: number | string) => apiClient.delete(`/expenses/${id}`)
};
