"use client";

const takaFormatter = new Intl.NumberFormat("bn-BD");

export function PaymentSummary({
  totalAmount,
  paidAmount,
  onPaidAmountChange
}: {
  totalAmount: number;
  paidAmount: number;
  onPaidAmountChange: (amount: number) => void;
}) {
  const dueAmount = Math.max(totalAmount - paidAmount, 0);

  return (
    <section className="rounded-lg border bg-card p-4 shadow-soft sm:p-5">
      <h2 className="font-heading text-xl font-semibold">পেমেন্ট</h2>
      <div className="mt-4 grid gap-3 tablet:grid-cols-3">
        <SummaryItem label="মোট টাকা" value={`৳ ${takaFormatter.format(totalAmount)}`} />
        <label className="block rounded-md bg-muted/65 p-3">
          <span className="text-sm text-muted-foreground">পরিশোধ</span>
          <input
            value={paidAmount || ""}
            inputMode="numeric"
            onChange={(event) => onPaidAmountChange(Number(event.target.value) || 0)}
            placeholder="০"
            className="mt-1 h-10 w-full rounded-md border bg-background px-3 font-heading text-xl font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </label>
        <SummaryItem label="বাকি" value={`৳ ${takaFormatter.format(dueAmount)}`} />
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/65 p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold">{value}</p>
    </div>
  );
}
