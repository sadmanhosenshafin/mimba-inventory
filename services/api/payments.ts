import { apiClient } from "./client";

export type PaymentPayload = {
  customer_id: number;
  sale_id?: number;
  amount: number;
  type: "cash" | "mobile" | "partial";
  notes?: string;
  paid_at?: string;
};

export const paymentsApi = {
  list: (params?: { per_page?: number }) => apiClient.get("/payments", { params }),
  create: (payload: PaymentPayload) => apiClient.post("/payments", payload)
};
