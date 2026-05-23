import type { Customer } from "@/lib/customers/types";
import type { Product } from "@/lib/products/types";
import type { Sale } from "@/lib/sales/types";

export function getTotalSales(sales: Sale[]) {
  return sales.reduce((total, sale) => total + sale.totalAmount, 0);
}

export function getTotalDue(customers: Customer[]) {
  return customers.reduce((total, customer) => total + customer.currentDue, 0);
}

export function getStockValue(products: Product[]) {
  return products.reduce(
    (total, product) => total + product.stockQuantity * product.buyingPrice,
    0
  );
}

export function getProfitEstimate(sales: Sale[]) {
  return Math.round(getTotalSales(sales) * 0.12);
}

export function getProductPerformance(sales: Sale[], products: Product[]) {
  return products
    .map((product) => {
      const saleItems = sales.flatMap((sale) =>
        sale.items.filter((item) => item.productId === product.id)
      );
      const salesCount = saleItems.reduce((total, item) => total + item.quantity, 0);
      const revenue = saleItems.reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0
      );

      return {
        product,
        salesCount,
        revenue,
        stockRemaining: product.stockQuantity
      };
    })
    .sort((first, second) => second.revenue - first.revenue);
}

export function getCustomerPerformance(sales: Sale[], customers: Customer[]) {
  return customers
    .map((customer) => {
      const customerSales = sales.filter((sale) => sale.customerId === customer.id);
      const totalPurchase = customerSales.reduce(
        (total, sale) => total + sale.totalAmount,
        0
      );

      return {
        customer,
        totalPurchase,
        saleCount: customerSales.length,
        dueAmount: customer.currentDue,
        lastPurchaseDate: customer.lastPurchaseDate
      };
    })
    .sort((first, second) => second.totalPurchase - first.totalPurchase);
}
