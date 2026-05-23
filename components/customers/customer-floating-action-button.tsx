import Link from "next/link";
import { Plus, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerFloatingActionButton({
  href,
  label,
  type = "add"
}: {
  href: string;
  label: string;
  type?: "add" | "sell";
}) {
  const Icon = type === "sell" ? ReceiptText : Plus;

  return (
    <Link
      href={href}
      className={cn(
        "fixed bottom-24 right-4 z-40 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-soft transition-transform active:scale-95 laptop:bottom-8 laptop:right-8"
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
