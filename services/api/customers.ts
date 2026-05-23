import { apiClient } from "./client";

export type CustomerPayload = {
  shop_name: string;
  owner_name: string;
  phone: string;
  address?: string;
  total_due?: number;
  status?: "green" | "yellow" | "red";
};

export const customersApi = {
  list: (params?: { search?: string; per_page?: number }) => apiClient.get("/customers", { params }),
  create: (payload: CustomerPayload) => apiClient.post("/customers", payload),
  show: (id: number | string) => apiClient.get(`/customers/${id}`),
  update: (id: number | string, payload: Partial<CustomerPayload>) => apiClient.put(`/customers/${id}`, payload)
};
