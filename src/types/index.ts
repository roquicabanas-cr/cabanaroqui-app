// ROQUI Control Center - Types

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

export interface Settings {
  id: string;
  basePrice: number;
  exchangeRate: number; // USD to CRC
  cleaningFee: number;
  platformFeeAirbnb: number; // percentage
  platformFeeBooking: number; // percentage
  caretakerPayment: number;
  wifiName: string;
  wifiPassword: string;
  updatedAt: Date;
}

export interface Reservation {
  id: string;
  guestName: string;
  platform: Platform;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  pricePerNight: number;
  grossIncome: number;
  platformFee: number;
  cleaningFee: number;
  caretakerFee: number;
  taxIva: number; // 13% for direct bookings
  netIncome: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  notes?: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: 'USD' | 'CRC';
  date: Date;
  description?: string;
  receiptUrl?: string;
  createdAt: Date;
}

export interface Image {
  id: string;
  category: ImageCategory;
  url: string;
  description?: string;
  isMain: boolean;
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
