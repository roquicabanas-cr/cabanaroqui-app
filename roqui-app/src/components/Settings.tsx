'use client'

import { useState } from 'react'
import { Save, DollarSign, Percent, Wifi } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Settings as SettingsType } from '@/types'

interface SettingsProps {
  settings: SettingsType
  onUpdateSettings: (updates: Partial<SettingsType>) => void
}

export function Settings({ settings, onUpdateSettings }: SettingsProps) {
  const [formData, setFormData] = useState({
    base_price: settings.base_price,
    exchange_rate: settings.exchange_rate,
    cleaning_fee: settings.cleaning_fee,
    airbnb_fee: settings.airbnb_fee,
    booking_fee: settings.booking_fee,
    caretaker_fee: settings.caretaker_fee,
    wifi_name: settings.wifi_name || '',
    wifi_password: settings.wifi_password || '',
  })

  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateSettings({
      base_price: Number(formData.base_price),
      exchange_rate: Number(formData.exchange_rate),
      cleaning_fee: Number(formData.cleaning_fee),
      airbnb_fee: Number(formData.airbnb_fee),
      booking_fee: Number(formData.booking_fee),
      caretaker_fee: Number(formData.caretaker_fee),
      wifi_name: formData.wifi_name,
      wifi_password: formData.wifi_password,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-roqui-cream">Configuración</h2>
        <p className="text-roqui-cream/60">Ajustes de operación y finanzas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-roqui-cream flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-roqui-gold" />
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
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                />
                <p className="text-xs text-roqui-cream/50 mt-1">
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
                  value={formData.cleaning_fee}
                  onChange={(e) => setFormData({ ...formData, cleaning_fee: Number(e.target.value) })}
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
                value={formData.caretaker_fee}
                onChange={(e) => setFormData({ ...formData, caretaker_fee: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-roqui-cream flex items-center gap-2">
              <Percent className="w-5 h-5 text-roqui-gold" />
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
                  value={formData.airbnb_fee}
                  onChange={(e) => setFormData({ ...formData, airbnb_fee: Number(e.target.value) })}
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
                  value={formData.booking_fee}
                  onChange={(e) => setFormData({ ...formData, booking_fee: Number(e.target.value) })}
                />
              </div>
            </div>
            <p className="text-sm text-roqui-cream/50">
              Las reservas directas incluyen automáticamente el 13% de IVA.
            </p>
          </CardContent>
        </Card>

        {/* Exchange Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-roqui-cream flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-roqui-gold" />
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
                value={formData.exchange_rate}
                onChange={(e) => setFormData({ ...formData, exchange_rate: Number(e.target.value) })}
              />
              <p className="text-xs text-roqui-cream/50 mt-1">
                Usado para convertir gastos en colones a dólares
              </p>
            </div>
          </CardContent>
        </Card>

        {/* WiFi Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-roqui-cream flex items-center gap-2">
              <Wifi className="w-5 h-5 text-roqui-gold" />
              Información Wi-Fi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wifiName">Nombre de Red (SSID)</Label>
                <Input
                  id="wifiName"
                  value={formData.wifi_name}
                  onChange={(e) => setFormData({ ...formData, wifi_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="wifiPassword">Contraseña</Label>
                <Input
                  id="wifiPassword"
                  value={formData.wifi_password}
                  onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })}
                />
              </div>
            </div>
            <p className="text-sm text-roqui-cream/50">
              Esta información se puede compartir con los huéspedes.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
          {saved && (
            <span className="text-roqui-success text-sm">
              ¡Cambios guardados exitosamente!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
