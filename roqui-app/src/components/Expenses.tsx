'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Trash2, Receipt, Upload } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import type { Expense, ExpenseCategory } from '@/types'
import { getExpenseCategoryLabel, formatCurrency } from '@/lib/utils'
import { useStorage } from '@/hooks/useStorage'

interface ExpensesProps {
  expenses: Expense[]
  exchangeRate: number
  onAddExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => void
  onDeleteExpense: (id: string) => void
}

const categoryColors: Record<ExpenseCategory, string> = {
  electricidad: '#E6A800',
  agua: '#3498DB',
  internet: '#9B59B6',
  mantenimiento: '#E67E22',
  cuidador: '#2ECC71',
  impuestos: '#E74C3C',
  otros: '#95A5A6',
}

export function Expenses({ 
  expenses, 
  exchangeRate, 
  onAddExpense, 
  onDeleteExpense 
}: ExpensesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)
  
  const { uploadReceipt, uploading, progress } = useStorage()

  const [formData, setFormData] = useState({
    category: 'electricidad' as ExpenseCategory,
    amount: '',
    currency: 'USD' as 'USD' | 'CRC',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receipt_url: '',
  })

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(exp => {
        const matchesSearch = 
          exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getExpenseCategoryLabel(exp.category).toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === 'all' || exp.category === filterCategory
        return matchesSearch && matchesCategory
      })
      .slice(0, 20)
  }, [expenses, searchTerm, filterCategory])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadingFile(file)
      const { url, error } = await uploadReceipt(file)
      if (error) {
        alert('Error al subir el recibo: ' + error)
      } else {
        setFormData({ ...formData, receipt_url: url || '' })
      }
      setUploadingFile(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onAddExpense({
      category: formData.category,
      amount: Number(formData.amount),
      currency: formData.currency,
      date: formData.date,
      description: formData.description,
      receipt_url: formData.receipt_url,
    })

    setFormData({
      category: 'electricidad',
      amount: '',
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      description: '',
      receipt_url: '',
    })
    setShowAddDialog(false)
  }

  const getTotalExpenses = () => {
    return expenses.reduce((total, exp) => {
      const amountInUSD = exp.currency === 'CRC' ? exp.amount / exchangeRate : exp.amount
      return total + amountInUSD
    }, 0)
  }

  const getCurrentMonthExpenses = () => {
    const now = new Date()
    return expenses
      .filter(exp => {
        const expDate = new Date(exp.date)
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
      })
      .reduce((total, exp) => {
        const amountInUSD = exp.currency === 'CRC' ? exp.amount / exchangeRate : exp.amount
        return total + amountInUSD
      }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-roqui-cream">Gastos</h2>
          <p className="text-roqui-cream/60">Registro de gastos operativos</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-roqui-cream/60">Gastos del Mes</p>
            <p className="text-2xl font-bold text-roqui-danger mt-1">
              {formatCurrency(getCurrentMonthExpenses())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-roqui-cream/60">Total de Gastos</p>
            <p className="text-2xl font-bold text-roqui-cream mt-1">
              {formatCurrency(getTotalExpenses())}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-roqui-cream/50" />
              <Input
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as ExpenseCategory | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="electricidad">Electricidad</SelectItem>
                <SelectItem value="agua">Agua</SelectItem>
                <SelectItem value="internet">Internet</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="cuidador">Cuidador</SelectItem>
                <SelectItem value="impuestos">Impuestos</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-roqui-cream">
            Últimos Gastos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-roqui-gold/20">
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Fecha</th>
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Categoría</th>
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Descripción</th>
                  <th className="text-left p-4 text-sm font-medium text-roqui-cream/60">Monto</th>
                  <th className="text-right p-4 text-sm font-medium text-roqui-cream/60">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-roqui-cream/50">
                      No se encontraron gastos
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr 
                      key={expense.id} 
                      className="border-b border-roqui-gold/10 hover:bg-roqui-gold/5 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-sm text-roqui-cream/70">
                          {new Date(expense.date).toLocaleDateString('es-ES')}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge 
                          className="text-white"
                          style={{ backgroundColor: categoryColors[expense.category] }}
                        >
                          {getExpenseCategoryLabel(expense.category)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-roqui-cream/70">
                          {expense.description || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-roqui-cream">
                          {formatCurrency(expense.amount, expense.currency)}
                        </span>
                        {expense.currency === 'CRC' && (
                          <span className="text-xs text-roqui-cream/50 ml-2">
                            (~{formatCurrency(expense.amount / exchangeRate)})
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {expense.receipt_url && (
                            <a
                              href={expense.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-roqui-cream/60 hover:text-roqui-gold hover:bg-roqui-gold/10"
                              >
                                <Receipt className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteExpense(expense.id)}
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

      {/* Add Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Nuevo Gasto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v as ExpenseCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricidad">Electricidad</SelectItem>
                  <SelectItem value="agua">Agua</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="cuidador">Cuidador</SelectItem>
                  <SelectItem value="impuestos">Impuestos</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(v) => setFormData({ ...formData, currency: v as 'USD' | 'CRC' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="CRC">CRC (₡)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej. Pago mensual de electricidad"
              />
            </div>

            <div>
              <Label htmlFor="receipt">Recibo (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {uploading && (
                  <span className="text-sm text-roqui-gold">{progress}%</span>
                )}
              </div>
              {formData.receipt_url && (
                <p className="text-sm text-roqui-success mt-1">
                  Recibo subido exitosamente
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={uploading}
              >
                Guardar Gasto
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
    </div>
  )
}
