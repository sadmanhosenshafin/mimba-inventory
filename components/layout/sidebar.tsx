"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MimbaLogo } from "@/components/brand/mimba-logo";
import { mainNavItems, utilityNavItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-card laptop:flex laptop:flex-col">
      <div className="flex h-20 items-center gap-3 px-6">
        <MimbaLogo />
        <div>
          <p className="font-heading text-xl font-semibold leading-none">MIMBA</p>
          <p className="mt-1 text-sm text-muted-foreground">ফিড ডিলার সহকারী</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-4 py-3">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-md px-4 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-secondary text-primary"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        {utilityNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-md px-4 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-secondary text-primary"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
