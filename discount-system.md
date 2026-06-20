# Discount, Voucher, and Promo Report API Docs

Base URL: `/api`

Endpoint headings below omit the `/api` prefix for readability. Admin CRUD/report endpoints require `adminAccessToken` HTTP-only cookie. Public display handoff endpoints are called out separately.

## Current Implementation Summary

This promo implementation is split into admin CRUD/report modules and public product display handoff.

### Latest Changes for Frontend

Public catalog is now documented and implemented as inventory-based, while preserving the existing product-card response shape.

- Primary frontend catalog endpoint:
  - `GET /api/stocks/store/:storeId`
- Primary frontend product availability/detail endpoint:
  - `GET /api/stocks/store/:storeId/product/:slug`
- Discount display fields are attached directly to each returned product card:
  - `activeDiscount`
  - `pricePreview`
  - `storeStock`
- The inventory catalog endpoint supports the catalog sidebar filters:
  - `q`
  - `categoryId`
  - `inStock`
  - `minPrice`
  - `maxPrice`
  - `sortBy`
  - `sortOrder`
  - `page`
  - `limit`
- `sortBy=price` is supported on `GET /api/stocks/store/:storeId`.
- Product-first store endpoints still exist, but discount display for public catalog is owned by the stock endpoints:
  - `GET /api/stores/:storeId/products`
  - `GET /api/stores/:storeId/products/:slug`
- No new public discount endpoint was added.
- Checkout/order flow is not changed in this scope.

Frontend should render catalog card pricing from each returned item:

```ts
product.activeDiscount;
product.pricePreview;
product.storeStock;
```

Example inventory response fragment:

```json
{
  "id": "product-id",
  "name": "Fresh Milk",
  "price": 22000,
  "storeStock": {
    "productStockId": "stock-id",
    "storeId": "store-id",
    "stock": 70,
    "isAvailable": true,
    "store": {
      "id": "store-id",
      "name": "GrocerGo Jakarta"
    },
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z"
  },
  "activeDiscount": {
    "name": "Milk Payday Promo",
    "type": "percentage",
    "value": 10,
    "buyQuantity": null,
    "getQuantity": null,
    "startDate": "2026-06-18T00:00:00.000Z",
    "endDate": "2026-06-30T23:59:59.999Z"
  },
  "pricePreview": {
    "originalPrice": 22000,
    "finalPrice": 19800,
    "discountAmount": 2200,
    "isDiscounted": true,
    "label": "10% off",
    "calculationMode": "unitPrice"
  }
}
```

Example catalog filter request:

```txt
GET /api/stocks/store/:storeId?q=milk&categoryId=<uuid>&inStock=true&minPrice=10000&maxPrice=50000&sortBy=price&sortOrder=asc&page=1&limit=12
```

### Admin Promo System

- `admin-discount` handles product discounts bound to `productId + storeId`.
- `admin-voucher` handles transaction/delivery vouchers that are selected explicitly by frontend checkout.
- `admin-promo-report` reads promo usage histories for discount and voucher reports.
- `superAdmin` can manage cross-store promo data.
- `storeAdmin` can manage promo data only for their assigned store; body/query `storeId` is never trusted for store scoping.
- Product discount CRUD is ready, but checkout application is intentionally not wired here because order flow is handled separately.

### Product Discount System

- Product discounts support:
  - `percentage`
  - `nominal`
  - `buyXGetY`
- Discount has optional `quota`.
- `quota: null` means unlimited.
- `usedQuota` starts at `0` and is reserved for future checkout/order application.
- Backend blocks overlapping active discount windows for the same `productId + storeId`.
- Active public display requires:
  - `deletedAt = null`
  - `startDate <= now`
  - `endDate >= now`
  - `quota === null || usedQuota < quota`
- Admin responses may expose admin-sensitive fields such as `id`, `quota`, `usedQuota`, `productId`, and `storeId`.
- Public product responses intentionally hide `id`, `quota`, `usedQuota`, `productId`, `storeId`, and audit fields from discount data.

### Inventory and Product Endpoint Changes

The public storefront is inventory-based. The canonical frontend catalog/detail endpoints query stock rows first, then return the same product-card shape that frontend already uses:

```txt
GET /api/stocks/store/:storeId
GET /api/stocks/store/:storeId/product/:slug
```

Each returned product card includes:

| Field            | Description                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| `storeStock`     | Selected-store stock snapshot with `stock` and `isAvailable`.                                  |
| `activeDiscount` | Public-safe active discount snapshot for display. `null` when no active/available discount.    |
| `pricePreview`   | Frontend-ready price display data for original price, final price, discount amount, and label. |

