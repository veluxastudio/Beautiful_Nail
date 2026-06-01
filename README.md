# 📋 ALUR LENGKAP APLIKASI BEAUTY SALON

## 🎯 RINGKASAN APLIKASI
Aplikasi ini adalah **Admin Dashboard Beauty Salon** yang dibangun dengan **Next.js 16** + **React 19** + **Supabase** + **TypeScript** + **Tailwind CSS**.

Aplikasi digunakan untuk mengelola:
- 👥 **Customers** (Data Pelanggan)
- 📅 **Appointments** (Jadwal Janji Temu)
- 💅 **Services** (Layanan/Jenis Perawatan)
- 👨‍💼 **Staff** (Data Karyawan)
- 📊 **Reports** (Laporan & Statistik)
- 📋 **Dashboard** (Ringkasan Utama)

---

## 🏗️ STRUKTUR FOLDER

```
beauty_salon/
├── app/                          # ← Folder utama Next.js (File-based routing)
│   ├── page.tsx                  # ← Halaman root (redirect ke login)
│   ├── layout.tsx                # ← Layout global aplikasi
│   ├── globals.css               # ← Gaya CSS global
│   │
│   ├── auth/                     # ← Folder untuk halaman autentikasi
│   │   ├── login/page.tsx        # ← Halaman Login
│   │   └── register/page.tsx     # ← Halaman Register (jika ada)
│   │
│   └── (dashboard)/              # ← Route Group (layout khusus untuk dashboard)
│       ├── layout.tsx            # ← Layout dashboard (dengan sidebar)
│       ├── dashboard/page.tsx    # ← Halaman Dashboard Utama (KPI, stats)
│       ├── appointments/page.tsx # ← Halaman List Appointments
│       ├── customers/page.tsx    # ← Halaman List Customers
│       ├── services/page.tsx     # ← Halaman List Services
│       ├── staff/page.tsx        # ← Halaman List Staff
│       └── reports/page.tsx      # ← Halaman Reports (Laporan)
│
├── components/                   # ← Komponen React yang reusable
│   ├── layout/
│   │   ├── DashboardLayout.tsx  # ← Layout wrapper untuk dashboard
│   │   ├── Navbar.tsx           # ← Navigation bar (belum digunakan)
│   │   └── Sidebar.tsx          # ← Sidebar menu navigasi
│   │
│   ├── appointments/            # ← Komponen untuk appointments
│   │   ├── AppointmentCard.tsx  # ← Card single appointment
│   │   ├── AppointmentList.tsx  # ← List appointments
│   │   ├── AppointmentFilters.tsx # ← Filter appointments
│   │   └── ViewAppointmentModal.tsx # ← Modal detail appointment
│   │
│   ├── customers/              # ← Komponen untuk customers
│   │   └── CustomerCard.tsx    # ← Card single customer
│   │
│   ├── services/               # ← Komponen untuk services
│   │   └── ServiceCard.tsx     # ← Card single service
│   │
│   ├── staff/                  # ← Komponen untuk staff
│   │   └── StaffCard.tsx       # ← Card single staff member
│   │
│   └── ui/                     # ← UI components (dari shadcn/ui)
│       ├── button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Table.tsx
│
├── services/                   # ← Service layer (komunikasi dengan database)
│   ├── auth.service.ts         # ← Fungsi autentikasi (login, logout, register)
│   ├── customer.service.ts     # ← Fungsi CRUD customers
│   ├── appointment.service.ts  # ← Fungsi CRUD appointments
│   ├── service.service.ts      # ← Fungsi CRUD services
│   └── staff.service.ts        # ← Fungsi CRUD staff
│
├── lib/                        # ← Library & utility
│   ├── utils.ts               # ← Helper functions
│   └── supabase/              # ← Konfigurasi Supabase
│       ├── client.ts          # ← Supabase client (untuk browser)
│       ├── server.ts          # ← Supabase server (untuk server)
│       ├── middleware.ts      # ← Middleware autentikasi
│       └── types.ts           # ← TypeScript types untuk database
│
├── hooks/                      # ← Custom React hooks
│   ├── useAuth.ts             # ← Hook untuk autentikasi (auth state)
│   └── useSidebar.ts          # ← Hook untuk sidebar state
│
├── types/                      # ← TypeScript type definitions
│   ├── auth.ts                # ← Types untuk auth
│   ├── appointment.ts         # ← Types untuk appointments
│   ├── database.ts            # ← Types untuk database schema
│   └── index.ts               # ← Export semua types
│
├── public/                     # ← File static (gambar, icon, logo)
│   ├── icons/
│   ├── images/
│   └── logo/
│
├── package.json               # ← Dependencies project
├── tsconfig.json              # ← TypeScript configuration
├── next.config.ts             # ← Next.js configuration
└── README.md                  # ← Dokumentasi project
```

