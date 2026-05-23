export type RiskLevel = "good" | "warning" | "risky";

export type PaymentType = "cash" | "mobile" | "partial";

export type DueCustomer = {
  customerId: string;
  shopName: string;
  ownerName: string;
  mobile: string;
  currentDue: number;
  dueDays: number;
  risk: RiskLevel;
  lastPaymentDate: string;
  notes: string;
};

export type NotificationSeverity = "info" | "warning" | "critical" | "success";

export type NotificationType =
  | "due-reminder"
  | "overdue-alert"
  | "stock-warning"
  | "payment-received";

export type AppNotification = {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  message: string;
  time: string;
};
