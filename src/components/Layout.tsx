import { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  Receipt, 
  Settings, 
  Image as ImageIcon,
  BarChart3,
  Menu,
  LogOut,
  Share2,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onExportData?: () => void;
  onImportData?: (data: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
  { id: 'reservations', label: 'Reservas', icon: ClipboardList },
  { id: 'expenses', label: 'Gastos', icon: Receipt },
  { id: 'analysis', label: 'Análisis', icon: BarChart3 },
  { id: 'gallery', label: 'Galería', icon: ImageIcon },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export function Layout({ children, currentView, onViewChange, onExportData, onImportData }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');

  const handleExport = () => {
    if (onExportData) {
      onExportData();
    }
    setShareDialogOpen(false);
  };

  const handleImport = () => {
    if (onImportData && importData.trim()) {
      onImportData(importData.trim());
      setImportData('');
      setShareDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F4F4F4] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0B0B0B] border-r border-[#E6A800]/20 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#E6A800]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E6A800]/10 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-7 h-7">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E6A800" strokeWidth="2"/>
                  <path 
                    d="M50 20 Q65 20 70 35 Q75 50 60 65 Q50 75 40 65 Q25 50 30 35 Q35 20 50 20" 
                    fill="none" 
                    stroke="#E6A800" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M35 55 L50 40 L65 55 L65 75 L35 75 Z" 
                    fill="none" 
                    stroke="#E6A800" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M40 75 L40 65 L50 60 L60 65 L60 75" 
                    fill="none" 
                    stroke="#E6A800" 
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#E6A800]">ROQUI</h1>
                <p className="text-xs text-[#F4F4F4]/60">Control Center</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-[#E6A800] text-[#0B0B0B] font-medium" 
                      : "text-[#F4F4F4]/70 hover:bg-[#E6A800]/10 hover:text-[#F4F4F4]"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#E6A800]/20">
            <div className="flex items-center gap-3 px-4 py-3 text-[#F4F4F4]/50 text-sm">
              <LogOut className="w-4 h-4" />
              <span>Uvita, Costa Rica</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between p-4 border-b border-[#E6A800]/20 bg-[#0B0B0B]">
          <div className="flex items-center gap-3">
            <span className="text-[#F4F4F4]/60 text-sm">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <Button
            onClick={() => setShareDialogOpen(true)}
            className="bg-[#E6A800] text-[#0B0B0B] hover:bg-[#E6A800]/90"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir Datos
          </Button>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-[#E6A800]/20 bg-[#0B0B0B]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6A800]/10 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-5 h-5">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#E6A800" strokeWidth="2"/>
                <path 
                  d="M50 20 Q65 20 70 35 Q75 50 60 65 Q50 75 40 65 Q25 50 30 35 Q35 20 50 20" 
                  fill="none" 
                  stroke="#E6A800" 
                  strokeWidth="2"
                />
                <path 
                  d="M35 55 L50 40 L65 55 L65 75 L35 75 Z" 
                  fill="none" 
                  stroke="#E6A800" 
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className="font-bold text-[#E6A800]">ROQUI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShareDialogOpen(true)}
              className="bg-[#E6A800] text-[#0B0B0B] hover:bg-[#E6A800]/90"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-[#E6A800]/10"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-[#0B0B0B] border-[#E6A800]/20 text-[#F4F4F4] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#E6A800]" />
              Compartir Datos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="p-4 bg-[#F4F4F4]/5 rounded-lg border border-[#E6A800]/10">
              <h4 className="font-medium text-[#F4F4F4] mb-2">Exportar Datos</h4>
              <p className="text-sm text-[#F4F4F4]/60 mb-4">
                Descarga todos tus datos (reservas, gastos, configuración) en formato JSON para compartir con tu equipo.
              </p>
              <Button
                onClick={handleExport}
                className="w-full bg-[#E6A800] text-[#0B0B0B] hover:bg-[#E6A800]/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Datos
              </Button>
            </div>

            <div className="border-t border-[#E6A800]/20 pt-4">
              <h4 className="font-medium text-[#F4F4F4] mb-2">Importar Datos</h4>
              <p className="text-sm text-[#F4F4F4]/60 mb-4">
                Pega el código JSON para cargar datos compartidos.
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Pega aquí el código JSON..."
                className="w-full h-32 p-3 bg-[#F4F4F4]/5 border border-[#E6A800]/20 rounded-lg text-[#F4F4F4] text-sm placeholder:text-[#F4F4F4]/40 resize-none"
              />
              <Button
                onClick={handleImport}
                disabled={!importData.trim()}
                className="w-full mt-3 bg-[#2ECC71] text-[#0B0B0B] hover:bg-[#2ECC71]/90 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Cargar Datos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
