'use client'

import { useState, useMemo } from 'react'
import { 
  TrendingDown, 
  PieChart, 
  BarChart3,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import type { Reservation, Expense } from '@/types'
import { formatCurrency, getExpenseCategoryLabel, getMonthName } from '@/lib/utils'

interface AnalysisProps {
  reservations: Reservation[]
  expenses: Expense[]
  exchangeRate: number
  notes: Note[]
  onAddNote: (note: Omit<Note, 'id' | 'created_at' | 'user_id'>) => void
  onUpdateNote: (id: string, updates: Partial<Note>) => void
  onDeleteNote: (id: string) => void
}

export interface Note {
  id: string
  title: string
  content: string
  category: 'general' | 'financial' | 'maintenance' | 'guest'
  date: string
  created_at?: string
  user_id?: string
}

const COLORS = ['#E6A800', '#3498DB', '#2ECC71', '#E74C3C', '#9B59B6', '#E67E22', '#95A5A6']

const noteCategoryLabels: Record<string, string> = {
  general: 'General',
  financial: 'Financiero',
  maintenance: 'Mantenimiento',
  guest: 'Huéspedes'
}

const noteCategoryColors: Record<string, string> = {
  general: '#E6A800',
  financial: '#2ECC71',
  maintenance: '#3498DB',
  guest: '#9B59B6'
}

export function Analysis({ 
  reservations, 
  expenses, 
  exchangeRate,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}: AnalysisProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'general' as Note['category']
  })

  // Calculate yearly stats
  const yearlyStats = useMemo(() => {
    const yearReservations = reservations.filter(r => {
      const checkIn = new Date(r.check_in)
      return checkIn.getFullYear() === selectedYear && r.status !== 'cancelled'
    })

    const yearExpenses = expenses.filter(e => {
      const expDate = new Date(e.date)
      return expDate.getFullYear() === selectedYear
    })

    const totalIncome = yearReservations.reduce((sum, r) => sum + r.net_income, 0)
    const totalExpenses = yearExpenses.reduce((sum, e) => {
      const amountUSD = e.currency === 'CRC' ? e.amount / exchangeRate : e.amount
      return sum + amountUSD
    }, 0)

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      reservationCount: yearReservations.length,
      totalNights: yearReservations.reduce((sum, r) => sum + r.nights, 0),
      avgNightlyRate: yearReservations.length > 0 
        ? totalIncome / yearReservations.reduce((sum, r) => sum + r.nights, 0)
        : 0
    }
  }, [reservations, expenses, selectedYear, exchangeRate])

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    const data = []
    for (let month = 0; month < 12; month++) {
      const monthReservations = reservations.filter(r => {
        const checkIn = new Date(r.check_in)
        return checkIn.getFullYear() === selectedYear && 
               checkIn.getMonth() === month &&
               r.status !== 'cancelled'
      })

      const monthExpenses = expenses.filter(e => {
        const expDate = new Date(e.date)
        return expDate.getFullYear() === selectedYear && expDate.getMonth() === month
      })

      const income = monthReservations.reduce((sum, r) => sum + r.net_income, 0)
      const expenseTotal = monthExpenses.reduce((sum, e) => {
        const amountUSD = e.currency === 'CRC' ? e.amount / exchangeRate : e.amount
        return sum + amountUSD
      }, 0)

      data.push({
        month: getMonthName(month).slice(0, 3),
        fullMonth: getMonthName(month),
        income: Math.round(income),
        expenses: Math.round(expenseTotal),
        profit: Math.round(income - expenseTotal),
        reservations: monthReservations.length,
        nights: monthReservations.reduce((sum, r) => sum + r.nights, 0)
      })
    }
    return data
  }, [reservations, expenses, selectedYear, exchangeRate])

  // Platform distribution
  const platformData = useMemo(() => {
    const distribution: Record<string, { count: number; income: number }> = {
      Airbnb: { count: 0, income: 0 },
      Booking: { count: 0, income: 0 },
      Directa: { count: 0, income: 0 },
    }

    reservations
      .filter(r => {
        const checkIn = new Date(r.check_in)
        return checkIn.getFullYear() === selectedYear && r.status !== 'cancelled'
      })
      .forEach(r => {
        distribution[r.platform].count++
        distribution[r.platform].income += r.net_income
      })

    return Object.entries(distribution)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({
        name,
        value: Math.round(data.income),
        count: data.count
      }))
  }, [reservations, selectedYear])

  // Expense breakdown by category
  const expenseCategoryData = useMemo(() => {
    const breakdown: Record<string, number> = {}
    
    expenses
      .filter(e => {
        const expDate = new Date(e.date)
        return expDate.getFullYear() === selectedYear
      })
      .forEach(e => {
        const amountUSD = e.currency === 'CRC' ? e.amount / exchangeRate : e.amount
        breakdown[e.category] = (breakdown[e.category] || 0) + amountUSD
      })

    return Object.entries(breakdown)
      .map(([category, amount]) => ({
        name: getExpenseCategoryLabel(category),
        value: Math.round(amount),
        category
      }))
      .sort((a, b) => b.value - a.value)
  }, [expenses, selectedYear, exchangeRate])

  // Occupancy trend
  const occupancyData = useMemo(() => {
    return monthlyData.map(m => ({
      month: m.month,
      occupancy: Math.min(100, Math.round((m.nights / 30) * 100))
    }))
  }, [monthlyData])

  const handleSaveNote = () => {
    if (editingNote) {
      onUpdateNote(editingNote.id, noteForm)
    } else {
      onAddNote({
        ...noteForm,
        date: new Date().toISOString()
      })
    }
    setNoteForm({ title: '', content: '', category: 'general' })
    setEditingNote(null)
    setShowNoteDialog(false)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteForm({
      title: note.title,
      content: note.content,
      category: note.category
    })
    setShowNoteDialog(true)
  }

  const years = Array.from(new Set([
    ...reservations.map(r => new Date(r.check_in).getFullYear()),
    ...expenses.map(e => new Date(e.date).getFullYear()),
    new Date().getFullYear()
  ])).sort((a, b) => b - a)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-roqui-cream">Análisis Financiero</h2>
          <p className="text-roqui-cream/60">Balances, estadísticas y reportes detallados</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-roqui-cream/5 border border-roqui-gold/20 text-roqui-cream rounded-lg px-3 py-2"
          >
            {years.map(year => (
              <option key={year} value={year} className="bg-roqui-black">{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-roqui-cream/60">Ingresos {selectedYear}</p>
            <p className="text-xl font-bold text-roqui-gold mt-1">
              {formatCurrency(yearlyStats.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-roqui-cream/60">Gastos {selectedYear}</p>
            <p className="text-xl font-bold text-roqui-danger mt-1">
              {formatCurrency(yearlyStats.totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-roqui-cream/60">Ganancia Neta</p>
            <p className={`text-xl font-bold mt-1 ${yearlyStats.netProfit >= 0 ? 'text-roqui-success' : 'text-roqui-danger'}`}>
              {formatCurrency(yearlyStats.netProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-roqui-cream/60">Reservas</p>
            <p className="text-xl font-bold text-roqui-cream mt-1">
              {yearlyStats.reservationCount}
            </p>
            <p className="text-xs text-roqui-cream/50">
              {yearlyStats.totalNights} noches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 bg-roqui-cream/5 mb-6">
          <TabsTrigger 
            value="overview" 
            className="text-roqui-cream/70 data-[state=active]:bg-roqui-gold data-[state=active]:text-roqui-black"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="platforms"
            className="text-roqui-cream/70 data-[state=active]:bg-roqui-gold data-[state=active]:text-roqui-black"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Plataformas
          </TabsTrigger>
          <TabsTrigger 
            value="expenses"
            className="text-roqui-cream/70 data-[state=active]:bg-roqui-gold data-[state=active]:text-roqui-black"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Gastos
          </TabsTrigger>
          <TabsTrigger 
            value="notes"
            className="text-roqui-cream/70 data-[state=active]:bg-roqui-gold data-[state=active]:text-roqui-black"
          >
            <FileText className="w-4 h-4 mr-2" />
            Notas
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Monthly Income vs Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-roqui-cream">
                Ingresos vs Gastos por Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(230, 168, 0, 0.1)" />
                    <XAxis dataKey="month" stroke="rgba(244, 244, 244, 0.5)" fontSize={12} tick={{ fill: 'rgba(244, 244, 244, 0.7)' }} />
                    <YAxis stroke="rgba(244, 244, 244, 0.5)" fontSize={12} tickFormatter={(v) => `$${v}`} tick={{ fill: 'rgba(244, 244, 244, 0.7)' }} />
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
                    <Bar dataKey="income" name="Ingresos" fill="#E6A800" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Gastos" fill="#E74C3C" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Ganancia" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-roqui-cream">
                Tendencia de Ocupación (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(230, 168, 0, 0.1)" />
                    <XAxis dataKey="month" stroke="rgba(244, 244, 244, 0.5)" fontSize={12} tick={{ fill: 'rgba(244, 244, 244, 0.7)' }} />
                    <YAxis stroke="rgba(244, 244, 244, 0.5)" fontSize={12} tickFormatter={(v) => `${v}%`} tick={{ fill: 'rgba(244, 244, 244, 0.7)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0B0B0B', 
                        border: '1px solid rgba(230, 168, 0, 0.3)',
                        borderRadius: '8px',
                        color: '#F4F4F4'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Ocupación']}
                      labelStyle={{ color: '#F4F4F4' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="occupancy" 
                      stroke="#E6A800" 
                      strokeWidth={3}
                      dot={{ fill: '#E6A800', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-roqui-cream">
                Resumen Mensual Detallado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-roqui-gold/20">
                      <th className="text-left p-3 text-sm font-medium text-roqui-cream/60">Mes</th>
                      <th className="text-right p-3 text-sm font-medium text-roqui-cream/60">Reservas</th>
                      <th className="text-right p-3 text-sm font-medium text-roqui-cream/60">Noches</th>
                      <th className="text-right p-3 text-sm font-medium text-roqui-cream/60">Ingresos</th>
                      <th className="text-right p-3 text-sm font-medium text-roqui-cream/60">Gastos</th>
                      <th className="text-right p-3 text-sm font-medium text-roqui-cream/60">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((month, idx) => (
                      <tr key={idx} className="border-b border-roqui-gold/10 hover:bg-roqui-gold/5">
                        <td className="p-3 text-roqui-cream">{month.fullMonth}</td>
                        <td className="p-3 text-right text-roqui-cream/70">{month.reservations}</td>
                        <td className="p-3 text-right text-roqui-cream/70">{month.nights}</td>
                        <td className="p-3 text-right text-roqui-gold">{formatCurrency(month.income)}</td>
                        <td className="p-3 text-right text-roqui-danger">{formatCurrency(month.expenses)}</td>
                        <td className={`p-3 text-right font-medium ${month.profit >= 0 ? 'text-roqui-success' : 'text-roqui-danger'}`}>
                          {formatCurrency(month.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-roqui-cream">
                  Distribución por Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0B0B0B', 
                          border: '1px solid rgba(230, 168, 0, 0.3)',
                          borderRadius: '8px',
                          color: '#F4F4F4'
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-roqui-cream">
                  Detalle por Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformData.map((platform, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-roqui-cream/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-roqui-cream">{platform.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-roqui-gold">{formatCurrency(platform.value)}</p>
                        <p className="text-xs text-roqui-cream/50">{platform.count} reservas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-roqui-cream">
                  Gastos por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseCategoryData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0B0B0B', 
                          border: '1px solid rgba(230, 168, 0, 0.3)',
                          borderRadius: '8px',
                          color: '#F4F4F4'
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-roqui-cream">
                  Desglose de Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseCategoryData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-roqui-cream/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-roqui-cream">{item.name}</span>
                      </div>
                      <span className="font-medium text-roqui-danger">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                  {expenseCategoryData.length === 0 && (
                    <p className="text-center text-roqui-cream/50 py-8">No hay gastos registrados</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-roqui-cream">Notas y Observaciones</h3>
            <Button
              onClick={() => {
                setEditingNote(null)
                setNoteForm({ title: '', content: '', category: 'general' })
                setShowNoteDialog(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Nota
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.length === 0 ? (
              <div className="col-span-full py-12 text-center text-roqui-cream/50">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay notas registradas</p>
              </div>
            ) : (
              notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge 
                        className="text-white text-xs"
                        style={{ backgroundColor: noteCategoryColors[note.category] }}
                      >
                        {noteCategoryLabels[note.category]}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditNote(note)}
                          className="h-7 w-7 text-roqui-cream/60 hover:text-roqui-gold hover:bg-roqui-gold/10"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteNote(note.id)}
                          className="h-7 w-7 text-roqui-cream/60 hover:text-roqui-danger hover:bg-roqui-danger/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="font-medium text-roqui-cream mb-2">{note.title}</h4>
                    <p className="text-sm text-roqui-cream/70 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-roqui-cream/40 mt-3">
                      {new Date(note.date).toLocaleDateString('es-ES')}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingNote ? 'Editar Nota' : 'Nueva Nota'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="noteTitle">Título</Label>
              <Input
                id="noteTitle"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                placeholder="Ej. Revisión mensual"
              />
            </div>
            <div>
              <Label htmlFor="noteCategory">Categoría</Label>
              <select
                id="noteCategory"
                value={noteForm.category}
                onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value as Note['category'] })}
                className="w-full p-2 bg-roqui-cream/5 border border-roqui-gold/20 text-roqui-cream rounded-lg"
              >
                <option value="general" className="bg-roqui-black">General</option>
                <option value="financial" className="bg-roqui-black">Financiero</option>
                <option value="maintenance" className="bg-roqui-black">Mantenimiento</option>
                <option value="guest" className="bg-roqui-black">Huéspedes</option>
              </select>
            </div>
            <div>
              <Label htmlFor="noteContent">Contenido</Label>
              <textarea
                id="noteContent"
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                placeholder="Escribe tu nota aquí..."
                rows={5}
                className="w-full p-3 bg-roqui-cream/5 border border-roqui-gold/20 text-roqui-cream rounded-lg resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveNote}
                disabled={!noteForm.title.trim()}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNoteDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
