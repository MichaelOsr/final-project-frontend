# Grocery Backend API Docs

Base URL: `/api`

Endpoint headings below omit the `/api` prefix for readability. Request examples use the full frontend path with `/api`, for example `/api/products`.

## Response Wrapper

Most successful responses use this shape:

```json
{
  "message": "Message",
  "data": {},
  "meta": {}
}
```

`meta` only exists on paginated list endpoints.

## Shared Rules

- UUID fields must be valid UUID strings.
- Boolean query params only accept `true` or `false`. Do not send `0`, `1`, `yes`, `no`, or random strings.
- Pagination `page` and `limit` must be positive integers. `limit` is capped at `100`.
- Product image upload field name is always `images`.
- Product image upload accepts JPG/JPEG, PNG, and GIF by MIME type. Max file size is `1MB`.
- Target resource identifiers are sent through params, for example `:slug`, `:storeId`, and `:imageId`.
- Batch item identifiers are sent in body arrays, for example image IDs in reorder/gallery payloads.
- Admin endpoints require `adminAccessToken` HTTP-only cookie.

## Shared Schemas

### Pagination Meta

```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3
}
```

### Product Card

Used by public product lists and admin product lists.

```json
{
  "id": "uuid",
  "name": "Indomie Goreng",
  "slug": "indomie-goreng-1234",
  "categoryId": "uuid",
  "brand": "Indomie",
  "variant": "Original",
  "size": "85g",
  "description": "Instant fried noodle",
  "sku": "INS-IND-IND-ORI-85G",
  "price": 3500,
  "createdAt": "2026-06-06T10:00:00.000Z",
  "updatedAt": "2026-06-06T10:00:00.000Z",
  "deletedAt": null,
  "category": {
    "id": "uuid",
    "name": "Instant Food"
  },
  "images": [
    {
      "id": "uuid",
      "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
      "position": 1
    }
  ]
}
```

### Admin Product Detail

Admin detail contains data that is not considered public-safe, including image `publicId`, stock histories, and discounts.

```json
{
  "id": "uuid",
  "name": "Indomie Goreng",
  "slug": "indomie-goreng-1234",
  "categoryId": "uuid",
  "brand": "Indomie",
  "variant": "Original",
  "size": "85g",
  "description": "Instant fried noodle",
  "sku": "INS-IND-IND-ORI-85G",
  "price": 3500,
  "createdAt": "2026-06-06T10:00:00.000Z",
  "updatedAt": "2026-06-06T10:00:00.000Z",
  "deletedAt": null,
  "category": {
    "id": "uuid",
    "name": "Instant Food",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  },
  "images": [
    {
      "id": "uuid",
      "productId": "uuid",
      "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
      "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
      "position": 1,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null
    }
  ],
  "stocks": [],
  "stockHistories": [],
  "discounts": []
}
```

### Product Stock

```json
{
  "id": "uuid",
  "productId": "uuid",
  "storeId": "uuid",
  "stock": 0,
  "store": {
    "id": "uuid",
    "name": "Grocergo Kemang",
    "latitude": "-6.260000",
    "longitude": "106.810000"
  },
  "createdAt": "2026-06-06T10:00:00.000Z",
  "updatedAt": "2026-06-06T10:00:00.000Z"
}
```

### Category

```json
{
  "id": "uuid",
  "name": "Instant Food",
  "createdAt": "2026-06-06T10:00:00.000Z",
  "updatedAt": "2026-06-06T10:00:00.000Z",
  "deletedAt": null
}
```

## Public Categories

### GET `/categories`

Get paginated category list.

#### Frontend Usage

Use this endpoint for category filters, category dropdowns, and product create/edit forms that need a selectable category list. For simple dropdowns, request a high enough `limit`, for example `limit=100`.

#### Zod Contract

