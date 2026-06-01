# API Docs

Dokumen ini mencakup semua endpoint yang terdaftar di aplikasi kecuali module `auth` (`/api/auth/*`).

Base URL route yang tersedia:

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `POST /api/admin/auth/refresh`
- `GET /api/admin/auth/me`
- `GET /api/admin/dashboard/summary`
- `POST /api/admin/admin-accounts`
- `GET /api/admin/admin-accounts`
- `GET /api/admin/admin-accounts/:id`
- `PATCH /api/admin/admin-accounts/:id`
- `DELETE /api/admin/admin-accounts/:id`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `GET /api/stores`
- `GET /api/stores/:id`
- `POST /api/stores`
- `PATCH /api/stores/:id`
- `DELETE /api/stores/:id`

## Global Notes

- Semua response sukses berbentuk JSON.
- Semua response error saat ini minimal berbentuk:

```json
{
  "message": "Some error message"
}
```

- Endpoint user/non-admin yang memakai `verifyAccessToken` butuh cookie `accessToken`.
- Endpoint admin yang memakai `verifyAdminAccessToken` butuh cookie `adminAccessToken`.
- Endpoint `POST /api/admin/auth/refresh` butuh cookie `adminRefreshToken`.
- Authorization lanjutan memakai permission guard.
- Validasi request memakai Zod. Saat validasi gagal, API mengembalikan HTTP `400` dengan `message` dari error pertama.
- Pagination meta berbentuk:

```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3
}
```

## Common Error Responses

Error berikut bisa muncul di banyak endpoint:

- `400` validation error dari Zod
- `401` `Unauthorized`
- `401` `Invalid token`
- `401` `Token expired`
- `403` `Forbidden`
- `404` `Route not found`
- `409` `Already exists`
- `500` error internal lain

## Admin Auth

Base path: `/api/admin/auth`

Response `data` untuk ketiga endpoint berikut sekarang seragam dan siap dipakai frontend sebagai admin session:

```json
{
  "id": "uuid",
  "name": "Admin",
  "email": "admin@example.com",
  "avatar": null,
  "isVerified": true,
  "role": "superAdmin",
  "roleId": "uuid",
  "store": {
    "id": "uuid",
    "name": "Main Store",
    "latitude": "1.234",
    "longitude": "2.345"
  }
}
```

Catatan:

- `store` bisa `null`
- `role` adalah string untuk route guard frontend
- `roleId` ikut disediakan untuk kebutuhan query atau mutation berikutnya
- response session ini tidak menyertakan permission list
- response session ini tidak menyertakan `referralCode`, `createdAt`, `updatedAt`, atau field audit lain

### POST `/login`

Admin login. Tidak butuh token.

Request body:

```json
{
  "email": "admin@example.com",
  "password": "Secret123"
}
```

Body rules:

- `email`: wajib, harus format email valid
- `password`: wajib, minimal panjang `1`

Success `200`:

```json
{
  "message": "Admin login successful",
  "data": {
    "name": "Admin",
    "id": "uuid",
    "email": "admin@example.com",
    "avatar": null,
    "isVerified": true,
    "role": "superAdmin",
    "roleId": "uuid",
    "store": {
      "id": "uuid",
      "name": "Main Store",
      "latitude": "1.234",
      "longitude": "2.345"
    }
  }
}
```

Catatan:

- Response juga menyetel cookie `adminAccessToken` dan `adminRefreshToken`.
- Token payload internal tetap terpisah dan tidak diubah; response di atas adalah session shape untuk frontend.

Possible error messages:

- `400` `Email format is invalid`
- `400` `Password is required`
- `401` `Email or password is incorrect`
- `403` `Only admin users can access the admin dashboard`

### POST `/logout`

Logout admin. Butuh `adminAccessToken`.

Request body: tidak ada.

Success `200`:

```json
{
  "message": "Admin logout successful"
}
```

Catatan:

- Endpoint ini membersihkan cookie `adminAccessToken` dan `adminRefreshToken`.

Possible error messages:

- `401` `Unauthorized`
- `401` `Invalid token`
- `401` `Token expired`

### POST `/refresh`

Refresh token admin. Butuh `adminRefreshToken`.

Request body: tidak ada.

Success `200`:

```json
{
  "message": "Admin token refreshed successfully",
  "data": {
    "name": "Admin",
    "id": "uuid",
    "email": "admin@example.com",
    "avatar": null,
    "isVerified": true,
    "role": "superAdmin",
    "roleId": "uuid",
    "store": {
      "id": "uuid",
      "name": "Main Store",
      "latitude": "1.234",
      "longitude": "2.345"
    }
  }
}
```

Catatan:

- Endpoint ini menyetel ulang cookie `adminAccessToken` dan `adminRefreshToken`.
- Jika gagal karena `401`, controller akan mencoba membersihkan kedua cookie.

Possible error messages:

- `401` `Unauthorized`
- `401` `Invalid token`
- `401` `Token expired`
- `403` `Only admin users can access the admin dashboard`

### GET `/me`

Ambil profil admin yang sedang login. Butuh `adminAccessToken`.

Request query: tidak ada.

Success `200`:

```json
{
  "message": "Admin profile fetched successfully",
  "data": {
    "name": "Admin",
    "id": "uuid",
    "email": "admin@example.com",
    "avatar": null,
    "isVerified": true,
    "role": "superAdmin",
    "roleId": "uuid",
    "store": {
      "id": "uuid",
      "name": "Main Store",
      "latitude": "1.234",
      "longitude": "2.345"
    }
  }
}
```

Catatan:

- Shape `GET /me` sekarang sama dengan `POST /login` dan `POST /refresh`.

Possible error messages:

- `401` `Unauthorized`
- `401` `Invalid token`
- `401` `Token expired`
- `403` `Only admin users can access the admin dashboard`

## Admin Dashboard

Base path: `/api/admin/dashboard`

Semua endpoint di module ini butuh:

- `adminAccessToken`
- permission guard sesuai endpoint

### GET `/summary`

Ambil summary angka untuk super admin dashboard.

Permission:

- `dashboard:read`

Success `200`:

```json
{
  "message": "Admin dashboard summary fetched successfully",
  "data": {
    "totalStores": 3,
    "totalRegisteredUsers": 120,
    "totalVerifiedUsers": 95,
    "totalAdminAccounts": 5,
    "totalStoreAdmins": 4,
    "totalSuperAdmins": 1
  }
}
```

Catatan:

- Endpoint ini hanya melakukan query count.
- Cocok untuk dashboard cards.
- Endpoint ini ditujukan untuk halaman frontend `/admin/dashboard` milik `superAdmin`.
- Jika frontend butuh recent list, tetap gunakan endpoint list dengan `limit=5`.
- Untuk dashboard awal yang informatif, frontend bisa menggabungkan endpoint ini dengan:
  - `GET /api/stores?limit=5`
  - `GET /api/admin/admin-accounts?limit=5`
  - `GET /api/admin/users?limit=5`

Possible error messages:

- `401` `Unauthorized`
- `403` `Forbidden`

## Admin Management

Base path: `/api/admin/admin-accounts`

Semua endpoint di module ini butuh:

- `adminAccessToken`
- permission guard sesuai endpoint

Response object `data` untuk admin account umumnya mengandung relasi `role` dan `store`, tetapi tidak mengandung `password`, `roleId`, atau `storeId`.

### POST `/`

Buat admin account baru.

Permission:

- `adminAccount:create`

Request body:

```json
{
  "name": "Store Admin A",
  "email": "storeadmin@example.com",
  "password": "Secret123",
  "roleId": "uuid",
  "storeId": "uuid"
}
```

Body rules:

- `name`: wajib
- `email`: wajib, format email valid
- `password`: wajib, minimal `8`, harus punya `1` huruf besar dan `1` angka
- `roleId`: wajib, UUID valid
- `storeId`: opsional, UUID valid

Business rules:

- email tidak boleh sudah dipakai
- `roleId` harus role yang punya permission `admin:login`
- jika role target adalah `storeAdmin`, `storeId` wajib ada
- jika `storeId` dikirim, store harus ada

Success `201`:

```json
{
  "message": "Admin account created successfully",
  "data": {
    "id": "uuid",
    "name": "Store Admin A",
    "email": "storeadmin@example.com",
    "avatar": null,
    "isVerified": true,
    "referralCode": null,
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z",
    "deletedAt": null,
    "role": {
      "id": "uuid",
      "name": "storeAdmin",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null
    },
    "store": {
      "id": "uuid",
      "name": "Main Store",
      "latitude": "1.234",
      "longitude": "2.345",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null
    }
  }
}
```

Possible error messages:

- `400` `Name is required`
- `400` `Email format is invalid`
- `400` `Password must be at least 8 characters`
- `400` `Password must contain an uppercase letter`
- `400` `Password must contain a number`
- `400` `Role ID is invalid`
- `400` `Store ID is invalid`
- `400` `Email is already in use`
- `400` `Role is not allowed for admin account`
- `400` `Store ID is required for store admin`
- `404` `Role was not found`
- `404` `Store was not found`
- `401` `Unauthorized`
- `403` `Forbidden`

### GET `/`

Ambil list admin accounts.

Permission:

- `adminAccount:read`

Available query params:

- `q?: string`
- `name?: string`
- `email?: string`
- `roleName?: string`
- `storeName?: string`
- `isVerified?: boolean`
- `sortBy?: "name" | "email" | "roleName" | "storeName" | "createdAt" | "updatedAt"` default `createdAt`
- `sortOrder?: "asc" | "desc"` default `desc`
- `page?: positive integer` default `1`
- `limit?: positive integer` default `10`, maksimum efektif `100`

Filter behavior:

- `q`, `name`, `email`, `roleName`, `storeName` memakai `contains` case-insensitive
- hanya user dengan role yang punya permission `admin:login` yang akan masuk list

Example query:

```txt
/api/admin/admin-accounts?q=admin&isVerified=true&sortBy=createdAt&sortOrder=desc&page=1&limit=10
```

Success `200`:

```json
{
  "message": "Admin accounts fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Store Admin A",
      "email": "storeadmin@example.com",
      "avatar": null,
      "isVerified": true,
      "referralCode": null,
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null,
      "role": {
        "id": "uuid",
        "name": "storeAdmin",
        "createdAt": "2026-06-01T00:00:00.000Z",
        "updatedAt": "2026-06-01T00:00:00.000Z",
        "deletedAt": null
      },
      "store": {
        "id": "uuid",
        "name": "Main Store",
        "latitude": "1.234",
        "longitude": "2.345",
        "createdAt": "2026-06-01T00:00:00.000Z",
        "updatedAt": "2026-06-01T00:00:00.000Z",
        "deletedAt": null
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

Possible error messages:

- `400` error query validation
- `401` `Unauthorized`
- `403` `Forbidden`

### GET `/:id`

Ambil detail satu admin account.

Permission:

- `adminAccount:read`

Path params:

- `id`: UUID valid

Success `200`:

```json
{
  "message": "Admin account fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Store Admin A",
    "email": "storeadmin@example.com",
    "avatar": null,
    "isVerified": true,
    "referralCode": null,
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z",
    "deletedAt": null,
    "role": {
      "id": "uuid",
      "name": "storeAdmin",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null
    },
    "store": {
      "id": "uuid",
      "name": "Main Store",
      "latitude": "1.234",
      "longitude": "2.345",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null
    }
  }
}
```

Possible error messages:

- `400` `Admin account ID is invalid`
- `404` `Admin account was not found`
- `401` `Unauthorized`
- `403` `Forbidden`

### PATCH `/:id`

Update admin account.

Permission:

- `adminAccount:update`

Path params:

- `id`: UUID valid

Request body, semua field opsional tetapi minimal satu field harus dikirim:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "NewSecret123",
  "roleId": "uuid",
  "storeId": "uuid"
}
```

Special cases:

- `storeId: null` berarti disconnect store
- jika role akhir adalah `storeAdmin`, store wajib tersedia
- jika role akhir adalah `superAdmin`, service saat ini akan memaksa `storeId` menjadi `null`

Success `200`:

```json
{
  "message": "Admin account updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "email": "updated@example.com",
    "avatar": null,
    "isVerified": true,
    "referralCode": null,
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z",
    "deletedAt": null,
    "role": {
      "id": "uuid",
      "name": "superAdmin",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null
    },
    "store": null
  }
}
```

Possible error messages:

- `400` `At least one field is required`
- `400` validation error untuk field body
- `400` `Email is already in use`
- `400` `Role is not allowed for admin account`
- `400` `Store ID is required for store admin`
- `404` `Admin account was not found`
- `404` `Role was not found`
- `404` `Store was not found`
- `401` `Unauthorized`
- `403` `Forbidden`

### DELETE `/:id`

Soft delete admin account.

Permission:

- `adminAccount:delete`

Path params:

- `id`: UUID valid

Success `200`:

```json
{
  "message": "Admin account deleted successfully",
  "data": {
    "id": "uuid",
    "name": "Store Admin A",
    "email": "storeadmin@example.com",
    "avatar": null,
    "isVerified": true,
    "referralCode": null,
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z",
    "deletedAt": "2026-06-01T01:00:00.000Z",
    "role": {
      "id": "uuid",
      "name": "storeAdmin",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null
    },
    "store": {
      "id": "uuid",
      "name": "Main Store",
      "latitude": "1.234",
      "longitude": "2.345",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null
    }
  }
}
```

Possible error messages:

- `400` `Admin account ID is invalid`
- `404` `Admin account was not found`
- `401` `Unauthorized`
- `403` `Forbidden`

## User Management

Base path: `/api/admin/users`

Semua endpoint di module ini butuh:

- `adminAccessToken`
- permission `user:read`

Response user di module ini sudah menghapus `password`, `roleId`, dan `storeId`, tetapi masih menyertakan relasi `role` dan `store`.

### GET `/`

Ambil list user.

Available query params:

- `q?: string`
- `name?: string`
- `email?: string`
- `roleName?: string`
- `storeName?: string`
- `isVerified?: boolean`
- `sortBy?: "name" | "email" | "roleName" | "storeName" | "createdAt" | "updatedAt"` default `createdAt`
- `sortOrder?: "asc" | "desc"` default `desc`
- `page?: positive integer` default `1`
- `limit?: positive integer` default `10`, maksimum efektif `100`

Filter behavior:

- `q`, `name`, `email`, `roleName`, `storeName` memakai `contains` case-insensitive

Success `200`:

```json
{
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Dummy Fabio",
      "email": "dummy.1.fabio@example.com",
      "avatar": null,
      "isVerified": true,
      "referralCode": null,
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null,
      "role": {
        "id": "uuid",
        "name": "user",
        "createdAt": "2026-06-01T00:00:00.000Z",
        "updatedAt": "2026-06-01T00:00:00.000Z",
        "deletedAt": null
      },
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

Possible error messages:

- `400` error query validation
- `401` `Unauthorized`
- `403` `Forbidden`

### GET `/:id`

Ambil detail satu user.

Path params:

- `id`: UUID valid

Success `200`:

```json
{
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Dummy Fabio",
    "email": "dummy.1.fabio@example.com",
    "avatar": null,
    "isVerified": true,
    "referralCode": null,
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z",
    "deletedAt": null,
    "role": {
      "id": "uuid",
      "name": "user",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "deletedAt": null
    },
    "store": null
  }
}
```

Possible error messages:

- `400` `User ID is invalid`
- `404` `User was not found`
- `401` `Unauthorized`
- `403` `Forbidden`

## Store

Base path: `/api/stores`

### GET `/`

Ambil list store. Endpoint ini public.

Available query params:

- `q?: string`
- `name?: string`
- `sortBy?: "name" | "createdAt" | "updatedAt"` default `name`
- `sortOrder?: "asc" | "desc"` default `asc`
- `page?: positive integer` default `1`
- `limit?: positive integer` default `10`, maksimum efektif `100`

Filter behavior:

- `q` dan `name` memakai `contains` case-insensitive

Success `200`:

```json
{
  "message": "Stores fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Main Store",
      "latitude": "1.234",
      "longitude": "2.345",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
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

Possible error messages:

- `400` invalid query enum/number

### GET `/:id`

Ambil detail store. Endpoint ini public.

Path params:

- `id`: UUID valid

Success `200`:

```json
{
  "message": "Store fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Main Store",
    "latitude": "1.234",
    "longitude": "2.345",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

Possible error messages:

- `400` `Store ID is invalid`
- `404` `Store was not found`

### POST `/`

Buat store baru.

Auth:

- butuh `adminAccessToken`
- permission `store:create`
- permission ini diberikan ke `superAdmin`

Request body:

```json
{
  "name": "Main Store",
  "latitude": -6.2,
  "longitude": 106.8
}
```

Body rules:

- `name`: wajib
- `latitude`: opsional, range `-90` sampai `90`
- `longitude`: opsional, range `-180` sampai `180`

Success `201`:

```json
{
  "message": "Store created successfully",
  "data": {
    "id": "uuid",
    "name": "Main Store",
    "latitude": "1.234",
    "longitude": "2.345",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

Possible error messages:

- `400` `Name is required`
- `400` `Latitude is too small`
- `400` `Latitude is too large`
- `400` `Longitude is too small`
- `400` `Longitude is too large`
- `400` `Store name is already in use`
- `401` `Unauthorized`
- `403` `Forbidden`

### PATCH `/:id`

Update store.

Auth:

- butuh `adminAccessToken`
- permission `store:update`
- permission ini diberikan ke `superAdmin`

Path params:

- `id`: UUID valid

Request body, minimal satu field wajib ada:

```json
{
  "name": "Updated Store",
  "latitude": -6.21,
  "longitude": 106.81
}
```

Special cases:

- `latitude` bisa `null`
- `longitude` bisa `null`

Success `200`:

```json
{
  "message": "Store updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Store",
    "latitude": "1.234",
    "longitude": "2.345",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

Possible error messages:

- `400` `At least one field is required`
- `400` validation error body
- `400` `Store name is already in use`
- `404` `Store was not found`
- `401` `Unauthorized`
- `403` `Forbidden`

### DELETE `/:id`

Soft delete store.

Auth:

- butuh `adminAccessToken`
- permission `store:delete`
- permission ini diberikan ke `superAdmin`

Path params:

- `id`: UUID valid

Success `200`:

```json
{
  "message": "Store deleted successfully"
}
```

Possible error messages:

- `400` `Store ID is invalid`
- `404` `Store was not found`
- `401` `Unauthorized`
- `403` `Forbidden`

## Frontend Integration Notes

- Semua endpoint auth admin menggunakan cookie `adminAccessToken` dan `adminRefreshToken`, bukan bearer token di response header.
- Setelah `POST /api/admin/auth/login`, frontend sebaiknya memanggil `GET /api/admin/auth/me`, lalu redirect berdasarkan `role`:
  - `superAdmin` ke `/admin/dashboard`
  - `storeAdmin` ke `/admin/store/dashboard`
- `GET /api/admin/dashboard/summary` hanya untuk dashboard `superAdmin`.
- Untuk endpoint list, frontend sebaiknya selalu mengirim `page`, `limit`, `sortBy`, dan `sortOrder` secara eksplisit supaya state tabel konsisten.
- Untuk endpoint update yang bersifat `PATCH`, frontend sebaiknya hanya mengirim field yang berubah.
- Untuk `PATCH /api/admin/admin-accounts/:id`, kirim `storeId: null` jika memang ingin melepas store, kecuali role akhirnya `superAdmin` karena service saat ini juga mencoba memaksa disconnect.
- Untuk endpoint list admin/user, response sudah include relasi `role` dan `store`, jadi frontend tidak perlu request tambahan hanya untuk render nama role/store.