Frontend can use `pricePreview.finalPrice` for crossed-out-price UI on `percentage` and `nominal` discounts. For `buyXGetY`, `pricePreview.calculationMode` is `quantityBased`, so frontend should show the promo label instead of calculating a unit final price.

Catalog filters supported on `GET /api/stocks/store/:storeId`:

| Param       | Description                                      |
| ----------- | ------------------------------------------------ |
| `q`         | Search product name, slug, SKU, brand, category. |
| `categoryId`| Filter by product category ID.                   |
| `inStock`   | `true` for stock `> 0`, `false` for stock `<= 0`. |
| `minPrice`  | Minimum product price.                           |
| `maxPrice`  | Maximum product price.                           |
| `sortBy`    | Supports `productName`, `price`, `stock`, etc.   |
| `sortOrder` | `asc` or `desc`.                                 |
| `page`      | Positive integer page.                           |
| `limit`     | Positive integer, capped at `100`.               |

The product-first store endpoints still exist for product-first pages, but discount display is owned by the inventory-based stock endpoints:

```txt
GET /api/stores/:storeId/products
GET /api/stores/:storeId/products/:slug
```

## Response Wrapper

Successful responses use this shape:

```json
{
  "message": "Message",
  "data": {},
  "meta": {}
}
```

`meta` only exists on paginated endpoints.

## Shared Rules

- UUID fields must be valid UUID strings.
- Pagination `page` and `limit` must be positive integers. `limit` is capped at `100`.
- Date fields are parsed as JavaScript dates by Zod. Send ISO date strings from frontend.
- Date-only strings are supported. `startDate: "yyyy-MM-dd"` becomes start of day UTC, and `endDate: "yyyy-MM-dd"` becomes end of day UTC.
- `superAdmin` can access cross-store promo data.
- `storeAdmin` is always scoped from authenticated requester `storeId`, not from body/query.
- Store-scoped out-of-scope resources return `404`.
- This system does not edit order checkout flow yet. Product discounts are prepared for backend auto-apply later. Vouchers remain explicit frontend selections.

## Permissions

Seeded permissions:

```txt
discount:create
discount:read
discount:update
discount:delete
voucher:create
voucher:read
voucher:update
voucher:delete
promoReport:read
```

`superAdmin` receives all permissions. `storeAdmin` receives the same promo permissions, but every service enforces assigned-store scope.

## Discount Concepts

Product discounts live in `Discount`.

- Bound to `productId + storeId`.
- Valid types: `percentage`, `nominal`, `buyXGetY`.
- Applied at transaction item level in the future checkout flow.
- Frontend must not send `discountId` for the new auto-applied product discount flow.
- Backend guarantees no overlapping active discount for the same `productId + storeId + date window`.
- `quota` is optional. `null` or omitted means unlimited.
- `usedQuota` starts from `0` and is intended to be incremented by the future checkout flow.

Calculation handoff for order partner:

| Type         | Rule                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| `percentage` | Discount amount is item subtotal multiplied by `value / 100`.          |
| `nominal`    | Discount amount is fixed `value`, capped by item subtotal in checkout. |
| `buyXGetY`   | Free quantity uses bundle formula explained below.                     |

The current admin module stores enough data for checkout to query one active discount by `productId + storeId + current date`.

### Buy X Get Y Formula

For a line item quantity greater than one, calculate complete promo bundles:

```ts
bundleSize = buyQuantity + getQuantity;
freeQuantity = Math.floor(quantity / bundleSize) * getQuantity;
paidQuantity = quantity - freeQuantity;
discountAmount = freeQuantity * unitPrice;
```

Examples:

| Promo       | Ordered quantity | Free quantity | Paid quantity |
| ----------- | ---------------- | ------------- | ------------- |
| Buy 1 Get 1 | 1                | 0             | 1             |
| Buy 1 Get 1 | 2                | 1             | 1             |
| Buy 1 Get 1 | 3                | 1             | 2             |
| Buy 1 Get 1 | 4                | 2             | 2             |
| Buy 2 Get 1 | 2                | 0             | 2             |
| Buy 2 Get 1 | 3                | 1             | 2             |
| Buy 2 Get 1 | 6                | 2             | 4             |

Recommended quota consumption for checkout:

- `percentage` and `nominal`: consume `1` quota per discounted transaction item.
- `buyXGetY`: consume `freeQuantity` quota, so quota represents the free item budget.
- Before applying, ensure `quota === null || usedQuota + consumedQuota <= quota`.