---

## 🔄 ALUR APLIKASI (FLOW)

### 1️⃣ **ENTRY POINT - ROOT PAGE**
```
User membuka aplikasi (misalnya: localhost:3000)
            ↓
app/page.tsx dijalankan
            ↓
Redirect ke /auth/login
            ↓
Halaman Login ditampilkan
```

---

### 2️⃣ **AUTHENTICATION FLOW**

```
📄 app/auth/login/page.tsx

User input email & password
            ↓
Click tombol "Login"
            ↓
handleLogin() dipanggil
            ↓
supabase.auth.signInWithPassword()
  ├─ Supabase authenticate user
  ├─ Jika gagal → Show error alert
  └─ Jika berhasil → Navigate ke /dashboard
            ↓
Redirect ke app/(dashboard)/dashboard/page.tsx
            ↓
Dashboard ditampilkan
```

**File yang terlibat:**
- [app/auth/login/page.tsx](app/auth/login/page.tsx) - UI Login
- [services/auth.service.ts](services/auth.service.ts) - Logic autentikasi
- [lib/supabase/client.ts](lib/supabase/client.ts) - Koneksi ke Supabase

---

### 3️⃣ **DASHBOARD LAYOUT STRUCTURE**

Setelah login, user masuk ke struktur layout ini:

```
🌐 app/(dashboard)/layout.tsx
    ├── 📍 Sidebar.tsx
    │   └── Menu navigasi dengan opsi:
    │       • Dashboard (/dashboard)
    │       • Appointments (/appointments)
    │       • Services (/services)
    │       • Customers (/customers)
    │       • Staff (/staff)
    │       • Reports (/reports)
    │       • Logout
    │
    └── 📄 children (main content area)
        └── Konten halaman yang sedang aktif
```

**File yang terlibat:**
- [app/(dashboard)/layout.tsx](app/(dashboard)/layout.tsx) - Layout wrapper
- [components/layout/Sidebar.tsx](components/layout/Sidebar.tsx) - Sidebar menu

---

### 4️⃣ **DASHBOARD PAGE FLOW**

```
📄 app/(dashboard)/dashboard/page.tsx

Component render
            ↓
useEffect hook dipicu
            ↓
Panggil dua fungsi secara bersamaan:
  ├─ getAppointments()  → Ambil semua janji temu
  └─ getStaff()         → Ambil data staff
            ↓
Data simpan di state (appointments, staff)
            ↓
Tampilkan di halaman:
  ├─ KPI Cards
  │  ├─ Appointment hari ini
  │  ├─ Total revenue
  │  ├─ Jumlah customer
  │  └─ Top staff
  │
  └─ Recent Appointments Table
     └─ List janji temu terbaru
```

**Alur data:**
```
Dashboard Page Component
            ↓
useState untuk menyimpan data
            ↓
useEffect (onMount) → Fetch data dari Supabase
            ↓
State diupdate → Component re-render
            ↓
UI tampil dengan data
```

**File yang terlibat:**
- [app/(dashboard)/dashboard/page.tsx](app/(dashboard)/dashboard/page.tsx) - Logic dashboard
- [services/appointment.service.ts](services/appointment.service.ts) - Fetch appointments
- [services/staff.service.ts](services/staff.service.ts) - Fetch staff

---

### 5️⃣ **CUSTOMERS PAGE FLOW**

