import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Calendar } from '@/components/Calendar';
import { Reservations } from '@/components/Reservations';
import { Expenses } from '@/components/Expenses';
import { Settings } from '@/components/Settings';
import { Gallery } from '@/components/Gallery';
import { Analysis } from '@/components/Analysis';
import { useReservations } from '@/hooks/useReservations';
import { useExpenses } from '@/hooks/useExpenses';
import { useSettings } from '@/hooks/useSettings';
import { useDashboard } from '@/hooks/useDashboard';
import { useImages } from '@/hooks/useImages';
import { useNotes } from '@/hooks/useNotes';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  
  const { settings, updateSettings, setSettings } = useSettings();
  const { reservations, addReservation, updateReservation, deleteReservation, setReservations } = useReservations();
  const { expenses, addExpense, deleteExpense, setExpenses } = useExpenses();
  const { images, addImage, updateImage, deleteImage, setImages } = useImages();
  const { notes, addNote, updateNote, deleteNote, setNotes } = useNotes();
  const { kpis, monthlyStats } = useDashboard(reservations, expenses);

  const handleAddReservation = (data: Parameters<typeof addReservation>[0]) => {
    try {
      addReservation(data, settings);
      toast.success('Reserva creada exitosamente');
    } catch (error) {
      toast.error('Error al crear la reserva');
    }
  };

  const handleUpdateReservation = (id: string, updates: Partial<Parameters<typeof updateReservation>[1]>) => {
    try {
      updateReservation(id, updates);
      toast.success('Reserva actualizada');
    } catch (error) {
      toast.error('Error al actualizar la reserva');
    }
  };

  const handleDeleteReservation = (id: string) => {
    try {
      deleteReservation(id);
      toast.success('Reserva eliminada');
    } catch (error) {
      toast.error('Error al eliminar la reserva');
    }
  };

  const handleAddExpense = (data: Parameters<typeof addExpense>[0]) => {
    try {
      addExpense(data);
      toast.success('Gasto registrado exitosamente');
    } catch (error) {
      toast.error('Error al registrar el gasto');
    }
  };

  const handleDeleteExpense = (id: string) => {
    try {
      deleteExpense(id);
      toast.success('Gasto eliminado');
    } catch (error) {
      toast.error('Error al eliminar el gasto');
    }
  };

  const handleAddImage = (data: Parameters<typeof addImage>[0]) => {
    try {
      addImage(data);
      toast.success('Imagen agregada exitosamente');
    } catch (error) {
      toast.error('Error al agregar la imagen');
    }
  };

  const handleUpdateImage = (id: string, updates: Partial<Parameters<typeof updateImage>[1]>) => {
    try {
      updateImage(id, updates);
      toast.success('Imagen actualizada');
    } catch (error) {
      toast.error('Error al actualizar la imagen');
    }
  };

  const handleDeleteImage = (id: string) => {
    try {
      deleteImage(id);
      toast.success('Imagen eliminada');
    } catch (error) {
      toast.error('Error al eliminar la imagen');
    }
  };

  const handleUpdateSettings = (updates: Parameters<typeof updateSettings>[0]) => {
    try {
      updateSettings(updates);
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    }
  };

  const handleAddNote = (data: Parameters<typeof addNote>[0]) => {
    try {
      addNote(data);
      toast.success('Nota agregada exitosamente');
    } catch (error) {
      toast.error('Error al agregar la nota');
    }
  };

  const handleUpdateNote = (id: string, updates: Partial<Parameters<typeof updateNote>[1]>) => {
    try {
      updateNote(id, updates);
      toast.success('Nota actualizada');
    } catch (error) {
      toast.error('Error al actualizar la nota');
    }
  };

  const handleDeleteNote = (id: string) => {
    try {
      deleteNote(id);
      toast.success('Nota eliminada');
    } catch (error) {
      toast.error('Error al eliminar la nota');
    }
  };

  // Export all data to JSON file
  const handleExportData = () => {
    try {
      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings,
        reservations,
        expenses,
        images,
        notes
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roqui-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Datos exportados exitosamente');
    } catch (error) {
      toast.error('Error al exportar los datos');
    }
  };

  // Import data from JSON
  const handleImportData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate data structure
      if (!data.settings || !data.reservations || !data.expenses) {
        throw new Error('Formato de datos inválido');
      }

      // Convert date strings back to Date objects
      const processedReservations = data.reservations.map((r: any) => ({
        ...r,
        checkIn: new Date(r.checkIn),
        checkOut: new Date(r.checkOut),
        createdAt: new Date(r.createdAt)
      }));

      const processedExpenses = data.expenses.map((e: any) => ({
        ...e,
        date: new Date(e.date),
        createdAt: new Date(e.createdAt)
      }));

      const processedNotes = (data.notes || []).map((n: any) => ({
        ...n,
        date: new Date(n.date),
        createdAt: new Date(n.createdAt)
      }));

      // Update all state
      setSettings(data.settings);
      setReservations(processedReservations);
      setExpenses(processedExpenses);
      if (data.images) setImages(data.images);
      if (data.notes) setNotes(processedNotes);

      toast.success('Datos importados exitosamente');
    } catch (error) {
      toast.error('Error al importar los datos. Verifica el formato JSON.');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard kpis={kpis} monthlyStats={monthlyStats} />;
      
      case 'calendar':
        return (
          <Calendar
            reservations={reservations}
            onAddReservation={(_date) => {
              setCurrentView('reservations');
            }}
            onViewReservation={(_reservation) => {
              // Could open detail modal here
            }}
          />
        );
      
      case 'reservations':
        return (
          <Reservations
            reservations={reservations}
            settings={settings}
            onAddReservation={handleAddReservation}
            onUpdateReservation={handleUpdateReservation}
            onDeleteReservation={handleDeleteReservation}
          />
        );
      
      case 'expenses':
        return (
          <Expenses
            expenses={expenses}
            exchangeRate={settings.exchangeRate}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );

      case 'analysis':
        return (
          <Analysis
            reservations={reservations}
            expenses={expenses}
            exchangeRate={settings.exchangeRate}
            notes={notes}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        );
      
      case 'settings':
        return (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      
      case 'gallery':
        return (
          <Gallery
            images={images}
            onAddImage={handleAddImage}
            onUpdateImage={handleUpdateImage}
            onDeleteImage={handleDeleteImage}
          />
        );
      
      default:
        return <Dashboard kpis={kpis} monthlyStats={monthlyStats} />;
    }
  };

  return (
    <>
      <Layout 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onExportData={handleExportData}
        onImportData={handleImportData}
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
  );
}

export default App;
