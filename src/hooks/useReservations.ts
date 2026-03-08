import { useLocalStorage } from './useLocalStorage';
import type { Reservation, Settings } from '@/types';
import { generateId, calculateNetIncome } from '@/lib/utils';

const STORAGE_KEY = 'roqui-reservations';

export function useReservations() {
  const [reservations, setReservationsState] = useLocalStorage<Reservation[]>(STORAGE_KEY, []);

  const setReservations = (newReservations: Reservation[]) => {
    setReservationsState(newReservations);
  };

  const addReservation = (
    data: Omit<Reservation, 'id' | 'nights' | 'grossIncome' | 'platformFee' | 'caretakerFee' | 'taxIva' | 'netIncome' | 'createdAt'>,
    settings: Settings
  ): Reservation => {
    const nights = Math.ceil(
      (new Date(data.checkOut).getTime() - new Date(data.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const grossIncome = nights * data.pricePerNight;
    
    let platformFeeRate = 0;
    if (data.platform === 'Airbnb') platformFeeRate = settings.platformFeeAirbnb / 100;
    else if (data.platform === 'Booking') platformFeeRate = settings.platformFeeBooking / 100;
    
    const platformFee = grossIncome * platformFeeRate;
    const cleaningFee = data.cleaningFee || settings.cleaningFee;
    const caretakerFee = settings.caretakerPayment;
    const taxIva = data.platform === 'Directa' ? grossIncome * 0.13 : 0;
    
    const netIncome = calculateNetIncome(
      grossIncome,
      platformFee,
      cleaningFee,
      caretakerFee,
      taxIva
    );

    const newReservation: Reservation = {
      ...data,
      id: generateId(),
      nights,
      grossIncome,
      platformFee,
      cleaningFee,
      caretakerFee,
      taxIva,
      netIncome,
      createdAt: new Date(),
    };

    setReservationsState([newReservation, ...reservations]);
    return newReservation;
  };

  const updateReservation = (id: string, updates: Partial<Reservation>): Reservation | null => {
    let updated: Reservation | null = null;
    
    setReservationsState(
      reservations.map(res => {
        if (res.id === id) {
          updated = { ...res, ...updates };
          return updated;
        }
        return res;
      })
    );
    
    return updated;
  };

  const deleteReservation = (id: string): boolean => {
    setReservationsState(reservations.filter(res => res.id !== id));
    return true;
  };

  const getReservationById = (id: string): Reservation | undefined => {
    return reservations.find(res => res.id === id);
  };

  const getReservationsByDateRange = (start: Date, end: Date): Reservation[] => {
    return reservations.filter(res => {
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      return (
        (checkIn >= start && checkIn <= end) ||
        (checkOut >= start && checkOut <= end) ||
        (checkIn <= start && checkOut >= end)
      );
    });
  };

  const getUpcomingReservations = (limit: number = 10): Reservation[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return [...reservations]
      .filter(res => new Date(res.checkIn) >= today && res.status !== 'cancelled')
      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
      .slice(0, limit);
  };

  const getReservationsForMonth = (year: number, month: number): Reservation[] => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    
    return reservations.filter(res => {
      const checkIn = new Date(res.checkIn);
      return checkIn >= startOfMonth && checkIn <= endOfMonth;
    });
  };

  const getOccupiedDates = (): Date[] => {
    const occupied: Date[] = [];
    
    reservations
      .filter(res => res.status !== 'cancelled')
      .forEach(res => {
        const checkIn = new Date(res.checkIn);
        const checkOut = new Date(res.checkOut);
        
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          occupied.push(new Date(d));
        }
      });
    
    return occupied;
  };

  return {
    reservations,
    setReservations,
    addReservation,
    updateReservation,
    deleteReservation,
    getReservationById,
    getReservationsByDateRange,
    getUpcomingReservations,
    getReservationsForMonth,
    getOccupiedDates,
  };
}
