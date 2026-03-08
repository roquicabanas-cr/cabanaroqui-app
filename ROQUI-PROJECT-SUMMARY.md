# ROQUI Control Center - Resumen del Proyecto

## 📁 Estructura del Proyecto

El proyecto completo está en `/mnt/okcomputer/output/roqui-app/`

```
roqui-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Estilos globales con tema ROQUI
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página principal con auth
│   │
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes UI base
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   └── tabs.tsx
│   │   │
│   │   ├── Analysis.tsx        # Análisis financiero con gráficas
│   │   ├── Calendar.tsx        # Calendario de reservas
│   │   ├── Dashboard.tsx       # Dashboard con KPIs
│   │   ├── Expenses.tsx        # Gestión de gastos
│   │   ├── Gallery.tsx         # Galería de imágenes
│   │   ├── Layout.tsx          # Layout con sidebar
│   │   ├── Login.tsx           # Pantalla de login
│   │   ├── Reservations.tsx    # Gestión de reservas
│   │   └── Settings.tsx        # Configuración
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useDashboard.ts     # Lógica del dashboard
│   │   ├── useStorage.ts       # Subida de archivos
│   │   └── useSupabase.ts      # Operaciones CRUD con Supabase
│   │
│   ├── lib/                    # Utilidades
│   │   ├── supabase.ts         # Cliente Supabase
│   │   └── utils.ts            # Funciones utilitarias
│   │
│   └── types/                  # TypeScript types
│       ├── database.ts         # Tipos de la base de datos
│       └── index.ts            # Tipos de la aplicación
│
├── public/                     # Archivos estáticos
├── .env.local.example          # Ejemplo de variables de entorno
├── .gitignore                  # Git ignore
├── DEPLOYMENT.md               # Guía de deployment detallada
├── README.md                   # Documentación completa
├── next.config.js              # Configuración de Next.js
├── next-env.d.ts               # Tipos de Next.js
├── package.json                # Dependencias
├── postcss.config.js           # Configuración de PostCSS
├── tailwind.config.js          # Configuración de Tailwind
└── tsconfig.json               # Configuración de TypeScript
```

## 🎯 Características Implementadas

### 1. Autenticación Real (Supabase Auth)
- Login con email/contraseña
- Registro de nuevos usuarios
- Perfiles de usuario
- Sesiones persistentes

### 2. Base de Datos Real (Supabase PostgreSQL)
- Tablas: settings, reservations, expenses, images, notes, profiles
- Políticas de seguridad (RLS)
- Relaciones entre tablas
- Triggers automáticos

### 3. Almacenamiento de Archivos (Supabase Storage)
- Subida de recibos
- Subida de imágenes de la cabaña
- URLs públicas para visualización

### 4. Dashboard Mejorado
- KPIs del mes actual
- Gráfica de barras: Ingresos vs Gastos vs Ganancia
- Próximas reservas
- Datos con mejor contraste

### 5. Análisis Financiero Completo
- Resumen anual con selector de año
- Gráficas de barras mensuales
- Gráfica de línea de ocupación
- Distribución por plataforma (pie chart)
- Desglose de gastos por categoría
- Tabla mensual detallada
- Sistema de notas

### 6. Módulos
- **Dashboard:** KPIs y gráficas
- **Calendario:** Vista mensual con colores por plataforma
- **Reservas:** CRUD completo con cálculo automático
- **Gastos:** Registro con subida de recibos
- **Análisis:** Reportes y gráficas
- **Galería:** Gestión de imágenes
- **Configuración:** Precios y tarifas

## 🚀 Instrucciones de Deployment

### Paso 1: Supabase (5 minutos)

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear proyecto nuevo
3. Ir a SQL Editor
4. Copiar y pegar el SQL de creación de tablas (en `DEPLOYMENT.md`)
5. Ir a Storage > New bucket > `roqui-files`
6. Copiar URL y anon key desde Project Settings > API

### Paso 2: Variables de Entorno (1 minuto)

Crear archivo `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### Paso 3: Vercel (5 minutos)

1. Subir código a GitHub
2. Ir a [vercel.com](https://vercel.com)
3. Importar repositorio
4. Agregar variables de entorno
5. Deploy

**Tiempo total estimado: ~15 minutos**

## 📊 Esquema de Base de Datos

### settings
- `id` (UUID)
- `base_price` (decimal)
- `exchange_rate` (decimal)
- `cleaning_fee` (decimal)
- `airbnb_fee` (decimal)
- `booking_fee` (decimal)
- `caretaker_fee` (decimal)
- `wifi_name` (text)
- `wifi_password` (text)

### reservations
- `id` (UUID)
- `guest_name` (text)
- `platform` (enum: Airbnb, Booking, Directa)
- `check_in` (date)
- `check_out` (date)
- `nights` (integer)
- `price_per_night` (decimal)
- `cleaning_fee` (decimal)
- `platform_fee` (decimal)
- `caretaker_cost` (decimal)
- `gross_income` (decimal)
- `net_income` (decimal)
- `status` (enum: confirmed, cancelled, pending)
- `notes` (text)
- `user_id` (UUID)

### expenses
- `id` (UUID)
- `category` (text)
- `amount` (decimal)
- `currency` (enum: USD, CRC)
- `date` (date)
- `description` (text)
- `receipt_url` (text)
- `user_id` (UUID)

### images
- `id` (UUID)
- `category` (text)
- `url` (text)
- `description` (text)
- `is_main` (boolean)
- `user_id` (UUID)

### notes
- `id` (UUID)
- `title` (text)
- `content` (text)
- `category` (text)
- `date` (date)
- `user_id` (UUID)

### profiles
- `id` (UUID)
- `email` (text)
- `role` (enum: admin, viewer)
- `full_name` (text)

## 🎨 Identidad Visual

| Elemento | Valor |
|----------|-------|
| Fondo | `#0B0B0B` (Negro Profundo) |
| Acento | `#E6A800` (Dorado ROQUI) |
| Texto | `#F4F4F4` (Blanco Hueso) |
| Éxito | `#2ECC71` (Verde) |
| Alerta | `#E74C3C` (Rojo) |
| Azul | `#3498DB` (Booking) |

## 📦 Dependencias Principales

```json
{
  "next": "14.0.4",
  "react": "^18.2.0",
  "@supabase/supabase-js": "^2.39.0",
  "recharts": "^2.10.0",
  "tailwindcss": "^3.3.6",
  "lucide-react": "^0.294.0"
}
```

## 🔧 Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start
```

## 📚 Documentación Adicional

- `README.md` - Documentación completa
- `DEPLOYMENT.md` - Guía de deployment paso a paso

## ✅ Checklist de Verificación

- [ ] Proyecto creado en Supabase
- [ ] Tablas creadas con SQL
- [ ] Bucket de storage creado
- [ ] Variables de entorno configuradas
- [ ] Código subido a GitHub
- [ ] Proyecto deployado en Vercel
- [ ] Usuario admin configurado
- [ ] Primera reserva de prueba creada

## 🆘 Soporte

Si encuentras problemas:
1. Revisa `DEPLOYMENT.md` para solución de problemas
2. Verifica logs en Vercel Dashboard
3. Verifica logs en Supabase > Logs > API
