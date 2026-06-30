# Super Admin Frontend — Implementation Plan

## Context

This is the frontend dashboard for JPay's Super Admin, built as a separate React application at `/jpayv1/super_admin/`. It mirrors the tech stack of the existing `merchant_admin` app and consumes the backend's `/api/v1/admin/` endpoints.

---

## 1. Tech Stack

Matches `merchant_admin` for consistency:

| Tech | Version | Purpose |
|------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool (port 8081 for dev) |
| React Router DOM | 6.x | Routing |
| TanStack React Query | 5.x | Server state & caching |
| shadcn/ui + Radix UI | latest | Component library |
| Tailwind CSS | 3.x | Styling |
| Recharts | 2.x | Charts & data visualization |
| React Hook Form + Zod | latest | Form handling & validation |
| Lucide React | latest | Icons |
| Sonner | latest | Toast notifications |
| jsPDF + xlsx | latest | PDF/Excel export |

---

## 2. Project Structure

```
super_admin/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx                    # Router setup
│   ├── config/
│   │   └── api.ts                 # API_BASE_URL config
│   ├── contexts/
│   │   └── AuthContext.tsx         # Super admin auth state, JWT handling
│   ├── services/
│   │   ├── api.ts                 # Axios/fetch instance with auth interceptor
│   │   ├── merchants.ts           # Merchant API calls
│   │   ├── applications.ts        # Application review API calls
│   │   ├── transactions.ts        # Collections & payouts API calls
│   │   ├── settlements.ts         # Settlement API calls
│   │   ├── customers.ts           # Customer API calls
│   │   ├── analytics.ts           # Analytics API calls
│   │   └── audit.ts               # Audit log API calls
│   ├── hooks/
│   │   ├── useMerchants.ts        # React Query hooks for merchants
│   │   ├── useApplications.ts     # React Query hooks for applications
│   │   ├── useTransactions.ts     # React Query hooks for transactions
│   │   ├── useAnalytics.ts        # React Query hooks for analytics
│   │   └── useAuth.ts             # Auth hook
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx    # Sidebar + header layout
│   │   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   │   └── Header.tsx             # Top bar with admin info
│   │   ├── ui/                        # shadcn/ui components
│   │   ├── merchants/
│   │   │   ├── MerchantTable.tsx
│   │   │   ├── MerchantDetail.tsx
│   │   │   ├── MerchantDocuments.tsx   # KYC document viewer
│   │   │   └── MerchantStatusBadge.tsx
│   │   ├── applications/
│   │   │   ├── ApplicationList.tsx
│   │   │   ├── ApplicationReview.tsx   # Full review with approve/reject
│   │   │   └── DocumentViewer.tsx      # PDF/image viewer for KYC docs
│   │   ├── transactions/
│   │   │   ├── CollectionsTable.tsx
│   │   │   ├── PayoutsTable.tsx
│   │   │   └── TransactionDetail.tsx
│   │   ├── analytics/
│   │   │   ├── OverviewCards.tsx       # Summary stat cards
│   │   │   ├── RevenueChart.tsx        # Revenue over time
│   │   │   ├── TransactionVolumeChart.tsx
│   │   │   ├── MerchantGrowthChart.tsx
│   │   │   └── GatewayBreakdown.tsx
│   │   ├── settlements/
│   │   │   ├── SettlementTable.tsx
│   │   │   └── SettlementDetail.tsx
│   │   └── common/
│   │       ├── DataTable.tsx           # Reusable paginated table
│   │       ├── FilterBar.tsx           # Common filter controls
│   │       ├── DateRangePicker.tsx
│   │       ├── MerchantSelect.tsx      # Merchant dropdown filter
│   │       ├── StatusBadge.tsx
│   │       ├── ExportButton.tsx        # PDF/Excel export
│   │       └── LoadingSpinner.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── ChangePassword.tsx          # First login password change
│   │   ├── Dashboard.tsx               # Overview with analytics
│   │   ├── merchants/
│   │   │   ├── MerchantList.tsx
│   │   │   └── MerchantDetail.tsx
│   │   ├── applications/
│   │   │   ├── ApplicationList.tsx
│   │   │   └── ApplicationReview.tsx
│   │   ├── transactions/
│   │   │   ├── Collections.tsx
│   │   │   └── Payouts.tsx
│   │   ├── settlements/
│   │   │   └── Settlements.tsx
│   │   ├── customers/
│   │   │   └── Customers.tsx
│   │   └── audit/
│   │       └── AuditLog.tsx
│   ├── types/
│   │   ├── merchant.ts
│   │   ├── transaction.ts
│   │   ├── settlement.ts
│   │   ├── analytics.ts
│   │   └── common.ts
│   ├── utils/
│   │   ├── formatters.ts             # Currency, date, phone formatters
│   │   └── constants.ts              # Status labels, colors, etc.
│   ├── lib/
│   │   └── utils.ts                  # shadcn/ui cn() utility
│   └── assets/
│       └── logo.svg
├── .env
├── .env.development
├── .env.staging
├── .env.production
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json                    # shadcn/ui config
└── firebase.json                      # Firebase Hosting config
```

