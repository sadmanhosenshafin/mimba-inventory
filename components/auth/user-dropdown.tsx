"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.replace("/login");
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="gap-2 px-2 tablet:px-3"
        aria-expanded={isOpen}
        aria-label="প্রোফাইল"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="flex size-8 items-center justify-center rounded-md bg-secondary text-primary">
          <User className="size-4" />
        </span>
        <span className="hidden max-w-28 truncate text-sm tablet:inline">
          {user?.ownerName || "ব্যবহারকারী"}
        </span>
      </Button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-lg border bg-card p-2 shadow-soft">
          <div className="border-b px-3 py-3">
            <p className="truncate font-heading text-base font-semibold">
              {user?.businessName || "MIMBA"}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {user?.mobile || "০১XXXXXXXXX"}
            </p>
          </div>
          <Link
            href="/settings/profile"
            className="mt-2 flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold hover:bg-muted"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="size-4" />
            প্রোফাইল সেটিংস
          </Link>
          <button
            type="button"
            className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-destructive hover:bg-muted"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            লগআউট
          </button>
        </div>
      ) : null}
    </div>
  );
}
