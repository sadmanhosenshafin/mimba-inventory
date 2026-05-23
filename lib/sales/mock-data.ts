import type { PaymentCollection, Sale } from "@/lib/sales/types";

export const mockSales: Sale[] = [
  {
    id: "sale-1001",
    customerId: "karim-feed-store",
    customerName: "করিম ফিড স্টোর",
    customerMobile: "01711111111",
    items: [
      {
        productId: "sonali-broiler-starter",
        productName: "সোনালী ব্রয়লার স্টার্টার",
        availableStock: 18,
        quantity: 10,
        unitPrice: 3050
      },
      {
        productId: "quality-fish-feed",
        productName: "কোয়ালিটি ফিশ ফিড",
        availableStock: 42,
        quantity: 5,
        unitPrice: 1500
      }
    ],
    totalAmount: 38000,
    paidAmount: 30000,
    dueAmount: 8000,
    status: "partial",
    timestamp: "আজ সকাল ১০:২০",
    note: "বাকি টাকা শুক্রবার দেবেন।"
  },
  {
    id: "sale-1002",
    customerId: "rahman-feed",
    customerName: "রহমান ফিড",
    customerMobile: "01933333333",
    items: [
      {
        productId: "nourish-broiler-grower",
        productName: "নারিশ ব্রয়লার গ্রোয়ার",
        availableStock: 74,
        quantity: 12,
        unitPrice: 3120
      }
    ],
    totalAmount: 37440,
    paidAmount: 37440,
    dueAmount: 0,
    status: "paid",
    timestamp: "গতকাল বিকাল ৪:৩০",
    note: "সম্পূর্ণ পরিশোধ।"
  },
  {
    id: "sale-1003",
    customerId: "madina-feed-house",
    customerName: "মদিনা ফিড ঘর",
    customerMobile: "01644444444",
    items: [
      {
        productId: "dairy-plus-cattle-feed",
        productName: "ডেইরি প্লাস গরুর খাদ্য",
        availableStock: 12,
        quantity: 8,
        unitPrice: 1980
      }
    ],
    totalAmount: 15840,
    paidAmount: 0,
    dueAmount: 15840,
    status: "due",
    timestamp: "৩ দিন আগে",
    note: "পুরোটাই বাকি।"
  }
];

export const mockPayments: PaymentCollection[] = [
  {
    id: "pay-1",
    customerId: "karim-feed-store",
    customerName: "করিম ফিড স্টোর",
    amount: 10000,
    note: "সকালের বাকি আদায়",
    timestamp: "আজ সকাল ১১:১০"
  },
  {
    id: "pay-2",
    customerId: "madina-feed-house",
    customerName: "মদিনা ফিড ঘর",
    amount: 15000,
    note: "পুরনো বাকি থেকে আদায়",
    timestamp: "গতকাল"
  }
];
