import { baseApi } from './baseApi';

export interface Booking {
  id: string;
  salonName: string;
  date: string;
  status: 'upcoming' | 'completed';
}

const mockBookings: Booking[] = [
  { id: 'b1', salonName: 'Glow Salon', date: new Date().toISOString(), status: 'upcoming' },
  {
    id: 'b2',
    salonName: 'Urban Cuts',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
  },
];

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBookings: build.query<Booking[], void>({
      queryFn: async () => ({ data: mockBookings }),
      providesTags: ['Booking'],
    }),
  }),
});

export const { useGetBookingsQuery } = bookingsApi;
