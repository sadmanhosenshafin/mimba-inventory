"use client";

import { InventoryTimeline } from "@/components/products/inventory-timeline";
import { useProducts } from "@/components/products/product-provider";
import { PageContainer } from "@/components/shared/page-container";
import { notifyBusinessDataChanged } from "@/lib/live-data/events";
import { stockApi } from "@/services/api/stock";

export default function InventoryActivityPage() {
  const { activities, refreshProducts } = useProducts();

  return (
    <PageContainer
      title="স্টক হিসাব"
      description="কোন পণ্যের স্টক কখন যোগ বা কমেছে তার সহজ তালিকা।"
    >
      <InventoryTimeline
        activities={activities}
        onDelete={async (id) => {
          if (!window.confirm("আপনি কি নিশ্চিত?")) return;
          await stockApi.delete(id);
          await refreshProducts();
          notifyBusinessDataChanged();
        }}
      />
    </PageContainer>
  );
}
