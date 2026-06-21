import type { StockTransferRequest, TransferAction, TransferStatus } from "../types/stockTransfer.types";


export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  received: "Received",
  cancelled: "Cancelled",
};

export const TRANSFER_STATUS_BADGE_CLASS: Record<TransferStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-muted text-muted-foreground",
};

export const TRANSFER_ACTION_LABELS: Record<TransferAction, string> = {
  approve: "Approve",
  reject: "Reject",
  receive: "Receive",
  cancel: "Cancel",
};

export const TRANSFER_ACTION_NOTES_FIELD: Record<TransferAction, string> = {
  approve: "responseNotes",
  reject: "responseNotes",
  receive: "receivedNotes",
  cancel: "cancelledNotes",
};

export const TRANSFER_ACTION_NOTES_LABEL: Record<TransferAction, string> = {
  approve: "Approval notes (optional)",
  reject: "Rejection reason (optional)",
  receive: "Received notes (optional)",
  cancel: "Cancellation reason (optional)",
};

export function getTransferActions(
  request: StockTransferRequest,
  myStoreId: string,
): TransferAction[] {
  const isSource = request.fromStoreId === myStoreId;
  const isDest = request.toStoreId === myStoreId;

  if (request.status === "pending") {
    const actions: TransferAction[] = [];
    if (isSource) actions.push("approve", "reject");
    if (isDest) actions.push("cancel");
    return actions;
  }

  if (request.status === "approved" && isDest) return ["receive"];

  return [];
}

export function getTransferStatusLabel(status: TransferStatus) {
  return TRANSFER_STATUS_LABELS[status];
}

export function getTransferStatusBadgeClass(status: TransferStatus) {
  return TRANSFER_STATUS_BADGE_CLASS[status];
}
