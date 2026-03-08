'use client'

import { useState } from 'react'
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
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/supabase'

interface LayoutProps {
  children: React.ReactNode
  currentView: string
  onViewChange: (view: string) => void
  userEmail?: string
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
  { id: 'reservations', label: 'Reservas', icon: ClipboardList },
  { id: 'expenses', label: 'Gastos', icon: Receipt },
  { id: 'analysis', label: 'Análisis', icon: BarChart3 },
  { id: 'gallery', label: 'Galería', icon: ImageIcon },
  { id: 'settings', label: 'Configuración', icon: Settings },
]

export function Layout({ children, currentView, onViewChange, userEmail }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-roqui-black text-roqui-cream flex">
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
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-roqui-black border-r border-roqui-gold/20 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-roqui-gold/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-roqui-gold/10 flex items-center justify-center">
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
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-roqui-gold">ROQUI</h1>
                <p className="text-xs text-roqui-cream/60">Control Center</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-roqui-gold text-roqui-black font-medium" 
                      : "text-roqui-cream/70 hover:bg-roqui-gold/10 hover:text-roqui-cream"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-roqui-gold/20">
            {userEmail && (
              <div className="flex items-center gap-2 px-4 py-2 mb-2">
                <User className="w-4 h-4 text-roqui-cream/50" />
                <span className="text-sm text-roqui-cream/50 truncate">{userEmail}</span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-roqui-cream/50 hover:text-roqui-danger hover:bg-roqui-danger/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-roqui-gold/20 bg-roqui-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-roqui-gold/10 flex items-center justify-center">
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
            <span className="font-bold text-roqui-gold">ROQUI</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-roqui-gold/10"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
