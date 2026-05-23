import { apiClient, clearApiToken, saveApiToken } from "./client";

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  business_name?: string;
  mobile?: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    user: ApiUser;
    token: string;
  };
};

export async function loginRequest(payload: { email: string; password: string }) {
  const { data } = await apiClient.post<AuthResponse>("/login", payload);
  saveApiToken(data.data.token);
  return data;
}

export type ProfilePayload = {
  name: string;
  email: string;
  current_password: string;
  password: string;
  password_confirmation: string;
};

export async function updateProfileRequest(payload: ProfilePayload) {
  const { data } = await apiClient.put<{
    success: boolean;
    message: string;
    data: { user: ApiUser };
  }>("/user/profile", payload);
  return data;
}

export async function logoutRequest() {
  try {
    await apiClient.post("/logout");
  } catch {
    // Keep logout reliable when the API server is offline during local development.
  } finally {
    clearApiToken();
  }
}

export async function getCurrentUserRequest() {
  const { data } = await apiClient.get<{
    success: boolean;
    message: string;
    data: { user: ApiUser };
  }>("/user");
  return data.data.user;
}

export function mapApiUser(user: ApiUser) {
  return {
    businessName: user.business_name ?? "MIMBA",
    ownerName: user.name,
    mobile: user.email ?? user.phone ?? user.mobile ?? ""
  };
}
