"use client";

import { useRouter } from "next/navigation";
import { CustomerForm } from "@/components/customers/customer-form";
import { useCustomers } from "@/components/customers/customer-provider";
import { PageContainer } from "@/components/shared/page-container";
import type { CustomerFormValues } from "@/lib/customers/types";

export default function AddCustomerPage() {
  const { addCustomer } = useCustomers();
  const router = useRouter();

  const handleSubmit = async (values: CustomerFormValues) => {
    const customer = await addCustomer(values);
    router.push(`/customers/${customer.id}`);
  };

  return (
    <PageContainer
      title="দোকান যোগ"
      description="দোকানের তথ্য একবার সেভ করলে পরে বিক্রির সময় দ্রুত খুঁজে পাবেন।"
    >
      <CustomerForm
        submitLabel="দোকান সেভ করুন"
        loadingLabel="সেভ হচ্ছে"
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
