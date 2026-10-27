import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute';

import LoginPage               from './pages/auth/LoginPage';
import RegisterPage            from './pages/auth/RegisterPage';
import HomePage                from './pages/HomePage';
import EventListingPage        from './pages/EventListingPage';
import EventDetailPage         from './pages/EventDetailPage';
import BookingPage             from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage          from './pages/MyBookingsPage';
import BookingDetailPage       from './pages/BookingDetailPage';
import ProfilePage             from './pages/ProfilePage';
import AdminDashboard          from './pages/admin/AdminDashboard';
import AdminEventsPage         from './pages/admin/AdminEventsPage';
import AdminCategoriesPage     from './pages/admin/AdminCategoriesPage';
import AdminVenuesPage         from './pages/admin/AdminVenuesPage';
import AdminBookingsPage       from './pages/admin/AdminBookingsPage';
import NotFoundPage            from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
