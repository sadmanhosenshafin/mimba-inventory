"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentForm } from "@/components/due/payment-form";
import { useCustomers } from "@/components/customers/customer-provider";
import { useSales } from "@/components/sales/sales-provider";
import { PageContainer } from "@/components/shared/page-container";
import { getDueCustomers } from "@/lib/due/utils";

const paymentTypeLabel = {
  cash: "নগদ",
  mobile: "মোবাইল ব্যাংকিং",
  partial: "আংশিক পেমেন্ট"
};

export default function PaymentCollectionPage() {
  const { customers } = useCustomers();
  const { collectPayment } = useSales();
  const router = useRouter();
  const [initialCustomerId, setInitialCustomerId] = useState<string | undefined>();
  const dueCustomers = getDueCustomers(customers);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setInitialCustomerId(searchParams.get("customer") || undefined);
  }, []);

  return (
    <PageContainer
      title="পেমেন্ট সংগ্রহ"
      description="দোকান নির্বাচন করে পেমেন্ট ধরন, আদায়ের টাকা ও বাকি হিসাব দেখুন।"
    >
      <PaymentForm
        customers={dueCustomers}
        initialCustomerId={initialCustomerId}
        onSubmit={async ({ customer, amount, type, note }) => {
          await collectPayment({
            customerId: customer.customerId,
            customerName: customer.shopName,
            amount,
            type,
            note: `${paymentTypeLabel[type]} · ${note}`
          });
          router.push(`/due/${customer.customerId}`);
        }}
      />
    </PageContainer>
  );
}