## Public Discount Display Handoff

Public frontend does not call a discount endpoint directly. Active product discount display is attached to product cards returned by the inventory-based stock endpoints:

```txt
GET /api/stocks/store/:storeId
GET /api/stocks/store/:storeId/product/:slug
```

Each returned item is a product card with `storeStock`, `activeDiscount`, and `pricePreview`:

```json
{
  "id": "product-id",
  "name": "Fresh Milk",
  "price": 22000,
  "storeStock": {
    "productStockId": "stock-id",
    "storeId": "store-id",
    "stock": 70,
    "isAvailable": true
  },
  "activeDiscount": {
    "name": "Milk Payday Promo",
    "type": "percentage",
    "value": 10,
    "buyQuantity": null,
    "getQuantity": null,
    "startDate": "2026-06-18T00:00:00.000Z",
    "endDate": "2026-06-30T23:59:59.999Z"
  },
  "pricePreview": {
    "originalPrice": 22000,
    "finalPrice": 19800,
    "discountAmount": 2200,
    "isDiscounted": true,
    "label": "10% off",
    "calculationMode": "unitPrice"
  }
}
```

Public `activeDiscount` intentionally omits `id`, `productId`, `storeId`, `quota`, `usedQuota`, and audit fields. Frontend must not send a product `discountId` to checkout.

If no active discount exists, or if the active discount quota is exhausted:

```json
{
  "activeDiscount": null,
  "pricePreview": {
    "originalPrice": 22000,
    "finalPrice": 22000,
    "discountAmount": 0,
    "isDiscounted": false,
    "label": null,
    "calculationMode": "none"
  }
}
```

For `buyXGetY`, unit final price is not knowable until the user selects a quantity:

```json
{
  "activeDiscount": {
    "name": "Buy 1 Get 1",
    "type": "buyXGetY",
    "value": null,
    "buyQuantity": 1,
    "getQuantity": 1,
    "startDate": "2026-06-18T00:00:00.000Z",
    "endDate": "2026-06-30T23:59:59.999Z"
  },
  "pricePreview": {
    "originalPrice": 22000,
    "finalPrice": null,
    "discountAmount": null,
    "isDiscounted": true,
    "label": "Buy 1 Get 1",
    "calculationMode": "quantityBased"
  }
}
```

## Admin Discounts

### GET `/admin/discounts`

Get paginated discounts.

#### Auth

Requires `discount:read`.

#### Zod Contract

