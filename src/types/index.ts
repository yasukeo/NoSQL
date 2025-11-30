// Types TypeScript pour les collections MongoDB

export interface Flight {
  _id?: string;
  flno: string;
  origin: string;
  destination: string;
  distance: number;
  departure_date: string;
  arrival_date: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  aid: string;
  available_seats: number;
}

export interface Aircraft {
  _id?: string;
  aid: string;
  name: string;
  distance: number;
  capacity: number;
  manufacturer: string;
  year_manufactured: number;
}

export interface Employee {
  _id?: string;
  eid: string;
  name: string;
  salary: number;
  role: string;
  hire_date: string;
  email: string;
}

export interface Certificate {
  _id?: string;
  eid: string;
  aid: string;
}

export interface Passenger {
  _id?: string;
  pid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  passport_number: string;
  nationality: string;
  date_of_birth: string;
}

export interface Booking {
  _id?: string;
  bid: string;
  pid: string;
  flno: string;
  booking_date: string;
  seat_number: string;
  class: 'Economy' | 'Business' | 'First';
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  price_paid: number;
}
