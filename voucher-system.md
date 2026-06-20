# Admin Voucher Frontend Handoff

This document explains how to build the admin voucher management page on the frontend.

The voucher page should follow the existing admin page patterns and visual language. Before implementing, inspect the existing admin pages/components that are already working, especially admin discount, product/category/list pages, shared admin tables, filters, dialogs, form fields, loading states, empty states, pagination, and the shared admin axios/session setup. Keep layout, spacing, button style, table density, modal/drawer behavior, validation display, and route protection consistent with those pages.

## Goals

Build a usable admin voucher CRUD page that lets admins:

- View paginated voucher list.
- Search and filter vouchers.
- Create vouchers.
- Edit vouchers.
- Soft delete vouchers.
- Support both global and store-scoped vouchers.
- Support transaction vouchers and delivery vouchers.
- Support nominal and percentage discount types.

Do not build a marketing page. The first screen should be the actual admin management interface.

## Backend Routes

Base admin route:

```txt
/api/admin/vouchers
```

Public selected-store voucher route:

```txt
/api/vouchers/store/:storeId
```

The admin page mainly uses `/api/admin/vouchers`. The public route is for customer-facing checkout/catalog voucher discovery and can be ignored unless the frontend also needs to test public voucher availability.

Use the shared admin API client that sends HTTP-only cookies with credentials. Do not manually read admin tokens in frontend code.

## Permissions

Admin routes require an authenticated admin session and these permissions:

```txt
voucher:read
voucher:create
voucher:update
voucher:delete
```

Frontend should hide or disable create/edit/delete actions when the current admin does not have the matching permission, following existing admin page behavior.

## Role Behavior

### superAdmin

`superAdmin` can create:

- Global vouchers by sending `storeId: null` or omitting `storeId`.
- Store-scoped vouchers by sending a concrete `storeId`.

`superAdmin` can filter list by `storeId`.

### storeAdmin

`storeAdmin` can only manage vouchers assigned to their own store.

Important frontend rule:

- For storeAdmin create/edit forms, do not show a store picker as an editable field.
- Backend ignores body/query `storeId` for storeAdmin scoping.
- A storeAdmin cannot create global vouchers.
- A storeAdmin receives `404` when accessing global vouchers or other-store vouchers.

## Voucher Concepts

There are two independent axes:

### Voucher Purpose

```ts
voucherType: "transaction" | "delivery";
```

- `transaction`: regular checkout subtotal voucher.
- `delivery`: delivery/ongkir voucher.

### Discount Type

```ts
discountType: "percentage" | "nominal";
```

- `percentage`: `value` must be from `1` to `100`.
- `nominal`: `value` must be a positive integer.

Delivery vouchers can also use `percentage`.

## Supported Voucher Examples

### Global Transaction Percentage Voucher

```json
{
  "name": "Payday Hemat 20%",
  "code": "PAYDAY20",
  "quantity": 500,
  "storeId": null,
  "minimumTransaction": 100000,
  "maxDiscount": 30000,
  "discountType": "percentage",
  "voucherType": "transaction",
  "value": 20,
  "startDate": "2026-06-20T09:00:00+07:00",
  "endDate": "2026-06-30T23:59:00+07:00"
}
```

### Store-Scoped Transaction Nominal Voucher

```json
{
  "name": "Diskon Kemang 25K",
  "code": "KEMANG25K",
  "quantity": 100,
  "storeId": "store-uuid",
  "minimumTransaction": 150000,
  "maxDiscount": null,
  "discountType": "nominal",
  "voucherType": "transaction",
  "value": 25000,
  "startDate": "2026-06-20T00:00:00+07:00",
  "endDate": "2026-07-05T23:59:00+07:00"
}
```

### Global Delivery Nominal Voucher

```json
{
  "name": "Gratis Ongkir 15K",
  "code": "ONGKIR15",
  "quantity": 1000,
  "storeId": null,
  "minimumTransaction": 50000,
  "maxDiscount": null,
  "discountType": "nominal",
  "voucherType": "delivery",
  "value": 15000,
  "startDate": "2026-06-20T00:00:00+07:00",
  "endDate": "2026-06-27T23:59:00+07:00"
}
```

### Store-Scoped Delivery Percentage Voucher

