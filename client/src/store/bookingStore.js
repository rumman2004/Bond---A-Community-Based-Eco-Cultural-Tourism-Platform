let bookings = [];
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(bookings));

const bookingStore = {
  getState: () => bookings,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setBookings(nextBookings) {
    bookings = nextBookings;
    notify();
  },
  upsertBooking(booking) {
    bookings = bookings.some((item) => item.id === booking.id)
      ? bookings.map((item) => (item.id === booking.id ? booking : item))
      : [booking, ...bookings];
    notify();
  },
};

export default bookingStore;
