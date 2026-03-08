import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Reservation } from '@/types';
import { getPlatformColor, formatCurrency, cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CalendarProps {
  reservations: Reservation[];
  onAddReservation: (date: Date) => void;
  onViewReservation: (reservation: Reservation) => void;
}

export function Calendar({ reservations, onAddReservation, onViewReservation }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const days = useMemo(() => {
    const daysArray = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }
    
    return daysArray;
  }, [year, month, firstDayOfMonth, daysInMonth]);

  const getReservationsForDay = (day: number): Reservation[] => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    
    return reservations.filter(res => {
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      return date >= checkIn && date < checkOut && res.status !== 'cancelled';
    });
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    const dayReservations = getReservationsForDay(day);
    
    if (dayReservations.length > 0) {
      onViewReservation(dayReservations[0]);
    } else {
      setSelectedDate(date);
      setDialogOpen(true);
    }
  };

  const handleAddReservation = () => {
    if (selectedDate) {
      onAddReservation(selectedDate);
      setDialogOpen(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F4F4F4]">Calendario</h2>
          <p className="text-[#F4F4F4]/60">Vista mensual de reservas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-[#E6A800]/30 text-[#F4F4F4] hover:bg-[#E6A800]/10"
          >
            Hoy
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              className="border-[#E6A800]/30 text-[#F4F4F4] hover:bg-[#E6A800]/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2 min-w-[180px] text-center font-medium text-[#F4F4F4] capitalize">
              {monthName}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="border-[#E6A800]/30 text-[#F4F4F4] hover:bg-[#E6A800]/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E6A800' }} />
          <span className="text-sm text-[#F4F4F4]/70">Airbnb</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3498DB' }} />
          <span className="text-sm text-[#F4F4F4]/70">Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2ECC71' }} />
          <span className="text-sm text-[#F4F4F4]/70">Directa</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
        <CardContent className="p-4">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div 
                key={day} 
                className="text-center text-sm font-medium text-[#F4F4F4]/50 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <div 
                    key={`empty-${index}`} 
                    className="aspect-square"
                  />
                );
              }

              const dayReservations = getReservationsForDay(day);
              const hasReservation = dayReservations.length > 0;
              const isToday = 
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "aspect-square p-2 rounded-lg border transition-all duration-200 relative",
                    hasReservation 
                      ? "border-transparent" 
                      : "border-[#E6A800]/10 hover:border-[#E6A800]/30",
                    isToday && "ring-2 ring-[#E6A800] ring-offset-2 ring-offset-[#0B0B0B]"
                  )}
                  style={
                    hasReservation 
                      ? { backgroundColor: `${getPlatformColor(dayReservations[0].platform)}20` }
                      : {}
                  }
                >
                  <span className={cn(
                    "text-sm font-medium",
                    hasReservation ? "text-[#F4F4F4]" : "text-[#F4F4F4]/70"
                  )}>
                    {day}
                  </span>
                  
                  {hasReservation && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div 
                        className="h-1.5 rounded-full"
                        style={{ backgroundColor: getPlatformColor(dayReservations[0].platform) }}
                      />
                      {dayReservations.length > 1 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E6A800] rounded-full text-[10px] flex items-center justify-center text-[#0B0B0B] font-bold">
                          {dayReservations.length}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardContent className="p-4">
            <p className="text-sm text-[#F4F4F4]/60">Reservas este mes</p>
            <p className="text-2xl font-bold text-[#E6A800] mt-1">
              {reservations.filter(r => {
                const checkIn = new Date(r.checkIn);
                return checkIn.getMonth() === month && 
                       checkIn.getFullYear() === year &&
                       r.status !== 'cancelled';
              }).length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardContent className="p-4">
            <p className="text-sm text-[#F4F4F4]/60">Ingresos proyectados</p>
            <p className="text-2xl font-bold text-[#2ECC71] mt-1">
              {formatCurrency(
                reservations
                  .filter(r => {
                    const checkIn = new Date(r.checkIn);
                    return checkIn.getMonth() === month && 
                           checkIn.getFullYear() === year &&
                           r.status !== 'cancelled';
                  })
                  .reduce((sum, r) => sum + r.netIncome, 0)
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardContent className="p-4">
            <p className="text-sm text-[#F4F4F4]/60">Noches ocupadas</p>
            <p className="text-2xl font-bold text-[#F4F4F4] mt-1">
              {(() => {
                const occupiedDays = new Set();
                reservations
                  .filter(r => r.status !== 'cancelled')
                  .forEach(r => {
                    const checkIn = new Date(r.checkIn);
                    const checkOut = new Date(r.checkOut);
                    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
                      if (d.getMonth() === month && d.getFullYear() === year) {
                        occupiedDays.add(d.toISOString().split('T')[0]);
                      }
                    }
                  });
                return occupiedDays.size;
              })()} / {daysInMonth}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Reservation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0B0B0B] border-[#E6A800]/20 text-[#F4F4F4]">
          <DialogHeader>
            <DialogTitle>Día disponible</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-[#F4F4F4]/70">
              {selectedDate?.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-[#F4F4F4]/50">
              Este día está disponible. ¿Deseas crear una nueva reserva?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleAddReservation}
                className="flex-1 bg-[#E6A800] text-[#0B0B0B] hover:bg-[#E6A800]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Reserva
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-[#E6A800]/30 text-[#F4F4F4] hover:bg-[#E6A800]/10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