```
📄 app/(dashboard)/customers/page.tsx

Component render
            ↓
useState untuk state:
  ├─ customers (array of customer data)
  ├─ search (query pencarian)
  ├─ loading (status loading)
  └─ error (error state)
            ↓
useEffect hook → loadCustomers()
            ↓
Call getCustomers() dari customer.service.ts
            ↓
Supabase query:
  1. SELECT * FROM customers
  2. SELECT * FROM appointments WHERE status != 'Cancelled'
  3. Enrich customer data dengan appointment info:
     ├─ total_visits (jumlah appointment)
     ├─ total_spent (total uang yang dihabiskan)
     ├─ last_visit (appointment terakhir)
     └─ favorite_service (service favorit)
            ↓
Data disimpan di state (setCustomers)
            ↓
Render CustomerCard untuk setiap customer:

┌─────────────────────────┐
│  CUSTOMER CARD          │
├─────────────────────────┤
│ Foto customer           │
│ Nama: John Doe          │
│ Email: john@email.com   │
│ Phone: 081234567890     │
│ Visits: 5               │
│ Total Spent: Rp 500.000 │
└─────────────────────────┘

            ↓
Search filter:
  User input query → Component filter customer
  ├─ Filter by nama
  ├─ Filter by email
  └─ Filter by phone
            ↓
Tampilkan hasil filter
```

**Alur service:**
```
getCustomers() di customer.service.ts
            ↓
Step 1: Query semua customers dari DB
            ↓
Step 2: Query semua appointments (non-cancelled)
            ↓
Step 3: Group appointments per customer_id
            ↓
Step 4: Enrich setiap customer dengan:
  ├─ total_visits
  ├─ total_spent
  ├─ last_visit
  └─ favorite_service
            ↓
Return enriched customer data
```

**File yang terlibat:**
- [app/(dashboard)/customers/page.tsx](app/(dashboard)/customers/page.tsx) - Page logic
- [services/customer.service.ts](services/customer.service.ts) - Data service
- [components/customers/CustomerCard.tsx](components/customers/CustomerCard.tsx) - Card component

---

### 6️⃣ **APPOINTMENTS PAGE FLOW**

```
📄 app/(dashboard)/appointments/page.tsx

Component render
            ↓
useState untuk state:
  ├─ appointments (array of appointments)
  ├─ search (pencarian)
  ├─ filterTreatment (filter by service)
  ├─ filterStatus (filter by status)
  └─ services (list semua services untuk filter options)
            ↓
useEffect hook → loadData()
            ↓
Fetch data secara bersamaan (Promise.all):
  ├─ getAppointments() → Ambil semua appointments
  │  └─ Query: SELECT * FROM appointments
  │           + JOIN customers
  │           + JOIN services
  │           + JOIN staff
  └─ getServices() → Ambil semua services
     └─ Query: SELECT * FROM services
            ↓
Simpan di state
            ↓
Render dengan filters:

┌──────────────────────────────────────────┐
│  FILTERS SECTION                         │
├──────────────────────────────────────────┤
│ [Search field]  [Service filter] [Status]│
│                                          │
│ ✓ Search by: nama customer / email / svc │
│ ✓ Filter by Service: All / Manicure / ... │
│ ✓ Filter by Status: All/Pending/Confirmed│
└──────────────────────────────────────────┘
            ↓
Tampilkan filtered appointments dalam card:

┌────────────────────────────────────────┐
│ APPOINTMENT CARD                       │
├────────────────────────────────────────┤
│ Customer: Siti Nur                     │
│ Date: 2024-06-01 | Time: 10:00 AM     │
│ Service: Gel Manicure                  │
│ Staff: Dewi                            │
│ Duration: 60 min | Price: Rp 200.000  │
│ Status: Pending [Confirm] [Reject]    │
├────────────────────────────────────────┤
│ [Confirm] [Complete] [Cancel]          │
└────────────────────────────────────────┘

            ↓
User action (Confirm/Complete/Cancel):
  ├─ handleConfirm(id) → UPDATE status = 'Confirmed'
  ├─ handleComplete(id) → UPDATE status = 'Completed'
  └─ handleReject(id) → UPDATE status = 'Cancelled'
            ↓
updateAppointmentStatus() dipanggil
            ↓
Supabase update: UPDATE appointments SET status = ?
            ↓
Reload data
            ↓
UI refresh dengan data terbaru
```