```json
{
  "name": "Ongkir Hemat BSD 50%",
  "code": "BSDONGKIR50",
  "quantity": 200,
  "storeId": "store-uuid",
  "minimumTransaction": null,
  "maxDiscount": 20000,
  "discountType": "percentage",
  "voucherType": "delivery",
  "value": 50,
  "startDate": "2026-06-21T09:00:00+07:00",
  "endDate": "2026-06-23T21:00:00+07:00"
}
```

## Admin List Endpoint

```http
GET /api/admin/vouchers
```

### Query

```ts
type GetAdminVouchersQuery = {
  q?: string;
  name?: string;
  code?: string;
  storeId?: string;
  discountType?: "percentage" | "nominal";
  voucherType?: "transaction" | "delivery";
  startDate?: string | Date;
  endDate?: string | Date;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "name"
    | "code"
    | "quantity"
    | "startDate"
    | "endDate"
    | "storeName";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};
```

Defaults:

```ts
sortBy = "createdAt";
sortOrder = "desc";
page = 1;
limit = 10;
```

`limit` is capped at `100`.

For storeAdmin, `storeId` query is ignored by backend and automatically scoped to the requester store.

### Response

```json
{
  "message": "Vouchers fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Payday Hemat 20%",
      "code": "PAYDAY20",
      "quantity": 500,
      "storeId": null,
      "minimumTransaction": 100000,
      "maxDiscount": 30000,
      "discountType": "percentage",
      "voucherType": "transaction",
      "value": 20,
      "startDate": "2026-06-20T02:00:00.000Z",
      "endDate": "2026-06-30T16:59:00.000Z",
      "createdAt": "2026-06-20T01:00:00.000Z",
      "updatedAt": "2026-06-20T01:00:00.000Z",
      "deletedAt": null,
      "store": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

For store-scoped vouchers, `store` is included:

```json
{
  "store": {
    "id": "uuid",
    "name": "GrocerGo Kemang",
    "latitude": "-6.260000",
    "longitude": "106.810000"
  }
}
```

## Admin Detail Endpoint

```http
GET /api/admin/vouchers/:id
```

Response:

```json
{
  "message": "Voucher fetched successfully",
  "data": "Voucher"
}
```

Use this when opening an edit form from a direct URL or when list row data is not enough.

## Create Endpoint

```http
POST /api/admin/vouchers
```

### Body

```ts
type CreateVoucherBody = {
  name: string;
  code: string;
  quantity: number;
  storeId?: string | null;
  minimumTransaction?: number | null;
  maxDiscount?: number | null;
  discountType: "percentage" | "nominal";
  voucherType: "transaction" | "delivery";
  value: number;
  startDate: string | Date;
  endDate: string | Date;
};
```

Response:

```json
{
  "message": "Voucher created successfully",
  "data": "Voucher"
}
```

## Update Endpoint

```http
PATCH /api/admin/vouchers/:id
```

Same fields as create, all optional. At least one field is required.

Response:

```json
{
  "message": "Voucher updated successfully",
  "data": "Voucher"
}
```

## Delete Endpoint

```http
DELETE /api/admin/vouchers/:id
```

This soft deletes the voucher.

Response:

```json
{
  "message": "Voucher deleted successfully",
  "data": "Voucher"
}
```

## Validation Rules

Frontend should mirror these validations for better UX, but backend remains the source of truth.

- `name` is required.
- `code` is required.
- `code` is normalized to uppercase by backend.
- `code` must be globally unique, including soft-deleted voucher rows.
- `quantity` must be an integer `>= 0`.
- `minimumTransaction` is optional, nullable, integer `>= 0`.
- `maxDiscount` is optional, nullable, integer `>= 0`.
- `discountType = "percentage"` requires `value` from `1` to `100`.
- `discountType = "nominal"` requires positive `value`.
- `voucherType` must be `"transaction"` or `"delivery"`.
- `startDate` must be before or equal to `endDate`.
- `storeId` can be `null` only for superAdmin global vouchers.

Important current behavior:

- `maxDiscount` is meaningful for percentage vouchers.
- For nominal vouchers, frontend should hide or clear `maxDiscount` unless product decision says otherwise.

## Date And Time Handling

Backend supports both date-only and date-time values.

Date-only input:

```json
{
  "startDate": "2026-06-20",
  "endDate": "2026-06-30"
}
```

Backend interprets date-only input as:

```txt
startDate -> 2026-06-20T00:00:00.000Z
endDate   -> 2026-06-30T23:59:59.999Z
```

For hour-level control, send date-time with timezone:

```json
{
  "startDate": "2026-06-20T09:00:00+07:00",
  "endDate": "2026-06-20T11:00:00+07:00"
}
```

Recommended frontend behavior:

- Use date-time controls if admin needs flash-sale precision.
- Preserve local admin timezone in the UI.
- Send ISO strings or explicit timezone strings.
- Display dates in local timezone.

## Suggested Admin Page UX

Use existing admin page patterns. The page should feel like the current admin tables, not a separate design system.

### Page Structure

- Header with title `Vouchers`.
- Primary create button.
- Filter/search toolbar.
- Data table.
- Pagination.
- Create/edit form in the same modal/drawer pattern used by existing admin pages.
- Delete confirmation dialog.

### Recommended Table Columns

- Name.
- Code.
- Scope: `Global` or store name.
- Voucher purpose: `Transaction` or `Delivery`.
- Discount: percentage or nominal formatted label.
- Minimum transaction.
- Max discount.
- Quantity.
- Active period.
- Status.
- Actions.

Status can be computed on frontend from current time:

```ts
if (now < startDate) status = "Scheduled";
else if (now > endDate) status = "Expired";
else if (quantity <= 0) status = "Out of quota";
else status = "Active";
```

### Filters

Include these filters if they match existing admin table patterns:

- Search `q`.
- Voucher type: all, transaction, delivery.
- Discount type: all, percentage, nominal.
- Store filter for superAdmin only.
- Date range.

For storeAdmin, do not show the store filter unless existing pages show it disabled/read-only.

### Form Fields

Recommended order:

1. Name.
2. Code.
3. Voucher purpose segmented control: Transaction / Delivery.
4. Discount type segmented control: Percentage / Nominal.
5. Value.
6. Max discount, only prominent for percentage.
7. Minimum transaction.
8. Quantity.
9. Store scope:
   - superAdmin: Global vs Store-scoped.
   - storeAdmin: fixed assigned store, no editable picker.
10. Start date-time.
11. End date-time.

Use the existing store options/dropdown endpoint if a store picker is needed:

```http
GET /api/stores/options
```

## Frontend Formatting Helpers

Suggested labels:

```ts
function formatVoucherPurpose(voucherType) {
  return voucherType === "delivery" ? "Delivery" : "Transaction";
}

