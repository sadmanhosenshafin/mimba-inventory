import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/due/types";

const riskMap: Record<RiskLevel, { label: string; className: string }> = {
  good: {
    label: "ভালো",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100"
  },
  warning: {
    label: "সতর্ক",
    className: "bg-amber-50 text-amber-700 ring-amber-100"
  },
  risky: {
    label: "ঝুঁকিপূর্ণ",
    className: "bg-rose-50 text-rose-700 ring-rose-100"
  }
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const item = riskMap[risk];

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
