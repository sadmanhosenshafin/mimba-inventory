"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { PageContainer } from "@/components/shared/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProfileErrors = {
  name?: string;
  email?: string;
  currentPassword?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export default function ProfileSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.ownerName ?? "অ্যাডমিন");
  const [email, setEmail] = useState(user?.mobile ?? "admin@gmail.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isDisabled = useMemo(
    () =>
      !name.trim() ||
      !email.trim() ||
      !currentPassword.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      isSubmitting,
    [confirmPassword, currentPassword, email, isSubmitting, name, password]
  );

  const validate = () => {
    const nextErrors: ProfileErrors = {};

    if (!name.trim()) {
      nextErrors.name = "নাম দিন";
    }

    if (!email.trim()) {
      nextErrors.email = "ইমেইল দিন";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "সঠিক ইমেইল দিন";
    }

    if (!currentPassword.trim()) {
      nextErrors.currentPassword = "বর্তমান পাসওয়ার্ড দিন";
    }

    if (!password.trim()) {
      nextErrors.password = "নতুন পাসওয়ার্ড দিন";
    } else if (password.length < 8) {
      nextErrors.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "নতুন পাসওয়ার্ড নিশ্চিত করুন";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "নতুন পাসওয়ার্ড মিলছে না";
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
    setIsSaved(false);

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        current_password: currentPassword,
        password,
        password_confirmation: confirmPassword
      });
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setIsSaved(true);
      setErrors({});
    } catch {
      setErrors({ form: "তথ্য আপডেট করা যায়নি। বর্তমান পাসওয়ার্ড ঠিক আছে কি না দেখুন।" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="প্রোফাইল সেটিংস"
      description="অ্যাডমিন নাম, ইমেইল ও পাসওয়ার্ড নিরাপদভাবে আপডেট করুন।"
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>অ্যাডমিন তথ্য</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <AuthInput
              label="নাম"
              name="name"
              value={name}
              disabled={isSubmitting}
              error={errors.name}
              onChange={(event) => setName(event.target.value)}
            />
            <AuthInput
              label="ইমেইল"
              name="email"
              type="email"
              inputMode="email"
              value={email}
              disabled={isSubmitting}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <PasswordInput
              label="বর্তমান পাসওয়ার্ড"
              name="currentPassword"
              value={currentPassword}
              disabled={isSubmitting}
              error={errors.currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <PasswordInput
              label="নতুন পাসওয়ার্ড"
              name="password"
              value={password}
              disabled={isSubmitting}
              error={errors.password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <PasswordInput
              label="নতুন পাসওয়ার্ড নিশ্চিত করুন"
              name="confirmPassword"
              value={confirmPassword}
              disabled={isSubmitting}
              error={errors.confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            {errors.form ? (
              <p className="rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errors.form}
              </p>
            ) : null}
            {isSaved ? (
              <p className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="size-4" />
                তথ্য আপডেট হয়েছে
              </p>
            ) : null}

            <SubmitButton
              isLoading={isSubmitting}
              loadingText="আপডেট হচ্ছে"
              disabled={isDisabled}
            >
              তথ্য আপডেট করুন
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
