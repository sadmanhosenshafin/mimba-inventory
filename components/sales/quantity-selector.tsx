"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickValues = [5, 10, 20, 50];

export function QuantitySelector({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="পরিমাণ কমান"
          onClick={() => onChange(Math.max(value - 1, 1))}
        >
          <Minus className="size-4" />
        </Button>
        <input
          value={value}
          inputMode="numeric"
          onChange={(event) => onChange(Math.max(Number(event.target.value) || 1, 1))}
          className="h-11 min-w-0 flex-1 rounded-md border bg-background px-3 text-center font-heading text-xl font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="পরিমাণ বাড়ান"
          onClick={() => onChange(value + 1)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {quickValues.map((quickValue) => (
          <Button
            key={quickValue}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange(value + quickValue)}
          >
            +{quickValue}
          </Button>
        ))}
      </div>
    </div>
  );
}
