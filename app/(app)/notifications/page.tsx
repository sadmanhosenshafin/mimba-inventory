"use client";

import { NotificationPanel } from "@/components/due/notification-panel";
import { useCustomers } from "@/components/customers/customer-provider";
import { useProducts } from "@/components/products/product-provider";
import { useSales } from "@/components/sales/sales-provider";
import { PageContainer } from "@/components/shared/page-container";
import { getDueCustomers, getDueNotifications } from "@/lib/due/utils";

export default function NotificationsPage() {
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { payments } = useSales();
  const dueCustomers = getDueCustomers(customers);
  const notifications = getDueNotifications({ dueCustomers, products, payments });

  return (
    <PageContainer
      title="নোটিফিকেশন"
      description="বাকি, কম স্টক, পেমেন্ট ও ঝুঁকিপূর্ণ দোকানের সতর্কতা।"
    >
      <NotificationPanel notifications={notifications} />
    </PageContainer>
  );
}
