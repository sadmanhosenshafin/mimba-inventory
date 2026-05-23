"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RiskLevel } from "@/lib/due/types";
import { cn } from "@/lib/utils";

export type RiskFilterValue = "all" | RiskLevel;
export type DaysFilterValue = "all" | "3" | "7";

const riskOptions: { label: string; value: RiskFilterValue }[] = [
  { label: "সব", value: "all" },
  { label: "ভালো", value: "good" },
  { label: "সতর্ক", value: "warning" },
  { label: "ঝুঁকিপূর্ণ", value: "risky" }
];

export function DueFilterBar({
  query,
  risk,
  days,
  onQueryChange,
  onRiskChange,
  onDaysChange
}: {
  query: string;
  risk: RiskFilterValue;
  days: DaysFilterValue;
  onQueryChange: (value: string) => void;
  onRiskChange: (value: RiskFilterValue) => void;
  onDaysChange: (value: DaysFilterValue) => void;
}) {
  return (
    <div className="sticky top-16 z-20 -mx-4 space-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 tablet:top-20 tablet:-mx-6 tablet:px-6 laptop:static laptop:mx-0 laptop:border-0 laptop:bg-transparent laptop:p-0">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="দোকান বা মোবাইল খুঁজুন"
          className="h-14 w-full rounded-md border bg-card pl-12 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {riskOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              "min-h-11 shrink-0 rounded-md border bg-card px-4 text-sm font-semibold text-muted-foreground",
              risk === option.value && "border-primary bg-secondary text-primary"
            )}
            onClick={() => onRiskChange(option.value)}
          >
            {option.label}
          </button>
        ))}
        <Button
          type="button"
          variant={days === "3" ? "secondary" : "outline"}
          onClick={() => onDaysChange(days === "3" ? "all" : "3")}
        >
          ৩+ দিন
        </Button>
        <Button
          type="button"
          variant={days === "7" ? "secondary" : "outline"}
          onClick={() => onDaysChange(days === "7" ? "all" : "7")}
        >
          ৭+ দিন
        </Button>
      </div>
    </div>
  );
}