**Alur filter:**
```
User input / ubah filter
            ↓
State diupdate
            ↓
Component re-render
            ↓
filtered = appointments.filter(...) dipanggil
            ↓
Cek kondisi:
  ├─ Search match?
  ├─ Treatment match?
  └─ Status match?
            ↓
Return appointments yang sesuai
            ↓
Render hanya yang cocok
```

**File yang terlibat:**
- [app/(dashboard)/appointments/page.tsx](app/(dashboard)/appointments/page.tsx) - Page
- [services/appointment.service.ts](services/appointment.service.ts) - Service
- [components/appointments/AppointmentCard.tsx](components/appointments/AppointmentCard.tsx) - Card

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                   🖥️  BROWSER (Client)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  React Components                                           │
│  ├─ Dashboard Page                                          │
│  ├─ Customers Page                                          │
│  ├─ Appointments Page                                       │
│  └─ ... (Services, Staff, Reports)                          │
│           ↓                                                 │
│  useState (State Management)                                │
│           ↓                                                 │
│  Render UI (JSX)                                            │
│           ↑                                                 │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ API Call (JavaScript)
            ↓
┌─────────────────────────────────────────────────────────────┐
│               📡 SERVICE LAYER (services/)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • customer.service.ts - getCustomers(), ...                │
│  • appointment.service.ts - getAppointments(), ...          │
│  • staff.service.ts - getStaff(), ...                       │
│  • service.service.ts - getServices(), ...                  │
│  • auth.service.ts - login(), logout(), ...                 │
│           ↓                                                 │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ SQL Query
            ↓
┌─────────────────────────────────────────────────────────────┐
│            🗄️  SUPABASE (Database & Auth)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tables:                                                    │
│  • auth_users (Supabase built-in)                           │
│  • customers                                                │
│  • appointments                                             │
│  • services                                                 │
│  • staff                                                    │
│  • ... (relasi tabel lainnya)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
            ↑
            │ Response (JSON data)
            │
            └── Back to Browser
```

---

## 🔌 CONTOH: Alur Lengkap Dari User Klik Button Sampai Data Tampil

### Scenario: User klik "Confirm" di Appointments Page

```
1. USER INTERACTION
   └─ User melihat appointment dengan status "Pending"
   └─ User klik tombol "[Confirm]"

2. COMPONENT HANDLER
   └─ onClick -> handleConfirm(appointmentId)
   └─ updateAppointmentStatus(id, "Confirmed") dipanggil

3. SERVICE LAYER
   └─ appointment.service.ts
   └─ updateAppointmentStatus() function:
      ```typescript
      export async function updateAppointmentStatus(id: string, status: string) {
        const { error } = await supabase
          .from("appointments")
          .update({ status })
          .eq("id", id);
        if (error) throw error;
      }
      ```

4. DATABASE UPDATE
   └─ Supabase menerima request
   └─ Execute SQL: UPDATE appointments SET status='Confirmed' WHERE id=?
   └─ Database record diupdate

5. RESPONSE BACK
   └─ Supabase return response (success/error)
   └─ Control kembali ke component

6. RELOAD DATA
   └─ handleConfirm() selesai
   └─ loadData() dipanggil lagi
   └─ getAppointments() fetch data terbaru

7. STATE UPDATE
   └─ setAppointments(newData)
   └─ Component re-render

8. UI UPDATE
   └─ User lihat appointment yang baru saja di-confirm
   └─ Status berubah dari "Pending" → "Confirmed"
   └─ Visual update (warna status badge berubah)
```

---

## 🔐 AUTHENTICATION FLOW

```
┌─────────────────────────────────────┐
│  UNAUTHENTICATED USER                │
├─────────────────────────────────────┤
│ Buka aplikasi (/)                   │
│        ↓                             │
│ Redirect ke /auth/login             │
│        ↓                             │
│ Input email & password              │
│        ↓                             │
│ Click "Sign In"                     │
└─────────────────────────────────────┘
            ↓
            │ supabase.auth.signInWithPassword()
            ↓
