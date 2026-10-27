import api from './api';

export interface BookingRequest {
  eventId: number;
  ticketCount: number;
  attendees: AttendeeInfo[];
}

export interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: number;
  event: {
    id: number;
    title: string;
    dateTime: string;
    venue: { name: string; city: string };
    price: number;
    imageUrl?: string;
  };
  bookingDate: string;
  ticketCount: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  attendees?: AttendeeInfo[];
}

export const bookingService = {
  create:        (data: BookingRequest)  => api.post<Booking>('/bookings', data),
  getMyBookings: ()                      => api.get<Booking[]>('/bookings/my'),
  getBooking:    (id: number)            => api.get<Booking>(`/bookings/${id}`),
  // Admin
  getAllBookings: (params?: { page?: number; size?: number }) =>
                                            api.get<any>('/admin/bookings', { params }),
  updateStatus:  (id: number, status: string) =>
                                            api.patch(`/admin/bookings/${id}/status`, { status }),
};

export const profileService = {
  getMe:    ()               => api.get('/users/me'),
  updateMe: (data: unknown)  => api.put('/users/me', data),
};
