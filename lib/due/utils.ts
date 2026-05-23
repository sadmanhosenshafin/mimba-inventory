import type { Customer } from "@/lib/customers/types";
import type { Product } from "@/lib/products/types";
import { isLowStock } from "@/components/products/stock-badge";
import type { PaymentCollection, Sale } from "@/lib/sales/types";
import type { AppNotification, DueCustomer, RiskLevel } from "@/lib/due/types";

export function getRiskLevel(dueAmount: number, dueDays: number): RiskLevel {
  if (dueDays >= 7 || dueAmount >= 50000) return "risky";
  if (dueDays >= 3 || dueAmount >= 20000) return "warning";
  return "good";
}

export function getDueCustomers(customers: Customer[]): DueCustomer[] {
  return customers
    .filter((customer) => customer.currentDue > 0)
    .map((customer) => {
      const dueDays = customer.status === "risky" ? 8 : customer.status === "warning" ? 4 : 1;

      return {
        customerId: customer.id,
        shopName: customer.shopName,
        ownerName: customer.ownerName,
        mobile: customer.mobile,
        currentDue: customer.currentDue,
        dueDays,
        risk: getRiskLevel(customer.currentDue, dueDays),
        lastPaymentDate: customer.lastPurchaseDate,
        notes: customer.notes
      };
    })
    .sort((first, second) => second.currentDue - first.currentDue);
}

export function getDueNotifications({
  dueCustomers,
  products,
  payments
}: {
  dueCustomers: DueCustomer[];
  products: Product[];
  payments: PaymentCollection[];
}): AppNotification[] {
  const overdueNotifications = dueCustomers
    .filter((customer) => customer.dueDays >= 3)
    .map<AppNotification>((customer) => ({
      id: `due-${customer.customerId}`,
      type: customer.dueDays >= 7 ? "overdue-alert" : "due-reminder",
      severity: customer.dueDays >= 7 ? "critical" : "warning",
      message: `${customer.shopName} এর বাকি ${customer.dueDays} দিন ধরে আছে`,
      time: "আজ"
    }));

  const stockNotifications = products
    .filter((product) => isLowStock(product))
    .slice(0, 3)
    .map<AppNotification>((product) => ({
      id: `stock-${product.id}`,
      type: "stock-warning",
      severity: "warning",
      message: `${product.productName} এর স্টক প্রায় শেষ`,
      time: product.lastStockUpdate
    }));

  const paymentNotifications = payments.slice(0, 2).map<AppNotification>((payment) => ({
    id: `payment-${payment.id}`,
    type: "payment-received",
    severity: "success",
    message: `${payment.customerName} থেকে টাকা আদায় হয়েছে`,
    time: payment.timestamp
  }));

  return [...overdueNotifications, ...stockNotifications, ...paymentNotifications];
}

export function getUnpaidSalesForCustomer(sales: Sale[], customerId: string) {
  return sales.filter((sale) => sale.customerId === customerId && sale.dueAmount > 0);
}
