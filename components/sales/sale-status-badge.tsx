import { cn } from "@/lib/utils";
import type { SaleStatus } from "@/lib/sales/types";

const statusMap: Record<SaleStatus, { label: string; className: string }> = {
  paid: {
    label: "সম্পূর্ণ পরিশোধ",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100"
  },
  partial: {
    label: "আংশিক পরিশোধ",
    className: "bg-amber-50 text-amber-700 ring-amber-100"
  },
  due: {
    label: "বাকি আছে",
    className: "bg-rose-50 text-rose-700 ring-rose-100"
  }
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const item = statusMap[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
        item.className
      )}
    >
      {item.label}
    </span>
  );
}
