"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerQuickSearch } from "@/components/sales/customer-quick-search";
import { FloatingCheckoutButton } from "@/components/sales/floating-checkout-button";
import { PaymentSummary } from "@/components/sales/payment-summary";
import { ProductQuickSearch } from "@/components/sales/product-quick-search";
import { ProductSelectionCard } from "@/components/sales/product-selection-card";
import { SaleSummaryCard } from "@/components/sales/sale-summary-card";
import { useSales } from "@/components/sales/sales-provider";
import { useCustomers } from "@/components/customers/customer-provider";
import { useProducts } from "@/components/products/product-provider";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/lib/customers/types";
import type { Product } from "@/lib/products/types";
import type { SaleItem } from "@/lib/sales/types";

export default function QuickSellPage() {
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { saveSale } = useSales();
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const customerId = searchParams.get("customer");
    const foundCustomer = customers.find((customer) => customer.id === customerId);
    if (foundCustomer) setSelectedCustomer(foundCustomer);
  }, [customers]);

  const totalAmount = useMemo(
    () => items.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
    [items]
  );

  const canSave = Boolean(selectedCustomer && items.length > 0);

  const addProduct = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          productName: product.productName,
          availableStock: product.stockQuantity,
          quantity: 1,
          unitPrice: product.sellingPrice
        }
      ];
    });
  };

  const handleSave = async () => {
    if (!selectedCustomer || items.length === 0) return;
    const sale = await saveSale({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.shopName,
      customerMobile: selectedCustomer.mobile,
      items,
      paidAmount
    });
    router.push(`/sales/${sale.id}`);
  };

  return (
    <PageContainer
      title="দ্রুত বিক্রি"
      description="দোকান বেছে পণ্য যোগ করুন, তারপর বিক্রি সম্পন্ন করুন।"
    >
      <div className="grid min-w-0 gap-4 laptop:grid-cols-[minmax(0,1fr)_320px] laptop:items-start">
        <div className="min-w-0 space-y-5">
          <CustomerQuickSearch
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelect={setSelectedCustomer}
          />

          <ProductQuickSearch products={products} onSelect={addProduct} />

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold">নির্বাচিত পণ্য</h2>
            {items.length > 0 ? (
              <div className="grid gap-3">
                {items.map((item) => (
                  <ProductSelectionCard
                    key={item.productId}
                    item={item}
                    onQuantityChange={(quantity) =>
                      setItems((current) =>
                        current.map((currentItem) =>
                          currentItem.productId === item.productId
                            ? { ...currentItem, quantity }
                            : currentItem
                        )
                      )
                    }
                    onRemove={() =>
                      setItems((current) =>
                        current.filter((currentItem) => currentItem.productId !== item.productId)
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-5 text-center text-muted-foreground">
                বিক্রির জন্য পণ্য যোগ করুন
              </div>
            )}
          </section>

          <PaymentSummary
            totalAmount={totalAmount}
            paidAmount={paidAmount}
            onPaidAmountChange={setPaidAmount}
          />

          <Button
            type="button"
            size="lg"
            className="hidden w-full laptop:inline-flex"
            disabled={!canSave}
            onClick={handleSave}
          >
            বিক্রি সম্পন্ন করুন
          </Button>
        </div>

        <div className="min-w-0">
          <SaleSummaryCard items={items} paidAmount={paidAmount} />
        </div>
      </div>

      <FloatingCheckoutButton disabled={!canSave} onClick={handleSave} />
    </PageContainer>
  );
}
