import type { InventoryActivity, Product, ProductCategory } from "@/lib/products/types";

export const productCategories: ProductCategory[] = [
  "ব্রয়লার ফিড",
  "ফিশ ফিড",
  "গরুর খাদ্য",
  "লেয়ার ফিড"
];

export const mockProducts: Product[] = [
  {
    id: "sonali-broiler-starter",
    productName: "সোনালী ব্রয়লার স্টার্টার",
    category: "ব্রয়লার ফিড",
    brand: "সোনালী",
    weight: "৫০ কেজি",
    stockQuantity: 18,
    minimumStockLimit: 25,
    buyingPrice: 2850,
    sellingPrice: 3050,
    supplier: "সোনালী ফিড মিল",
    notes: "দ্রুত বিক্রি হয়, সবসময় নজরে রাখা দরকার।",
    createdDate: "২০২৬-০৪-০২",
    lastStockUpdate: "আজ সকাল"
  },
  {
    id: "nourish-broiler-grower",
    productName: "নারিশ ব্রয়লার গ্রোয়ার",
    category: "ব্রয়লার ফিড",
    brand: "নারিশ",
    weight: "৫০ কেজি",
    stockQuantity: 74,
    minimumStockLimit: 30,
    buyingPrice: 2920,
    sellingPrice: 3120,
    supplier: "নারিশ ডিস্ট্রিবিউশন",
    notes: "নিয়মিত চাহিদা আছে।",
    createdDate: "২০২৬-০৩-২২",
    lastStockUpdate: "গতকাল"
  },
  {
    id: "quality-fish-feed",
    productName: "কোয়ালিটি ফিশ ফিড",
    category: "ফিশ ফিড",
    brand: "কোয়ালিটি",
    weight: "২৫ কেজি",
    stockQuantity: 42,
    minimumStockLimit: 20,
    buyingPrice: 1380,
    sellingPrice: 1500,
    supplier: "কোয়ালিটি ফিড",
    notes: "মাছের মৌসুমে বেশি চলে।",
    createdDate: "২০২৬-০৩-১৫",
    lastStockUpdate: "২ দিন আগে"
  },
  {
    id: "dairy-plus-cattle-feed",
    productName: "ডেইরি প্লাস গরুর খাদ্য",
    category: "গরুর খাদ্য",
    brand: "ডেইরি প্লাস",
    weight: "৪০ কেজি",
    stockQuantity: 12,
    minimumStockLimit: 18,
    buyingPrice: 1840,
    sellingPrice: 1980,
    supplier: "ডেইরি প্লাস সাপ্লাই",
    notes: "কম স্টকে গেলে আগে অর্ডার দিতে হয়।",
    createdDate: "২০২৬-০২-২৮",
    lastStockUpdate: "৩ দিন আগে"
  },
  {
    id: "layer-gold-feed",
    productName: "লেয়ার গোল্ড ফিড",
    category: "লেয়ার ফিড",
    brand: "গোল্ড",
    weight: "৫০ কেজি",
    stockQuantity: 56,
    minimumStockLimit: 25,
    buyingPrice: 2740,
    sellingPrice: 2950,
    supplier: "গোল্ড ফিড মিল",
    notes: "লেয়ার খামারিদের জন্য জনপ্রিয়।",
    createdDate: "২০২৬-০২-১০",
    lastStockUpdate: "আজ দুপুর"
  },
  {
    id: "mega-fish-floating",
    productName: "মেগা ফিশ ফ্লোটিং",
    category: "ফিশ ফিড",
    brand: "মেগা",
    weight: "২০ কেজি",
    stockQuantity: 9,
    minimumStockLimit: 15,
    buyingPrice: 1250,
    sellingPrice: 1380,
    supplier: "মেগা ফিড",
    notes: "স্টক প্রায় শেষ।",
    createdDate: "২০২৬-০১-২৫",
    lastStockUpdate: "৫ দিন আগে"
  }
];

export const mockInventoryActivities: InventoryActivity[] = [
  {
    id: "act-1",
    productId: "sonali-broiler-starter",
    productName: "সোনালী ব্রয়লার স্টার্টার",
    type: "added",
    quantityChange: 40,
    unitType: "বস্তা",
    timestamp: "আজ সকাল ৯:৩০",
    note: "গুদামে নতুন স্টক এসেছে"
  },
  {
    id: "act-2",
    productId: "nourish-broiler-grower",
    productName: "নারিশ ব্রয়লার গ্রোয়ার",
    type: "reduced",
    quantityChange: 12,
    unitType: "বস্তা",
    timestamp: "গতকাল বিকাল ৪:১০",
    note: "বিক্রির কারণে স্টক কমেছে"
  },
  {
    id: "act-3",
    productId: "layer-gold-feed",
    productName: "লেয়ার গোল্ড ফিড",
    type: "added",
    quantityChange: 30,
    unitType: "বস্তা",
    timestamp: "আজ দুপুর ১২:১৫",
    note: "সাপ্লায়ার থেকে এসেছে"
  },
  {
    id: "act-4",
    productId: "mega-fish-floating",
    productName: "মেগা ফিশ ফ্লোটিং",
    type: "reduced",
    quantityChange: 8,
    unitType: "বস্তা",
    timestamp: "৩ দিন আগে",
    note: "দোকানে বিক্রি হয়েছে"
  }
];
