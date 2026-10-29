# EventHub — Frontend (Event Management & Ticket Booking System)

EventHub is a modern, enterprise-grade Event Management and Ticketing Platform built with **React 19**, **TypeScript**, **Vite**, and **Spring Boot 3**.

---

## 🎨 Design & Theme Highlights

- **Palette**: Refined **Royal Violet** (`#7c3aed`, `#6d28d9`), **Emerald Green** (`#059669`), **Warm Amber** (`#d97706`), and **Rose** (`#e11d48`).
- **No Blue Policy**: Pure luxury violet and emerald styling across all customer and admin screens.
- **External CSS Architecture**: All reusable component styles (`.page-container`, `.filter-card`, `.filter-chip`, `.booking-card-item`, `.event-card`, `.data-table`, `.modal-box`, `.pagination-container`, etc.) are centralized in `src/index.css`.
- **React Icons**: Complete adoption of `react-icons/hi2` (Heroicons 2) across all navigation bars, stat cards, action buttons, chips, forms, and badges.
- **Local Asset Management**: Dedicated vector assets located under `src/assets/images/` (`event-tech.svg`, `event-music.svg`, `event-business.svg`, `event-default.svg`) with dynamic fallback resolver (`getEventImage`).

---

## 🚀 Key Features

### 👤 Customer Experience
1. **Interactive Event Discovery**:
   - Filter by keyword search, category, city/location, date range, and price slider.
   - Dynamic sorting (Upcoming, Price Low to High, Price High to Low).
   - Real-time seat availability tags (Sold Out vs. Available seats).
2. **Event Details & Venue Information**:
   - High-resolution hero banner, category pill, venue address, date/time, and pricing breakdown.
3. **Multi-Attendee Ticket Booking**:
   - Ticket count stepper (1 to 10 tickets per booking).
   - Dynamic attendee detail forms (Attendee Name, Email, Phone number).
   - Price calculation with instant total amount display.
4. **Instant Booking Confirmation**:
   - Ticket reference generation (`#EH000001`).
   - Print & download ticket pass option.
5. **My Bookings Dashboard**:
   - **Resolved Lazy Loading**: Fix for booking attendees displaying without backend session closure.
   - **Filter Chips**: Filter bookings by status (`All`, `Confirmed`, `Pending`, `Cancelled`).
   - **Search Input**: Live search by event title or booking reference number.
   - **Pagination**: Client-side paginated list with page navigation controls.
6. **User Profile**:
   - View account details, email, and user role.

### 🛡️ Admin Dashboard
1. **Analytics & Overview**:
   - Real-time metric cards: Total Events, Total Bookings, Active Events, Platform Health.
   - Recent events list and latest booking feed.
2. **Event Management (CRUD)**:
   - Create, edit, and delete events with validation.
   - Search by title or city, and filter by category.
   - Assign venue, category, datetime, price, and seat capacity.
3. **Category Management**:
   - Add, edit, and delete event categories.
4. **Venue Management**:
   - Add and update venues with city, address, and seating capacity.
5. **Booking Management**:
   - View all platform bookings with customer info, ticket counts, and timestamps.
   - Search by customer name, email, or reference number.
   - Status update dropdown (`CONFIRMED`, `PENDING`, `CANCELLED`).
   - Complete pagination support.

---

## 📂 Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/
│   │   └── images/               # Local SVG illustrations & fallbacks
│   │       ├── event-tech.svg
│   │       ├── event-music.svg
│   │       ├── event-business.svg
│   │       ├── event-default.svg
│   │       └── index.ts          # Image helper functions
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication state & JWT storage
│   ├── layouts/
│   │   ├── AdminLayout.tsx       # Admin sidebar & header layout (Violet theme)
│   │   └── CustomerLayout.tsx    # Customer navbar & footer layout (Violet theme)
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminBookingsPage.tsx
│   │   │   ├── AdminCategoriesPage.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminEventsPage.tsx
│   │   │   └── AdminVenuesPage.tsx
│   │   ├── BookingConfirmationPage.tsx
│   │   ├── BookingDetailPage.tsx
│   │   ├── BookingPage.tsx
│   │   ├── EventDetailPage.tsx
│   │   ├── EventListingPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MyBookingsPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── RegisterPage.tsx
│   ├── services/
│   │   ├── api.ts                # Axios instance with Bearer token interceptor
│   │   ├── authService.ts
│   │   ├── bookingService.ts
│   │   └── eventService.ts
│   ├── App.tsx                   # Route definitions & guards
│   ├── index.css                 # External CSS Design System (No Blue)
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 🛠️ Setup & Running

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Backend API**: Running on `http://localhost:8080`

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch at: `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Customer** | `customer@eventhub.com` | `customer123` |
| **Admin** | `admin@eventhub.com` | `admin123` |

---

## 🔌 API Proxy Configuration
The frontend communicates with the backend at `http://localhost:8080/api`.
Requests automatically attach the JWT token stored in `localStorage` via Axios interceptors in `src/services/api.ts`.
