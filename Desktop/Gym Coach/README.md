# Gym Coach App

Aplicación de gestión para entrenadores personales y sus alumnos.

## 🚀 Características

- Gestión de alumnos
- Creación de rutinas de entrenamiento
- Planificación de dietas
- Seguimiento de progreso (medidas corporales y fotos)
- Gestión de pagos
- Sistema de notificaciones

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **UI**: Tailwind CSS + shadcn/ui
- **Deploy**: Vercel

## 📋 Requisitos

- Node.js 18+
- Cuenta en Supabase
- Cuenta en Vercel
- Cuenta en GitHub

## 🔧 Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="tu-secreto-seguro"
NEXTAUTH_URL="https://tu-dominio.vercel.app"
```

## 🏃‍♂️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

## 🚀 Deploy en Vercel

1. Sube el código a GitHub
2. Conecta tu repositorio en Vercel
3. Configura las variables de entorno
4. ¡Listo!

## 📝 Licencia

MIT