┌─────────────────────────────────────┐
│  SUPABASE AUTH VERIFY                │
├─────────────────────────────────────┤
│ Check email exists?                 │
│ Check password correct?             │
│ Generate session token              │
└─────────────────────────────────────┘
            ↓
        SUCCESS?
        ├─ YES: Return token + user data
        └─ NO:  Return error message
            ↓
        IF SUCCESS
        ├─ Store session di Supabase
        ├─ Browser store session di cookies/localStorage
        ├─ Redirect ke /dashboard
        └─ Render dashboard dengan user data
            ↓
┌─────────────────────────────────────┐
│  AUTHENTICATED USER                   │
├─────────────────────────────────────┤
│ Dapat mengakses semua halaman      │
│ Protected route check: middleware.ts│
└─────────────────────────────────────┘
            ↓
        LOGOUT
        ├─ User klik "Logout"
        ├─ supabase.auth.signOut()
        ├─ Clear session dari browser
        └─ Redirect ke /auth/login
```

---

## 📱 COMPONENT HIERARCHY

```
RootLayout (app/layout.tsx)
├── GlobalCSS
├── Fonts (Geist)
└── <body>
    ├── Auth Routes
    │   ├── /auth/login
    │   │   ├── LoginPage
    │   │   ├── LoginForm
    │   │   ├── Email Input
    │   │   ├── Password Input
    │   │   └── Submit Button
    │   └── /auth/register
    │       └── RegisterPage
    │
    └── Dashboard Routes (app/(dashboard)/layout.tsx)
        ├── Sidebar
        │   ├── Logo
        │   ├── Navigation Menu
        │   │   ├── Dashboard Link
        │   │   ├── Appointments Link
        │   │   ├── Services Link
        │   │   ├── Customers Link
        │   │   ├── Staff Link
        │   │   ├── Reports Link
        │   │   └── Logout Button
        │   └── Mobile Overlay
        │
        └── Main Content Area
            ├── Mobile Header (Menu Button)
            ├── Page Content
            │   ├── Dashboard Page
            │   │   ├── KPI Stats Cards
            │   │   │   ├── Appointments Today
            │   │   │   ├── Revenue Card
            │   │   │   ├── Customers Card
            │   │   │   └── Top Staff Card
            │   │   └── Recent Appointments Table
            │   │
            │   ├── Customers Page
            │   │   ├── Header
            │   │   ├── Search Input
            │   │   └── Customer Grid
            │   │       └── CustomerCard (repeating)
            │   │           ├── Avatar
            │   │           ├── Name
            │   │           ├── Contact Info
            │   │           ├── Stats
            │   │           └── Actions
            │   │
            │   ├── Appointments Page
            │   │   ├── Header
            │   │   ├── Filters Section
            │   │   │   ├── Search Input
            │   │   │   ├── Service Filter Dropdown
            │   │   │   └── Status Filter Dropdown
            │   │   └── Appointments Grid
            │   │       └── AppointmentCard (repeating)
            │   │           ├── Customer Name
            │   │           ├── Date & Time
            │   │           ├── Service & Staff
            │   │           ├── Price & Duration
            │   │           ├── Status Badge
            │   │           └── Action Buttons
            │   │
            │   ├── Services Page
            │   │   └── Service Grid
            │   │       └── ServiceCard
            │   │
            │   ├── Staff Page
            │   │   └── Staff Grid
            │   │       └── StaffCard
            │   │
            │   └── Reports Page
            │       └── Reports Content
            │
            └── Footer (optional)
