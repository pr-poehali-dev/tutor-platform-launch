const API_URLS = {
  bookings: 'https://functions.poehali.dev/2963a1fb-9e80-4b4a-8e27-6e34c261e9ca',
  timeslots: 'https://functions.poehali.dev/a47d8802-f521-438e-8c2b-4511ecd40d2e'
};

export interface Booking {
  id?: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

export interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
}

export const createBooking = async (booking: Booking): Promise<{ id: number; message: string }> => {
  const response = await fetch(API_URLS.bookings, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при создании бронирования');
  }
  
  return response.json();
};

export const getBookings = async (date?: string): Promise<Booking[]> => {
  const url = date ? `${API_URLS.bookings}?date=${date}` : API_URLS.bookings;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении бронирований');
  }
  
  const data = await response.json();
  return data.bookings;
};

export const updateBookingStatus = async (id: number, status: 'confirmed' | 'cancelled'): Promise<void> => {
  const response = await fetch(API_URLS.bookings, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при обновлении статуса');
  }
};

export const getTimeSlots = async (): Promise<TimeSlot[]> => {
  const response = await fetch(API_URLS.timeslots);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении слотов');
  }
  
  const data = await response.json();
  return data.slots;
};

export const updateTimeSlot = async (time: string, available: boolean): Promise<void> => {
  const response = await fetch(API_URLS.timeslots, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ time, available })
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при обновлении слота');
  }
};
