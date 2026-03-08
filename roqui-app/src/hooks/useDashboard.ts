'use client'

import { useMemo } from 'react'
import type { Reservation, Expense, DashboardKPIs, MonthlyStats } from '@/types'

export function useDashboard(
  reservations: Reservation[],
  expenses: Expense[],
  exchangeRate: number
) {
  const getCurrentMonthStats = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    const monthReservations = reservations.filter(res => {
      const checkIn = new Date(res.check_in)
      return checkIn.getFullYear() === currentYear && 
             checkIn.getMonth() === currentMonth &&
             res.status !== 'cancelled'
    })

    const currentMonthIncome = monthReservations.reduce(
      (sum, res) => sum + res.net_income, 
      0
    )

    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date)
      return expDate.getFullYear() === currentYear && expDate.getMonth() === currentMonth
    })

    const currentMonthExpenses = monthExpenses.reduce((sum, exp) => {
      const amountInUSD = exp.currency === 'CRC' 
        ? exp.amount / exchangeRate 
        : exp.amount
      return sum + amountInUSD
    }, 0)

    const occupiedNights = new Set<string>()
    monthReservations.forEach(res => {
      const checkIn = new Date(res.check_in)
      const checkOut = new Date(res.check_out)
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        occupiedNights.add(d.toISOString().split('T')[0])
      }
    })

    const currentMonthOccupancy = (occupiedNights.size / daysInMonth) * 100
    const currentMonthNetProfit = currentMonthIncome - currentMonthExpenses

    return {
      currentMonthIncome,
      currentMonthExpenses,
      currentMonthNetProfit,
      currentMonthOccupancy,
      reservationCount: monthReservations.length,
    }
  }

  const getUpcomingReservations = (limit: number = 3) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return reservations
      .filter(res => new Date(res.check_in) >= today && res.status !== 'cancelled')
      .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())
      .slice(0, limit)
  }

  const getKPIs = (): DashboardKPIs => {
    const stats = getCurrentMonthStats()
    const upcoming = getUpcomingReservations(3)

    return {
      currentMonthIncome: stats.currentMonthIncome,
      currentMonthExpenses: stats.currentMonthExpenses,
      currentMonthNetProfit: stats.currentMonthNetProfit,
      currentMonthOccupancy: stats.currentMonthOccupancy,
      totalReservations: stats.reservationCount,
      upcomingReservations: upcoming,
    }
  }

  const getMonthlyStats = (months: number = 6): MonthlyStats[] => {
    const stats: MonthlyStats[] = []
    const now = new Date()
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      
      const monthReservations = reservations.filter(res => {
        const checkIn = new Date(res.check_in)
        return checkIn.getFullYear() === year && 
               checkIn.getMonth() === month &&
               res.status !== 'cancelled'
      })
      
      const income = monthReservations.reduce((sum, res) => sum + res.net_income, 0)
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date)
        return expDate.getFullYear() === year && expDate.getMonth() === month
      })
      
      const expensesTotal = monthExpenses.reduce((sum, exp) => {
        const amountInUSD = exp.currency === 'CRC' 
          ? exp.amount / exchangeRate 
          : exp.amount
        return sum + amountInUSD
      }, 0)
      
      const occupiedNights = new Set<string>()
      monthReservations.forEach(res => {
        const checkIn = new Date(res.check_in)
        const checkOut = new Date(res.check_out)
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() === month) {
            occupiedNights.add(d.toISOString().split('T')[0])
          }
        }
      })
      
      const occupancyRate = (occupiedNights.size / daysInMonth) * 100
      
      stats.push({
        month: date.toLocaleString('es-ES', { month: 'short' }),
        year,
        income,
        expenses: expensesTotal,
        netProfit: income - expensesTotal,
        occupancyRate,
        reservationCount: monthReservations.length,
      })
    }
    
    return stats
  }

  const getPlatformDistribution = () => {
    const distribution: Record<string, { count: number; income: number }> = {
      Airbnb: { count: 0, income: 0 },
      Booking: { count: 0, income: 0 },
      Directa: { count: 0, income: 0 },
    }

    reservations
      .filter(res => res.status !== 'cancelled')
      .forEach(res => {
        distribution[res.platform].count++
        distribution[res.platform].income += res.net_income
      })

    return distribution
  }

  const kpis = useMemo(() => getKPIs(), [reservations, expenses, exchangeRate])
  const monthlyStats = useMemo(() => getMonthlyStats(), [reservations, expenses, exchangeRate])
  const platformDistribution = useMemo(() => getPlatformDistribution(), [reservations])

  return {
    kpis,
    monthlyStats,
    platformDistribution,
  }
}