```

---

## 🧪 TESTING FLOW (Apa yang terjadi saat user menggunakan aplikasi)

### Test 1: Login Flow
```
1. User buka localhost:3000
2. Redirect ke /auth/login
3. User input: email = "admin@beauty.com", password = "password123"
4. Click "Sign In"
5. Supabase autentikasi
6. Jika berhasil → User diarahkan ke /dashboard
7. Dashboard tampil dengan data appointments dan staff
```

### Test 2: Browse Customers
```
1. User sudah login, ada di dashboard
2. User klik menu "Customers"
3. Navigasi ke /customers
4. Page render → useEffect trigger → getCustomers()
5. Loading state tampil
6. Data dari Supabase dimuat
7. Customers tampil sebagai card grid
8. User bisa search/filter
```

### Test 3: Confirm Appointment
```
1. User ada di /appointments
2. User lihat appointment dengan status "Pending"
3. User klik tombol "[Confirm]"
4. handleConfirm() dipanggil
5. updateAppointmentStatus("apt-123", "Confirmed")
6. Supabase update database
7. loadData() reload semuanya
8. Appointment status berubah ke "Confirmed"
9. UI refresh dengan status baru
```

---

## 🛠️ TECH STACK BREAKDOWN

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 | Framework web React |
| | React 19 | UI library |
| | TypeScript | Type safety |
| | Tailwind CSS | Styling |
| | Radix UI | UI components |
| **State** | Zustand (optional) | Global state management |
| **Forms** | React Hook Form | Form management |
| | Zod | Validation |
| **Backend** | Supabase | Database + Auth |
| **Icons** | Lucide React | Icon library |
| **Dev Tools** | ESLint | Code linting |

---

## 📌 SUMMARY - ALUR SINGKAT

### 3 TAHAP UTAMA:

#### 1️⃣ **AUTHENTICATION** (app/auth/)
- User login dengan email + password
- Supabase verify credentials
- Jika valid → Session created → Redirect to dashboard

#### 2️⃣ **DASHBOARD LAYOUT** (app/(dashboard)/layout.tsx)
- Sidebar dengan menu navigasi
- Main content area
- Protected routes (hanya bisa akses jika sudah login)

#### 3️⃣ **DATA PAGES** (app/(dashboard)/*/)
- Dashboard Page: KPI + stats
- Customers Page: List + search customers
- Appointments Page: List + filter + actions appointments
- Services Page: List services
- Staff Page: List staff
- Reports Page: Laporan statistik

### ALUR DATA:
```
User Input → Component Handler → Service Function → 
Supabase Query → Database → Response → 
State Update → Component Re-render → UI Update
```

---

## 🔗 FILE REFERENCES

**Core Files:**
- Entry Point: [app/page.tsx](app/page.tsx)
- Global Layout: [app/layout.tsx](app/layout.tsx)
- Dashboard Layout: [app/(dashboard)/layout.tsx](app/(dashboard)/layout.tsx)
- Sidebar: [components/layout/Sidebar.tsx](components/layout/Sidebar.tsx)

**Pages:**
- Dashboard: [app/(dashboard)/dashboard/page.tsx](app/(dashboard)/dashboard/page.tsx)
- Customers: [app/(dashboard)/customers/page.tsx](app/(dashboard)/customers/page.tsx)
- Appointments: [app/(dashboard)/appointments/page.tsx](app/(dashboard)/appointments/page.tsx)

**Services:**
- [services/customer.service.ts](services/customer.service.ts)
- [services/appointment.service.ts](services/appointment.service.ts)
- [services/staff.service.ts](services/staff.service.ts)

**Supabase Config:**
- [lib/supabase/client.ts](lib/supabase/client.ts)
- [lib/supabase/middleware.ts](lib/supabase/middleware.ts)

---

## ❓ FAQ

**Q: Bagaimana data customers bisa menampilkan total_spent?**
A: Di customer.service.ts, saat query customers, kita juga ambil appointments yang linked ke customer, lalu hitung total harga yang Completed status.

**Q: Apakah ada cache untuk data?**
A: Tidak. Setiap kali loadData() dipanggil, data fresh dari Supabase.

**Q: Bagaimana autentikasi di cek?**
A: Middleware di lib/supabase/middleware.ts cek session, jika tidak valid → redirect ke login.

**Q: Bisa customize warna sidebar?**
A: Ya, bisa edit Tailwind classes di Sidebar.tsx (bg-white, text-[#ff2056], etc).

---

*Dokumentasi dibuat untuk menjelaskan alur lengkap aplikasi Beauty Salon Admin Dashboard.*
