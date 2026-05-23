export type SaleStatus = "paid" | "partial" | "due";

export type SaleItem = {
  productId: string;
  productName: string;
  availableStock: number;
  quantity: number;
  unitPrice: number;
};

export type Sale = {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: SaleItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: SaleStatus;
  timestamp: string;
  note: string;
};

export type PaymentCollection = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  note: string;
  timestamp: string;
};
