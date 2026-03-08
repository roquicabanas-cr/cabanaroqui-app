'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn, signUp } from '@/lib/supabase'
import { toast } from 'sonner'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) {
          toast.error('Error al registrarse: ' + error.message)
        } else {
          toast.success('Registro exitoso. Por favor inicia sesión.')
          setIsSignUp(false)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error('Error al iniciar sesión: ' + error.message)
        } else {
          toast.success('Inicio de sesión exitoso')
          onLogin()
        }
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-roqui-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-roqui-gold/10 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-10 h-10">
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
          </div>
          <CardTitle className="text-2xl font-bold text-roqui-gold">
            ROQUI Control Center
          </CardTitle>
          <p className="text-roqui-cream/60 mt-2">
            {isSignUp ? 'Crear nueva cuenta' : 'Iniciar sesión'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading 
                ? 'Cargando...' 
                : isSignUp 
                  ? 'Registrarse' 
                  : 'Iniciar sesión'
              }
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-roqui-gold hover:underline"
            >
              {isSignUp 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
