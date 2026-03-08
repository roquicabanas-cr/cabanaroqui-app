import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate net income from gross income and fees
export function calculateNetIncome(
  grossIncome: number,
  platformFee: number,
  cleaningFee: number,
  caretakerFee: number,
  taxIva: number
): number {
  return grossIncome - platformFee - cleaningFee - caretakerFee - taxIva;
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Format date range
export function formatDateRange(checkIn: Date | string, checkOut: Date | string): string {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  
  const startStr = start.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
  
  const endStr = end.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  
  return `${startStr} - ${endStr}`;
}

// Format currency
export function formatCurrency(amount: number, currency: 'USD' | 'CRC' = 'USD'): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return `₡${Math.round(amount).toLocaleString('es-ES')}`;
}

// Get platform color
export function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'Airbnb':
      return '#E6A800'; // Dorado ROQUI
    case 'Booking':
      return '#3498DB'; // Azul
    case 'Directa':
      return '#2ECC71'; // Verde
    default:
      return '#9CA3AF';
  }
}

// Get expense category label
export function getExpenseCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    electricidad: 'Electricidad',
    agua: 'Agua',
    internet: 'Internet',
    mantenimiento: 'Mantenimiento',
    cuidador: 'Cuidador',
    impuestos: 'Impuestos',
    otros: 'Otros',
  };
  return labels[category] || category;
}

// Get image category label
export function getImageCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    cabana: 'Cabaña',
    habitaciones: 'Habitaciones',
    exteriores: 'Exteriores',
    amenidades: 'Amenidades',
  };
  return labels[category] || category;
}

// Check if date is in the past
export function isPastDate(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// Check if two date ranges overlap
export function dateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

// Get days between two dates
export function getDaysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
}

// Get month name
export function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month];
}
