"use client";

import { productCategories } from "@/lib/products/mock-data";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/lib/products/types";

export type CategoryFilterValue = "সব" | ProductCategory;

export function CategoryFilter({
  value,
  onChange
}: {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}) {
  const options: CategoryFilterValue[] = ["সব", ...productCategories];

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 tablet:mx-0 tablet:px-0">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={cn(
            "min-h-11 shrink-0 rounded-md border bg-card px-4 text-sm font-semibold text-muted-foreground transition-colors",
            value === option && "border-primary bg-secondary text-primary"
          )}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
