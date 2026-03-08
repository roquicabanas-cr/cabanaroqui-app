import { useLocalStorage } from './useLocalStorage';
import type { Settings } from '@/types';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'roqui-settings';

const DEFAULT_SETTINGS: Settings = {
  id: '',
  basePrice: 85, // USD per night
  exchangeRate: 515, // CRC per USD
  cleaningFee: 25, // USD
  platformFeeAirbnb: 15, // 15%
  platformFeeBooking: 18, // 18%
  caretakerPayment: 15, // USD per reservation
  wifiName: 'ROQUI Beach House',
  wifiPassword: 'roqui2024',
  updatedAt: new Date(),
};

export function useSettings() {
  const [settings, setSettingsState] = useLocalStorage<Settings>(STORAGE_KEY, {
    ...DEFAULT_SETTINGS,
    id: generateId(),
  });

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
  };

  const updateSettings = (updates: Partial<Settings>): Settings => {
    const updated = {
      ...settings,
      ...updates,
      updatedAt: new Date(),
    };
    setSettingsState(updated);
    return updated;
  };

  const updateBasePrice = (price: number): void => {
    updateSettings({ basePrice: price });
  };

  const updateExchangeRate = (rate: number): void => {
    updateSettings({ exchangeRate: rate });
  };

  const updateCleaningFee = (fee: number): void => {
    updateSettings({ cleaningFee: fee });
  };

  const updatePlatformFees = (airbnb: number, booking: number): void => {
    updateSettings({ 
      platformFeeAirbnb: airbnb, 
      platformFeeBooking: booking 
    });
  };

  const updateCaretakerPayment = (payment: number): void => {
    updateSettings({ caretakerPayment: payment });
  };

  const updateWifiInfo = (name: string, password: string): void => {
    updateSettings({ 
      wifiName: name, 
      wifiPassword: password 
    });
  };

  const convertToCRC = (usdAmount: number): number => {
    return usdAmount * settings.exchangeRate;
  };

  const convertToUSD = (crcAmount: number): number => {
    return crcAmount / settings.exchangeRate;
  };

  const formatCurrency = (amount: number, currency: 'USD' | 'CRC' = 'USD'): string => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `₡${Math.round(amount).toLocaleString()}`;
  };

  return {
    settings,
    setSettings,
    updateSettings,
    updateBasePrice,
    updateExchangeRate,
    updateCleaningFee,
    updatePlatformFees,
    updateCaretakerPayment,
    updateWifiInfo,
    convertToCRC,
    convertToUSD,
    formatCurrency,
  };
}
