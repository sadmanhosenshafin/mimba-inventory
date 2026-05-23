import { ProtectedRoute } from "@/components/auth/protected-route";
import { CustomerProvider } from "@/components/customers/customer-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ProductProvider } from "@/components/products/product-provider";
import { SalesProvider } from "@/components/sales/sales-provider";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <ProductProvider>
          <SalesProvider>
            <AppShell>{children}</AppShell>
          </SalesProvider>
        </ProductProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}
