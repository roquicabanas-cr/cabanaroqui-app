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
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Format date range
export function formatDateRange(checkIn: string | Date, checkOut: string | Date): string {
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
      return '#E6A800';
    case 'Booking':
      return '#3498DB';
    case 'Directa':
      return '#2ECC71';
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

// Get month name
export function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month];
}

// Calculate nights between two dates
export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
