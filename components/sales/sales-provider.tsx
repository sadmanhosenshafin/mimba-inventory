"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { notifyBusinessDataChanged, subscribeBusinessDataChanged } from "@/lib/live-data/events";
import type { PaymentCollection, Sale, SaleItem, SaleStatus } from "@/lib/sales/types";
import { paymentsApi } from "@/services/api/payments";
import { salesApi } from "@/services/api/sales";

type SaveSalePayload = {
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: SaleItem[];
  paidAmount: number;
  note?: string;
};

type ApiSale = {
  id: number | string;
  customer_id: number | string;
  customer?: { shop_name?: string; phone?: string };
  items?: Array<{
    product_id: number | string;
    product?: { name?: string; stock?: number | string };
    quantity: number | string;
    price: number | string;
  }>;
  total_amount: number | string;
  paid_amount: number | string;
  due_amount: number | string;
  date?: string;
  created_at?: string;
};

type ApiPayment = {
  id: number | string;
  customer_id: number | string;
  customer?: { shop_name?: string };
  amount: number | string;
  note?: string | null;
  date?: string;
  created_at?: string;
};

type SalesContextValue = {
  sales: Sale[];
  payments: PaymentCollection[];
  saveSale: (payload: SaveSalePayload) => Promise<Sale>;
  updateSale: (id: string, payload: SaveSalePayload) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
  collectPayment: (payload: Omit<PaymentCollection, "id" | "timestamp"> & { type?: "cash" | "mobile" | "partial" }) => Promise<void>;
  getSaleById: (id: string) => Sale | undefined;
  refreshSales: () => Promise<void>;
};

const SalesContext = createContext<SalesContextValue | undefined>(undefined);

function getSaleStatus(totalAmount: number, paidAmount: number): SaleStatus {
  if (paidAmount >= totalAmount) return "paid";
  if (paidAmount > 0) return "partial";
  return "due";
}

function formatDate(date?: string | null) {
  return date ? new Date(date).toLocaleDateString("bn-BD") : "এইমাত্র";
}

function mapSale(sale: ApiSale): Sale {
  const totalAmount = Number(sale.total_amount || 0);
  const paidAmount = Number(sale.paid_amount || 0);

  return {
    id: String(sale.id),
    customerId: String(sale.customer_id),
    customerName: sale.customer?.shop_name || "দোকান",
    customerMobile: sale.customer?.phone || "",
    items: (sale.items || []).map((item) => ({
      productId: String(item.product_id),
      productName: item.product?.name || "পণ্য",
      availableStock: Number(item.product?.stock || 0),
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.price || 0)
    })),
    totalAmount,
    paidAmount,
    dueAmount: Number(sale.due_amount || 0),
    status: getSaleStatus(totalAmount, paidAmount),
    timestamp: formatDate(sale.date || sale.created_at),
    note: "বিক্রি"
  };
}

function mapPayment(payment: ApiPayment): PaymentCollection {
  return {
    id: String(payment.id),
    customerId: String(payment.customer_id),
    customerName: payment.customer?.shop_name || "দোকান",
    amount: Number(payment.amount || 0),
    note: payment.note || "পেমেন্ট",
    timestamp: formatDate(payment.date || payment.created_at)
  };
}

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<PaymentCollection[]>([]);

  const refreshSales = useCallback(async () => {
    try {
      const [salesResponse, paymentsResponse] = await Promise.all([
        salesApi.list({ per_page: 100 }),
        paymentsApi.list({ per_page: 100 })
      ]);
      const rawSales = salesResponse.data.data?.data ?? salesResponse.data.data ?? [];
      const rawPayments = paymentsResponse.data.data?.data ?? paymentsResponse.data.data ?? [];
      setSales(rawSales.map(mapSale));
      setPayments(rawPayments.map(mapPayment));
    } catch {
      setSales([]);
      setPayments([]);
    }
  }, []);

  useEffect(() => {
    void refreshSales();
    return subscribeBusinessDataChanged(() => void refreshSales());
  }, [refreshSales]);

  const saveSale = useCallback(
    async (payload: SaveSalePayload) => {
      const response = await salesApi.create({
        customer_id: Number(payload.customerId),
        paid_amount: payload.paidAmount,
        items: payload.items.map((item) => ({
          product_id: Number(item.productId),
          quantity: item.quantity,
          unit_price: item.unitPrice
        }))
      });
      const sale = mapSale(response.data.data.sale);
      await refreshSales();
      notifyBusinessDataChanged();
      return sale;
    },
    [refreshSales]
  );

  const collectPayment = useCallback(
    async (payload: Omit<PaymentCollection, "id" | "timestamp"> & { type?: "cash" | "mobile" | "partial" }) => {
      await paymentsApi.create({
        customer_id: Number(payload.customerId),
        amount: payload.amount,
        type: payload.type || "cash",
        notes: payload.note
      });
      await refreshSales();
      notifyBusinessDataChanged();
    },
    [refreshSales]
  );

  const getSaleById = useCallback(
    (id: string) => sales.find((sale) => sale.id === id),
    [sales]
  );

  const updateSale = useCallback(
    async (id: string, payload: SaveSalePayload) => {
      const response = await salesApi.update(id, {
        customer_id: Number(payload.customerId),
        paid_amount: payload.paidAmount,
        notes: payload.note,
        items: payload.items.map((item) => ({
          product_id: Number(item.productId),
          quantity: item.quantity,
          unit_price: item.unitPrice
        }))
      });
      const sale = mapSale(response.data.data.sale);
      await refreshSales();
      notifyBusinessDataChanged();
      return sale;
    },
    [refreshSales]
  );

  const deleteSale = useCallback(
    async (id: string) => {
      await salesApi.delete(id);
      await refreshSales();
      notifyBusinessDataChanged();
    },
    [refreshSales]
  );

  const value = useMemo(
    () => ({ sales, payments, saveSale, updateSale, deleteSale, collectPayment, getSaleById, refreshSales }),
    [collectPayment, deleteSale, getSaleById, payments, refreshSales, sales, saveSale, updateSale]
  );

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}

export function useSales() {
  const context = useContext(SalesContext);

  if (!context) {
    throw new Error("useSales must be used within SalesProvider");
  }

  return context;
}
