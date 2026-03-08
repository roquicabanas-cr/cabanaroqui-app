import { useMemo } from 'react';
import type { Reservation, Expense, DashboardKPIs, MonthlyStats } from '@/types';
import { useSettings } from './useSettings';

export function useDashboard(
  reservations: Reservation[],
  expenses: Expense[]
) {
  const { settings } = useSettings();

  const getCurrentMonthStats = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Get reservations for current month
    const monthReservations = reservations.filter(res => {
      const checkIn = new Date(res.checkIn);
      return checkIn.getFullYear() === currentYear && 
             checkIn.getMonth() === currentMonth &&
             res.status !== 'cancelled';
    });

    // Calculate income
    const currentMonthIncome = monthReservations.reduce(
      (sum, res) => sum + res.netIncome, 
      0
    );

    // Calculate expenses
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getFullYear() === currentYear && expDate.getMonth() === currentMonth;
    });

    const currentMonthExpenses = monthExpenses.reduce((sum, exp) => {
      const amountInUSD = exp.currency === 'CRC' 
        ? exp.amount / settings.exchangeRate 
        : exp.amount;
      return sum + amountInUSD;
    }, 0);

    // Calculate occupancy
    const occupiedNights = new Set<string>();
    monthReservations.forEach(res => {
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        occupiedNights.add(d.toISOString().split('T')[0]);
      }
    });

    const currentMonthOccupancy = (occupiedNights.size / daysInMonth) * 100;

    // Net profit
    const currentMonthNetProfit = currentMonthIncome - currentMonthExpenses;

    return {
      currentMonthIncome,
      currentMonthExpenses,
      currentMonthNetProfit,
      currentMonthOccupancy,
      reservationCount: monthReservations.length,
    };
  };

  const getUpcomingReservations = (limit: number = 3) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return reservations
      .filter(res => new Date(res.checkIn) >= today && res.status !== 'cancelled')
      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
      .slice(0, limit);
  };

  const getKPIs = (): DashboardKPIs => {
    const stats = getCurrentMonthStats();
    const upcoming = getUpcomingReservations(3);

    return {
      currentMonthIncome: stats.currentMonthIncome,
      currentMonthExpenses: stats.currentMonthExpenses,
      currentMonthNetProfit: stats.currentMonthNetProfit,
      currentMonthOccupancy: stats.currentMonthOccupancy,
      totalReservations: stats.reservationCount,
      upcomingReservations: upcoming,
    };
  };

  const getMonthlyStats = (months: number = 6): MonthlyStats[] => {
    const stats: MonthlyStats[] = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Income
      const monthReservations = reservations.filter(res => {
        const checkIn = new Date(res.checkIn);
        return checkIn.getFullYear() === year && 
               checkIn.getMonth() === month &&
               res.status !== 'cancelled';
      });
      
      const income = monthReservations.reduce((sum, res) => sum + res.netIncome, 0);
      
      // Expenses
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getFullYear() === year && expDate.getMonth() === month;
      });
      
      const expensesTotal = monthExpenses.reduce((sum, exp) => {
        const amountInUSD = exp.currency === 'CRC' 
          ? exp.amount / settings.exchangeRate 
          : exp.amount;
        return sum + amountInUSD;
      }, 0);
      
      // Occupancy
      const occupiedNights = new Set<string>();
      monthReservations.forEach(res => {
        const checkIn = new Date(res.checkIn);
        const checkOut = new Date(res.checkOut);
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() === month) {
            occupiedNights.add(d.toISOString().split('T')[0]);
          }
        }
      });
      
      const occupancyRate = (occupiedNights.size / daysInMonth) * 100;
      
      stats.push({
        month: date.toLocaleString('es-ES', { month: 'short' }),
        year,
        income,
        expenses: expensesTotal,
        netProfit: income - expensesTotal,
        occupancyRate,
        reservationCount: monthReservations.length,
      });
    }
    
    return stats;
  };

  const getPlatformDistribution = () => {
    const distribution: Record<string, { count: number; income: number }> = {
      Airbnb: { count: 0, income: 0 },
      Booking: { count: 0, income: 0 },
      Directa: { count: 0, income: 0 },
    };

    reservations
      .filter(res => res.status !== 'cancelled')
      .forEach(res => {
        distribution[res.platform].count++;
        distribution[res.platform].income += res.netIncome;
      });

    return distribution;
  };

  const kpis = useMemo(() => getKPIs(), [reservations, expenses, settings]);
  const monthlyStats = useMemo(() => getMonthlyStats(), [reservations, expenses, settings]);
  const platformDistribution = useMemo(() => getPlatformDistribution(), [reservations]);

  return {
    kpis,
    monthlyStats,
    platformDistribution,
    getCurrentMonthStats,
    getUpcomingReservations,
    getMonthlyStats,
    getPlatformDistribution,
  };
}
