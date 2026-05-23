export type ProductCategory = "ব্রয়লার ফিড" | "ফিশ ফিড" | "গরুর খাদ্য" | "লেয়ার ফিড";

export type Product = {
  id: string;
  productName: string;
  category: ProductCategory;
  brand: string;
  weight: string;
  stockQuantity: number;
  minimumStockLimit: number;
  buyingPrice: number;
  sellingPrice: number;
  supplier: string;
  notes: string;
  createdDate: string;
  lastStockUpdate: string;
};

export type ProductFormValues = {
  productName: string;
  category: ProductCategory;
  weight: string;
  minimumStockLimit: string;
  notes: string;
};

export type StockEntryValues = {
  productId: string;
  quantity: string;
  supplier: string;
  buyingPrice: string;
  sellingPrice: string;
  date: string;
  notes: string;
};

export type InventoryActivityType = "added" | "reduced";

export type InventoryActivity = {
  id: string;
  productId: string;
  productName: string;
  type: InventoryActivityType;
  quantityChange: number;
  buyingPrice?: number;
  sellingPrice?: number;
  supplier?: string;
  unitType: string;
  timestamp: string;
  note: string;
};
