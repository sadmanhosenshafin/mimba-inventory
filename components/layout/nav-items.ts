import {
  BarChart3,
  Boxes,
  RotateCcw,
  Home,
  ReceiptText,
  Settings,
  Store
} from "lucide-react";

export const mainNavItems = [
  {
    title: "হোম",
    href: "/",
    icon: Home
  },
  {
    title: "বিক্রি",
    href: "/sales",
    icon: ReceiptText
  },
  {
    title: "ফেরত",
    href: "/returns",
    icon: RotateCcw
  },
  {
    title: "স্টক",
    href: "/products",
    icon: Boxes
  },
  {
    title: "দোকান",
    href: "/customers",
    icon: Store
  },
  {
    title: "রিপোর্ট",
    href: "/reports",
    icon: BarChart3
  }
] as const;

export const utilityNavItems = [
  {
    title: "সেটিংস",
    href: "/settings",
    icon: Settings
  }
] as const;
