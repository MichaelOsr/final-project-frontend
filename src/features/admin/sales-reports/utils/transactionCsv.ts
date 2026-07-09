import type { LabelKeyObject } from "react-csv/lib/core";
import type { ResolvedRange } from "../types/salesReport.types";
import type { TransactionItem } from "../types/transactionReport.types";

// react-csv (2.2.2) wraps every cell in double-quotes but does NOT escape a
// double-quote embedded in the value, which produces malformed CSV for
// free-text fields like store or customer names (e.g. `Jean "JD" Doe` would
// prematurely close the field and shift every following column). We double
// embedded quotes ourselves so react-csv's wrapping yields RFC 4180 output.
function csvSafe(value: string | null): string {
  return (value ?? "").replace(/"/g, '""');
}

// Flattened, escaped shape handed to CSVLink. Numbers pass through untouched
// (no quotes to escape); null strings collapse to "". The `Store` column is
// dropped purely by omitting its header below, so rows always carry storeName.
export interface TransactionCsvRow {
  reportDate: string;
  transactionId: string;
  transactionStatus: string;
  storeName: string;
  customerName: string;
  customerEmail: string;
  paidAt: string;
  totalItemsSold: number;
  productSales: number;
  transactionVoucherDiscount: number;
  deliveryRevenue: number;
  totalRevenue: number;
}

export function toTransactionCsvRows(items: TransactionItem[]): TransactionCsvRow[] {
  return items.map((item) => ({
    reportDate: csvSafe(item.reportDate),
    transactionId: csvSafe(item.transactionId),
    transactionStatus: csvSafe(item.transactionStatus),
    storeName: csvSafe(item.store.name),
    customerName: csvSafe(item.customer.name),
    customerEmail: csvSafe(item.customer.email),
    paidAt: csvSafe(item.paidAt),
    totalItemsSold: item.totalItemsSold,
    productSales: item.productSales,
    transactionVoucherDiscount: item.transactionVoucherDiscount,
    deliveryRevenue: item.deliveryRevenue,
    totalRevenue: item.totalRevenue,
  }));
}

export function getTransactionCsvHeaders(showStoreColumn: boolean): LabelKeyObject[] {
  return [
    { label: "Date", key: "reportDate" },
    { label: "Transaction ID", key: "transactionId" },
    { label: "Status", key: "transactionStatus" },
    ...(showStoreColumn ? [{ label: "Store", key: "storeName" }] : []),
    { label: "Customer Name", key: "customerName" },
    { label: "Customer Email", key: "customerEmail" },
    { label: "Paid At", key: "paidAt" },
    { label: "Items Sold", key: "totalItemsSold" },
    { label: "Product Sales", key: "productSales" },
    { label: "Voucher Discount", key: "transactionVoucherDiscount" },
    { label: "Delivery Revenue", key: "deliveryRevenue" },
    { label: "Total Revenue", key: "totalRevenue" },
  ];
}

export function getTransactionCsvFilename(range: ResolvedRange | null): string {
  if (!range) return "sales-transactions.csv";
  return `sales-transactions_${range.startDate}_${range.endDate}.csv`;
}
