"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { SubmitButton } from "@/components/auth/submit-button";

export default function ForgotPasswordPage() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isDisabled = useMemo(
    () => !mobile.trim() || isSubmitting,
    [isSubmitting, mobile]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!mobile.trim()) {
      setError("মোবাইল নাম্বার দিন");
      return;
    }

    if (mobile.trim().length < 11) {
      setError("সঠিক মোবাইল নাম্বার দিন");
      return;
    }

    setError("");
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setIsSubmitting(false);
    setIsSent(true);
  };

  return (
    <AuthCard
      title="পাসওয়ার্ড রিসেট"
      description="আপনার মোবাইল নাম্বার দিন। আমরা ডেমো OTP পাঠানোর অবস্থা দেখাব।"
      footerText="পাসওয়ার্ড মনে আছে?"
      footerHref="/login"
      footerLink="লগইন করুন"
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="মোবাইল নাম্বার"
          name="mobile"
          inputMode="tel"
          placeholder="০১XXXXXXXXX"
          value={mobile}
          disabled={isSubmitting}
          error={error}
          onChange={(event) => {
            setMobile(event.target.value);
            setIsSent(false);
          }}
        />
        {isSent ? (
          <div className="flex items-start gap-2 rounded-md bg-secondary p-3 text-sm text-primary">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <p className="font-medium">ডেমো OTP পাঠানো হয়েছে</p>
          </div>
        ) : null}
        <SubmitButton
          isLoading={isSubmitting}
          loadingText="OTP পাঠানো হচ্ছে"
          disabled={isDisabled}
        >
          OTP পাঠান
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