---

## 3. Pages & Routes

```typescript
const routes = [
  // Public
  { path: "/login",              element: <Login /> },
  { path: "/change-password",    element: <ChangePassword /> },

  // Protected (requires SuperAdmin auth)
  { path: "/",                   element: <Dashboard /> },
  { path: "/merchants",          element: <MerchantList /> },
  { path: "/merchants/:id",      element: <MerchantDetail /> },
  { path: "/applications",       element: <ApplicationList /> },
  { path: "/applications/:id",   element: <ApplicationReview /> },
  { path: "/collections",        element: <Collections /> },
  { path: "/payouts",            element: <Payouts /> },
  { path: "/settlements",        element: <Settlements /> },
  { path: "/customers",          element: <Customers /> },
  { path: "/audit-log",          element: <AuditLog /> },
];
```

---

## 4. Page Descriptions

### 4a. Dashboard (Home)

The main overview page showing platform-wide stats.

**Layout:**
- **Top row:** 6 stat cards — Total Merchants, Active Merchants, Pending Applications, Today's Collections (count + amount), Today's Payouts (count + amount), Platform Revenue
- **Middle row:** Two charts side-by-side
  - Transaction Volume chart (line/bar, daily/weekly/monthly toggle)
  - Revenue Trend chart (line chart)
- **Bottom row:** Two panels
  - Recent pending applications (quick-action table with approve/reject)
  - Recent transactions (latest collections + payouts combined)
- **Global filter:** Merchant dropdown + date range picker at top

### 4b. Merchants Page

**List view:**
- Searchable, paginated table of all merchants
- Columns: Name, Email, Phone, Status (active/inactive), Profile Status, Created Date
- Filters: Status (active/inactive), Profile Status, search
- Actions: View detail, Activate/Deactivate toggle

**Detail view:**
- Tabs: Overview | Profile | Documents | Wallets | Apps | Operators | Transactions
- **Overview tab:** Merchant info, quick stats (total collections, payouts, customers)
- **Profile tab:** Business details, directors
- **Documents tab:** KYC document viewer (certificate of incorporation, tax pin, director resolutions) with download buttons
- **Wallets tab:** Collection + Payout wallet balances, recent wallet transactions
- **Apps tab:** List of merchant's API apps with status, approve/reject actions
- **Operators tab:** List of merchant's team members
- **Transactions tab:** Merchant-scoped collections, payouts, settlements

### 4c. Applications Page

**List view:**
- Table of merchant applications filtered by status
- Default: Show "pending" and "review" status
- Columns: Merchant Name, Email, Business Type, Industry, Submitted Date, Status
- Quick-action buttons: Review, Approve, Reject

**Review view:**
- Full application details in a structured layout
- Side-by-side: Business info | Documents
- Document viewer with zoom/download
- Director information section
- Action panel: Approve, Reject (with reason textarea), Request More Info (with message)
- Previous review history if any

### 4d. Collections Page

