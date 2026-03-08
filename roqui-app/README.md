# ROQUI Control Center

Sistema de gestión profesional para ROQUI Beach House - Una cabaña turística de lujo en Uvita, Costa Rica.

## Características

- **Dashboard** con KPIs en tiempo real
- **Calendario** de reservas con vista mensual
- **Gestión de Reservas** con cálculo automático de ingresos
- **Registro de Gastos** con subida de recibos
- **Análisis Financiero** con gráficas y reportes
- **Galería de Imágenes** de la cabaña
- **Configuración** de precios y tarifas
- **Autenticación** multi-usuario con Supabase Auth
- **Persistencia de datos** en PostgreSQL
- **Almacenamiento de archivos** para recibos e imágenes

## Tecnologías

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Gráficas:** Recharts
- **UI Components:** Radix UI

## Requisitos Previos

- Node.js 18+
- Cuenta en Supabase (gratuita)
- Cuenta en Vercel (para deployment)

## Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda la URL y la anon key del proyecto

### 2. Crear Tablas

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Tabla de configuración
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

-- Tabla de reservas
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
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Tabla de gastos
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'CRC')),
  date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Tabla de imágenes
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Tabla de notas
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad (RLS)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: todos los usuarios autenticados pueden leer settings
CREATE POLICY "Settings are viewable by all users" ON settings
  FOR SELECT USING (true);

-- Política: solo admins pueden modificar settings
CREATE POLICY "Settings are editable by admins" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Política: usuarios pueden ver todas las reservas
CREATE POLICY "Reservations are viewable by all users" ON reservations
  FOR SELECT USING (true);

-- Política: usuarios pueden crear/modificar reservas
CREATE POLICY "Reservations are editable by authenticated users" ON reservations
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Política: usuarios pueden ver todos los gastos
CREATE POLICY "Expenses are viewable by all users" ON expenses
  FOR SELECT USING (true);

-- Política: usuarios pueden crear/modificar gastos
CREATE POLICY "Expenses are editable by authenticated users" ON expenses
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Política: usuarios pueden ver todas las imágenes
CREATE POLICY "Images are viewable by all users" ON images
  FOR SELECT USING (true);

-- Política: usuarios pueden crear/modificar imágenes
CREATE POLICY "Images are editable by authenticated users" ON images
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Política: usuarios pueden ver todas las notas
CREATE POLICY "Notes are viewable by all users" ON notes
  FOR SELECT USING (true);

-- Política: usuarios pueden crear/modificar notas
CREATE POLICY "Notes are editable by authenticated users" ON notes
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Política: usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente
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

### 3. Crear Bucket de Storage

1. Ve a Storage en el dashboard de Supabase
2. Crea un nuevo bucket llamado `roqui-files`
3. Configura las políticas de acceso público para lectura

## Instalación Local

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd roqui-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo de variables de entorno:
```bash
cp .env.local.example .env.local
```

4. Edita `.env.local` con tus credenciales de Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Deployment en Vercel

### 1. Preparar el Proyecto

Asegúrate de que tu `next.config.js` esté configurado correctamente:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '*.supabase.co'],
  },
}

module.exports = nextConfig
```

### 2. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/roqui-app.git
git push -u origin main
```

### 3. Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click en "Deploy"

### 4. Configurar Dominio Personalizado (Opcional)

1. En el dashboard de Vercel, ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar los DNS

## Uso del Sistema

### Primer Acceso

1. Registra un nuevo usuario en la pantalla de login
2. El primer usuario registrado debe ser configurado como admin en la tabla `profiles`
3. Para hacer un usuario admin, ejecuta en SQL:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu-email@ejemplo.com';
```

### Flujo de Trabajo

1. **Configuración**: Define precios base, comisiones y tarifas
2. **Reservas**: Registra nuevas reservas desde el calendario o el módulo de reservas
3. **Gastos**: Registra todos los gastos operativos con sus recibos
4. **Análisis**: Revisa el dashboard y reportes para tomar decisiones

## Estructura del Proyecto

```
roqui-app/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/           # Componentes UI reutilizables
│   │   ├── Analysis.tsx
│   │   ├── Calendar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Expenses.tsx
│   │   ├── Gallery.tsx
│   │   ├── Layout.tsx
│   │   ├── Login.tsx
│   │   ├── Reservations.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useDashboard.ts
│   │   ├── useStorage.ts
│   │   └── useSupabase.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── types/
│       ├── database.ts
│       └── index.ts
├── public/
├── .env.local.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Solución de Problemas

### Error: "Cannot find module"
Asegúrate de haber instalado todas las dependencias:
```bash
npm install
```

### Error de conexión a Supabase
Verifica que las variables de entorno estén correctamente configuradas en `.env.local`

### Las imágenes no se cargan
Verifica que el bucket `roqui-files` tenga las políticas de acceso público configuradas

## Soporte

Para reportar problemas o solicitar características, abre un issue en el repositorio.

## Licencia

Este proyecto es privado y pertenece a ROQUI Beach House.
