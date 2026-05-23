import { apiClient } from "./client";

export type SalesReturnPayload = {
  sale_id: number;
  product_id: number;
  quantity: number;
  reason: string;
  return_date?: string;
  note?: string;
};

export const returnsApi = {
  list: (params?: { search?: string; reason?: string; per_page?: number }) =>
    apiClient.get("/returns", { params }),
  create: (payload: SalesReturnPayload) => apiClient.post("/returns", payload),
  delete: (id: number | string) => apiClient.delete(`/returns/${id}`)
};