- Paginated table of all collections across merchants
- Columns: Ref No, Merchant, Amount, Status, Gateway, Pay From, Date
- Filters: Merchant, Status, Gateway, Date Range, Amount Range, Search
- Click row → modal/drawer with full details
- Export to PDF/Excel

### 4e. Payouts Page

- Same structure as Collections
- Columns: Ref No, Merchant, Amount, Status, Gateway, Pay To, Date
- Same filter set

### 4f. Settlements Page

- Paginated table of all settlements
- Columns: Ref No, Merchant, Amount, Commission, Net Amount, Status, Channel, Date
- Filters: Merchant, Status, Date Range
- Admin actions: Approve, Reject pending settlements
- Click row → detail drawer

### 4g. Customers Page

- Paginated table of all customers across merchants
- Columns: Name, Email, Account Number, Merchant, Status, Created Date
- Filters: Merchant, Status, Search
- Click row → customer detail with associated merchant info

### 4h. Audit Log Page

- Paginated table of admin actions
- Columns: Admin, Action, Target, Details, IP Address, Timestamp
- Filters: Admin, Action Type, Date Range
- Read-only — no actions

---

## 5. Authentication Flow

1. Admin navigates to `/login`
2. Enters email + password (no OTP — password-based auth for admins)
3. On success, store JWT tokens in localStorage (`admin_jwt_token`, `admin_refresh_token`)
4. If `is_password_changed === false`, redirect to `/change-password`
5. All API calls via `authFetch` wrapper that:
   - Attaches `Authorization: Bearer <token>` header
   - On 401, attempts token refresh via `/api/v1/admin/auth/refresh`
   - On refresh failure, redirect to `/login`

---

## 6. Key Reusable Components

### DataTable
Generic paginated table with:
- Server-side pagination (page, page_size)
- Column sorting
- Row click handler
- Loading skeleton
- Empty state
- Export button

### FilterBar
Composable filter bar with:
- MerchantSelect dropdown (fetches merchant list)
- DateRangePicker
- Status select
- Gateway select
- Search input
- Clear all filters button

### DocumentViewer
For KYC document review:
- Renders PDF inline (PDF.js or iframe)
- Image zoom for image documents
- Download button
- Approve/Reject action buttons

---

## 7. Environment Configuration

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api/v1/

# .env.staging
VITE_API_BASE_URL=https://staging-api.jpay.co.ke/api/v1/

# .env.production
VITE_API_BASE_URL=https://api.jpay.co.ke/api/v1/
```

---

## 8. Deployment

- Firebase Hosting (separate project from merchant_admin)
- Custom domain: `admin.jpay.co.ke`
- Build: `npm run build` → `dist/`
- Deploy: `firebase deploy --only hosting`

---

## 9. Implementation Order

1. **Phase 1 — Scaffold:** Initialize Vite + React + TS project, install deps, configure Tailwind + shadcn/ui
2. **Phase 2 — Auth:** Login page, AuthContext, protected routes, change password page
3. **Phase 3 — Layout:** DashboardLayout, Sidebar, Header
4. **Phase 4 — Dashboard:** Overview page with stat cards and charts (connect to analytics API)
5. **Phase 5 — Merchants:** Merchant list + detail pages with all tabs
6. **Phase 6 — Applications:** Application list + review page with document viewer
7. **Phase 7 — Transactions:** Collections + Payouts pages with filters
8. **Phase 8 — Settlements + Customers:** Settlement management + customer list
9. **Phase 9 — Audit Log:** Audit log page
10. **Phase 10 — Polish:** Export functionality, loading states, error handling, responsive design

---

## 10. Verification

1. `npm run dev` — app starts on port 8081
2. Login with super admin credentials → redirected to dashboard
3. Verify all pages load and display data from backend
4. Test merchant approve/reject flow end-to-end
5. Test settlement approve/reject flow
6. Verify filters work on all table pages
7. Verify merchant dropdown filter on analytics
8. Test PDF/Excel export
9. Test token refresh flow (wait 30+ min or manually expire token)
10. `npm run build` — production build succeeds with no errors
