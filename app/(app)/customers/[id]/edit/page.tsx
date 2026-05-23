"use client";

import { useRouter, useParams, notFound } from "next/navigation";
import { CustomerForm } from "@/components/customers/customer-form";
import { useCustomers } from "@/components/customers/customer-provider";
import { PageContainer } from "@/components/shared/page-container";
import type { CustomerFormValues } from "@/lib/customers/types";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const { getCustomerById, updateCustomer } = useCustomers();
  const router = useRouter();
  const customer = getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  const handleSubmit = async (values: CustomerFormValues) => {
    await updateCustomer(customer.id, values);
    router.push(`/customers/${customer.id}`);
  };

  return (
    <PageContainer
      title="দোকান এডিট"
      description={`${customer.shopName} এর তথ্য ঠিক করুন।`}
    >
      <CustomerForm
        customer={customer}
        submitLabel="পরিবর্তন সেভ করুন"
        loadingLabel="সেভ হচ্ছে"
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
