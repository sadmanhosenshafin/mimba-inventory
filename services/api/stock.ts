import { apiClient } from "./client";

export type StockInPayload = {
  product_id: number;
  quantity: number;
  unit_type?: string;
  supplier?: string;
  buy_price?: number;
  sell_price?: number;
  buying_price?: number;
  selling_price?: number;
  entry_date?: string;
  date?: string;
  note?: string;
  notes?: string;
};

export const stockApi = {
  add: (payload: StockInPayload) => apiClient.post("/stock/in", payload),
  history: (params?: { per_page?: number }) => apiClient.get("/stock/history", { params }),
  show: (id: number | string) => apiClient.get(`/stock/history/${id}`),
  update: (id: number | string, payload: StockInPayload & { type?: "in" | "out" }) =>
    apiClient.put(`/stock/history/${id}`, payload),
  delete: (id: number | string) => apiClient.delete(`/stock/history/${id}`)
};
