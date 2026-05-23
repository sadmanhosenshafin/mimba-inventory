"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { AuthInput } from "@/components/auth/auth-input";
import { Button } from "@/components/ui/button";
import type { Customer, CustomerFormValues } from "@/lib/customers/types";

type CustomerFormErrors = Partial<Record<keyof CustomerFormValues, string>>;

const initialValues: CustomerFormValues = {
  shopName: "",
  ownerName: "",
  mobile: "",
  address: "",
  notes: ""
};

export function CustomerForm({
  customer,
  submitLabel,
  loadingLabel,
  onSubmit
}: {
  customer?: Customer;
  submitLabel: string;
  loadingLabel: string;
  onSubmit: (values: CustomerFormValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<CustomerFormValues>(
    customer
      ? {
          shopName: customer.shopName,
          ownerName: customer.ownerName,
          mobile: customer.mobile,
          address: customer.address,
          notes: customer.notes
        }
      : initialValues
  );
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = useMemo(
    () =>
      !values.shopName.trim() ||
      !values.ownerName.trim() ||
      !values.mobile.trim() ||
      !values.address.trim() ||
      isSubmitting,
    [isSubmitting, values]
  );

  const updateValue = (name: keyof CustomerFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [name]: value
    }));
  };

  const validate = () => {
    const nextErrors: CustomerFormErrors = {};

    if (!values.shopName.trim()) {
      nextErrors.shopName = "দোকানের নাম দিন";
    }
    if (!values.ownerName.trim()) {
      nextErrors.ownerName = "মালিকের নাম দিন";
    }
    if (!values.mobile.trim()) {
      nextErrors.mobile = "মোবাইল নাম্বার দিন";
    } else if (values.mobile.trim().length < 11) {
      nextErrors.mobile = "সঠিক মোবাইল নাম্বার দিন";
    }
    if (!values.address.trim()) {
      nextErrors.address = "ঠিকানা দিন";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 420));
    await onSubmit({
      shopName: values.shopName.trim(),
      ownerName: values.ownerName.trim(),
      mobile: values.mobile.trim(),
      address: values.address.trim(),
      notes: values.notes.trim()
    });
    setIsSubmitting(false);
  };

  return (
    <form
      className="grid gap-4 rounded-lg border bg-card p-4 shadow-soft sm:p-5 tablet:grid-cols-2"
      onSubmit={handleSubmit}
      noValidate
    >
      <AuthInput
        label="দোকানের নাম"
        name="shopName"
        placeholder="যেমন: করিম ফিড স্টোর"
        value={values.shopName}
        disabled={isSubmitting}
        error={errors.shopName}
        onChange={(event) => updateValue("shopName", event.target.value)}
      />
      <AuthInput
        label="মালিকের নাম"
        name="ownerName"
        placeholder="মালিকের নাম"
        value={values.ownerName}
        disabled={isSubmitting}
        error={errors.ownerName}
        onChange={(event) => updateValue("ownerName", event.target.value)}
      />
      <AuthInput
        label="মোবাইল নাম্বার"
        name="mobile"
        inputMode="tel"
        placeholder="০১XXXXXXXXX"
        value={values.mobile}
        disabled={isSubmitting}
        error={errors.mobile}
        onChange={(event) => updateValue("mobile", event.target.value)}
      />
      <AuthInput
        label="ঠিকানা"
        name="address"
        placeholder="দোকানের ঠিকানা"
        value={values.address}
        disabled={isSubmitting}
        error={errors.address}
        onChange={(event) => updateValue("address", event.target.value)}
      />
      <label className="block space-y-2 tablet:col-span-2" htmlFor="notes">
        <span className="text-sm font-semibold">নোট</span>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="বিশেষ কোনো কথা থাকলে লিখুন"
          value={values.notes}
          disabled={isSubmitting}
          onChange={(event) => updateValue("notes", event.target.value)}
          className="w-full resize-none rounded-md border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      <div className="tablet:col-span-2">
        <Button type="submit" size="lg" className="w-full" disabled={isDisabled}>
          {isSubmitting ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          {isSubmitting ? loadingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