function formatDiscount(voucher) {
  if (voucher.discountType === "percentage") {
    return `${voucher.value}%${
      voucher.maxDiscount ? `, max Rp ${voucher.maxDiscount}` : ""
    }`;
  }

  return `Rp ${voucher.value}`;
}

function formatScope(voucher) {
  return voucher.storeId ? voucher.store?.name ?? "Store" : "Global";
}
```

## Public Voucher Endpoint

Customer-facing pages can fetch active vouchers for the selected store:

```http
GET /api/vouchers/store/:storeId
```

Response:

```json
{
  "message": "Vouchers fetched successfully",
  "data": {
    "vouchers": [],
    "deliveryVouchers": []
  }
}
```

Rules:

- Returns only active vouchers.
- Returns only vouchers with `quantity > 0`.
- Includes global vouchers and selected-store vouchers.
- Splits transaction vouchers and delivery vouchers.

This endpoint is not required for the admin voucher management page, but useful for checking whether created vouchers appear for customers.

## Expected Error Handling

Handle backend errors in the same toast/inline validation style used by existing admin pages.

Common errors:

- `400`: invalid input, duplicate voucher code, invalid date range, invalid percentage value.
- `401`: unauthenticated admin.
- `403`: missing permission.
- `404`: voucher not found, store not found, or storeAdmin accessing out-of-scope voucher.

## Implementation Checklist

- Read `api-docs.md` first.
- Inspect existing admin pages and reuse their table, form, modal/drawer, confirmation, pagination, and filter patterns.
- Use shared admin axios/client with credentials.
- Add a dedicated admin voucher feature folder if that matches the current frontend structure, for example `src/features/admin/vouchers`.
- Keep schemas/types/services/components local to the voucher feature.
- Use `GET /api/admin/vouchers` for the table.
- Use `POST /api/admin/vouchers` for create.
- Use `PATCH /api/admin/vouchers/:id` for edit.
- Use `DELETE /api/admin/vouchers/:id` for delete.
- Hide or disable actions based on permissions.
- For superAdmin, support global/store-scoped choice.
- For storeAdmin, do not allow global voucher creation.
- Use date-time capable inputs.
- Run frontend build and lint after implementation.
