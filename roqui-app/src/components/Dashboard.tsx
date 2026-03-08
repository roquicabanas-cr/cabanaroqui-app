'use client'

import { TrendingDown, TrendingUp, Calendar, DollarSign, Percent } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardKPIs, MonthlyStats } from '@/types'
import { formatCurrency, formatDateRange, getPlatformColor } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DashboardProps {
  kpis: DashboardKPIs
  monthlyStats: MonthlyStats[]
}

export function Dashboard({ kpis, monthlyStats }: DashboardProps) {
  const chartData = monthlyStats.map(stat => ({
    name: stat.month.charAt(0).toUpperCase() + stat.month.slice(1),
    Ingresos: Math.round(stat.income),
    Gastos: Math.round(stat.expenses),
    Ganancia: Math.round(stat.netProfit),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-roqui-cream">Dashboard</h2>
          <p className="text-roqui-cream/60">Resumen de operaciones de ROQUI Beach House</p>
        </div>
        <div className="text-sm text-roqui-cream/50">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-roqui-cream/60 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-roqui-gold" />
              Ingresos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-roqui-cream">
              {formatCurrency(kpis.currentMonthIncome)}
            </div>
            <p className="text-xs text-roqui-cream/50 mt-1">
              Neto después de comisiones
            </p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-roqui-cream/60 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-roqui-danger" />
              Gastos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-roqui-cream">
              {formatCurrency(kpis.currentMonthExpenses)}
            </div>
            <p className="text-xs text-roqui-cream/50 mt-1">
              Total de operaciones
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-roqui-cream/60 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-roqui-success" />
              Ganancia Neta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.currentMonthNetProfit >= 0 ? 'text-roqui-success' : 'text-roqui-danger'}`}>
              {formatCurrency(kpis.currentMonthNetProfit)}
            </div>
            <p className="text-xs text-roqui-cream/50 mt-1">
              Ingresos - Gastos
            </p>
          </CardContent>
        </Card>

        {/* Occupancy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-roqui-cream/60 flex items-center gap-2">
              <Percent className="w-4 h-4 text-roqui-gold" />
              Ocupación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-roqui-cream">
              {kpis.currentMonthOccupancy.toFixed(1)}%
            </div>
            <p className="text-xs text-roqui-cream/50 mt-1">
              {kpis.totalReservations} reservas este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Upcoming Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-roqui-cream">
              Ingresos vs Gastos (Últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(230, 168, 0, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(244, 244, 244, 0.5)" 
                    fontSize={12}
                    tick={{ fill: 'rgba(244, 244, 244, 0.7)' }}
                  />
                  <YAxis 
                    stroke="rgba(244, 244, 244, 0.5)" 
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fill: 'rgba(244, 244, 244, 0.7)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0B0B0B', 
                      border: '1px solid rgba(230, 168, 0, 0.3)',
                      borderRadius: '8px',
                      color: '#F4F4F4'
                    }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelStyle={{ color: '#F4F4F4' }}
                  />
                  <Legend wrapperStyle={{ color: '#F4F4F4' }} />
                  <Bar dataKey="Ingresos" fill="#E6A800" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#E74C3C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Ganancia" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-roqui-cream flex items-center gap-2">
              <Calendar className="w-5 h-5 text-roqui-gold" />
              Próximas Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.upcomingReservations.length === 0 ? (
                <p className="text-roqui-cream/50 text-center py-8">
                  No hay reservas próximas
                </p>
              ) : (
                kpis.upcomingReservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    className="p-4 rounded-lg bg-roqui-cream/5 border border-roqui-gold/10 hover:border-roqui-gold/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-roqui-cream">
                          {reservation.guest_name}
                        </p>
                        <p className="text-sm text-roqui-cream/60 mt-1">
                          {formatDateRange(reservation.check_in, reservation.check_out)}
                        </p>
                        <p className="text-sm text-roqui-cream/50 mt-1">
                          {reservation.nights} noches
                        </p>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPlatformColor(reservation.platform) }}
                      />
                    </div>
                    <div className="mt-3 pt-3 border-t border-roqui-gold/10 flex justify-between items-center">
                      <span className="text-xs text-roqui-cream/50">
                        {reservation.platform}
                      </span>
                      <span className="font-medium text-roqui-gold">
                        {formatCurrency(reservation.net_income)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
