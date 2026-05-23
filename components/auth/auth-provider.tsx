"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  clearApiToken,
  getApiToken,
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  mapApiUser,
  type ProfilePayload,
  updateProfileRequest
} from "@/services/api";

type MockUser = {
  businessName: string;
  ownerName: string;
  mobile: string;
};

type AuthContextValue = {
  user: MockUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  updateProfile: (payload: ProfilePayload) => Promise<void>;
  logout: () => Promise<void>;
};

const SESSION_KEY = "mimba_session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        if (getApiToken()) {
          const apiUser = await getCurrentUserRequest();
          if (isMounted) {
            setUser(mapApiUser(apiUser));
            setIsLoading(false);
          }
          return;
        }
      } catch {
        clearApiToken();
      }

      try {
        const rawSession = window.localStorage?.getItem(SESSION_KEY);
        if (rawSession && isMounted) {
          setUser(JSON.parse(rawSession) as MockUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistUser = useCallback((nextUser: MockUser) => {
    try {
      window.localStorage?.setItem(SESSION_KEY, JSON.stringify(nextUser));
    } catch {
      // Mock auth still works in memory if browser storage is unavailable.
    }
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await loginRequest({ email, password });
        const apiUser = response.data.user;
        persistUser(mapApiUser(apiUser));
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 450));
        if (email === "admin@gmail.com" && password === "12345678") {
          persistUser({
            businessName: "MIMBA",
            ownerName: "অ্যাডমিন",
            mobile: email
          });
          return;
        }

        throw new Error("ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।");
      }
    },
    [persistUser]
  );

  const updateProfile = useCallback(
    async (payload: ProfilePayload) => {
      const response = await updateProfileRequest(payload);
      persistUser(mapApiUser(response.data.user));
    },
    [persistUser]
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    try {
      window.localStorage?.removeItem(SESSION_KEY);
    } catch {
      // Nothing to clear when mock storage is unavailable.
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      updateProfile,
      logout
    }),
    [isLoading, login, logout, updateProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
