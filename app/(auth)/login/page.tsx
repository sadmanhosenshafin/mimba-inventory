"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { useAuth } from "@/components/auth/auth-provider";

type LoginErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const isDisabled = useMemo(
    () => !email.trim() || !password.trim() || isSubmitting,
    [email, isSubmitting, password]
  );

  const validate = () => {
    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = "ইমেইল দিন";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "সঠিক ইমেইল দিন";
    }

    if (!password.trim()) {
      nextErrors.password = "পাসওয়ার্ড দিন";
    } else if (password.length < 6) {
      nextErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে";
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
    try {
      await login(email.trim(), password);
      const searchParams = new URLSearchParams(window.location.search);
      router.replace(searchParams.get("next") || "/");
    } catch {
      setErrors({ email: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।" });
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="লগইন করুন"
      description="অ্যাডমিন ড্যাশবোর্ডে ঢুকতে ইমেইল ও পাসওয়ার্ড দিন।"
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="ইমেইল"
          name="email"
          type="email"
          inputMode="email"
          placeholder="admin@gmail.com"
          value={email}
          disabled={isSubmitting}
          error={errors.email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordInput
          label="পাসওয়ার্ড"
          name="password"
          placeholder="আপনার পাসওয়ার্ড"
          value={password}
          disabled={isSubmitting}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <SubmitButton isLoading={isSubmitting} disabled={isDisabled}>
          লগইন করুন
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
