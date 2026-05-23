import { apiClient } from "./client";

export const notificationsApi = {
  list: (params?: { per_page?: number }) => apiClient.get("/notifications", { params })
};
