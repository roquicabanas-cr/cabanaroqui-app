import { useState } from 'react';
import { Save, DollarSign, Percent, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Settings as SettingsType } from '@/types';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (updates: Partial<SettingsType>) => void;
}

export function Settings({ settings, onUpdateSettings }: SettingsProps) {
  const [formData, setFormData] = useState({
    basePrice: settings.basePrice,
    exchangeRate: settings.exchangeRate,
    cleaningFee: settings.cleaningFee,
    platformFeeAirbnb: settings.platformFeeAirbnb,
    platformFeeBooking: settings.platformFeeBooking,
    caretakerPayment: settings.caretakerPayment,
    wifiName: settings.wifiName,
    wifiPassword: settings.wifiPassword,
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      basePrice: Number(formData.basePrice),
      exchangeRate: Number(formData.exchangeRate),
      cleaningFee: Number(formData.cleaningFee),
      platformFeeAirbnb: Number(formData.platformFeeAirbnb),
      platformFeeBooking: Number(formData.platformFeeBooking),
      caretakerPayment: Number(formData.caretakerPayment),
      wifiName: formData.wifiName,
      wifiPassword: formData.wifiPassword,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#F4F4F4]">Configuración</h2>
        <p className="text-[#F4F4F4]/60">Ajustes de operación y finanzas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pricing Settings */}
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#F4F4F4] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#E6A800]" />
              Precios y Tarifas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Precio Base por Noche (USD)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
                />
                <p className="text-xs text-[#F4F4F4]/50 mt-1">
                  Precio predeterminado para nuevas reservas
                </p>
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
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="caretakerPayment">Pago al Cuidador por Reserva (USD)</Label>
              <Input
                id="caretakerPayment"
                type="number"
                min="0"
                step="0.01"
                value={formData.caretakerPayment}
                onChange={(e) => setFormData({ ...formData, caretakerPayment: Number(e.target.value) })}
                className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Fees */}
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#F4F4F4] flex items-center gap-2">
              <Percent className="w-5 h-5 text-[#E6A800]" />
              Comisiones de Plataformas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platformFeeAirbnb">Comisión Airbnb (%)</Label>
                <Input
                  id="platformFeeAirbnb"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.platformFeeAirbnb}
                  onChange={(e) => setFormData({ ...formData, platformFeeAirbnb: Number(e.target.value) })}
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
                />
              </div>
              <div>
                <Label htmlFor="platformFeeBooking">Comisión Booking (%)</Label>
                <Input
                  id="platformFeeBooking"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.platformFeeBooking}
                  onChange={(e) => setFormData({ ...formData, platformFeeBooking: Number(e.target.value) })}
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
                />
              </div>
            </div>
            <p className="text-sm text-[#F4F4F4]/50">
              Las reservas directas incluyen automáticamente el 13% de IVA.
            </p>
          </CardContent>
        </Card>

        {/* Exchange Rate */}
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#F4F4F4] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#E6A800]" />
              Tipo de Cambio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="exchangeRate">CRC por 1 USD</Label>
              <Input
                id="exchangeRate"
                type="number"
                min="0"
                step="1"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: Number(e.target.value) })}
                className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
              />
              <p className="text-xs text-[#F4F4F4]/50 mt-1">
                Usado para convertir gastos en colones a dólares
              </p>
            </div>
          </CardContent>
        </Card>

        {/* WiFi Info */}
        <Card className="bg-[#0B0B0B] border-[#E6A800]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#F4F4F4] flex items-center gap-2">
              <Wifi className="w-5 h-5 text-[#E6A800]" />
              Información Wi-Fi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wifiName">Nombre de Red (SSID)</Label>
                <Input
                  id="wifiName"
                  value={formData.wifiName}
                  onChange={(e) => setFormData({ ...formData, wifiName: e.target.value })}
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
                />
              </div>
              <div>
                <Label htmlFor="wifiPassword">Contraseña</Label>
                <Input
                  id="wifiPassword"
                  value={formData.wifiPassword}
                  onChange={(e) => setFormData({ ...formData, wifiPassword: e.target.value })}
                  className="bg-[#F4F4F4]/5 border-[#E6A800]/20 text-[#F4F4F4]"
                />
              </div>
            </div>
            <p className="text-sm text-[#F4F4F4]/50">
              Esta información se puede compartir con los huéspedes.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            className="bg-[#E6A800] text-[#0B0B0B] hover:bg-[#E6A800]/90"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
          {saved && (
            <span className="text-[#2ECC71] text-sm">
              ¡Cambios guardados exitosamente!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
