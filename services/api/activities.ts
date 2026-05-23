import { apiClient } from "./client";

export const activitiesApi = {
  list: (params?: { per_page?: number }) => apiClient.get("/activities", { params })
};
