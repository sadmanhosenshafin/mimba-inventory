"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export function FloatingActionButton() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/customers") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/sales")
  ) {
    return null;
  }

  return (
    <Link
      href="/sales"
      aria-label="নতুন বিক্রি"
      className="fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform active:scale-95 laptop:hidden"
    >
      <Plus className="size-6" />
    </Link>
  );
}
