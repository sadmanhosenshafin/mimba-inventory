"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { AuthInput } from "@/components/auth/auth-input";
import { Button } from "@/components/ui/button";
import { productCategories } from "@/lib/products/mock-data";
import type { ProductFormValues } from "@/lib/products/types";

type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

const initialValues: ProductFormValues = {
  productName: "",
  category: "ব্রয়লার ফিড",
  weight: "",
  minimumStockLimit: "",
  notes: ""
};

export function ProductForm({
  onSubmit
}: {
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = useMemo(
    () =>
      !values.productName.trim() ||
      !values.weight.trim() ||
      !values.minimumStockLimit.trim() ||
      isSubmitting,
    [isSubmitting, values]
  );

  const updateValue = (name: keyof ProductFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    const nextErrors: ProductFormErrors = {};

    if (!values.productName.trim()) nextErrors.productName = "পণ্যের নাম দিন";
    if (!values.weight.trim()) nextErrors.weight = "ওজন দিন";
    if (!values.minimumStockLimit.trim()) nextErrors.minimumStockLimit = "সর্বনিম্ন স্টক দিন";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 420));
    await onSubmit(values);
    setIsSubmitting(false);
  };

  return (
    <form
      className="grid gap-4 rounded-lg border bg-card p-4 shadow-soft sm:p-5 tablet:grid-cols-2"
      onSubmit={handleSubmit}
      noValidate
    >
      <AuthInput
        label="পণ্যের নাম"
        name="productName"
        placeholder="যেমন: সোনালী ব্রয়লার স্টার্টার"
        value={values.productName}
        disabled={isSubmitting}
        error={errors.productName}
        onChange={(event) => updateValue("productName", event.target.value)}
      />
      <label className="block space-y-2" htmlFor="category">
        <span className="text-sm font-semibold">ক্যাটাগরি</span>
        <select
          id="category"
          value={values.category}
          disabled={isSubmitting}
          onChange={(event) => updateValue("category", event.target.value)}
          className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {productCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <AuthInput
        label="ওজন"
        name="weight"
        placeholder="৫০ কেজি"
        value={values.weight}
        disabled={isSubmitting}
        error={errors.weight}
        onChange={(event) => updateValue("weight", event.target.value)}
      />
      <AuthInput
        label="সর্বনিম্ন স্টক"
        name="minimumStockLimit"
        inputMode="numeric"
        placeholder="২৫"
        value={values.minimumStockLimit}
        disabled={isSubmitting}
        error={errors.minimumStockLimit}
        onChange={(event) => updateValue("minimumStockLimit", event.target.value)}
      />
      <label className="block space-y-2 tablet:col-span-2" htmlFor="notes">
        <span className="text-sm font-semibold">নোট</span>
        <textarea
          id="notes"
          rows={4}
          value={values.notes}
          disabled={isSubmitting}
          placeholder="পণ্য সম্পর্কে দরকারি নোট"
          onChange={(event) => updateValue("notes", event.target.value)}
          className="w-full resize-none rounded-md border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      <div className="tablet:col-span-2">
        <Button type="submit" size="lg" className="w-full" disabled={isDisabled}>
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
          {isSubmitting ? "সেভ হচ্ছে" : "পণ্য সেভ করুন"}
        </Button>
      </div>
    </form>
  );
}
