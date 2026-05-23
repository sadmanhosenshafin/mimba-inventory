"use client";

const BUSINESS_DATA_EVENT = "mimba:business-data-changed";

export function notifyBusinessDataChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BUSINESS_DATA_EVENT));
}

export function subscribeBusinessDataChanged(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(BUSINESS_DATA_EVENT, callback);
  return () => window.removeEventListener(BUSINESS_DATA_EVENT, callback);
}
