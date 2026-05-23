"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t bg-card/98 px-2 pb-2 pt-2 shadow-[0_-10px_30px_-24px_rgba(15,23,42,0.7)] backdrop-blur laptop:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-semibold text-muted-foreground transition-colors",
                isActive && "bg-secondary text-primary"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="leading-none">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
