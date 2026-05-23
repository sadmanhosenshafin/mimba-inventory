import { apiClient } from "./client";

export type ProductPayload = {
  name: string;
  category: string;
  brand?: string;
  weight?: string;
  stock?: number;
  stock_quantity?: number;
  min_stock?: number;
  minimum_stock_limit?: number;
  buy_price?: number;
  buying_price?: number;
  sell_price?: number;
  selling_price?: number;
  supplier?: string;
  note?: string;
  notes?: string;
};

export const productsApi = {
  list: (params?: { search?: string; category?: string; low_stock?: boolean; per_page?: number }) =>
    apiClient.get("/products", { params }),
  create: (payload: ProductPayload) => apiClient.post("/products", payload),
  show: (id: number | string) => apiClient.get(`/products/${id}`),
  update: (id: number | string, payload: Partial<ProductPayload>) => apiClient.put(`/products/${id}`, payload)
};
