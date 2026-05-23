"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { Customer, CustomerFormValues, CustomerStatus } from "@/lib/customers/types";
import { notifyBusinessDataChanged, subscribeBusinessDataChanged } from "@/lib/live-data/events";
import { customersApi } from "@/services/api/customers";

type ApiCustomer = {
  id: number | string;
  shop_name: string;
  owner_name: string;
  phone: string;
  address?: string | null;
  total_due?: number | string;
  status?: "green" | "yellow" | "red";
  created_at?: string;
  updated_at?: string;
};

type CustomerContextValue = {
  customers: Customer[];
  addCustomer: (values: CustomerFormValues) => Promise<Customer>;
  updateCustomer: (id: string, values: CustomerFormValues) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  refreshCustomers: () => Promise<void>;
};

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined);

const statusMap: Record<string, CustomerStatus> = {
  green: "good",
  yellow: "warning",
  red: "risky"
};

function mapCustomer(customer: ApiCustomer): Customer {
  return {
    id: String(customer.id),
    shopName: customer.shop_name,
    ownerName: customer.owner_name,
    mobile: customer.phone,
    address: customer.address || "",
    currentDue: Number(customer.total_due || 0),
    status: statusMap[customer.status || "green"] || "good",
    createdDate: customer.created_at ? new Date(customer.created_at).toLocaleDateString("bn-BD") : "আজ",
    notes: "",
    lastPurchaseDate: customer.updated_at ? new Date(customer.updated_at).toLocaleDateString("bn-BD") : "এখনো নেই",
    recentScore: 100
  };
}

function payloadFromValues(values: CustomerFormValues) {
  return {
    shop_name: values.shopName,
    owner_name: values.ownerName,
    phone: values.mobile,
    address: values.address
  };
}

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const refreshCustomers = useCallback(async () => {
    try {
      const response = await customersApi.list({ per_page: 100 });
      const rawCustomers = response.data.data?.data ?? response.data.data ?? [];
      setCustomers(rawCustomers.map(mapCustomer));
    } catch {
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    void refreshCustomers();
    return subscribeBusinessDataChanged(() => void refreshCustomers());
  }, [refreshCustomers]);

  const addCustomer = useCallback(
    async (values: CustomerFormValues) => {
      const response = await customersApi.create(payloadFromValues(values));
      const customer = mapCustomer(response.data.data.customer);
      await refreshCustomers();
      notifyBusinessDataChanged();
      return customer;
    },
    [refreshCustomers]
  );

  const updateCustomer = useCallback(
    async (id: string, values: CustomerFormValues) => {
      await customersApi.update(id, payloadFromValues(values));
      await refreshCustomers();
      notifyBusinessDataChanged();
    },
    [refreshCustomers]
  );

  const getCustomerById = useCallback(
    (id: string) => customers.find((customer) => customer.id === id),
    [customers]
  );

  const value = useMemo(
    () => ({
      customers,
      addCustomer,
      updateCustomer,
      getCustomerById,
      refreshCustomers
    }),
    [addCustomer, customers, getCustomerById, refreshCustomers, updateCustomer]
  );

  return (
    <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);

  if (!context) {
    throw new Error("useCustomers must be used within CustomerProvider");
  }

  return context;
}
