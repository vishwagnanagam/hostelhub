export interface Facilities {
  wifi: boolean;
  food: boolean;
  laundry: boolean;
  gym: boolean;
  parking: boolean;
  security: boolean;
  library: boolean;
}

export interface Hostel {
  id: string;
  name: string;
  city: string;
  area: string;
  college_nearby: string;
  price: number;
  type: 'AC' | 'Non-AC';
  gender: 'boys' | 'girls' | 'co-ed';
  rating: number;
  hygiene_score: number;
  safety_score: number;
  facilities: Facilities;
  images: string[];
  description: string;
  available_rooms: number;
  created_at: string;
}

export interface Review {
  id: string;
  hostel_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Booking {
  id: string;
  hostel_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  payment_id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  check_in_date: string;
  created_at: string;
}

export interface SearchFilters {
  query: string;
  city: string;
  minPrice: number;
  maxPrice: number;
  type: string;
  gender: string;
  minRating: number;
  facilities: Partial<Facilities>;
}

export interface BookingFormData {
  user_name: string;
  user_email: string;
  user_phone: string;
  check_in_date: string;
}

export type Page = 'home' | 'listing' | 'detail' | 'admin';
