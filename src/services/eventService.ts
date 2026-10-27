import api from './api';

export interface Event {
  id: number;
  title: string;
  description: string;
  category: { id: number; name: string };
  venue: { id: number; name: string; city: string; address: string; capacity: number };
  dateTime: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  imageUrl?: string;
}

export interface EventFilters {
  search?: string;
  categoryId?: number;
  city?: string;
  fromDate?: string;
  toDate?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Category { id: number; name: string; description?: string; status?: string; }
export interface Venue    { id: number; name: string; address: string; city: string; capacity: number; }

export const eventService = {
  getEvents:   (params?: EventFilters) => api.get<PagedResponse<Event>>('/events', { params }),
  getEvent:    (id: number)             => api.get<Event>(`/events/${id}`),
  createEvent: (data: Partial<Event>)   => api.post<Event>('/events', data),
  updateEvent: (id: number, data: Partial<Event>) => api.put<Event>(`/events/${id}`, data),
  deleteEvent: (id: number)             => api.delete(`/events/${id}`),
};

export const categoryService = {
  getAll:  ()                       => api.get<Category[]>('/categories'),
  create:  (data: Partial<Category>) => api.post<Category>('/categories', data),
  update:  (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),
  delete:  (id: number)             => api.delete(`/categories/${id}`),
};

export const venueService = {
  getAll:  ()                    => api.get<Venue[]>('/venues'),
  create:  (data: Partial<Venue>) => api.post<Venue>('/venues', data),
  update:  (id: number, data: Partial<Venue>) => api.put<Venue>(`/venues/${id}`, data),
  delete:  (id: number)          => api.delete(`/venues/${id}`),
};
