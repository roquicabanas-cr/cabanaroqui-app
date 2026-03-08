import { TrendingDown, TrendingUp, Calendar, DollarSign, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardKPIs, MonthlyStats } from '@/types';
import { formatCurrency, formatDateRange, getPlatformColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  kpis: DashboardKPIs;
  monthlyStats: MonthlyStats[];
}

export function Dashboard({ kpis, monthlyStats }: DashboardProps) {
  const chartData = monthlyStats.map(stat => ({
    name: stat.month,
    Ingresos: Math.round(stat.income),
    Gastos: Math.round(stat.expenses),
    Ganancia: Math.round(stat.netProfit),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F4F4F4]">Dashboard</h2>
          <p className="text-[#F4F4F4]/60">Resumen de operaciones de ROQUI Beach House</p>
        </div>
        <div className="text-sm text-[#F4F4F4]/50">
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
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#F4F4F4]/60 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#E6A800]" />
              Ingresos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F4F4F4]">
              {formatCurrency(kpis.currentMonthIncome)}
            </div>
            <p className="text-xs text-[#F4F4F4]/50 mt-1">
              Neto después de comisiones
            </p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#F4F4F4]/60 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#E74C3C]" />
              Gastos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F4F4F4]">
              {formatCurrency(kpis.currentMonthExpenses)}
            </div>
            <p className="text-xs text-[#F4F4F4]/50 mt-1">
              Total de operaciones
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#F4F4F4]/60 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2ECC71]" />
              Ganancia Neta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.currentMonthNetProfit >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}`}>
              {formatCurrency(kpis.currentMonthNetProfit)}
            </div>
            <p className="text-xs text-[#F4F4F4]/50 mt-1">
              Ingresos - Gastos
            </p>
          </CardContent>
        </Card>

        {/* Occupancy */}
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#F4F4F4]/60 flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#E6A800]" />
              Ocupación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F4F4F4]">
              {kpis.currentMonthOccupancy.toFixed(1)}%
            </div>
            <p className="text-xs text-[#F4F4F4]/50 mt-1">
              {kpis.totalReservations} reservas este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Upcoming Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#F4F4F4]">
              Ingresos vs Gastos (Últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6A800/10" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#F4F4F4/50" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#F4F4F4/50" 
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0B0B0B', 
                      border: '1px solid rgba(230, 168, 0, 0.2)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="Ingresos" fill="#E6A800" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#E74C3C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Ganancia" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reservations */}
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#F4F4F4] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E6A800]" />
              Próximas Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.upcomingReservations.length === 0 ? (
                <p className="text-[#F4F4F4]/50 text-center py-8">
                  No hay reservas próximas
                </p>
              ) : (
                kpis.upcomingReservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    className="p-4 rounded-lg bg-[#F4F4F4]/5 border border-[#E6A800]/10 hover:border-[#E6A800]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-[#F4F4F4]">
                          {reservation.guestName}
                        </p>
                        <p className="text-sm text-[#F4F4F4]/60 mt-1">
                          {formatDateRange(reservation.checkIn, reservation.checkOut)}
                        </p>
                        <p className="text-sm text-[#F4F4F4]/50 mt-1">
                          {reservation.nights} noches
                        </p>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPlatformColor(reservation.platform) }}
                      />
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#E6A800]/10 flex justify-between items-center">
                      <span className="text-xs text-[#F4F4F4]/50">
                        {reservation.platform}
                      </span>
                      <span className="font-medium text-[#E6A800]">
                        {formatCurrency(reservation.netIncome)}
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
  );
}
