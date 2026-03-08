# Guía de Deployment - ROQUI Control Center

## Resumen Rápido

Esta guía te llevará paso a paso para desplegar ROQUI Control Center con:
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Frontend:** Next.js en Vercel
- **Costo:** Gratuito para uso inicial

---

## Paso 1: Configurar Supabase

### 1.1 Crear Cuenta y Proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita (puedes usar GitHub)
3. Crea un nuevo proyecto:
   - **Nombre:** `roqui-control-center`
   - **Contraseña:** Genera una segura y guárdala
   - **Región:** Selecciona la más cercana a Costa Rica (us-east-1)

### 1.2 Obtener Credenciales

1. En el dashboard de Supabase, ve a **Project Settings** > **API**
2. Copia estos valores:
   - **URL:** `https://xxxxxxxx.supabase.co`
   - **anon public:** `eyJhbGciOiJIUzI1NiIs...`

### 1.3 Crear Tablas

Ve a **SQL Editor** > **New query** y ejecuta:

```sql
-- Configuración
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_price DECIMAL(10,2) DEFAULT 85,
  exchange_rate DECIMAL(10,2) DEFAULT 515,
  cleaning_fee DECIMAL(10,2) DEFAULT 25,
  airbnb_fee DECIMAL(5,2) DEFAULT 15,
  booking_fee DECIMAL(5,2) DEFAULT 18,
  caretaker_fee DECIMAL(10,2) DEFAULT 15,
  wifi_name TEXT,
  wifi_password TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservas
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('Airbnb', 'Booking', 'Directa')),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  cleaning_fee DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  caretaker_cost DECIMAL(10,2) NOT NULL,
  gross_income DECIMAL(10,2) NOT NULL,
  net_income DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Gastos
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Imágenes
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Notas
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Perfiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO settings (base_price, exchange_rate, cleaning_fee, airbnb_fee, booking_fee, caretaker_fee, wifi_name, wifi_password)
VALUES (85, 515, 25, 15, 18, 15, 'ROQUI Beach House', 'roqui2024');

-- Políticas RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "All users can modify settings" ON settings FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can view reservations" ON reservations FOR SELECT USING (true);
CREATE POLICY "All users can modify reservations" ON reservations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can view expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "All users can modify expenses" ON expenses FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can view images" ON images FOR SELECT USING (true);
CREATE POLICY "All users can modify images" ON images FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can view notes" ON notes FOR SELECT USING (true);
CREATE POLICY "All users can modify notes" ON notes FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Trigger para crear perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'viewer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 1.4 Crear Bucket de Storage

1. Ve a **Storage** en el sidebar
2. Click en **New bucket**
3. Nombre: `roqui-files`
4. Desmarca "Restrict public access"
5. Click en **Save**

---

## Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

---

## Paso 3: Deploy en Vercel

### 3.1 Subir a GitHub

```bash
# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit - ROQUI Control Center"

# Crear rama main
git branch -M main

# Conectar con GitHub (reemplaza con tu usuario)
git remote add origin https://github.com/TU_USUARIO/roqui-app.git

# Subir código
git push -u origin main
```

### 3.2 Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click en **Add New Project**
4. Importa el repositorio `roqui-app`
5. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
6. Click en **Deploy**

### 3.3 Configurar Dominio (Opcional)

1. En el dashboard de Vercel, ve a **Settings** > **Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones de DNS

---

## Paso 4: Primer Uso

### 4.1 Crear Usuario Admin

1. Abre la URL de tu app en Vercel
2. Regístrate con tu email
3. Ve a Supabase > SQL Editor
4. Ejecuta:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu-email@ejemplo.com';
```

### 4.2 Verificar Funcionamiento

1. Inicia sesión en la app
2. Ve a **Configuración** y ajusta precios
3. Crea una reserva de prueba
4. Verifica que aparezca en el Dashboard

---

## Solución de Problemas

### Error: "Failed to connect to Supabase"
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto Supabase esté activo

### Error: "Table does not exist"
- Verifica que ejecutaste el SQL de creación de tablas
- Revisa que no haya errores en el SQL Editor

### Las imágenes no se cargan
- Verifica que el bucket `roqui-files` exista
- Asegúrate de que no tenga restricciones de acceso público

---

## URLs Importantes

- **App en Vercel:** `https://roqui-app.vercel.app`
- **Supabase Dashboard:** `https://app.supabase.com`
- **Vercel Dashboard:** `https://vercel.com/dashboard`

---

## Soporte

Si tienes problemas:
1. Revisa los logs en Vercel (Deployments > Latest > Functions)
2. Verifica los logs en Supabase (Logs > API)
3. Abre un issue en el repositorio de GitHub
