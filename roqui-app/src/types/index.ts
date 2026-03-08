export type Platform = 'Airbnb' | 'Booking' | 'Directa';

export type ExpenseCategory = 
  | 'electricidad' 
  | 'agua' 
  | 'internet' 
  | 'mantenimiento' 
  | 'cuidador' 
  | 'impuestos' 
  | 'otros';

export type ImageCategory = 'cabana' | 'habitaciones' | 'exteriores' | 'amenidades';

export type UserRole = 'admin' | 'viewer';

export interface Settings {
  id: string;
  base_price: number;
  exchange_rate: number;
  cleaning_fee: number;
  airbnb_fee: number;
  booking_fee: number;
  caretaker_fee: number;
  wifi_name?: string;
  wifi_password?: string;
  updated_at?: string;
}

export interface Reservation {
  id: string;
  guest_name: string;
  platform: Platform;
  check_in: string;
  check_out: string;
  nights: number;
  price_per_night: number;
  cleaning_fee: number;
  platform_fee: number;
  caretaker_cost: number;
  gross_income: number;
  net_income: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  notes?: string;
  created_at?: string;
  user_id?: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: 'USD' | 'CRC';
  date: string;
  description?: string;
  receipt_url?: string;
  created_at?: string;
  user_id?: string;
}

export interface Image {
  id: string;
  category: ImageCategory;
  url: string;
  description?: string;
  is_main: boolean;
  created_at?: string;
  user_id?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'financial' | 'maintenance' | 'guest';
  date: string;
  created_at?: string;
  user_id?: string;
}

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at?: string;
}

export interface MonthlyStats {
  month: string;
  year: number;
  income: number;
  expenses: number;
  netProfit: number;
  occupancyRate: number;
  reservationCount: number;
}

export interface DashboardKPIs {
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthNetProfit: number;
  currentMonthOccupancy: number;
  totalReservations: number;
  upcomingReservations: Reservation[];
}
