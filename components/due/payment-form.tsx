"use client";

import { FormEvent, useMemo, useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { AuthInput } from "@/components/auth/auth-input";
import { Button } from "@/components/ui/button";
import type { DueCustomer, PaymentType } from "@/lib/due/types";

const takaFormatter = new Intl.NumberFormat("bn-BD");

const paymentTypes: { label: string; value: PaymentType }[] = [
  { label: "নগদ", value: "cash" },
  { label: "মোবাইল ব্যাংকিং", value: "mobile" },
  { label: "আংশিক পেমেন্ট", value: "partial" }
];

export function PaymentForm({
  customers,
  initialCustomerId,
  onSubmit
}: {
  customers: DueCustomer[];
  initialCustomerId?: string;
  onSubmit: (payload: {
    customer: DueCustomer;
    amount: number;
    type: PaymentType;
    note: string;
  }) => void;
}) {
  const [customerId, setCustomerId] = useState(initialCustomerId || customers[0]?.customerId || "");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PaymentType>("cash");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.customerId === customerId),
    [customerId, customers]
  );
  const collectedAmount = Number(amount) || 0;
  const remainingDue = Math.max((selectedCustomer?.currentDue || 0) - collectedAmount, 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer) return;
    if (!amount.trim() || collectedAmount <= 0) {
      setError("আদায়ের টাকা দিন");
      return;
    }

    onSubmit({
      customer: selectedCustomer,
      amount: collectedAmount,
      type,
      note: note || "বাকি টাকা আদায়"
    });
  };

  return (
    <form className="grid gap-4 laptop:grid-cols-[1fr_0.9fr]" onSubmit={handleSubmit}>
      <div className="space-y-4 rounded-lg border bg-card p-4 shadow-soft sm:p-5">
        <label className="block space-y-2" htmlFor="due-customer">
          <span className="text-sm font-semibold">দোকান</span>
          <select
            id="due-customer"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20"
          >
            {customers.map((customer) => (
              <option key={customer.customerId} value={customer.customerId}>
                {customer.shopName}
              </option>
            ))}
          </select>
        </label>

        <AuthInput
          label="আদায়ের টাকা"
          name="amount"
          inputMode="numeric"
          placeholder="১০০০০"
          value={amount}
          error={error}
          onChange={(event) => {
            setAmount(event.target.value);
            setError("");
          }}
        />

        <label className="block space-y-2" htmlFor="payment-type">
          <span className="text-sm font-semibold">পেমেন্ট ধরন</span>
          <select
            id="payment-type"
            value={type}
            onChange={(event) => setType(event.target.value as PaymentType)}
            className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20"
          >
            {paymentTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2" htmlFor="payment-note">
          <span className="text-sm font-semibold">নোট</span>
          <textarea
            id="payment-note"
            value={note}
            rows={4}
            placeholder="পেমেন্ট সম্পর্কে নোট"
            onChange={(event) => setNote(event.target.value)}
            className="w-full resize-none rounded-md border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </label>

        <Button type="submit" size="lg" className="w-full">
          <CircleDollarSign className="size-5" />
          পেমেন্ট সেভ করুন
        </Button>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4 shadow-soft sm:p-5">
        <h2 className="font-heading text-xl font-semibold">বাকি হিসাব</h2>
        {selectedCustomer ? (
          <>
            <Summary label="মোট বাকি" value={`৳ ${takaFormatter.format(selectedCustomer.currentDue)}`} />
            <Summary label="আদায়" value={`৳ ${takaFormatter.format(collectedAmount)}`} />
            <Summary label="বাকি থাকবে" value={`৳ ${takaFormatter.format(remainingDue)}`} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">দোকান নির্বাচন করুন</p>
        )}
      </div>
    </form>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/65 p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold">{value}</p>
    </div>
  );
}
