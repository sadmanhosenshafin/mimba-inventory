import type { Customer } from "@/lib/customers/types";

export const mockCustomers: Customer[] = [
  {
    id: "karim-feed-store",
    shopName: "করিম ফিড স্টোর",
    ownerName: "মো. করিম উদ্দিন",
    mobile: "01711111111",
    address: "বাজার রোড, সাভার",
    currentDue: 12500,
    status: "good",
    createdDate: "২০২৬-০৫-০১",
    notes: "নিয়মিত ক্রেতা। মাস শেষে টাকা পরিশোধ করেন।",
    lastPurchaseDate: "আজ",
    recentScore: 98
  },
  {
    id: "karim-traders",
    shopName: "করিম ট্রেডার্স",
    ownerName: "আবদুল করিম",
    mobile: "01822222222",
    address: "স্টেশন বাজার, গাজীপুর",
    currentDue: 34200,
    status: "warning",
    createdDate: "২০২৬-০৪-১৮",
    notes: "বাকি টাকা মনে করিয়ে দিতে হয়।",
    lastPurchaseDate: "গতকাল",
    recentScore: 95
  },
  {
    id: "rahman-feed",
    shopName: "রহমান ফিড",
    ownerName: "মাহবুব রহমান",
    mobile: "01933333333",
    address: "নতুন বাজার, মানিকগঞ্জ",
    currentDue: 0,
    status: "good",
    createdDate: "২০২৬-০৪-১২",
    notes: "ক্যাশ ক্রেতা।",
    lastPurchaseDate: "আজ",
    recentScore: 92
  },
  {
    id: "madina-feed-house",
    shopName: "মদিনা ফিড ঘর",
    ownerName: "মো. সেলিম",
    mobile: "01644444444",
    address: "হাটখোলা, নারায়ণগঞ্জ",
    currentDue: 68200,
    status: "risky",
    createdDate: "২০২৬-০৩-২৮",
    notes: "নতুন বিক্রির আগে পুরনো বাকি যাচাই করা দরকার।",
    lastPurchaseDate: "৩ দিন আগে",
    recentScore: 86
  },
  {
    id: "alam-poultry",
    shopName: "আলম পোল্ট্রি",
    ownerName: "মো. আলম",
    mobile: "01555555555",
    address: "পূর্ব বাজার, টাঙ্গাইল",
    currentDue: 8400,
    status: "good",
    createdDate: "২০২৬-০৩-২০",
    notes: "ব্রয়লার ফিড বেশি নেন।",
    lastPurchaseDate: "২ দিন আগে",
    recentScore: 84
  },
  {
    id: "sonali-feed-corner",
    shopName: "সোনালী ফিড কর্নার",
    ownerName: "রফিকুল ইসলাম",
    mobile: "01466666666",
    address: "পুরাতন বাজার, ময়মনসিংহ",
    currentDue: 22800,
    status: "warning",
    createdDate: "২০২৬-০২-১৪",
    notes: "স্টক কম থাকলে আগে ফোন করেন।",
    lastPurchaseDate: "৫ দিন আগে",
    recentScore: 78
  }
];

export const recentPurchases = [
  { product: "পোল্ট্রি ফিড", quantity: "২০ বস্তা", amount: "৳ ১২,০০০", date: "আজ" },
  { product: "গরুর ফিড", quantity: "১২ বস্তা", amount: "৳ ৮,৪০০", date: "গতকাল" },
  { product: "মাছের ফিড", quantity: "৮ বস্তা", amount: "৳ ৫,৬০০", date: "৩ দিন আগে" }
];

export const paymentHistory = [
  { method: "নগদ", amount: "৳ ১০,০০০", date: "আজ" },
  { method: "বিকাশ", amount: "৳ ৮,০০০", date: "৪ দিন আগে" },
  { method: "নগদ", amount: "৳ ১৫,০০০", date: "১ সপ্তাহ আগে" }
];
