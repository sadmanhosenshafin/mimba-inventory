import axios, { AxiosError } from "axios";

export const API_TOKEN_KEY = "mimba_api_token";

export type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem(API_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(API_TOKEN_KEY);
    }

    return Promise.reject(error);
  }
);

export function saveApiToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(API_TOKEN_KEY, token);
  }
}

export function clearApiToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(API_TOKEN_KEY);
  }
}

export function getApiToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(API_TOKEN_KEY);
}

export function getBanglaApiError(error: unknown, fallback = "অনুরোধটি সম্পন্ন করা যায়নি") {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const fieldErrors = error.response?.data?.errors;
    const firstFieldError = fieldErrors ? Object.values(fieldErrors)[0]?.[0] : undefined;
    return firstFieldError ?? error.response?.data?.message ?? fallback;
  }

  return fallback;
}
