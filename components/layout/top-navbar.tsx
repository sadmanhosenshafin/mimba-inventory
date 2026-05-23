"use client";

import { Bell, Search } from "lucide-react";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { Button } from "@/components/ui/button";

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/92 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-5 tablet:px-6 laptop:h-20 laptop:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="font-heading text-lg font-semibold leading-tight tablet:text-xl">
              সাম্প্রতিক কার্যক্রম
            </p>
            <p className="hidden text-sm text-muted-foreground xs:block">
              বিক্রি, স্টক ও বাকি এক জায়গায়
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="খুঁজুন">
            <Search className="size-5" />
          </Button>
          <Button variant="outline" size="icon" aria-label="নোটিশ">
            <Bell className="size-5" />
          </Button>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
