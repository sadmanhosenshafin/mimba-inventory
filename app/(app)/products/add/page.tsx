"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";
import { useProducts } from "@/components/products/product-provider";
import { PageContainer } from "@/components/shared/page-container";
import type { ProductFormValues } from "@/lib/products/types";

export default function AddProductPage() {
  const { addProduct } = useProducts();
  const router = useRouter();

  const handleSubmit = async (values: ProductFormValues) => {
    const product = await addProduct(values);
    router.push(`/products/${product.id}`);
  };

  return (
    <PageContainer
      title="পণ্য যোগ"
      description="নতুন ফিড পণ্য সেভ করুন, পরে স্টক এন্ট্রি দিয়ে মজুদ যোগ করুন।"
    >
      <ProductForm onSubmit={handleSubmit} />
    </PageContainer>
  );
}
