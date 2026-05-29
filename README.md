# GrocerGo — Frontend

React 19 · Vite · TypeScript · Tailwind 4 · shadcn · React Router 7 · Zustand · Axios · Formik + Yup

---

## Getting started

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev            # http://localhost:5173
```

The backend must be running first (`cd ../backend-grocery && npm run dev`, port 5000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build (run before pushing) |
| `npm run lint` | ESLint |

---

## Project structure

```
src/
  lib/              # axios instance, error helpers
  store/            # global Zustand stores (auth)
  types/            # shared types: ApiResponse, User
  hooks/            # shared hooks (usePageTitle)
  components/
    ui/             # shadcn components
    layout/         # Navbar, RootLayout, AuthLayout
    form/           # shared form fields (TextField)
  routes/           # AppRoutes.tsx — route table
  features/
    auth/           # ← reference implementation, read this first
    home/           # homepage placeholder
```

### Each feature folder looks like this

```
features/<feature>/
  pages/      route-level screens
  components/ feature-only forms & widgets
  services/   API calls for this feature
  schemas/    Yup validation schemas
  types/      feature-only TypeScript types
```

**`src/features/auth/` is the reference.** Copy its pattern for every new feature.

---

## Adding a new feature (step by step)

1. Create `src/features/<your-feature>/` with the sub-folders above.
2. Write API calls in `services/<feature>.service.ts` — use the shared `api` instance:
   ```ts
   import api from "@/lib/axios"
   ```
3. Write Yup schemas in `schemas/<feature>.schemas.ts` — mirror the backend Zod rules.
4. Build pages in `pages/`, call `usePageTitle("...")` at the top of each one.
5. Register routes in `src/routes/AppRoutes.tsx`.
   - Wrap protected pages with `<ProtectedRoute>`.
   - Wrap logged-out-only pages with `<PublicOnlyRoute>`.

### The one hard rule

**Shared code (`lib/`, `store/`, `components/`, `types/`) must not import from `features/`.**  
Features may import shared code freely.  
`routes/AppRoutes.tsx` is the only exception.

---

## Auth (do not re-implement)

Tokens live in httpOnly cookies — the frontend never touches them. Everything is automatic:

- `api` already has `withCredentials: true`.
- A 401 response triggers one silent refresh (`POST /auth/refresh`) and retries the original request.
- If refresh fails, the session is cleared and guards redirect to `/login`.

To read the current user anywhere:

```ts
import { useAuthStore } from "@/store/auth.store"

const user = useAuthStore((s) => s.user)     // User | null
const status = useAuthStore((s) => s.status) // "loading" | "authenticated" | "unauthenticated"
```

---

## Forms

Use Formik + the shared `<TextField />` component. Handle server errors with:

```ts
import { getErrorMessage } from "@/lib/error"
import { toast } from "sonner"

toast.error(getErrorMessage(error))
```

---

## UI components

shadcn is pre-configured (style: radix-nova). Components already installed:
`Button`, `Input`, `Label`, `Card`, `Avatar`, `DropdownMenu`, `Toaster`.

Add more:
```bash
npx shadcn@latest add <component-name>
```

---

## PRD requirements (graded — do not skip)

| Requirement | Rule |
|---|---|
| Language | All UI text must be in **English** |
| Lists | Pagination + filter + sort must be **server-side** (send as query params) |
| Validation | Validate every input **client-side AND server-side**; validate file type + size |
| Responsive | Mobile-first; test on both mobile and desktop widths |
| File extension | Use `.tsx` for any file containing JSX |
| Clean code | ≤ 200 lines per file · ≤ 15 lines per function |
| Before pushing | Remove unused `console.log`s and dead code |

---

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL including `/api` prefix (e.g. `http://localhost:5000/api`) |

Copy `.env.example` to `.env`. The `.env` file is git-ignored and must never be committed.
