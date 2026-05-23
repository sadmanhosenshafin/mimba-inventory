"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const searchParams = new URLSearchParams(window.location.search);
      router.replace(searchParams.get("next") || "/");
    }
  }, [isLoading, router, user]);

  if (!isLoading && user) {
    return null;
  }

  return <>{children}</>;
}
