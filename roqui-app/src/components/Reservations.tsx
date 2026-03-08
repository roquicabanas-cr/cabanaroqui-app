'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Reservation, Platform, Settings } from '@/types'
import { formatCurrency, formatDateRange, getPlatformColor, calculateNights } from '@/lib/utils'

interface ReservationsProps {
  reservations: Reservation[]
  settings: Settings
  onAddReservation: (reservation: Omit<Reservation, 'id' | 'created_at' | 'user_id' | 'nights' | 'gross_income' | 'platform_fee' | 'caretaker_cost' | 'net_income'>) => void
  onUpdateReservation: (id: string, updates: Partial<Reservation>) => void
  onDeleteReservation: (id: string) => void
}

export function Reservations({ 
  reservations, 
  settings, 
  onAddReservation, 
  onDeleteReservation 
}: ReservationsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const [formData, setFormData] = useState({
    guest_name: '',
    platform: 'Airbnb' as Platform,
    check_in: '',
    check_out: '',
    price_per_night: settings.base_price,
    cleaning_fee: settings.cleaning_fee,
    status: 'confirmed' as const,
    notes: '',
  })

  const filteredReservations = useMemo(() => {
    return reservations
      .filter(res => {
        const matchesSearch = res.guest_name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPlatform = filterPlatform === 'all' || res.platform === filterPlatform
        const matchesStatus = filterStatus === 'all' || res.status === filterStatus
        return matchesSearch && matchesPlatform && matchesStatus
      })
      .sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime())
  }, [reservations, searchTerm, filterPlatform, filterStatus])

  const calculateReservationTotals = (data: typeof formData) => {
    const nights = calculateNights(data.check_in, data.check_out)
    const grossIncome = nights * data.price_per_night
    
    let platformFeeRate = 0
    if (data.platform === 'Airbnb') platformFeeRate = settings.airbnb_fee / 100
    else if (data.platform === 'Booking') platformFeeRate = settings.booking_fee / 100
    
    const platformFee = grossIncome * platformFeeRate
    const cleaningFee = data.cleaning_fee
    const caretakerCost = settings.caretaker_fee
    
    const netIncome = grossIncome - platformFee - cleaningFee - caretakerCost

    return {
      nights,
      gross_income: grossIncome,
      platform_fee: platformFee,
      caretaker_cost: caretakerCost,
      net_income: netIncome,
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const totals = calculateReservationTotals(formData)
    
    onAddReservation({
      guest_name: formData.guest_name,
      platform: formData.platform,
      check_in: formData.check_in,
      check_out: formData.check_out,
      price_per_night: Number(formData.price_per_night),
      cleaning_fee: Number(formData.cleaning_fee),
      status: formData.status,
      notes: formData.notes,
      ...totals,
    })

    setFormData({
      guest_name: '',
      platform: 'Airbnb',
      check_in: '',
      check_out: '',
      price_per_night: settings.base_price,
      cleaning_fee: settings.cleaning_fee,
      status: 'confirmed',
      notes: '',
    })
    setShowAddDialog(false)
  }

  const handleViewDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowDetailDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmada</Badge>
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>
      case 'cancelled':
        return <Badge variant="danger">Cancelada</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-roqui-cream">Reservas</h2>
          <p className="text-roqui-cream/60">Gestión de reservas de la cabaña</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-roqui-cream/50" />
              <Input
                placeholder="Buscar por nombre de huésped..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterPlatform} onValueChange={(v) => setFilterPlatform(v as Platform | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Airbnb">Airbnb</SelectItem>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Directa">Directa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-roqui-gold/20">
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Huésped</th>
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Fechas</th>
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Plataforma</th>
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Noches</th>
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Ingreso Neto</th>
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Estado</th>
                  <th className="text-right p-4 text-sm font-medium text-roqui-cream/60">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-roqui-cream/50">
                      No se encontraron reservas
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr 
                      key={reservation.id} 
                      className="border-b border-roqui-gold/10 hover:bg-roqui-gold/5 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium text-roqui-cream">{reservation.guest_name}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-roqui-cream/70">
                          {formatDateRange(reservation.check_in, reservation.check_out)}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getPlatformColor(reservation.platform) }}
                          />
                          <span className="text-sm text-roqui-cream/70">{reservation.platform}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-roqui-cream/70">{reservation.nights}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-roqui-gold">
                          {formatCurrency(reservation.net_income)}
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(reservation)}
                            className="h-8 w-8 text-roqui-cream/60 hover:text-roqui-gold hover:bg-roqui-gold/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteReservation(reservation.id)}
                            className="h-8 w-8 text-roqui-cream/60 hover:text-roqui-danger hover:bg-roqui-danger/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Reservation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Nueva Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guestName">Nombre del Huésped</Label>
              <Input
                id="guestName"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="platform">Plataforma</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(v) => setFormData({ ...formData, platform: v as Platform })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Airbnb">Airbnb</SelectItem>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Directa">Directa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.check_in}
                  onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.check_out}
                  onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerNight">Precio por Noche (USD)</Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cleaningFee">Tarifa de Limpieza (USD)</Label>
                <Input
                  id="cleaningFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cleaning_fee}
                  onChange={(e) => setFormData({ ...formData, cleaning_fee: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Preview */}
            {formData.check_in && formData.check_out && (
              <div className="p-4 bg-roqui-cream/5 rounded-lg border border-roqui-gold/20">
                <p className="text-sm font-medium text-roqui-cream mb-2">Vista previa:</p>
                {(() => {
                  const preview = calculateReservationTotals(formData)
                  return (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-roqui-cream/60">Noches:</span>
                        <span className="text-roqui-cream">{preview.nights}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-roqui-cream/60">Ingreso bruto:</span>
                        <span className="text-roqui-gold">{formatCurrency(preview.gross_income)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-roqui-cream/60">Comisión:</span>
                        <span className="text-roqui-danger">-{formatCurrency(preview.platform_fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-roqui-cream/60">Limpieza:</span>
                        <span className="text-roqui-danger">-{formatCurrency(preview.caretaker_cost)}</span>
                      </div>
                      <div className="flex justify-between border-t border-roqui-gold/20 pt-1 mt-1">
                        <span className="text-roqui-cream font-medium">Ingreso neto:</span>
                        <span className="text-roqui-success font-bold">{formatCurrency(preview.net_income)}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
              >
                Guardar Reserva
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Detalle de Reserva</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-roqui-cream/60">Huésped:</span>
                <span className="font-medium text-roqui-cream">{selectedReservation.guest_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-roqui-cream/60">Plataforma:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getPlatformColor(selectedReservation.platform) }}
                  />
                  <span className="text-roqui-cream">{selectedReservation.platform}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-roqui-cream/60">Fechas:</span>
                <span className="text-roqui-cream">{formatDateRange(selectedReservation.check_in, selectedReservation.check_out)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-roqui-cream/60">Noches:</span>
                <span className="text-roqui-cream">{selectedReservation.nights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-roqui-cream/60">Precio/noche:</span>
                <span className="text-roqui-cream">{formatCurrency(selectedReservation.price_per_night)}</span>
              </div>
              
              <div className="border-t border-roqui-gold/20 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-roqui-cream/60">Ingreso Bruto:</span>
                  <span className="text-roqui-cream">{formatCurrency(selectedReservation.gross_income)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-roqui-cream/60">Comisión Plataforma:</span>
                  <span className="text-roqui-danger">-{formatCurrency(selectedReservation.platform_fee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-roqui-cream/60">Limpieza:</span>
                  <span className="text-roqui-danger">-{formatCurrency(selectedReservation.cleaning_fee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-roqui-cream/60">Cuidador:</span>
                  <span className="text-roqui-danger">-{formatCurrency(selectedReservation.caretaker_cost)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-roqui-gold/20">
                  <span className="font-medium text-roqui-cream">Ingreso Neto:</span>
                  <span className="font-bold text-roqui-success text-lg">
                    {formatCurrency(selectedReservation.net_income)}
                  </span>
                </div>
              </div>

              {selectedReservation.notes && (
                <div className="pt-4">
                  <span className="text-roqui-cream/60">Notas:</span>
                  <p className="mt-1 text-sm text-roqui-cream">{selectedReservation.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
