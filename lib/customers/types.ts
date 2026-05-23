export type CustomerStatus = "good" | "warning" | "risky";

export type Customer = {
  id: string;
  shopName: string;
  ownerName: string;
  mobile: string;
  address: string;
  currentDue: number;
  status: CustomerStatus;
  createdDate: string;
  notes: string;
  lastPurchaseDate: string;
  recentScore: number;
};

export type CustomerFormValues = {
  shopName: string;
  ownerName: string;
  mobile: string;
  address: string;
  notes: string;
};
