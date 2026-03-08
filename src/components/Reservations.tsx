import { useState, useMemo } from 'react';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Reservation, Platform, Settings } from '@/types';
import { 
  formatCurrency, 
  formatDateRange, 
  getPlatformColor
} from '@/lib/utils';

interface ReservationsProps {
  reservations: Reservation[];
  settings: Settings;
  onAddReservation: (reservation: Omit<Reservation, 'id' | 'nights' | 'grossIncome' | 'platformFee' | 'caretakerFee' | 'taxIva' | 'netIncome' | 'createdAt'>) => void;
  onUpdateReservation: (id: string, updates: Partial<Reservation>) => void;
  onDeleteReservation: (id: string) => void;
}

export function Reservations({ 
  reservations, 
  settings, 
  onAddReservation, 
  onDeleteReservation 
}: ReservationsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    guestName: '',
    platform: 'Airbnb' as Platform,
    checkIn: '',
    checkOut: '',
    pricePerNight: settings.basePrice,
    cleaningFee: settings.cleaningFee,
    status: 'confirmed' as const,
    notes: '',
  });

  const filteredReservations = useMemo(() => {
    return reservations
      .filter(res => {
        const matchesSearch = res.guestName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlatform = filterPlatform === 'all' || res.platform === filterPlatform;
        const matchesStatus = filterStatus === 'all' || res.status === filterStatus;
        return matchesSearch && matchesPlatform && matchesStatus;
      })
      .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
  }, [reservations, searchTerm, filterPlatform, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddReservation({
      guestName: formData.guestName,
      platform: formData.platform,
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
      pricePerNight: Number(formData.pricePerNight),
      cleaningFee: Number(formData.cleaningFee),
      status: formData.status,
      notes: formData.notes,
    });

    setFormData({
      guestName: '',
      platform: 'Airbnb',
      checkIn: '',
      checkOut: '',
      pricePerNight: settings.basePrice,
      cleaningFee: settings.cleaningFee,
      status: 'confirmed',
      notes: '',
    });
    setShowAddDialog(false);
  };

  const handleViewDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-[#2ECC71] text-white">Confirmada</Badge>;
      case 'pending':
        return <Badge className="bg-[#E6A800] text-[#0B0B0B]">Pendiente</Badge>;
      case 'cancelled':
        return <Badge className="bg-[#E74C3C] text-white">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F4F4F4]">Reservas</h2>
          <p className="text-[#F4F4F4]/60">Gestión de reservas de la cabaña</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-[#E6A800] text-[#0B0B0B] hover:bg-[#E6A800]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4F4F4]/50" />
              <Input
                placeholder="Buscar por nombre de huésped..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4] placeholder:text-[#F4F4F4]/40"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterPlatform} onValueChange={(v) => setFilterPlatform(v as Platform | 'all')}>
                <SelectTrigger className="w-[140px] bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0B0B] border-[#E6A800]/20">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Airbnb">Airbnb</SelectItem>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Directa">Directa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0B0B] border-[#E6A800]/20">
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
      <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E6A800]/20">
                  <th className="text-left p-4 text-sm font-medium text-[#F4F4F4]/60">Huésped</th>
                  <th className="text-left p-4 text-sm font-medium text-[#F4F4F4]/60">Fechas</th>
                  <th className="text-left p-4 text-sm font-medium text-[#F4F4F4]/60">Plataforma</th>
                  <th className="text-left p-4 text-sm font-medium text-[#F4F4F4]/60">Noches</th>
                  <th className="text-left p-4 text-sm font-medium text-[#F4F4F4]/60">Ingreso Neto</th>
                  <th className="text-left p-4 text-sm font-medium text-[#F4F4F4]/60">Estado</th>
                  <th className="text-right p-4 text-sm font-medium text-[#F4F4F4]/60">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#F4F4F4]/50">
                      No se encontraron reservas
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr 
                      key={reservation.id} 
                      className="border-b border-[#E6A800]/10 hover:bg-[#E6A800]/5 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium text-[#F4F4F4]">{reservation.guestName}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-[#F4F4F4]/70">
                          {formatDateRange(reservation.checkIn, reservation.checkOut)}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getPlatformColor(reservation.platform) }}
                          />
                          <span className="text-sm text-[#F4F4F4]/70">{reservation.platform}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[#F4F4F4]/70">{reservation.nights}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-[#E6A800]">
                          {formatCurrency(reservation.netIncome)}
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
                            className="h-8 w-8 text-[#F4F4F4]/60 hover:text-[#E6A800] hover:bg-[#E6A800]/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteReservation(reservation.id)}
                            className="h-8 w-8 text-[#F4F4F4]/60 hover:text-[#E74C3C] hover:bg-[#E74C3C]/10"
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
        <DialogContent className="bg-[#0B0B0B] border-[#E6A800]/20 text-[#F4F4F4] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Nueva Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guestName">Nombre del Huésped</Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                required
                className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
              />
            </div>

            <div>
              <Label htmlFor="platform">Plataforma</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(v) => setFormData({ ...formData, platform: v as Platform })}
              >
                <SelectTrigger className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0B0B] border-[#E6A800]/20">
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
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  required
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  required
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
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
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                  required
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
                />
              </div>
              <div>
                <Label htmlFor="cleaningFee">Tarifa de Limpieza (USD)</Label>
                <Input
                  id="cleaningFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cleaningFee}
                  onChange={(e) => setFormData({ ...formData, cleaningFee: Number(e.target.value) })}
                  required
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#E6A800] text-[#0B0B0B] hover:bg-[#E6A800]/90"
              >
                Guardar Reserva
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border-[#E6A800]/30 text-[#F4F4F4] hover:bg-[#E6A800]/10"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#0B0B0B] border-[#E6A800]/20 text-[#F4F4F4] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Detalle de Reserva</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#F4F4F4]/60">Huésped:</span>
                <span className="font-medium">{selectedReservation.guestName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#F4F4F4]/60">Plataforma:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getPlatformColor(selectedReservation.platform) }}
                  />
                  <span>{selectedReservation.platform}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#F4F4F4]/60">Fechas:</span>
                <span>{formatDateRange(selectedReservation.checkIn, selectedReservation.checkOut)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#F4F4F4]/60">Noches:</span>
                <span>{selectedReservation.nights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#F4F4F4]/60">Precio/noche:</span>
                <span>{formatCurrency(selectedReservation.pricePerNight)}</span>
              </div>
              
              <div className="border-t border-[#E6A800]/20 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F4F4F4]/60">Ingreso Bruto:</span>
                  <span>{formatCurrency(selectedReservation.grossIncome)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F4F4F4]/60">Comisión Plataforma:</span>
                  <span className="text-[#E74C3C]">-{formatCurrency(selectedReservation.platformFee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F4F4F4]/60">Limpieza:</span>
                  <span className="text-[#E74C3C]">-{formatCurrency(selectedReservation.cleaningFee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F4F4F4]/60">Cuidador:</span>
                  <span className="text-[#E74C3C]">-{formatCurrency(selectedReservation.caretakerFee)}</span>
                </div>
                {selectedReservation.taxIva > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#F4F4F4]/60">IVA (13%):</span>
                    <span className="text-[#E74C3C]">-{formatCurrency(selectedReservation.taxIva)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[#E6A800]/20">
                  <span className="font-medium">Ingreso Neto:</span>
                  <span className="font-bold text-[#2ECC71] text-lg">
                    {formatCurrency(selectedReservation.netIncome)}
                  </span>
                </div>
              </div>

              {selectedReservation.notes && (
                <div className="pt-4">
                  <span className="text-[#F4F4F4]/60">Notas:</span>
                  <p className="mt-1 text-sm">{selectedReservation.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
