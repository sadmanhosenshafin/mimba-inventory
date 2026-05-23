import { apiClient } from "./client";

export type SalePayload = {
  customer_id: number;
  paid_amount?: number;
  notes?: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price?: number;
  }>;
};

export const salesApi = {
  list: (params?: { per_page?: number }) => apiClient.get("/sales", { params }),
  create: (payload: SalePayload) => apiClient.post("/sales", payload),
  show: (id: number | string) => apiClient.get(`/sales/${id}`),
  update: (id: number | string, payload: SalePayload) => apiClient.put(`/sales/${id}`, payload),
  delete: (id: number | string) => apiClient.delete(`/sales/${id}`)
};
