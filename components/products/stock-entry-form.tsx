"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, PackagePlus } from "lucide-react";
import { AuthInput } from "@/components/auth/auth-input";
import { Button } from "@/components/ui/button";
import type { Product, StockEntryValues } from "@/lib/products/types";

type StockEntryErrors = Partial<Record<keyof StockEntryValues, string>>;

export function StockEntryForm({
  products,
  initialProductId,
  onSubmit
}: {
  products: Product[];
  initialProductId?: string;
  onSubmit: (values: StockEntryValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<StockEntryValues>({
    productId: initialProductId || products[0]?.id || "",
    quantity: "",
    supplier: "",
    buyingPrice: "",
    sellingPrice: "",
    date: new Date().toISOString().slice(0, 10),
    notes: ""
  });
  const [errors, setErrors] = useState<StockEntryErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProductId) {
      setValues((current) => ({ ...current, productId: initialProductId }));
    }
  }, [initialProductId]);

  const selectedProduct = products.find((product) => product.id === values.productId);

  const isDisabled = useMemo(
    () =>
      !values.productId ||
      !values.quantity.trim() ||
      !values.buyingPrice.trim() ||
      !values.sellingPrice.trim() ||
      !values.date.trim() ||
      isSubmitting,
    [isSubmitting, values]
  );

  const updateValue = (name: keyof StockEntryValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    const nextErrors: StockEntryErrors = {};
    if (!values.productId) nextErrors.productId = "পণ্য নির্বাচন করুন";
    if (!values.quantity.trim()) nextErrors.quantity = "স্টক পরিমাণ দিন";
    if (!values.buyingPrice.trim()) nextErrors.buyingPrice = "ক্রয় দর দিন";
    if (!values.sellingPrice.trim()) nextErrors.sellingPrice = "বিক্রয় দর দিন";
    if (!values.date.trim()) nextErrors.date = "তারিখ দিন";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 360));
    await onSubmit(values);
    setIsSubmitting(false);
  };

  return (
    <form
      className="grid gap-4 rounded-lg border bg-card p-4 shadow-soft sm:p-5 tablet:grid-cols-2"
      onSubmit={handleSubmit}
      noValidate
    >
      <label className="block space-y-2 tablet:col-span-2" htmlFor="productId">
        <span className="text-sm font-semibold">পণ্য নির্বাচন</span>
        <select
          id="productId"
          value={values.productId}
          disabled={isSubmitting}
          onChange={(event) => updateValue("productId", event.target.value)}
          className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.productName}
            </option>
          ))}
        </select>
        {errors.productId ? <span className="block text-sm text-destructive">{errors.productId}</span> : null}
      </label>

      {selectedProduct ? (
        <div className="rounded-md bg-secondary p-3 text-sm font-medium text-primary tablet:col-span-2">
          এখন স্টক আছে {new Intl.NumberFormat("bn-BD").format(selectedProduct.stockQuantity)} বস্তা
        </div>
      ) : null}

      <AuthInput
        label="স্টক পরিমাণ"
        name="quantity"
        inputMode="numeric"
        placeholder="৪০"
        value={values.quantity}
        disabled={isSubmitting}
        error={errors.quantity}
        onChange={(event) => updateValue("quantity", event.target.value)}
      />
      <AuthInput
        label="ক্রয় দর"
        name="buyingPrice"
        inputMode="numeric"
        placeholder="২৮৫০"
        value={values.buyingPrice}
        disabled={isSubmitting}
        error={errors.buyingPrice}
        onChange={(event) => updateValue("buyingPrice", event.target.value)}
      />
      <AuthInput
        label="বিক্রয় দর"
        name="sellingPrice"
        inputMode="numeric"
        placeholder="৩০৫০"
        value={values.sellingPrice}
        disabled={isSubmitting}
        error={errors.sellingPrice}
        onChange={(event) => updateValue("sellingPrice", event.target.value)}
      />
      <AuthInput
        label="সাপ্লায়ার"
        name="supplier"
        placeholder="সাপ্লায়ারের নাম"
        value={values.supplier}
        disabled={isSubmitting}
        error={errors.supplier}
        onChange={(event) => updateValue("supplier", event.target.value)}
      />
      <AuthInput
        label="তারিখ"
        name="date"
        type="date"
        value={values.date}
        disabled={isSubmitting}
        error={errors.date}
        onChange={(event) => updateValue("date", event.target.value)}
      />
      <label className="block space-y-2 tablet:col-span-2" htmlFor="stock-notes">
        <span className="text-sm font-semibold">নোট</span>
        <textarea
          id="stock-notes"
          rows={4}
          value={values.notes}
          disabled={isSubmitting}
          placeholder="স্টক এন্ট্রির নোট"
          onChange={(event) => updateValue("notes", event.target.value)}
          className="w-full resize-none rounded-md border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      <div className="tablet:col-span-2">
        <Button type="submit" size="lg" className="w-full" disabled={isDisabled}>
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <PackagePlus className="size-5" />}
          {isSubmitting ? "স্টক সেভ হচ্ছে" : "স্টক সেভ করুন"}
        </Button>
      </div>
    </form>
  );
}