```ts
query = {
  q?: string;
  name?: string;
  productId?: uuid;
  storeId?: uuid; // ignored for storeAdmin
  type?: "percentage" | "nominal" | "buyXGetY";
  startDate?: date;
  endDate?: date;
  sortBy?: "createdAt" | "updatedAt" | "name" | "type" | "startDate" | "endDate" | "productName" | "storeName";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

`startDate` and `endDate` filter discounts whose active windows overlap the requested window.
Date-only `endDate` includes the whole day.

#### Request Examples

```txt
GET /api/admin/discounts?page=1&limit=10
GET /api/admin/discounts?storeId=<uuid>&productId=<uuid>
GET /api/admin/discounts?type=percentage&sortBy=startDate&sortOrder=desc
```

#### Return

```json
{
  "message": "Discounts fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Milk Payday Promo",
      "type": "percentage",
      "buyQuantity": null,
      "getQuantity": null,
      "value": 10,
      "quota": 100,
      "usedQuota": 0,
      "productId": "uuid",
      "storeId": "uuid",
      "startDate": "2026-06-18T00:00:00.000Z",
      "endDate": "2026-06-30T23:59:59.000Z",
      "createdAt": "2026-06-18T10:00:00.000Z",
      "updatedAt": "2026-06-18T10:00:00.000Z",
      "deletedAt": null,
      "product": {
        "id": "uuid",
        "name": "Fresh Milk",
        "slug": "fresh-milk",
        "sku": "DE-MLK-005"
      },
      "store": {
        "id": "uuid",
        "name": "GrocerGo Jakarta",
        "latitude": "-6.175392",
        "longitude": "106.827153"
      }
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

### GET `/admin/discounts/:id`

Get one discount detail.

#### Auth

Requires `discount:read`.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Return

```json
{
  "message": "Discount fetched successfully",
  "data": "Discount"
}
```

### POST `/admin/discounts`

Create a product discount.

#### Auth

Requires `discount:create`.

#### Zod Contract

```ts
body = {
  name: string;
  type: "percentage" | "nominal" | "buyXGetY";
  value?: positiveInt;
  buyQuantity?: positiveInt;
  getQuantity?: positiveInt;
  quota?: positiveInt; // omitted means unlimited
  productId: uuid;
  storeId?: uuid; // required for superAdmin, ignored for storeAdmin
  startDate: date;
  endDate: date;
}
```

#### Body Rules

| Field         | Required                                            | Description                                                         |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| `name`        | Yes                                                 | Discount display name.                                              |
| `type`        | Yes                                                 | Discount type.                                                      |
| `value`       | For `percentage` and `nominal`                      | `percentage` must be `1-100`.                                       |
| `buyQuantity` | For `buyXGetY`                                      | Positive integer.                                                   |
| `getQuantity` | For `buyXGetY`                                      | Positive integer.                                                   |
| `quota`       | No                                                  | Positive integer. Omit for unlimited discount usage.                |
| `productId`   | Yes                                                 | Active product ID.                                                  |
| `storeId`     | Required for `superAdmin`; ignored for `storeAdmin` | Target store.                                                       |
| `startDate`   | Yes                                                 | Discount starts at this date.                                       |
| `endDate`     | Yes                                                 | Discount ends at this date. Date-only values include the whole day. |

#### Validation

- Product must be active.
- Store must be active.
- Product must have an active stock row in the target store.
- `startDate <= endDate`.
- No active discount may overlap for the same `productId + storeId`.
- `usedQuota` cannot be set from admin create/update. It starts at `0` and is owned by checkout usage.
- Create runs stock existence check, overlap check, and insert in one serializable transaction.

#### Request Examples

Percentage:

```json
{
  "name": "Milk Payday Promo",
  "type": "percentage",
  "value": 10,
  "quota": 100,
  "productId": "product-uuid",
  "storeId": "store-uuid",
  "startDate": "2026-06-18T00:00:00.000Z",
  "endDate": "2026-06-30T23:59:59.000Z"
}
```

Buy one get one:

```json
{
  "name": "Buy 1 Get 1 Milk",
  "type": "buyXGetY",
  "buyQuantity": 1,
  "getQuantity": 1,
  "productId": "product-uuid",
  "storeId": "store-uuid",
  "startDate": "2026-06-18T00:00:00.000Z",
  "endDate": "2026-06-30T23:59:59.000Z"
}
```

#### Return

```json
{
  "message": "Discount created successfully",
  "data": "Discount"
}
```

#### Possible Errors

- `400` when type fields are invalid, date range is invalid, or active date window overlaps another discount.
- `401` when admin token is missing/invalid.
- `403` when admin lacks `discount:create`.
- `404` when product stock row does not exist in the target store.

### PATCH `/admin/discounts/:id`

Update a discount.

#### Auth

Requires `discount:update`.

#### Zod Contract

```ts
params = {
  id: uuid;
}

body = Partial<{
  name: string;
  type: "percentage" | "nominal" | "buyXGetY";
  value: positiveInt;
  buyQuantity: positiveInt;
  getQuantity: positiveInt;
  quota: positiveInt;
  productId: uuid;
  storeId: uuid; // superAdmin only, ignored for storeAdmin
  startDate: date;
  endDate: date;
}>; // at least one field required
```

Update revalidates final product/store/date/type state and blocks overlap with other discounts. StoreAdmin cannot move a discount to another store.

#### Return

```json
{
  "message": "Discount updated successfully",
  "data": "Discount"
}
```

### DELETE `/admin/discounts/:id`

Soft delete a discount.

#### Auth

Requires `discount:delete`.

#### Return

```json
{
  "message": "Discount deleted successfully",
  "data": "Discount"
}
```

## Voucher Concepts

Vouchers live in `Voucher`.

- Vouchers can be global (`storeId: null`) or store-scoped.
- `superAdmin` can create global or store-scoped vouchers.
- `storeAdmin` can only create/manage vouchers in assigned store.
- Voucher code is normalized to uppercase.
- Voucher is explicit: frontend sends `voucherId` and/or `deliveryVoucherId` to checkout.

## Admin Vouchers

### GET `/admin/vouchers`

Get paginated vouchers.

#### Auth

Requires `voucher:read`.

#### Zod Contract

```ts
query = {
  q?: string;
  name?: string;
  code?: string;
  storeId?: uuid; // ignored for storeAdmin
  discountType?: "percentage" | "nominal";
  voucherType?: "transaction" | "delivery";
  startDate?: date;
  endDate?: date;
  sortBy?: "createdAt" | "updatedAt" | "name" | "code" | "quantity" | "startDate" | "endDate" | "storeName";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

### GET `/admin/vouchers/:id`

Get one voucher detail.

#### Auth

Requires `voucher:read`.

### POST `/admin/vouchers`

Create a voucher.

#### Auth

Requires `voucher:create`.

#### Zod Contract

```ts
body = {
  name: string;
  code: string;
  quantity: nonNegativeInt;
  storeId?: uuid | null; // null/global only for superAdmin
  minimumTransaction?: nonNegativeInt | null;
  maxDiscount?: nonNegativeInt | null;
  discountType: "percentage" | "nominal";
  voucherType: "transaction" | "delivery";
  value: positiveInt;
  startDate: date;
  endDate: date;
}
```

#### Rules

- `code` must be globally unique, including soft-deleted rows because the database column is unique.
- `quantity` must be `0` or more.
- `percentage` value must be `1-100`.
- `nominal` value must be positive.
- `minimumTransaction` and `maxDiscount` are optional non-negative numbers.
- `startDate <= endDate`.

### PATCH `/admin/vouchers/:id`

Update a voucher. Same fields as create, all optional, at least one field required.

#### Auth

Requires `voucher:update`.

### DELETE `/admin/vouchers/:id`

Soft delete a voucher.

#### Auth

Requires `voucher:delete`.

## Admin Promo Reports

Reports are read-only and use snapshot fields from history tables:

- Discount report reads `DiscountHistory`.
- Voucher report reads `VoucherHistory`.
- Reports do not rely only on current `Discount` or `Voucher` master data.

### GET `/admin/promo-reports/discounts`

Read discount usage report.

#### Auth

Requires `promoReport:read`.

#### Zod Contract

```ts
query = {
  storeId?: uuid; // ignored for storeAdmin
  productId?: uuid;
  discountId?: uuid;
  startDate?: date;
  endDate?: date;
  sortBy?: "createdAt" | "discountName" | "discountAmount";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Return

```json
{
  "message": "Discount promo reports fetched successfully",
  "data": {
    "summary": {
      "totalUsage": 12,
      "totalDiscountAmount": 45000
    },
    "items": []
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

### GET `/admin/promo-reports/vouchers`

Read voucher usage report.

#### Auth

Requires `promoReport:read`.

#### Zod Contract

```ts
query = {
  storeId?: uuid; // ignored for storeAdmin
  voucherId?: uuid;
  voucherType?: "transaction" | "delivery";
  startDate?: date;
  endDate?: date;
  sortBy?: "createdAt" | "voucherName" | "voucherDiscountAmount" | "deliveryVoucherName" | "deliveryVoucherAmount";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

When `voucherType=transaction`, only transaction voucher fields are summarized. When `voucherType=delivery`, only delivery voucher fields are summarized.

#### Return

```json
{
  "message": "Voucher promo reports fetched successfully",
  "data": {
    "summary": {
      "totalUsage": 8,
      "totalVoucherDiscountAmount": 30000,
      "totalDeliveryVoucherAmount": 20000,
      "totalDiscountAmount": 50000
    },
    "items": []
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

## Apply Discount Handoff

The order module is intentionally untouched in this implementation.

Future checkout integration should:

1. Determine nearest/current checkout store.
2. For every transaction item, query active discount by `productId + storeId + current date`.
3. Because overlap is blocked, checkout should find at most one active discount.
4. Calculate discount amount from the stored type fields.
5. Check quota: `quota === null || usedQuota + consumedQuota <= quota`.
6. Increment `usedQuota` in the same checkout transaction.
7. Store immutable fields in `DiscountHistory`.

Voucher integration should:

1. Receive `voucherId` and/or `deliveryVoucherId` from frontend.
2. Validate voucher is active, has quantity, and is either global or same-store.
3. Apply `minimumTransaction`, `maxDiscount`, `discountType`, and `voucherType`.
4. Store immutable fields in `VoucherHistory`.

## Error Status

| Status | Meaning                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `400`  | Invalid promo input, invalid date range, duplicate voucher code, overlapping discount, or invalid type-specific fields. |
| `401`  | Missing or invalid admin token.                                                                                         |
| `403`  | Admin lacks required permission.                                                                                        |
| `404`  | Store-scoped resource is outside requester scope, resource does not exist, or product stock row is missing.             |
| `500`  | Unexpected operation failed.                                                                                            |
