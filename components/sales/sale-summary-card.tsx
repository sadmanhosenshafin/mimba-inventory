import type { SaleItem } from "@/lib/sales/types";

const numberFormatter = new Intl.NumberFormat("bn-BD");

export function SaleSummaryCard({
  items,
  paidAmount
}: {
  items: SaleItem[];
  paidAmount: number;
}) {
  const totalProducts = items.length;
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const grandTotal = items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );
  const dueAmount = Math.max(grandTotal - paidAmount, 0);

  return (
    <aside className="sticky top-24 rounded-lg border bg-card p-4 shadow-soft">
      <h2 className="font-heading text-xl font-semibold">বিক্রির সারাংশ</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Summary label="পণ্য" value={`${numberFormatter.format(totalProducts)}টি`} />
        <Summary label="পরিমাণ" value={`${numberFormatter.format(totalQuantity)} বস্তা`} />
        <Summary label="মোট" value={`৳ ${numberFormatter.format(grandTotal)}`} />
        <Summary label="বাকি" value={`৳ ${numberFormatter.format(dueAmount)}`} />
      </div>
    </aside>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/65 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-lg font-semibold">{value}</p>
    </div>
  );
}
