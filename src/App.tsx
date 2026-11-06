import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import CitySelectorModal from './components/CitySelectorModal';
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute';

// Public pages loaded eagerly or lazily
const HomePage                = lazy(() => import('./pages/HomePage'));
const EventListingPage        = lazy(() => import('./pages/EventListingPage'));
const EventDetailPage         = lazy(() => import('./pages/EventDetailPage'));
const LoginPage               = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage            = lazy(() => import('./pages/auth/RegisterPage'));

// Protected customer pages
const BookingPage             = lazy(() => import('./pages/BookingPage'));
const BookingConfirmationPage = lazy(() => import('./pages/BookingConfirmationPage'));
const MyBookingsPage          = lazy(() => import('./pages/MyBookingsPage'));
const BookingDetailPage       = lazy(() => import('./pages/BookingDetailPage'));
const ProfilePage             = lazy(() => import('./pages/ProfilePage'));

// Admin pages
const AdminDashboard          = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminEventsPage         = lazy(() => import('./pages/admin/AdminEventsPage'));
const AdminCategoriesPage     = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminVenuesPage         = lazy(() => import('./pages/admin/AdminVenuesPage'));
const AdminBookingsPage       = lazy(() => import('./pages/admin/AdminBookingsPage'));
const NotFoundPage            = lazy(() => import('./pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-midnight)'
    }}>
      <div className="spinner" style={{ width: 44, height: 44 }} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CityProvider>
          <BrowserRouter>
            <CitySelectorModal />
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public routes */}
              <Route path="/"           element={<HomePage />} />
              <Route path="/events"     element={<EventListingPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />

              {/* Guest-only routes (redirect if logged in) */}
              <Route element={<GuestRoute />}>
                <Route path="/login"    element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Protected customer routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/booking/:eventId"              element={<BookingPage />} />
                <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmationPage />} />
                <Route path="/my-bookings"                   element={<MyBookingsPage />} />
                <Route path="/my-bookings/:id"               element={<BookingDetailPage />} />
                <Route path="/profile"                       element={<ProfilePage />} />
              </Route>

              {/* Admin-only routes */}
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin"             element={<AdminDashboard />} />
                <Route path="/admin/events"      element={<AdminEventsPage />} />
                <Route path="/admin/categories"  element={<AdminCategoriesPage />} />
                <Route path="/admin/venues"      element={<AdminVenuesPage />} />
                <Route path="/admin/bookings"    element={<AdminBookingsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </CityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
