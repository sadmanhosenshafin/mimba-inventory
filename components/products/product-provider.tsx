"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type {
  InventoryActivity,
  InventoryActivityType,
  Product,
  ProductCategory,
  ProductFormValues,
  StockEntryValues
} from "@/lib/products/types";
import { notifyBusinessDataChanged, subscribeBusinessDataChanged } from "@/lib/live-data/events";
import { productsApi } from "@/services/api/products";
import { stockApi } from "@/services/api/stock";

type ApiProduct = {
  id: number | string;
  name: string;
  category: ProductCategory;
  weight?: string | null;
  stock?: number | string;
  min_stock?: number | string;
  buy_price?: number | string;
  sell_price?: number | string;
  supplier?: string | null;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ApiActivity = {
  id: number | string;
  product_id: number | string;
  product?: { name?: string };
  quantity: number | string;
  type: "in" | "out";
  buy_price?: number | string | null;
  sell_price?: number | string | null;
  supplier?: string | null;
  note?: string | null;
  date?: string | null;
  created_at?: string;
};

type ProductContextValue = {
  products: Product[];
  activities: InventoryActivity[];
  addProduct: (values: ProductFormValues) => Promise<Product>;
  addStockEntry: (values: StockEntryValues) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
};

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

function formatDate(date?: string | null) {
  return date ? new Date(date).toLocaleDateString("bn-BD") : "এখনো নেই";
}

function mapProduct(product: ApiProduct): Product {
  return {
    id: String(product.id),
    productName: product.name,
    category: product.category,
    brand: "",
    weight: product.weight || "",
    stockQuantity: Number(product.stock || 0),
    minimumStockLimit: Number(product.min_stock || 0),
    buyingPrice: Number(product.buy_price || 0),
    sellingPrice: Number(product.sell_price || 0),
    supplier: product.supplier || "",
    notes: product.note || "",
    createdDate: formatDate(product.created_at),
    lastStockUpdate: formatDate(product.updated_at)
  };
}

function mapActivity(activity: ApiActivity): InventoryActivity {
  const type: InventoryActivityType = activity.type === "in" ? "added" : "reduced";

  return {
    id: String(activity.id),
    productId: String(activity.product_id),
    productName: activity.product?.name || "পণ্য",
    type,
    quantityChange: Number(activity.quantity || 0),
    buyingPrice: Number(activity.buy_price || 0),
    sellingPrice: Number(activity.sell_price || 0),
    supplier: activity.supplier || "",
    unitType: "বস্তা",
    timestamp: formatDate(activity.date || activity.created_at),
    note: activity.note || (type === "added" ? "স্টক যোগ হয়েছে" : "স্টক কমেছে")
  };
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<InventoryActivity[]>([]);

  const refreshProducts = useCallback(async () => {
    try {
      const [productsResponse, historyResponse] = await Promise.all([
        productsApi.list({ per_page: 100 }),
        stockApi.history({ per_page: 50 })
      ]);
      const rawProducts = productsResponse.data.data?.data ?? productsResponse.data.data ?? [];
      const rawActivities = historyResponse.data.data?.data ?? historyResponse.data.data ?? [];
      setProducts(rawProducts.map(mapProduct));
      setActivities(rawActivities.map(mapActivity));
    } catch {
      setProducts([]);
      setActivities([]);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
    return subscribeBusinessDataChanged(() => void refreshProducts());
  }, [refreshProducts]);

  const addProduct = useCallback(
    async (values: ProductFormValues) => {
      const response = await productsApi.create({
        name: values.productName,
        category: values.category,
        weight: values.weight,
        min_stock: Number(values.minimumStockLimit) || 0,
        note: values.notes
      });
      const product = mapProduct(response.data.data.product);
      await refreshProducts();
      notifyBusinessDataChanged();
      return product;
    },
    [refreshProducts]
  );

  const addStockEntry = useCallback(
    async (values: StockEntryValues) => {
      await stockApi.add({
        product_id: Number(values.productId),
        quantity: Number(values.quantity) || 0,
        supplier: values.supplier || undefined,
        buy_price: Number(values.buyingPrice) || 0,
        sell_price: Number(values.sellingPrice) || 0,
        date: values.date,
        note: values.notes
      });
      await refreshProducts();
      notifyBusinessDataChanged();
    },
    [refreshProducts]
  );

  const getProductById = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products]
  );

  const value = useMemo(
    () => ({
      products,
      activities,
      addProduct,
      addStockEntry,
      getProductById,
      refreshProducts
    }),
    [activities, addProduct, addStockEntry, getProductById, products, refreshProducts]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used within ProductProvider");
  }

  return context;
}