```ts
query = {
  q?: string;
  name?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Query

| Param       | Type   | Default | Description                        |
| ----------- | ------ | ------- | ---------------------------------- |
| `q`         | string | -       | Search category name.              |
| `name`      | string | -       | Filter category name.              |
| `sortBy`    | enum   | `name`  | `name`, `createdAt`, `updatedAt`.  |
| `sortOrder` | enum   | `asc`   | `asc` or `desc`.                   |
| `page`      | number | `1`     | Positive integer.                  |
| `limit`     | number | `10`    | Positive integer, capped at `100`. |

#### Request Examples

```txt
GET /api/categories
GET /api/categories?q=instant&page=1&limit=20
GET /api/categories?sortBy=createdAt&sortOrder=desc
```

#### Return

```json
{
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Instant Food",
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null
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

### GET `/categories/:id`

Get category detail by ID.

#### Frontend Usage

Use this when frontend already stores a `categoryId` and needs to resolve its current category name.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Params

| Param | Type | Required | Description  |
| ----- | ---- | -------- | ------------ |
| `id`  | uuid | Yes      | Category ID. |

#### Return

```json
{
  "message": "Category fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Instant Food",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

## Admin Auth

Admin auth endpoints issue and verify two separate HTTP-only cookies: `adminAccessToken` (15 minutes) and `adminRefreshToken` (7 days). Both are signed JWTs containing the same payload shape (`TJwtTokenPayload`), but signed with different secrets (`ADMIN_ACCESS_TOKEN_SECRET` / `ADMIN_REFRESH_TOKEN_SECRET`).

### Cookie Rules

- `adminAccessToken`: `httpOnly`, `sameSite=lax`, `secure` only in production, `maxAge=15m`, `path=/`.
- `adminRefreshToken`: same flags, `maxAge=7d`, `path=/`.
- `POST /admin/auth/login` and `POST /admin/auth/refresh` both set **both** cookies (the refresh endpoint rotates the access token together with the refresh token, not just the access token).
- `POST /admin/auth/logout` clears both cookies.
- Frontend must send requests with credentials included (e.g. `fetch(..., { credentials: "include" })` or axios `withCredentials: true`) so the browser attaches these cookies.

### JWT Token Payload (`TJwtTokenPayload`)

This is the shape encoded inside both `adminAccessToken` and `adminRefreshToken`, and is also what middleware attaches to `req.user`.

```ts
{
  id: uuid;
  email: string;
  name: string;
  role: "superAdmin" | "storeAdmin" | "user";
  avatarUrl: string | null; // url or null
  isVerified: boolean;
}
```

### Admin Session (`TAdminSession`)

This is the shape returned as `data` by login/refresh/me endpoints.

```json
{
  "id": "uuid",
  "name": "Jane Admin",
  "email": "jane@grocergo.com",
  "avatar": "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
  "isVerified": true,
  "role": "storeAdmin",
  "roleId": "uuid",
  "store": {
    "id": "uuid",
    "name": "Grocergo Kemang",
    "latitude": "-6.260000",
    "longitude": "106.810000"
  }
}
```

`store` is `null` when the admin is not assigned to a store (e.g. `superAdmin`).

### Middleware: `verifyAdminAccessToken`

Used to protect `logout`, `me`, and all other admin endpoints (categories, products, etc).

#### Frontend Usage

This is what guards every admin page/action except login and refresh. When a request to a protected admin endpoint returns `401`, frontend should attempt `POST /admin/auth/refresh` once; if that also fails, redirect to admin login (cookies will already be cleared by the refresh controller on `401`).

#### Behavior

1. Reads JWT from `req.cookies.adminAccessToken`.
2. If the cookie is missing → throws `401 Unauthorized`.
3. Verifies the JWT signature/expiry using `ADMIN_ACCESS_TOKEN_SECRET`.
4. Parses the decoded payload through `jwtTokenSchema` (`TJwtTokenPayload`). Invalid/forged payload shape also results in an error forwarded to the error handler.
5. On success, attaches the decoded payload to `req.user` and calls `next()`.

This middleware does **not** query the database — it only trusts the JWT. Permission/role/store checks happen in downstream service code (e.g. `assertAdminAccess`, permission middleware).

### Middleware: `verifyAdminRefreshToken`

Used only to protect `POST /admin/auth/refresh`.

#### Behavior

Identical flow to `verifyAdminAccessToken`, except:

- Reads JWT from `req.cookies.adminRefreshToken`.
- Verifies the JWT using `ADMIN_REFRESH_TOKEN_SECRET`.
- Attaches the decoded payload to `req.user`.

### POST `/admin/auth/login`

Authenticate an admin user and issue admin cookies.

#### Frontend Usage

Use this from the admin login form. On success, both `adminAccessToken` and `adminRefreshToken` cookies are set by the server (frontend does not need to store tokens manually). Use the returned `data` (an `TAdminSession`) to populate the admin app shell (avatar, name, role, store).

#### Auth

None (public endpoint).

#### Zod Contract

```ts
body = {
  email: string; // valid email format
  password: string; // min length 1
}
```

#### Body

| Field      | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| `email`    | string | Yes      | Admin user email.    |
| `password` | string | Yes      | Admin user password. |

#### Request Example

```json
{
  "email": "jane@grocergo.com",
  "password": "supersecret"
}
```

#### Return

```json
{
  "message": "Admin login successful",
  "data": {
    "id": "uuid",
    "name": "Jane Admin",
    "email": "jane@grocergo.com",
    "avatar": "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
    "isVerified": true,
    "role": "storeAdmin",
    "roleId": "uuid",
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    }
  }
}
```

#### Possible Errors

- `401` when email/password is incorrect (`Email or password is incorrect`), or when user has no password set.
- `403` when the user's role does not have the `admin:login` permission (`Only admin users can access the admin dashboard`).

### POST `/admin/auth/logout`

Clear admin auth cookies.

#### Frontend Usage

Use this from the admin logout button/menu. After success, clear local admin state and redirect to admin login. The endpoint clears cookies server-side regardless of session validity.

#### Auth

Requires `adminAccessToken` HTTP-only cookie (`verifyAdminAccessToken`).

#### Zod Contract

```ts
// no params, query, or body
```

#### Return

```json
{
  "message": "Admin logout successful"
}
```

### POST `/admin/auth/refresh`

Rotate admin cookies using the refresh token.

#### Frontend Usage

Use this when a protected admin request returns `401` (access token expired). Call this endpoint once; on success, retry the original request — new `adminAccessToken` and `adminRefreshToken` cookies are already set by the server. On failure (`401`), both admin cookies are cleared by the controller — frontend should redirect to admin login immediately rather than retrying again.

#### Auth

Requires `adminRefreshToken` HTTP-only cookie (`verifyAdminRefreshToken`).

#### Zod Contract

```ts
// no params, query, or body
```

#### Behavior

1. Middleware verifies `adminRefreshToken` and attaches the decoded payload to `req.user`.
2. Service re-fetches the user from the database by `req.user.id` (`assertAdminAccess`) and re-checks the `admin:login` permission — so a user whose role/permissions changed (or who was deactivated) after the refresh token was issued will be rejected even with a structurally valid token.
3. On success, issues a brand new `adminAccessToken` and `adminRefreshToken` pair (both rotate together) and returns a fresh `TAdminSession`.

#### Return

```json
{
  "message": "Admin token refreshed successfully",
  "data": {
    "id": "uuid",
    "name": "Jane Admin",
    "email": "jane@grocergo.com",
    "avatar": "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
    "isVerified": true,
    "role": "storeAdmin",
    "roleId": "uuid",
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    }
  }
}
```

#### Possible Errors

- `401` when the refresh token cookie is missing/invalid/expired, or when the user no longer exists (`Unauthorized`). On `401`, both `adminAccessToken` and `adminRefreshToken` cookies are cleared server-side.
- `403` when the user's role no longer has the `admin:login` permission (`Only admin users can access the admin dashboard`).

### GET `/admin/auth/me`

Get the current authenticated admin's profile/session.

#### Frontend Usage

Use this on admin app bootstrap (page refresh) to restore session state from the `adminAccessToken` cookie, since the cookie itself is HTTP-only and unreadable from JS. If this returns `401`, attempt `POST /admin/auth/refresh`; if that also fails, treat the admin as logged out.

#### Auth

Requires `adminAccessToken` HTTP-only cookie (`verifyAdminAccessToken`).

#### Zod Contract

```ts
// no params, query, or body
```

#### Return

```json
{
  "message": "Admin profile fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Jane Admin",
    "email": "jane@grocergo.com",
    "avatar": "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
    "isVerified": true,
    "role": "storeAdmin",
    "roleId": "uuid",
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    }
  }
}
```

#### Possible Errors

- `401` when the access token is missing/invalid/expired, or the user no longer exists (`Unauthorized`).
- `403` when the user's role no longer has the `admin:login` permission (`Only admin users can access the admin dashboard`).

## Admin Categories

Admin category write endpoints. Public category read endpoints remain available at `GET /categories` and `GET /categories/:id`.

### POST `/admin/categories`

Create a category. Requires `category:create` permission.

#### Frontend Usage

Use this from super admin category management create form or modal. After success, refetch `GET /api/categories` so dropdowns and tables use the latest category list.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `category:create` permission.

#### Zod Contract

```ts
body = {
  name: string;
}
```

#### Body

| Field  | Type   | Required | Description                                                                                                                                                       |
| ------ | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | string | Yes      | Category name. Trimmed and stored as lowercase. Must not duplicate an active category name. If a deleted category with the same name exists, it will be restored. |

#### Request Example

```json
{
  "name": "Frozen Food"
}
```

Backend stores this as `frozen food`.

#### Return

```json
{
  "message": "Category created successfully",
  "data": {
    "id": "uuid",
    "name": "frozen food",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

### PATCH `/admin/categories/:id`

Update a category. Requires `category:update` permission.

#### Frontend Usage

Use this from super admin category edit form or inline edit. If products already use this category, their displayed category name will follow the updated category name through relation data.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `category:update` permission.

#### Zod Contract

```ts
params = {
  id: uuid;
}

body = Partial<{
  name: string;
}>; // at least one field required
```

#### Params

| Param | Type | Required | Description  |
| ----- | ---- | -------- | ------------ |
| `id`  | uuid | Yes      | Category ID. |

#### Body

| Field  | Type   | Required | Description                                                                                                                           |
| ------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | string | No       | Category name. Trimmed and stored as lowercase. Must not duplicate another category name, including a deleted row with the same name. |

#### Request Example

```json
{
  "name": "Frozen & Ready Meal"
}
```

Backend stores this as `frozen & ready meal`.

#### Return

```json
{
  "message": "Category updated successfully",
  "data": {
    "id": "uuid",
    "name": "frozen & ready meal",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

### DELETE `/admin/categories/:id`

Soft delete a category. Requires `category:delete` permission.

#### Frontend Usage

Use this from super admin category table destructive action. Frontend should disable or warn delete when category is still used by active products. Backend will reject deletion if active products still reference the category.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `category:delete` permission.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Params

| Param | Type | Required | Description  |
| ----- | ---- | -------- | ------------ |
| `id`  | uuid | Yes      | Category ID. |

#### Rules

- Category must exist and be active.
- Category cannot be deleted while active products still use it.
- Deleted category names can be reused through `POST /admin/categories`; the backend will restore the deleted row because `name` is unique in the database.

#### Return

```json
{
  "message": "Category deleted successfully",
  "data": {
    "id": "uuid",
    "name": "frozen & ready meal",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

## Public Products

### GET `/products`

Get paginated product list for product catalog/search.

#### Frontend Usage

Use this endpoint for catalog cards, search result pages, category pages, and product listing grids. Products with stock `0` can still appear. To decide whether the user can add an item to cart, filter by the selected store with `storeId` and/or fetch exact stock using the stock endpoint.

#### Zod Contract

```ts
{
  q?: string;
  name?: string;
  slug?: string;
  sku?: string;
  brand?: string;
  variant?: string;
  size?: string;
  categoryName?: string;
  categoryId?: uuid;
  storeId?: uuid;
  minPrice?: nonNegativeInt;
  maxPrice?: nonNegativeInt;
  minStock?: nonNegativeInt;
  maxStock?: nonNegativeInt;
  inStock?: boolean;
  sortBy?: "name" | "slug" | "sku" | "brand" | "price" | "categoryName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Query

| Param          | Type    | Default     | Description                                                                                   |
| -------------- | ------- | ----------- | --------------------------------------------------------------------------------------------- |
| `q`            | string  | -           | Search name, slug, SKU, brand, variant, size, category name.                                  |
| `name`         | string  | -           | Filter product name.                                                                          |
| `slug`         | string  | -           | Filter product slug.                                                                          |
| `sku`          | string  | -           | Filter SKU.                                                                                   |
| `brand`        | string  | -           | Filter brand.                                                                                 |
| `variant`      | string  | -           | Filter variant.                                                                               |
| `size`         | string  | -           | Filter size.                                                                                  |
| `categoryName` | string  | -           | Filter category name.                                                                         |
| `categoryId`   | uuid    | -           | Filter category ID.                                                                           |
| `storeId`      | uuid    | -           | Filter products that have a stock row in this store.                                          |
| `minPrice`     | number  | -           | Minimum price.                                                                                |
| `maxPrice`     | number  | -           | Maximum price.                                                                                |
| `minStock`     | number  | -           | Minimum stock on matching stock rows.                                                         |
| `maxStock`     | number  | -           | Maximum stock on matching stock rows.                                                         |
| `inStock`      | boolean | -           | `true` means stock `> 0`; `false` means stock `<= 0`; omitted means no stock quantity filter. |
| `sortBy`       | enum    | `createdAt` | `name`, `slug`, `sku`, `brand`, `price`, `categoryName`, `createdAt`, `updatedAt`.            |
| `sortOrder`    | enum    | `desc`      | `asc` or `desc`.                                                                              |
| `page`         | number  | `1`         | Positive integer.                                                                             |
| `limit`        | number  | `10`        | Positive integer, capped at `100`.                                                            |

#### Request Examples

```txt
GET /api/products?q=indomie&page=1&limit=12
GET /api/products?categoryId=<uuid>&storeId=<uuid>&inStock=true
GET /api/products?sortBy=price&sortOrder=asc
```

#### Return

```json
{
  "message": "Products fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Indomie Goreng",
      "slug": "indomie-goreng-1234",
      "categoryId": "uuid",
      "brand": "Indomie",
      "variant": "Original",
      "size": "85g",
      "description": "Instant fried noodle",
      "sku": "INS-IND-IND-ORI-85G",
      "price": 3500,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null,
      "category": {
        "id": "uuid",
        "name": "Instant Food"
      },
      "images": [
        {
          "id": "uuid",
          "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
          "position": 1
        }
      ]
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

### GET `/products/:slug`

Get public product detail by slug. Stocks are not included by default.

#### Frontend Usage

Use this endpoint for product detail pages. By default, use it for static product information only. Add `includeStocks=true` when the page needs store availability. Use `storeId` when the user already selected a store.

#### Zod Contract

```ts
params = {
  slug: string;
}

query = {
  includeStocks?: boolean; // default false
  storeId?: uuid;
  inStock?: boolean;
}
```

#### Params

| Param  | Type   | Required | Description   |
| ------ | ------ | -------- | ------------- |
| `slug` | string | Yes      | Product slug. |

#### Query

| Param           | Type    | Default | Description                                                                                                                        |
| --------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `includeStocks` | boolean | `false` | Include store stock rows.                                                                                                          |
| `storeId`       | uuid    | -       | When `includeStocks=true`, include stock only for this store.                                                                      |
| `inStock`       | boolean | -       | When `includeStocks=true`, `true` returns stock `> 0`; `false` returns stock `<= 0`; omitted returns all stock rows including `0`. |

#### Request Examples

```txt
GET /api/products/indomie-goreng-1234
GET /api/products/indomie-goreng-1234?includeStocks=true
GET /api/products/indomie-goreng-1234?includeStocks=true&storeId=<uuid>
```

#### Return

```json
{
  "message": "Product fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "categoryId": "uuid",
    "brand": "Indomie",
    "variant": "Original",
    "size": "85g",
    "description": "Instant fried noodle",
    "sku": "INS-IND-IND-ORI-85G",
    "price": 3500,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "category": {
      "id": "uuid",
      "name": "Instant Food"
    },
    "images": [
      {
        "id": "uuid",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "position": 1
      }
    ],
    "stocks": [
      {
        "id": "uuid",
        "productId": "uuid",
        "storeId": "uuid",
        "stock": 0,
        "store": {
          "id": "uuid",
          "name": "Grocergo Kemang",
          "latitude": "-6.260000",
          "longitude": "106.810000"
        },
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z"
      }
    ]
  }
}
```

`stocks` only exists when `includeStocks=true`.

## Public Stocks

### GET `/stocks/store/:storeId`

Get all stock rows for a store, including stock `0` by default. Product details are included for cards.

#### Frontend Usage

Use this endpoint for store-specific catalog pages or when the user chooses a store first. It returns stock rows with product card data, so frontend can render availability directly. Use `inStock=true` only when the UI should hide out-of-stock cards.

#### Zod Contract

```ts
params = {
  storeId: uuid;
}

query = {
  q?: string;
  productName?: string;
  sku?: string;
  brand?: string;
  categoryId?: uuid;
  categoryName?: string;
  minStock?: nonNegativeInt;
  maxStock?: nonNegativeInt;
  inStock?: boolean;
  sortBy?: "stock" | "productName" | "sku" | "brand" | "categoryName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Params

| Param     | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `storeId` | uuid | Yes      | Store ID.   |

#### Query

| Param          | Type    | Default       | Description                                                                                          |
| -------------- | ------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `q`            | string  | -             | Search product name, slug, SKU, brand, category name.                                                |
| `productName`  | string  | -             | Filter product name.                                                                                 |
| `sku`          | string  | -             | Filter SKU.                                                                                          |
| `brand`        | string  | -             | Filter brand.                                                                                        |
| `categoryId`   | uuid    | -             | Filter category ID.                                                                                  |
| `categoryName` | string  | -             | Filter category name.                                                                                |
| `minStock`     | number  | -             | Minimum stock.                                                                                       |
| `maxStock`     | number  | -             | Maximum stock.                                                                                       |
| `inStock`      | boolean | -             | `true` means stock `> 0`; `false` means stock `<= 0`; omitted includes all stock rows including `0`. |
| `sortBy`       | enum    | `productName` | `stock`, `productName`, `sku`, `brand`, `categoryName`, `createdAt`, `updatedAt`.                    |
| `sortOrder`    | enum    | `asc`         | `asc` or `desc`.                                                                                     |
| `page`         | number  | `1`           | Positive integer.                                                                                    |
| `limit`        | number  | `10`          | Positive integer, capped at `100`.                                                                   |

#### Request Examples

```txt
GET /api/stocks/store/<store-id>
GET /api/stocks/store/<store-id>?q=indomie
GET /api/stocks/store/<store-id>?inStock=false
```

#### Return

```json
{
  "message": "Store stocks fetched successfully",
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "storeId": "uuid",
      "stock": 0,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null,
      "product": {
        "id": "uuid",
        "name": "Indomie Goreng",
        "slug": "indomie-goreng-1234",
        "categoryId": "uuid",
        "brand": "Indomie",
        "variant": "Original",
        "size": "85g",
        "description": "Instant fried noodle",
        "sku": "INS-IND-IND-ORI-85G",
        "price": 3500,
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z",
        "deletedAt": null,
        "category": {
          "id": "uuid",
          "name": "Instant Food"
        },
        "images": [
          {
            "id": "uuid",
            "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
            "position": 1
          }
        ]
      },
      "store": {
        "id": "uuid",
        "name": "Grocergo Kemang"
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

### GET `/stocks/store/:storeId/product/:slug`

Get exact stock for one product in one store. Returns `stock: 0` when the stock row exists with zero quantity.

#### Frontend Usage

Use this endpoint when the product detail page only needs availability for the currently selected store. This is lighter than fetching every store stock row from product detail.

#### Zod Contract

```ts
params = {
  storeId: uuid;
  slug: string;
}
```

#### Params

| Param     | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| `storeId` | uuid   | Yes      | Store ID.     |
| `slug`    | string | Yes      | Product slug. |

#### Return

```json
{
  "message": "Store product stock fetched successfully",
  "data": {
    "id": "uuid",
    "productId": "uuid",
    "storeId": "uuid",
    "stock": 0,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    },
    "product": {
      "id": "uuid",
      "name": "Indomie Goreng",
      "slug": "indomie-goreng-1234",
      "categoryId": "uuid",
      "brand": "Indomie",
      "variant": "Original",
      "size": "85g",
      "description": "Instant fried noodle",
      "sku": "INS-IND-IND-ORI-85G",
      "price": 3500,
      "category": {
        "id": "uuid",
        "name": "Instant Food"
      },
      "images": [
        {
          "id": "uuid",
          "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
          "position": 1
        }
      ]
    }
  }
}
```

## Cart

Cart endpoints are for logged-in users, not admin users.

### Cart Rules

- All cart endpoints require user `accessToken` verification.
- `POST /cart` validates selected store stock before adding an item.
- If the same product already exists in the cart, backend increments quantity.
- If a previously deleted cart item exists for the same product, backend restores it and increments quantity.
- `PATCH /cart/:cartItemId` updates item quantity directly. Current implementation does not re-check store stock on update.
- `DELETE /cart/:cartItemId` soft deletes the cart item.

### GET `/cart`

Get the current user's cart.

#### Frontend Usage

Use this for cart page, cart drawer, cart badge calculation, and checkout preparation. If `data.items` is empty or missing, render empty cart state.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
// no params, query, or body
```

#### Return

If the user has no cart yet:

```json
{
  "message": "Cart fetched successfully",
  "data": {
    "items": []
  }
}
```

If the user has a cart:

```json
{
  "message": "Cart fetched successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "items": [
      {
        "id": "uuid",
        "cartId": "uuid",
        "productId": "uuid",
        "quantity": 2,
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z",
        "deletedAt": null,
        "product": {
          "id": "uuid",
          "name": "Indomie Goreng",
          "slug": "indomie-goreng-1234",
          "categoryId": "uuid",
          "brand": "Indomie",
          "variant": "Original",
          "size": "85g",
          "description": "Instant fried noodle",
          "sku": "INS-IND-IND-ORI-85G",
          "price": 3500,
          "createdAt": "2026-06-06T10:00:00.000Z",
          "updatedAt": "2026-06-06T10:00:00.000Z",
          "deletedAt": null,
          "images": [
            {
              "id": "uuid",
              "productId": "uuid",
              "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
              "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
              "position": 1,
              "createdAt": "2026-06-06T10:00:00.000Z",
              "updatedAt": "2026-06-06T10:00:00.000Z",
              "deletedAt": null
            }
          ],
          "stocks": [
            {
              "id": "uuid",
              "productId": "uuid",
              "storeId": "uuid",
              "stock": 10,
              "createdAt": "2026-06-06T10:00:00.000Z",
              "updatedAt": "2026-06-06T10:00:00.000Z",
              "deletedAt": null
            }
          ],
          "discounts": []
        }
      }
    ]
  }
}
```

### POST `/cart`

Add a product to the current user's cart.

#### Frontend Usage

Use this from product card/detail add-to-cart button. Frontend should send the selected `storeId` so backend can validate stock for that store. Disable add-to-cart in UI when selected store stock is `0`, but still rely on backend validation.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
body = {
  productId: uuid;
  storeId: uuid;
  quantity: positiveInt;
}
```

#### Body

| Field       | Type   | Required | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| `productId` | uuid   | Yes      | Product ID to add.                           |
| `storeId`   | uuid   | Yes      | Selected store ID used for stock validation. |
| `quantity`  | number | Yes      | Whole number, minimum `1`.                   |

#### Request Example

```json
{
  "productId": "product-uuid",
  "storeId": "store-uuid",
  "quantity": 2
}
```

#### Return

```json
{
  "message": "Item added to cart successfully"
}
```

#### Possible Errors

- `404` when product stock row does not exist in the selected store.
- `400` when selected store stock is lower than requested quantity or final accumulated cart quantity.

### PATCH `/cart/:cartItemId`

Update cart item quantity.

#### Frontend Usage

Use this from cart quantity stepper/input. Because current backend does not re-check stock on update, frontend should use cart product `stocks` or the store stock endpoint to prevent users from selecting an invalid quantity.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
params = {
  cartItemId: uuid;
}

body = {
  quantity: positiveInt;
}
```

#### Params

| Param        | Type | Required | Description   |
| ------------ | ---- | -------- | ------------- |
| `cartItemId` | uuid | Yes      | Cart item ID. |

#### Body

| Field      | Type   | Required | Description                |
| ---------- | ------ | -------- | -------------------------- |
| `quantity` | number | Yes      | Whole number, minimum `1`. |

#### Request Example

```json
{
  "quantity": 3
}
```

#### Return

```json
{
  "message": "Cart item updated successfully"
}
```

#### Possible Errors

- `404` when cart item does not exist or was deleted.
- `403` when cart item belongs to another user's cart.

### DELETE `/cart/:cartItemId`

Soft delete one cart item.

#### Frontend Usage

Use this for remove item action in cart UI. After success, remove item locally or refetch cart.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
params = {
  cartItemId: uuid;
}
```

#### Params

| Param        | Type | Required | Description   |
| ------------ | ---- | -------- | ------------- |
| `cartItemId` | uuid | Yes      | Cart item ID. |

#### Return

```json
{
  "message": "Cart item deleted successfully"
}
```

#### Possible Errors

- `404` when cart item does not exist or was deleted.
- `403` when cart item belongs to another user's cart.

## Admin Products

### Admin Scope Rule

- `superAdmin` can access all admin product data.
- Any requester with a `storeId` is scoped to products that have active stock rows in that store.
- Store-scoped mutation endpoints use the same scope check as admin detail. If the product is outside scope, frontend should expect `404`.
- Baseline seed keeps `storeAdmin` read-only.

### POST `/admin/product`

Create a product. Requires `product:create` permission.

#### Frontend Usage

Use this from the super admin product management create form. Send files with `multipart/form-data`. Do not send `slug` or `sku`; backend generates both.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:create` permission.

#### Zod Contract

```ts
body = {
  name: string;
  categoryId: uuid;
  brand?: string;
  variant?: string;
  size?: string;
  description?: string;
  price: positiveInt;
  positions: positiveInt[]; // min 1, max 5
}

files = {
  images: File[]; // min 1, max 5, max 1MB each
}
```

#### Content Type

`multipart/form-data`

#### Body

| Field         | Type     | Required | Description                                                                                                                                              |
| ------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | string   | Yes      | Product name. Must be unique. Backend generates slug using `createSlug(name)`.                                                                           |
| `categoryId`  | uuid     | Yes      | Existing active category ID.                                                                                                                             |
| `brand`       | string   | No       | Brand name. Empty string becomes omitted.                                                                                                                |
| `variant`     | string   | No       | Variant. Empty string becomes omitted.                                                                                                                   |
| `size`        | string   | No       | Size. Empty string becomes omitted.                                                                                                                      |
| `description` | string   | No       | Description. Empty string becomes omitted.                                                                                                               |
| `price`       | number   | Yes      | Positive integer.                                                                                                                                        |
| `positions`   | number[] | Yes      | Positive integer image order. Accepts JSON array string `[1,2]`, comma string `1,2`, or repeated multipart fields. Must match image count and be unique. |
| `images`      | file[]   | Yes      | Field name must be `images`. Minimum 1, maximum 5. JPG, JPEG, PNG, GIF only. Each file max 1MB.                                                          |

#### Request Example

```txt
POST /api/admin/product
Content-Type: multipart/form-data

name=Indomie Goreng
categoryId=7b5f0c20-3e8f-4f39-a36c-2d94675cc3df
brand=Indomie
variant=Original
size=85g
description=Instant fried noodle
price=3500
positions=[1,2]
images=<file-1>
images=<file-2>
```

#### Return

```json
{
  "message": "Product created successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "categoryId": "uuid",
    "brand": "Indomie",
    "variant": "Original",
    "size": "85g",
    "description": "Instant fried noodle",
    "sku": "INS-IND-IND-ORI-85G",
    "price": 3500,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "category": {},
    "images": [
      {
        "id": "uuid",
        "productId": "uuid",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 1,
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z",
        "deletedAt": null
      }
    ]
  }
}
```

#### Upload Cleanup Contract

The backend uploads all images to Cloudinary in parallel with `Promise.all`. Uploaded `publicId`s are collected. If any upload fails, all successfully uploaded images are deleted. If the database create operation fails after upload, all uploaded images are deleted before the error is forwarded.

### GET `/admin/product`

Get paginated admin product list. Requires `product:read` permission.

#### Frontend Usage

Use this for admin product tables. It returns the same card shape as public product list. Store-scoped admins only see products stocked in their assigned store.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:read` permission.

#### Query

Same query options as `GET /products`.

#### Request Example

```txt
GET /api/admin/product?page=1&limit=10&q=indomie
```

#### Return

```json
{
  "message": "Admin products fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### PATCH `/admin/product/:slug/images/positions`

Reorder all active product images. Requires `productImage:update` permission. This endpoint does not upload or delete Cloudinary assets.

#### Frontend Usage

Use this only when frontend needs a lightweight save for reorder-only UI. For a full gallery editor that can add, remove, and reorder images in one save, prefer `PATCH /admin/product/:slug/images`.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `productImage:update` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}

body = {
  images: Array<{
    id: uuid;
    position: positiveInt;
  }>; // min 1, max 5
}
```

#### Params

| Param  | Type   | Required | Description           |
| ------ | ------ | -------- | --------------------- |
| `slug` | string | Yes      | Current product slug. |

#### Body

```json
{
  "images": [
    { "id": "image-id-1", "position": 1 },
    { "id": "image-id-2", "position": 2 }
  ]
}
```

Rules:

- `images` must include all active images owned by this product.
- Image IDs must be unique.
- Positions must be positive integers and unique.
- Maximum image count is 5.

#### Return

```json
{
  "message": "Product image positions updated successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "images": [
      {
        "id": "image-id-1",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 1
      }
    ],
    "category": {},
    "stocks": [],
    "stockHistories": [],
    "discounts": []
  }
}
```

### PATCH `/admin/product/:slug/images`

Patch the final product gallery state. Requires `productImage:update` permission. This single endpoint can reorder existing images, soft delete removed existing images, and add new uploaded images.

Existing images that are not included in `existingImages` are soft deleted. Cloudinary assets for soft-deleted images are not destroyed immediately; they can be cleaned later by a scheduled job using `deletedAt` and `publicId`.

#### Frontend Usage

Use this for the main gallery editor. Keep gallery state locally. On save, send existing image IDs that should remain, plus any new files and positions. This lets frontend support add, remove, and reorder in one request.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `productImage:update` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}

body = {
  existingImages?: Array<{
    id: uuid;
    position: positiveInt;
  }>; // default []
  newImagePositions?: positiveInt[]; // default []
}

files = {
  images?: File[]; // max 5, max 1MB each
}
```

#### Params

| Param  | Type   | Required | Description           |
| ------ | ------ | -------- | --------------------- |
| `slug` | string | Yes      | Current product slug. |

#### Body

`multipart/form-data`

| Field               | Type        | Required | Description                                                                                                                      |
| ------------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `existingImages`    | JSON string | No       | Final existing images to keep, ordered by desired `position`. Defaults to `[]`.                                                  |
| `images`            | file[]      | No       | New product image files. JPG, JPEG, PNG, GIF only. Each file max 1MB.                                                            |
| `newImagePositions` | number[]    | No       | Positions for uploaded `images`. Must match uploaded file count. Accepts JSON array, comma string, or repeated multipart fields. |

`existingImages` shape:

```json
[
  { "id": "existing-image-id-1", "position": 1 },
  { "id": "existing-image-id-2", "position": 2 }
]
```

Rules:

- Final active image count must be minimum 1 and maximum 5.
- `existingImages` IDs must belong to the product and must be unique.
- `newImagePositions` count must match uploaded `images` count.
- All final positions from existing and new images must be positive integers and unique.
- New images are uploaded to Cloudinary in parallel. If upload or DB operation fails, newly uploaded Cloudinary assets are deleted by `publicId`.

#### Request Example

```txt
PATCH /api/admin/product/indomie-goreng-1234/images
Content-Type: multipart/form-data

existingImages=[{"id":"image-id-2","position":1}]
images=<file>
newImagePositions=2
```

#### Return

```json
{
  "message": "Product images updated successfully",
  "data": {
    "id": "uuid",
    "slug": "indomie-goreng-1234",
    "images": [
      {
        "id": "image-id-2",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 1
      },
      {
        "id": "new-image-id",
        "image": "https://res.cloudinary.com/demo/image/upload/product-new.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 2
      }
    ],
    "category": {},
    "stocks": [],
    "stockHistories": [],
    "discounts": []
  }
}
```

### PATCH `/admin/product/:slug`

Update product data. Requires `product:update` permission. `sku` is not accepted from frontend and is regenerated by backend after every update. If `name` changes, backend also regenerates `slug` using `createSlug(name)`.

#### Frontend Usage

Use this for product edit forms excluding gallery changes. If response slug changes because name changed, frontend should update route/state to the new slug returned by backend.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:update` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}

body = Partial<{
  name: string;
  categoryId: uuid;
  brand: string | null;
  variant: string | null;
  size: string | null;
  description: string | null;
  price: positiveInt;
}>; // at least one field required
```

#### Params

| Param  | Type   | Required | Description           |
| ------ | ------ | -------- | --------------------- |
| `slug` | string | Yes      | Current product slug. |

#### Body

At least one field is required.

| Field         | Type           | Required | Description                                                     |
| ------------- | -------------- | -------- | --------------------------------------------------------------- |
| `name`        | string         | No       | Product name. Must be unique. Regenerates product slug and SKU. |
| `categoryId`  | uuid           | No       | Existing active category ID. Regenerates SKU.                   |
| `brand`       | string or null | No       | Brand. Send `null` to clear. Regenerates SKU.                   |
| `variant`     | string or null | No       | Variant. Send `null` to clear. Regenerates SKU.                 |
| `size`        | string or null | No       | Size. Send `null` to clear. Regenerates SKU.                    |
| `description` | string or null | No       | Description. Send `null` to clear.                              |
| `price`       | number         | No       | Positive integer price.                                         |

#### Request Example

```json
{
  "name": "Indomie Goreng Jumbo",
  "brand": "Indomie",
  "variant": "Jumbo",
  "size": "120g",
  "price": 5000
}
```

#### Return

```json
{
  "message": "Product updated successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng Jumbo",
    "slug": "indomie-goreng-jumbo-5678",
    "categoryId": "uuid",
    "brand": "Indomie",
    "variant": "Jumbo",
    "size": "120g",
    "description": "Instant fried noodle",
    "sku": "INS-IND-IND-JUM-120G",
    "price": 5000,
    "category": {},
    "images": []
  }
}
```

### GET `/admin/product/:slug`

Get admin product detail by slug. Requires `product:read` permission.

#### Frontend Usage

Use this for admin product detail/edit pages. It returns image IDs/public IDs, stock rows, stock history, and discounts needed by admin UI.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:read` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}
```

#### Params

| Param  | Type   | Required | Description   |
| ------ | ------ | -------- | ------------- |
| `slug` | string | Yes      | Product slug. |

#### Return

```json
{
  "message": "Admin product fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "categoryId": "uuid",
    "brand": "Indomie",
    "variant": "Original",
    "size": "85g",
    "description": "Instant fried noodle",
    "sku": "INS-IND-IND-ORI-85G",
    "price": 3500,
    "category": {},
    "images": [],
    "stocks": [],
    "stockHistories": [],
    "discounts": []
  }
}
```

### DELETE `/admin/product/:slug/images/:imageId`

Soft delete one active product image. Requires `productImage:delete` permission. Baseline seed assigns this permission to `superAdmin`.

Cloudinary assets are not destroyed immediately. Use a scheduled cleanup job later with `deletedAt` and `publicId` if needed.

#### Frontend Usage

Use this for single-image delete actions. Disable delete button when only one active image remains, because backend requires at least one active image.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `productImage:delete` permission.

#### Zod Contract

```ts
params = {
  slug: string;
  imageId: uuid;
}
```

#### Params

| Param     | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `slug`    | string | Yes      | Product slug.     |
| `imageId` | uuid   | Yes      | Product image ID. |

#### Rules

- Product must exist and be active.
- Image must belong to the product and be active.
- Product must still have at least one active image after deletion.

#### Return

```json
{
  "message": "Product image deleted successfully",
  "data": {
    "id": "uuid",
    "slug": "indomie-goreng-1234",
    "images": [
      {
        "id": "remaining-image-id",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 1
      }
    ],
    "category": {},
    "stocks": [],
    "stockHistories": [],
    "discounts": []
  }
}
```

### DELETE `/admin/product/:slug`

Soft delete product data. Requires `product:delete` permission. Baseline seed assigns this permission to `superAdmin`.

This soft deletes the product, active product image rows, and active product stock rows. It does not soft delete discounts, carts, transactions, or other modules. Cloudinary assets are not destroyed because the product delete is soft-delete.

#### Frontend Usage

Use this from super admin destructive action UI. After success, remove the product from admin lists or refetch the list. Public/product endpoints will no longer return this product because they filter `deletedAt: null`.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:delete` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}
```

#### Params

| Param  | Type   | Required | Description   |
| ------ | ------ | -------- | ------------- |
| `slug` | string | Yes      | Product slug. |

#### Return

```json
{
  "message": "Product deleted successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "images": [],
    "stocks": []
  }
}
```

## Public Stores

### GET `/stores`

Get paginated store list.

#### Frontend Usage

Use this endpoint for store selection dropdowns, store listings, and store filter controls.

#### Zod Contract

```ts
query = {
  q?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Query

| Param       | Type   | Default | Description                        |
| ----------- | ------ | ------- | ---------------------------------- |
| `q`         | string | -       | Search store name.                 |
| `sortBy`    | enum   | `name`  | `name`, `createdAt`, `updatedAt`.  |
| `sortOrder` | enum   | `asc`   | `asc` or `desc`.                   |
| `page`      | number | `1`     | Positive integer.                  |
| `limit`     | number | `10`    | Positive integer, capped at `100`. |

#### Request Examples

```txt
GET /api/stores
GET /api/stores?q=kemang&page=1&limit=20
GET /api/stores?sortBy=createdAt&sortOrder=desc
```

#### Return

```json
{
  "message": "Stores fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000",
      "address": "Jl. Kemang Raya No. 10",
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

### GET `/stores/options`

Get minimal store list for dropdowns/selects (ID and name only).

#### Frontend Usage

Use this when frontend needs a lightweight store dropdown without pagination or sort overhead.

#### Zod Contract

```ts
// no params, query, or body
```

#### Return

```json
{
  "message": "Store options fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Grocergo Kemang"
    },
    {
      "id": "uuid",
      "name": "Grocergo Tebet"
    }
  ]
}
```

### GET `/stores/nearest-store`

Find the nearest active store from user coordinates.

#### Frontend Usage

Use this after the user grants location access or selects a delivery coordinate. The response includes `outOfRange` so frontend can decide whether to show delivery-unavailable messaging.

#### Zod Contract

```ts
query = {
  lat: number; // -90 to 90
  lng: number; // -180 to 180
}
```

#### Query

| Param | Type   | Required | Description     |
| ----- | ------ | -------- | --------------- |
| `lat` | number | Yes      | User latitude.  |
| `lng` | number | Yes      | User longitude. |

#### Request Example

```txt
GET /api/stores/nearest-store?lat=-6.200000&lng=106.816666
```

#### Return

```json
{
  "message": "Nearest store fetched successfully",
  "data": {
    "store": {
      "id": "uuid",
      "name": "GrocerGo Jakarta",
      "latitude": "-6.175392",
      "longitude": "106.827153",
      "address": null,
      "isMain": true,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null
    },
    "distanceKm": 3.2,
    "outOfRange": false
  }
}
```

### GET `/stores/mainStore`

Get the configured main store. If no store is flagged as main, backend falls back to the oldest active store.

#### Frontend Usage

Use this for homepage defaults before the user has selected a specific store.

#### Zod Contract

```ts
// no params, query, or body
```

#### Return

```json
{
  "message": "Main store fetched successfully",
  "data": {
    "id": "uuid",
    "name": "GrocerGo Jakarta",
    "latitude": "-6.175392",
    "longitude": "106.827153",
    "address": null,
    "isMain": true,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

### GET `/stores/:storeId/products`

Get paginated product catalog for a selected store. Each product includes `storeStock` for that store.

#### Frontend Usage

Use this for store-scoped catalog pages. Only products with an active stock row in the selected store are returned. Send `inStock=true` when the catalog should only show products available in the selected store. If `inStock` is omitted, available products are returned first and out-of-stock products are placed at the end.

#### Zod Contract

```ts
params = {
  storeId: uuid;
}

query = {
  q?: string;
  name?: string;
  slug?: string;
  sku?: string;
  brand?: string;
  variant?: string;
  size?: string;
  categoryName?: string;
  categoryId?: uuid;
  minPrice?: nonNegativeInt;
  maxPrice?: nonNegativeInt;
  inStock?: boolean;
  sortBy?: "name" | "slug" | "sku" | "brand" | "price" | "categoryName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Params

| Param     | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `storeId` | uuid | Yes      | Store ID.   |

#### Query

| Param          | Type    | Default     | Description                                                                        |
| -------------- | ------- | ----------- | ---------------------------------------------------------------------------------- |
| `q`            | string  | -           | Search name, slug, SKU, brand, variant, size, category name.                       |
| `name`         | string  | -           | Filter product name.                                                               |
| `slug`         | string  | -           | Filter product slug.                                                               |
| `sku`          | string  | -           | Filter SKU.                                                                        |
| `brand`        | string  | -           | Filter brand.                                                                      |
| `variant`      | string  | -           | Filter variant.                                                                    |
| `size`         | string  | -           | Filter size.                                                                       |
| `categoryName` | string  | -           | Filter category name.                                                              |
| `categoryId`   | uuid    | -           | Filter category ID.                                                                |
| `minPrice`     | number  | -           | Minimum price.                                                                     |
| `maxPrice`     | number  | -           | Maximum price.                                                                     |
| `inStock`      | boolean | -           | `true` means stock `> 0`; `false` means stock `<= 0`.                              |
| `sortBy`       | enum    | `createdAt` | `name`, `slug`, `sku`, `brand`, `price`, `categoryName`, `createdAt`, `updatedAt`. |
| `sortOrder`    | enum    | `desc`      | `asc` or `desc`.                                                                   |
| `page`         | number  | `1`         | Positive integer.                                                                  |
| `limit`        | number  | `10`        | Positive integer, capped at `100`.                                                 |

#### Request Examples

```txt
GET /api/stores/<store-id>/products?page=1&limit=20
GET /api/stores/<store-id>/products?q=milk&categoryId=<uuid>&inStock=true
GET /api/stores/<store-id>/products?sortBy=price&sortOrder=asc
```

#### Return

```json
{
  "message": "Store products fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Fresh Milk",
      "slug": "fresh-milk",
      "categoryId": "uuid",
      "brand": "Greenfields",
      "variant": "Full Cream",
      "size": "1 L",
      "description": null,
      "sku": "DE-MLK-005",
      "price": 22000,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null,
      "category": {
        "id": "uuid",
        "name": "Dairy & Eggs"
      },
      "images": [
        {
          "id": "uuid",
          "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
          "position": 1
        }
      ],
      "storeStock": {
        "productStockId": "uuid",
        "storeId": "uuid",
        "stock": 70,
        "isAvailable": true,
        "store": {
          "id": "uuid",
          "name": "GrocerGo Jakarta",
          "latitude": "-6.175392",
          "longitude": "106.827153"
        },
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

Products without an active stock row in the selected store are not returned by this endpoint.

### GET `/stores/:storeId/products/:slug`

Get one product detail scoped to a selected store. Response includes `storeStock` for that store. Products without an active stock row in the selected store return `404`.

#### Frontend Usage

Use this for product detail pages after the user has selected a store.

#### Zod Contract

```ts
params = {
  storeId: uuid;
  slug: string;
}
```

#### Params

| Param     | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| `storeId` | uuid   | Yes      | Store ID.     |
| `slug`    | string | Yes      | Product slug. |

#### Request Example

```txt
GET /api/stores/<store-id>/products/fresh-milk
```

#### Return

Same product shape as `GET /stores/:storeId/products`, without array/meta wrapper:

```json
{
  "message": "Store product fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Fresh Milk",
    "slug": "fresh-milk",
    "category": {
      "id": "uuid",
      "name": "Dairy & Eggs"
    },
    "images": [],
    "storeStock": {
      "productStockId": "uuid",
      "storeId": "uuid",
      "stock": 70,
      "isAvailable": true,
      "store": {
        "id": "uuid",
        "name": "GrocerGo Jakarta",
        "latitude": "-6.175392",
        "longitude": "106.827153"
      },
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z"
    }
  }
}
```

### GET `/stores/:id`

Get store detail by ID.

#### Frontend Usage

Use this for store detail pages or to resolve a stored `storeId`.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Params

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | uuid | Yes      | Store ID.   |

#### Return

```json
{
  "message": "Store fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Grocergo Kemang",
    "latitude": "-6.260000",
    "longitude": "106.810000",
    "address": "Jl. Kemang Raya No. 10",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

## Public Roles

Roles define admin permission sets. Endpoints are public so frontend can display role names/descriptions.

### GET `/roles`

Get all available roles with their permission names.

#### Frontend Usage

Use this for admin account creation/edit forms to show which roles are available. Display role names and their associated permissions.

#### Zod Contract

```ts
// no params, query, or body
```

#### Return

```json
{
  "message": "Roles fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "superAdmin",
      "description": "Full system access",
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null,
      "permissions": [
        {
          "id": "uuid",
          "name": "admin:login",
          "description": "Allow admin login"
        },
        {
          "id": "uuid",
          "name": "category:create",
          "description": "Create category"
        }
      ]
    },
    {
      "id": "uuid",
      "name": "storeAdmin",
      "description": "Store-level admin access",
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null,
      "permissions": [
        {
          "id": "uuid",
          "name": "admin:login",
          "description": "Allow admin login"
        }
      ]
    }
  ]
}
```

### GET `/roles/:id`

Get role detail by ID, including all associated permissions.

#### Frontend Usage

Use this to display detailed role information with full permission list.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Params

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | uuid | Yes      | Role ID.    |

#### Return

```json
{
  "message": "Role fetched successfully",
  "data": {
    "id": "uuid",
    "name": "storeAdmin",
    "description": "Store-level admin access",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "permissions": [
      {
        "id": "uuid",
        "name": "admin:login",
        "description": "Allow admin login"
      },
      {
        "id": "uuid",
        "name": "product:read",
        "description": "View products"
      }
    ]
  }
}
```

## Admin Users

### GET `/admin/users`

Get paginated list of regular users (non-admin).

#### Frontend Usage

Use this for admin user management tables, ban/flag user lists, or user analytics dashboards. Requires `user:read` permission.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `user:read` permission.

#### Zod Contract

```ts
query = {
  q?: string;
  name?: string;
  email?: string;
  roleName?: string;
  storeName?: string;
  isVerified?: boolean;
  sortBy?: "name" | "email" | "roleName" | "storeName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Query

| Param        | Type    | Default     | Description                                                         |
| ------------ | ------- | ----------- | ------------------------------------------------------------------- |
| `q`          | string  | -           | Search user name, email, role name, store name.                     |
| `name`       | string  | -           | Filter by user name.                                                |
| `email`      | string  | -           | Filter by email.                                                    |
| `roleName`   | string  | -           | Filter by role name.                                                |
| `storeName`  | string  | -           | Filter by store name.                                               |
| `isVerified` | boolean | -           | Filter by email verification status (`true` or `false`).            |
| `sortBy`     | enum    | `createdAt` | `name`, `email`, `roleName`, `storeName`, `createdAt`, `updatedAt`. |
| `sortOrder`  | enum    | `desc`      | `asc` or `desc`.                                                    |
| `page`       | number  | `1`         | Positive integer.                                                   |
| `limit`      | number  | `10`        | Positive integer, capped at `100`.                                  |

#### Request Example

```txt
GET /api/admin/users?isVerified=true&page=1&limit=20
```

#### Return

```json
{
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
      "isVerified": true,
      "role": {
        "id": "uuid",
        "name": "user"
      },
      "store": null,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### GET `/admin/users/:id`

Get a specific regular user detail.

#### Frontend Usage

Use this for user detail pages or to fetch user info for modification.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `user:read` permission.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Params

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | uuid | Yes      | User ID.    |

#### Return

```json
{
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
    "isVerified": true,
    "role": {
      "id": "uuid",
      "name": "user"
    },
    "store": null,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

## Admin Accounts

Manage admin users (superAdmin, storeAdmin). These endpoints require specific `adminAccount:*` permissions.

### POST `/admin/admin-accounts`

Create a new admin account.

#### Frontend Usage

Use this from the admin account creation form. `storeId` is required only when `roleId` points to `storeAdmin` role. SuperAdmin accounts do not need a `storeId`.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `adminAccount:create` permission.

#### Zod Contract

```ts
body = {
  name: string;
  email: string;
  password: string; // min 8 chars, 1+ uppercase, 1+ number
  roleId: uuid;
  storeId?: uuid;
}
```

#### Body

| Field      | Type   | Required | Description                                                         |
| ---------- | ------ | -------- | ------------------------------------------------------------------- |
| `name`     | string | Yes      | Admin name, min 1 character.                                        |
| `email`    | string | Yes      | Admin email, must be unique and valid format.                       |
| `password` | string | Yes      | Min 8 characters, must contain 1+ uppercase letter and 1+ number.   |
| `roleId`   | uuid   | Yes      | Must be a valid admin role with `admin:login` permission.           |
| `storeId`  | uuid   | No       | Required if role is `storeAdmin`; omitted/ignored for `superAdmin`. |

#### Request Example

```json
{
  "name": "Jane Admin",
  "email": "jane@grocergo.com",
  "password": "SecurePass123",
  "roleId": "uuid-of-storeAdmin-role",
  "storeId": "uuid-of-kemang-store"
}
```

#### Return

```json
{
  "message": "Admin account created successfully",
  "data": {
    "id": "uuid",
    "name": "Jane Admin",
    "email": "jane@grocergo.com",
    "avatar": null,
    "isVerified": true,
    "role": {
      "id": "uuid",
      "name": "storeAdmin"
    },
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    },
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

#### Possible Errors

- `400` when email is already in use, password doesn't meet requirements, or `storeId` is missing for `storeAdmin` role.
- `404` when `roleId` or `storeId` does not exist, or role does not have `admin:login` permission.

### GET `/admin/admin-accounts`

Get paginated list of admin accounts (both superAdmin and storeAdmin).

#### Frontend Usage

Use this for admin user management tables. Requires `adminAccount:read` permission. **StoreAdmin users will automatically see only admin accounts assigned to their own store; superAdmin users see all admin accounts across all stores.**

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `adminAccount:read` permission.

#### Store Scoping

- `superAdmin`: Returns all admin accounts from all stores.
- `storeAdmin`: Automatically filtered to return only admin accounts assigned to their own store.

#### Zod Contract

```ts
query = {
  q?: string;
  name?: string;
  email?: string;
  roleName?: string;
  roleId?: uuid;
  storeName?: string;
  storeId?: uuid;
  isVerified?: boolean;
  sortBy?: "name" | "email" | "roleName" | "storeName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Query

| Param        | Type    | Default     | Description                                                                                                  |
| ------------ | ------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `q`          | string  | -           | Search admin name, email, role name, store name.                                                             |
| `name`       | string  | -           | Filter by admin name.                                                                                        |
| `email`      | string  | -           | Filter by email.                                                                                             |
| `roleName`   | string  | -           | Filter by role name (`superAdmin`, `storeAdmin`).                                                            |
| `roleId`     | uuid    | -           | Filter by role ID.                                                                                           |
| `storeName`  | string  | -           | Filter by assigned store name (null for superAdmin). **For storeAdmin, ignored; uses their assigned store.** |
| `storeId`    | uuid    | -           | Filter by assigned store ID (null for superAdmin). **For storeAdmin, ignored; uses their assigned store.**   |
| `isVerified` | boolean | -           | Filter by verification status (`true` or `false`).                                                           |
| `sortBy`     | enum    | `createdAt` | `name`, `email`, `roleName`, `storeName`, `createdAt`, `updatedAt`.                                          |
| `sortOrder`  | enum    | `desc`      | `asc` or `desc`.                                                                                             |
| `page`       | number  | `1`         | Positive integer.                                                                                            |
| `limit`      | number  | `10`        | Positive integer, capped at `100`.                                                                           |

#### Request Examples

**SuperAdmin viewing all storeAdmin accounts:**

```txt
GET /api/admin/admin-accounts?roleName=storeAdmin&page=1&limit=20
```

Returns all `storeAdmin` accounts from all stores, paginated 20 per page.

**StoreAdmin viewing admins in their store:**

```txt
GET /api/admin/admin-accounts?page=1&limit=10
```

Even though no `storeId` filter is sent, the backend automatically restricts results to only admins assigned to the requester's store. Sending `storeId` in query params is ignored for `storeAdmin` — their own store is always used.

**StoreAdmin with search:**

```txt
GET /api/admin/admin-accounts?q=jane&page=1&limit=10
```

Searches for "jane" only among admins in their store.

#### Return

```json
{
  "message": "Admin accounts fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Jane Admin",
      "email": "jane@grocergo.com",
      "avatar": null,
      "isVerified": true,
      "role": {
        "id": "uuid",
        "name": "storeAdmin"
      },
      "store": {
        "id": "uuid",
        "name": "Grocergo Kemang",
        "latitude": "-6.260000",
        "longitude": "106.810000"
      },
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

#### Notes

- `meta.total` and `meta.totalPages` reflect **only the scoped results**:
  - **SuperAdmin**: Total count across all stores.
  - **StoreAdmin**: Total count of admins in their assigned store only.
- For storeAdmin, `storeId` and `storeName` query parameters are **ignored**; the backend always uses their assigned store.

### GET `/admin/admin-accounts/:id`

Get a specific admin account detail.

#### Frontend Usage

Use this for admin detail pages or edit forms. **StoreAdmin users can only view admin accounts assigned to their own store; superAdmin users can view any account.**

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `adminAccount:read` permission.

#### Store Scoping

- `superAdmin`: Can view any admin account.
- `storeAdmin`: Can only view admin accounts in their own store; returns `404` if the account is in a different store.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Params

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | uuid | Yes      | Admin ID.   |

#### Return

```json
{
  "message": "Admin account fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Jane Admin",
    "email": "jane@grocergo.com",
    "avatar": null,
    "isVerified": true,
    "role": {
      "id": "uuid",
      "name": "storeAdmin"
    },
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    },
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

### PATCH `/admin/admin-accounts/:id`

Update an admin account.

#### Frontend Usage

Use this from admin account edit forms. Password is optional; omit if not changing it. To remove a storeAdmin's store assignment, send `storeId: null`. Changing role from `storeAdmin` to `superAdmin` automatically clears the store assignment.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `adminAccount:update` permission.

#### Zod Contract

```ts
params = {
  id: uuid;
}

body = Partial<{
  name: string;
  email: string;
  password: string;
  roleId: uuid;
  storeId: uuid | null;
}>; // at least one field required
```

#### Params

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | uuid | Yes      | Admin ID.   |

#### Body

| Field      | Type         | Required | Description                                                                       |
| ---------- | ------------ | -------- | --------------------------------------------------------------------------------- |
| `name`     | string       | No       | New admin name, min 1 character.                                                  |
| `email`    | string       | No       | New email, must be unique if changed.                                             |
| `password` | string       | No       | New password, min 8 chars with 1+ uppercase and 1+ number. Only hash if provided. |
| `roleId`   | uuid         | No       | New role ID (must have `admin:login` permission).                                 |
| `storeId`  | uuid or null | No       | New store ID for `storeAdmin`, or `null` to remove store assignment.              |

#### Request Example

```json
{
  "email": "jane.new@grocergo.com",
  "storeId": "uuid-of-tebet-store"
}
```

#### Return

```json
{
  "message": "Admin account updated successfully",
  "data": {
    "id": "uuid",
    "name": "Jane Admin",
    "email": "jane.new@grocergo.com",
    "avatar": null,
    "isVerified": true,
    "role": {
      "id": "uuid",
      "name": "storeAdmin"
    },
    "store": {
      "id": "uuid",
      "name": "Grocergo Tebet",
      "latitude": "-6.270000",
      "longitude": "106.820000"
    },
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

#### Possible Errors

- `400` when email is already in use, password doesn't meet requirements, or role change creates invalid state.
- `404` when admin ID, `roleId`, or `storeId` does not exist.

### DELETE `/admin/admin-accounts/:id`

Soft delete an admin account.

#### Frontend Usage

Use this from admin account destructive action UI. After success, remove the admin from the table or refetch the list.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `adminAccount:delete` permission.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Params

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | uuid | Yes      | Admin ID.   |

#### Return

```json
{
  "message": "Admin account deleted successfully",
  "data": {
    "id": "uuid",
    "name": "Jane Admin",
    "email": "jane@grocergo.com",
    "avatar": null,
    "isVerified": true,
    "role": {
      "id": "uuid",
      "name": "storeAdmin"
    },
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    },
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

## Admin Dashboard

Analytics and summary endpoints for admin dashboards. Requires `dashboard:read` permission.

### GET `/admin/dashboard/summary`

Get global dashboard summary (total counts across entire system).

#### Frontend Usage

Use this on the main admin dashboard for system-wide KPIs: total stores, total users, admin counts, etc.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `dashboard:read` permission.

#### Zod Contract

```ts
// no params, query, or body
```

#### Return

```json
{
  "message": "Admin dashboard summary fetched successfully",
  "data": {
    "totalStores": 5,
    "totalRegisteredUsers": 250,
    "totalVerifiedUsers": 200,
    "totalAdminAccounts": 8,
    "totalStoreAdmins": 6,
    "totalSuperAdmins": 2
  }
}
```

### GET `/admin/dashboard/stores/:id/summary`

Get store-specific dashboard summary.

#### Frontend Usage

Use this on store detail or store admin dashboard. Shows admin counts and store info for a specific store. StoreAdmins can only view their own store; superAdmins can view any store.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and either `dashboard:read` or `store:read` permission.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Params

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | uuid | Yes      | Store ID.   |

#### Return

```json
{
  "message": "Store dashboard summary fetched successfully",
  "data": {
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    },
    "metrics": {
      "totalStoreAdmins": 3,
      "totalVerifiedStoreAdmins": 2
    },
    "storeAdmins": [
      {
        "id": "uuid",
        "name": "Jane Admin",
        "email": "jane@grocergo.com",
        "avatar": null,
        "isVerified": true
      }
    ]
  }
}
```

#### Possible Errors

- `403` when requester is a `storeAdmin` trying to access a store other than their own.
- `404` when store does not exist.

## Admin Stock

Read-only stock management endpoints for admins. All endpoints require `product:read` permission.

### GET `/admin/stock/store/:storeId`

Get paginated stock list for a specific store (admin view).

#### Frontend Usage

Use this for admin stock management tables and dashboards. **StoreAdmin users can only view stock for their own store; superAdmin users can view any store's stock.**

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:read` permission.

#### Store Scoping

- `superAdmin`: Can view stock for any store.
- `storeAdmin`: Automatically filtered to their assigned store; returns `404` if trying to access another store.

#### Zod Contract

```ts
params = {
  storeId: uuid;
}

query = {
  q?: string;
  productName?: string;
  sku?: string;
  brand?: string;
  categoryId?: uuid;
  categoryName?: string;
  minStock?: nonNegativeInt;
  maxStock?: nonNegativeInt;
  inStock?: boolean;
  sortBy?: "stock" | "productName" | "sku" | "brand" | "categoryName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Params

| Param     | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `storeId` | uuid | Yes      | Store ID.   |

#### Query

| Param          | Type    | Default       | Description                                                                                          |
| -------------- | ------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `q`            | string  | -             | Search product name, slug, SKU, brand, category name.                                                |
| `productName`  | string  | -             | Filter by product name.                                                                              |
| `sku`          | string  | -             | Filter by SKU.                                                                                       |
| `brand`        | string  | -             | Filter by brand.                                                                                     |
| `categoryId`   | uuid    | -             | Filter by category ID.                                                                               |
| `categoryName` | string  | -             | Filter by category name.                                                                             |
| `minStock`     | number  | -             | Minimum stock.                                                                                       |
| `maxStock`     | number  | -             | Maximum stock.                                                                                       |
| `inStock`      | boolean | -             | `true` means stock `> 0`; `false` means stock `<= 0`; omitted includes all stock rows including `0`. |
| `sortBy`       | enum    | `productName` | `stock`, `productName`, `sku`, `brand`, `categoryName`, `createdAt`, `updatedAt`.                    |
| `sortOrder`    | enum    | `asc`         | `asc` or `desc`.                                                                                     |
| `page`         | number  | `1`           | Positive integer.                                                                                    |
| `limit`        | number  | `10`          | Positive integer, capped at `100`.                                                                   |

#### Request Example

```txt
GET /api/admin/stock/store/<store-id>?inStock=false&page=1&limit=20
```

#### Return

```json
{
  "message": "Store stocks fetched successfully",
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "storeId": "uuid",
      "stock": 0,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null,
      "product": {
        "id": "uuid",
        "name": "Indomie Goreng",
        "slug": "indomie-goreng-1234",
        "categoryId": "uuid",
        "brand": "Indomie",
        "variant": "Original",
        "size": "85g",
        "description": "Instant fried noodle",
        "sku": "INS-IND-IND-ORI-85G",
        "price": 3500,
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z",
        "deletedAt": null,
        "category": {
          "id": "uuid",
          "name": "Instant Food"
        },
        "images": [
          {
            "id": "uuid",
            "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
            "position": 1
          }
        ]
      },
      "store": {
        "id": "uuid",
        "name": "Grocergo Kemang"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

#### Possible Errors

- `404` when store does not exist, or when storeAdmin tries to access another store.

### GET `/admin/stock/store/:storeId/product/:slug`

Get exact stock for one product in one store (admin view).

#### Frontend Usage

Use this for admin product detail pages or quick stock lookup. **StoreAdmin users can only view stock for products in their own store.**

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:read` permission.

#### Store Scoping

- `superAdmin`: Can view any product stock in any store.
- `storeAdmin`: Can only view stock for products in their assigned store; returns `404` if trying to access another store.

#### Zod Contract

```ts
params = {
  storeId: uuid;
  slug: string;
}
```

#### Params

| Param     | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| `storeId` | uuid   | Yes      | Store ID.     |
| `slug`    | string | Yes      | Product slug. |

#### Request Example

```txt
GET /api/admin/stock/store/<store-id>/product/indomie-goreng-1234
```

#### Return

```json
{
  "message": "Store product stock fetched successfully",
  "data": {
    "id": "uuid",
    "productId": "uuid",
    "storeId": "uuid",
    "stock": 5,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    },
    "product": {
      "id": "uuid",
      "name": "Indomie Goreng",
      "slug": "indomie-goreng-1234",
      "categoryId": "uuid",
      "brand": "Indomie",
      "variant": "Original",
      "size": "85g",
      "description": "Instant fried noodle",
      "sku": "INS-IND-IND-ORI-85G",
      "price": 3500,
      "category": {
        "id": "uuid",
        "name": "Instant Food"
      },
      "images": [
        {
          "id": "uuid",
          "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
          "position": 1
        }
      ]
    }
  }
}
```

#### Possible Errors

- `404` when store does not exist, product stock does not exist, or storeAdmin tries to access another store.

## Orders

Order endpoints are for logged-in users, not admin users.

### Order Rules

- All order endpoints require regular user `accessToken` verification.
- `POST /orders` chooses the nearest active store from the user's saved address.
- Product stock is validated against that nearest store before the transaction is created.
- Successful order creation decrements product stock and writes stock history.
- User status updates are limited to `cancel` and `confirmed`.

### GET `/orders`

Get paginated order list for the current user.

#### Frontend Usage

Use this for the user's order history page. Filters are optional and scoped to the authenticated user.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
query = {
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
```

#### Query

| Param       | Type   | Default | Description                                   |
| ----------- | ------ | ------- | --------------------------------------------- |
| `page`      | number | `1`     | Positive integer.                             |
| `limit`     | number | `10`    | Positive integer, capped at `100`.            |
| `status`    | string | -       | Filter by transaction status.                 |
| `startDate` | string | -       | Filter orders created at or after this date.  |
| `endDate`   | string | -       | Filter orders created at or before this date. |
| `search`    | string | -       | Accepted by schema; currently not applied.    |

#### Request Examples

```txt
GET /api/orders
GET /api/orders?status=waitingPayment&page=1&limit=10
GET /api/orders?startDate=2026-06-01&endDate=2026-06-10
```

#### Return

```json
{
  "message": "Orders fetched successfully",
  "data": [
    {
      "id": "uuid",
      "customerId": "uuid",
      "storeId": "uuid",
      "transactionStatus": "waitingPayment",
      "deliveryFee": 15000,
      "shipping_vendor": "JNE",
      "totalPrice": 57000,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null,
      "items": [
        {
          "id": "uuid",
          "transactionId": "uuid",
          "productId": "uuid",
          "name": "Fresh Milk",
          "quantity": 2,
          "totalPrice": 44000,
          "product": {
            "id": "uuid",
            "name": "Fresh Milk",
            "slug": "fresh-milk",
            "images": [
              {
                "id": "uuid",
                "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
                "position": 1
              }
            ]
          }
        }
      ],
      "store": {
        "id": "uuid",
        "name": "GrocerGo Jakarta"
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

### GET `/orders/:orderId`

Get one order detail owned by the current user.

#### Frontend Usage

Use this for order detail and payment/status pages.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
params = {
  orderId: uuid;
}
```

#### Params

| Param     | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `orderId` | uuid | Yes      | Order ID.   |

#### Return

```json
{
  "message": "Order fetched successfully",
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "storeId": "uuid",
    "transactionStatus": "waitingPayment",
    "deliveryFee": 15000,
    "shipping_vendor": "JNE",
    "totalPrice": 57000,
    "items": [],
    "store": {},
    "voucher": null,
    "deliveryVoucher": null,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

#### Possible Errors

- `403` when the order belongs to another user.
- `404` when the order does not exist.

### POST `/orders`

Create a new order for the current user.

#### Frontend Usage

Use this from checkout after the user selects an address, shipping vendor, and cart/product quantities. Backend determines the nearest store from the address coordinates.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
body = {
  addressId: uuid;
  shippingVendor: string;
  deliveryFee: nonNegativeInt;
  voucherId?: uuid;
  deliveryVoucherId?: uuid;
  items: Array<{
    productId: uuid;
    quantity: positiveInt;
    discountId?: uuid;
  }>; // min 1
}
```

#### Body

| Field               | Type   | Required | Description                    |
| ------------------- | ------ | -------- | ------------------------------ |
| `addressId`         | uuid   | Yes      | User address ID.               |
| `shippingVendor`    | string | Yes      | Shipping vendor name.          |
| `deliveryFee`       | number | Yes      | Whole number, minimum `0`.     |
| `voucherId`         | uuid   | No       | Transaction voucher ID.        |
| `deliveryVoucherId` | uuid   | No       | Delivery voucher ID.           |
| `items`             | array  | Yes      | Order items, minimum one item. |

`items` fields:

| Field        | Type   | Required | Description              |
| ------------ | ------ | -------- | ------------------------ |
| `productId`  | uuid   | Yes      | Product ID.              |
| `quantity`   | number | Yes      | Whole number, minimum 1. |
| `discountId` | uuid   | No       | Product discount ID.     |

#### Request Example

```json
{
  "addressId": "address-uuid",
  "shippingVendor": "JNE",
  "deliveryFee": 15000,
  "voucherId": "voucher-uuid",
  "deliveryVoucherId": "delivery-voucher-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "discountId": "discount-uuid"
    }
  ]
}
```

#### Return

```json
{
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "storeId": "uuid",
    "transactionStatus": "waitingPayment",
    "deliveryFee": 15000,
    "shipping_vendor": "JNE",
    "totalPrice": 57000,
    "voucherId": "uuid",
    "deliveryVoucherId": "uuid",
    "items": [
      {
        "id": "uuid",
        "transactionId": "uuid",
        "productId": "uuid",
        "name": "Fresh Milk",
        "quantity": 2,
        "totalPrice": 44000,
        "discountId": "uuid"
      }
    ]
  }
}
```

#### Possible Errors

- `404` when address does not exist, no nearby store is available, or a product is unavailable in the nearest store.
- `400` when stock is insufficient, voucher is invalid/expired, or discount does not match the product.

### PATCH `/orders/:orderId`

Update order status by the current user.

#### Frontend Usage

Use this for user-driven cancel and confirm actions. Backend validates allowed status transitions.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
params = {
  orderId: uuid;
}

body = {
  status: "cancel" | "confirmed";
}
```

#### Params

| Param     | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `orderId` | uuid | Yes      | Order ID.   |

#### Body

| Field    | Type | Required | Description                     |
| -------- | ---- | -------- | ------------------------------- |
| `status` | enum | Yes      | Either `cancel` or `confirmed`. |

#### Request Example

```json
{
  "status": "cancel"
}
```

#### Return

```json
{
  "message": "Order cancel successfully"
}
```

#### Possible Errors

- `400` when cancelling an order that is no longer `waitingPayment`, or confirming an order that is not `onDelivery`.
- `403` when the order belongs to another user.
- `404` when the order does not exist.

## Geocode

Geocode endpoints are public helpers for converting coordinates and place names.

### GET `/geocode/address`

Resolve coordinates into a human-readable address.

#### Frontend Usage

Use this after location picker/geolocation selection to display the resolved address label.

#### Zod Contract

```ts
query = {
  lat: number; // -90 to 90
  lng: number; // -180 to 180
}
```

#### Query

| Param | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| `lat` | number | Yes      | Latitude.   |
| `lng` | number | Yes      | Longitude.  |

#### Request Example

```txt
GET /api/geocode/address?lat=-6.200000&lng=106.816666
```

#### Return

```json
{
  "message": "Address resolved successfully",
  "data": {
    "label": "Jakarta, Indonesia",
    "lat": -6.2,
    "lng": 106.816666
  }
}
```

### GET `/geocode/coordinates`

Resolve a place name into coordinates.

#### Frontend Usage

Use this for address search/autocomplete flows when the user types a place name.

#### Zod Contract

```ts
query = {
  q: string;
}
```

#### Query

| Param | Type   | Required | Description           |
| ----- | ------ | -------- | --------------------- |
| `q`   | string | Yes      | Place/address search. |

#### Request Example

```txt
GET /api/geocode/coordinates?q=Jakarta
```

#### Return

```json
{
  "message": "Coordinates resolved successfully",
  "data": {
    "label": "Jakarta, Indonesia",
    "lat": -6.1753942,
    "lng": 106.827183
  }
}
```

#### Possible Errors

- `404` when the location cannot be resolved.
- `502` when the geocoding provider is unavailable.

## Error Status

| Status | Meaning                                                                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | Invalid input, invalid cart/order state, insufficient stock, invalid voucher/discount, invalid image payload, or deleting the last image.    |
| `401`  | Missing or invalid user/admin token.                                                                                                         |
| `403`  | User does not own a resource, admin lacks required permission, or admin is not assigned to a required store.                                 |
| `404`  | Category, product, product image, store, stock, address, order, or geocode location was not found. Outside-scope admin resources may be 404. |
| `500`  | Cloudinary upload/delete cleanup or unexpected operation failed.                                                                             |
| `502`  | External geocoding service is unavailable.                                                                                                   |
