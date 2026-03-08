'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/components/Dashboard'
import { Calendar } from '@/components/Calendar'
import { Reservations } from '@/components/Reservations'
import { Expenses } from '@/components/Expenses'
import { Settings } from '@/components/Settings'
import { Gallery } from '@/components/Gallery'
import { Analysis } from '@/components/Analysis'
import { Login } from '@/components/Login'
import { useReservations, useExpenses, useSettings, useImages, useNotes, useProfile } from '@/hooks/useSupabase'
import { useDashboard } from '@/hooks/useDashboard'
import { getCurrentUser, supabase } from '@/lib/supabase'
import { Toaster, toast } from 'sonner'

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const { profile } = useProfile()
  const { settings, loading: settingsLoading, createDefaultSettings } = useSettings()
  const { reservations, loading: reservationsLoading, addReservation, updateReservation, deleteReservation } = useReservations()
  const { expenses, loading: expensesLoading, addExpense, deleteExpense } = useExpenses()
  const { images, loading: imagesLoading, addImage, updateImage, deleteImage } = useImages()
  const { notes, loading: notesLoading, addNote, updateNote, deleteNote } = useNotes()

  const { kpis, monthlyStats } = useDashboard(reservations, expenses, settings?.exchange_rate || 515)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (settings === null && !settingsLoading) {
      createDefaultSettings()
    }
  }, [settings, settingsLoading])

  const checkUser = async () => {
    try {
      const user = await getCurrentUser()
      setUser(user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAddReservation = async (data: Parameters<typeof addReservation>[0]) => {
    const { error } = await addReservation(data)
    if (error) {
      toast.error('Error al crear la reserva: ' + error)
    } else {
      toast.success('Reserva creada exitosamente')
    }
  }

  const handleUpdateReservation = async (id: string, updates: Partial<Parameters<typeof updateReservation>[1]>) => {
    const { error } = await updateReservation(id, updates)
    if (error) {
      toast.error('Error al actualizar la reserva: ' + error)
    } else {
      toast.success('Reserva actualizada')
    }
  }

  const handleDeleteReservation = async (id: string) => {
    const { error } = await deleteReservation(id)
    if (error) {
      toast.error('Error al eliminar la reserva: ' + error)
    } else {
      toast.success('Reserva eliminada')
    }
  }

  const handleAddExpense = async (data: Parameters<typeof addExpense>[0]) => {
    const { error } = await addExpense(data)
    if (error) {
      toast.error('Error al registrar el gasto: ' + error)
    } else {
      toast.success('Gasto registrado exitosamente')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    const { error } = await deleteExpense(id)
    if (error) {
      toast.error('Error al eliminar el gasto: ' + error)
    } else {
      toast.success('Gasto eliminado')
    }
  }

  const handleAddImage = async (data: Parameters<typeof addImage>[0]) => {
    const { error } = await addImage(data)
    if (error) {
      toast.error('Error al agregar la imagen: ' + error)
    } else {
      toast.success('Imagen agregada exitosamente')
    }
  }

  const handleUpdateImage = async (id: string, updates: Partial<Parameters<typeof updateImage>[1]>) => {
    const { error } = await updateImage(id, updates)
    if (error) {
      toast.error('Error al actualizar la imagen: ' + error)
    } else {
      toast.success('Imagen actualizada')
    }
  }

  const handleDeleteImage = async (id: string) => {
    const { error } = await deleteImage(id)
    if (error) {
      toast.error('Error al eliminar la imagen: ' + error)
    } else {
      toast.success('Imagen eliminada')
    }
  }

  const handleUpdateSettings = async (updates: Parameters<typeof settings['updateSettings']>[0]) => {
    if (!settings) return
    const { error } = await settings.updateSettings(updates)
    if (error) {
      toast.error('Error al guardar la configuración: ' + error)
    } else {
      toast.success('Configuración guardada')
    }
  }

  const handleAddNote = async (data: Parameters<typeof addNote>[0]) => {
    const { error } = await addNote(data)
    if (error) {
      toast.error('Error al agregar la nota: ' + error)
    } else {
      toast.success('Nota agregada exitosamente')
    }
  }

  const handleUpdateNote = async (id: string, updates: Partial<Parameters<typeof updateNote>[1]>) => {
    const { error } = await updateNote(id, updates)
    if (error) {
      toast.error('Error al actualizar la nota: ' + error)
    } else {
      toast.success('Nota actualizada')
    }
  }

  const handleDeleteNote = async (id: string) => {
    const { error } = await deleteNote(id)
    if (error) {
      toast.error('Error al eliminar la nota: ' + error)
    } else {
      toast.success('Nota eliminada')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-roqui-black flex items-center justify-center">
        <div className="text-roqui-gold text-xl">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Login onLogin={checkUser} />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0B0B0B',
              border: '1px solid rgba(230, 168, 0, 0.2)',
              color: '#F4F4F4',
            },
          }}
        />
      </>
    )
  }

  const isLoading = reservationsLoading || expensesLoading || settingsLoading || imagesLoading || notesLoading

  if (isLoading) {
    return (
      <Layout currentView={currentView} onViewChange={setCurrentView} userEmail={user.email}>
        <div className="flex items-center justify-center h-64">
          <div className="text-roqui-gold text-xl">Cargando datos...</div>
        </div>
      </Layout>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard kpis={kpis} monthlyStats={monthlyStats} />
      
      case 'calendar':
        return (
          <Calendar
            reservations={reservations}
            onAddReservation={(_date) => {
              setCurrentView('reservations')
            }}
            onViewReservation={(_reservation) => {}}
          />
        )
      
      case 'reservations':
        return settings ? (
          <Reservations
            reservations={reservations}
            settings={settings}
            onAddReservation={handleAddReservation}
            onUpdateReservation={handleUpdateReservation}
            onDeleteReservation={handleDeleteReservation}
          />
        ) : null
      
      case 'expenses':
        return settings ? (
          <Expenses
            expenses={expenses}
            exchangeRate={settings.exchange_rate}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        ) : null

      case 'analysis':
        return settings ? (
          <Analysis
            reservations={reservations}
            expenses={expenses}
            exchangeRate={settings.exchange_rate}
            notes={notes}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        ) : null
      
      case 'settings':
        return settings ? (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        ) : null
      
      case 'gallery':
        return (
          <Gallery
            images={images}
            onAddImage={handleAddImage}
            onUpdateImage={handleUpdateImage}
            onDeleteImage={handleDeleteImage}
          />
        )
      
      default:
        return <Dashboard kpis={kpis} monthlyStats={monthlyStats} />
    }
  }

  return (
    <>
      <Layout 
        currentView={currentView} 
        onViewChange={setCurrentView}
        userEmail={user.email}
      >
        {renderContent()}
      </Layout>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0B0B0B',
            border: '1px solid rgba(230, 168, 0, 0.2)',
            color: '#F4F4F4',
          },
        }}
      />
    </>
  )
}
