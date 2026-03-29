# PROMPT COMPLETO - GYMPro: App de Gestión Fitness

## =====================
## GENERALIDAD DEL PROYECTO
## =====================

### Descripción General
GymPro es una aplicación web completa para gestión fitness que permite a los usuarios:
- Gestionar rutinas de entrenamiento personalizadas
- Registrar y visualizar progreso físico (medidas corporales y fotos)
- Administrar dietas y nutrición
- Generar recetas con IA
- Panel de administración para gestionar usuarios

### Stack Tecnológico
- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js v4 (solo Google OAuth)
- **UI**: Tailwind CSS + shadcn/ui (componentes)
- **Gráficos**: Recharts
- **Iconos**: Lucide React

### Estructura de Archivos Principal
```
src/
├── app/
│   ├── page.tsx                 # Página única con toda la aplicación
│   ├── layout.tsx               # Layout con SessionProvider
│   └── api/                     # API Routes
│       ├── auth/[...nextauth]/  # Autenticación
│       ├── user/                # Datos del usuario
│       ├── routines/            # CRUD rutinas
│       ├── exercises/           # CRUD ejercicios
│       ├── days/                # CRUD días de rutina
│       ├── progress/            # CRUD progreso físico
│       ├── diets/               # CRUD dietas
│       ├── meals/               # CRUD comidas
│       ├── meal-items/          # CRUD items de comida
│       ├── recipes/             # CRUD recetas
│       ├── ai/                  # APIs de IA
│       │   ├── routine-analysis/
│       │   ├── recipe-generator/
│       │   ├── meal-analyzer/
│       │   └── diet-analyzer/
│       └── admin/               # APIs de administración
│           ├── setup/
│           ├── stats/
│           ├── users/
│           └── users/[id]/progress/
├── components/
│   └── ui/                      # Componentes shadcn/ui
├── lib/
│   ├── auth.ts                  # Configuración NextAuth
│   └── db.ts                    # Cliente Prisma
└── prisma/
    └── schema.prisma            # Esquema de base de datos
```

---

## =====================
## MODELO DE DATOS (Prisma Schema)
## =====================

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  password      String?
  image         String?
  role          String         @default("USER")  // "USER" o "ADMIN"
  isActive      Boolean        @default(true)
  bannedAt      DateTime?
  lastLoginAt   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  routines      Routine[]
  progress      PhysicalProgress[]
  diets         Diet[]
  recipes       Recipe[]
  activeRoutine Routine?       @relation("ActiveRoutine", fields: [activeRoutineId], references: [id])
  activeRoutineId String?      @unique
  activeDiet    Diet?          @relation("ActiveDiet", fields: [activeDietId], references: [id])
  activeDietId  String?        @unique
}

model Routine {
  id          String       @id @default(cuid())
  name        String
  description String?
  isActive    Boolean      @default(false)
  isArchived  Boolean      @default(false)
  aiAnalysis  String?      // Análisis de IA almacenado
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  days        WorkoutDay[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  activeForUser User?      @relation("ActiveRoutine")
}

model WorkoutDay {
  id           String      @id @default(cuid())
  name         String      // Ej: "Día 1", "Día de Pecho"
  dayNumber    Int
  routineId    String
  routine      Routine     @relation(fields: [routineId], references: [id], onDelete: Cascade)
  exercises    Exercise[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model Exercise {
  id           String   @id @default(cuid())
  name         String   // Nombre del ejercicio
  sets         Int?     // Número de series
  reps         String?  // Repeticiones (puede ser rango "8-12")
  weight       Float?   // Peso en kg
  weightUnit   String   @default("kg")
  notes        String?
  muscleGroup  String?  // Grupo muscular (opcional)
  thumbnailUrl String?  // URL de miniatura (opcional)
  order        Int      @default(0)  // Orden dentro del día
  workoutDayId String
  workoutDay   WorkoutDay @relation(fields: [workoutDayId], references: [id], onDelete: Cascade)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model PhysicalProgress {
  id              String    @id @default(cuid())
  date            DateTime  @default(now())
  bodyWeight      Float?    // Peso corporal en kg
  backMeasurement Float?    // Medida espalda en cm
  chestMeasurement Float?   // Medida pecho en cm
  leftArmMeasurement Float? // Medida brazo izq en cm
  rightArmMeasurement Float? // Medida brazo der en cm
  abdomenMeasurement Float? // Medida abdomen en cm
  glutesMeasurement Float?  // Medida glúteos en cm
  rightLegMeasurement Float? // Medida pierna der en cm
  leftLegMeasurement Float? // Medida pierna izq en cm
  frontPhoto      String?   // Base64 o URL de foto frontal
  sidePhoto       String?   // Base64 o URL de foto lateral
  backPhoto       String?   // Base64 o URL de foto espalda
  extraPhoto      String?   // Base64 o URL de foto extra
  notes           String?   // Notas del usuario
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Diet {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isActive      Boolean  @default(false)
  isArchived    Boolean  @default(false)
  dietType      String?  // "training_day" o "rest_day"
  startDate     DateTime?
  endDate       DateTime?
  totalCalories Int?
  totalProtein  Int?
  totalCarbs    Int?
  totalFat      Int?
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  meals         Meal[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  activeForUser User?    @relation("ActiveDiet")
}

model Meal {
  id          String     @id @default(cuid())
  mealType    String     // "breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"
  name        String?
  description String?
  time        String?
  calories    Int?
  protein     Int?
  carbs       Int?
  fat         Int?
  fiber       Int?
  dietId      String
  diet        Diet       @relation(fields: [dietId], references: [id], onDelete: Cascade)
  items       MealItem[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model MealItem {
  id        String  @id @default(cuid())
  name      String
  quantity  Int
  unit      String
  calories  Int?
  protein   Int?
  carbs     Int?
  fat       Int?
  mealId    String
  meal      Meal    @relation(fields: [mealId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Recipe {
  id            String   @id @default(cuid())
  name          String
  description   String?
  instructions  String   // JSON string de array de pasos
  ingredients   String   // JSON string de array de ingredientes
  servings      Int      @default(1)
  prepTime      Int?     // Tiempo de preparación en minutos
  cookTime      Int?     // Tiempo de cocción en minutos
  calories      Int?
  protein       Int?
  carbs         Int?
  fat           Int?
  isAiGenerated Boolean @default(false)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## =====================
## PÁGINAS Y COMPONENTES
## =====================

### 1. PÁGINA DE AUTENTICACIÓN (AuthPage)

**Ubicación**: Se muestra cuando NO hay sesión activa.

**Diseño**:
- Fondo con gradiente suave (emerald-50 → white → teal-50)
- Logo centrado con icono de pesas (Dumbbell)
- Título "GymPro"
- Subtítulo "Tu registro de progreso y rutinas"
- Card central con:
  - Título "Bienvenido"
  - Descripción "Inicia sesión o regístrate con Google"
  - **Único botón**: "Continuar con Google" con icono de Google SVG

**Funcionalidad**:
- Click en botón → llama `signIn("google", { callbackUrl: "/" })`
- Muestra loader mientras procesa

---

### 2. DASHBOARD PRINCIPAL

**Ubicación**: Se muestra cuando HAY sesión activa.

**Estructura**:
```
┌─────────────────────────────────────┐
│ HEADER (logo + nombre + logout)     │
├─────────────────────────────────────┤
│ TABS: Rutina | Progreso | Nutrición │
│       | Recetas | Admin (si es admin)│
├─────────────────────────────────────┤
│ CONTENIDO SEGÚN TAB SELECCIONADA    │
├─────────────────────────────────────┤
│ FOOTER (copyright)                  │
└─────────────────────────────────────┘
```

#### 2.1 HEADER
- Logo con fondo emerald-600
- Nombre del usuario (session.user.name o email)
- Botón "Cerrar Sesión" → llama `signOut()`

#### 2.2 BANNER DE ADMIN SETUP (condicional)
- Solo se muestra si `hasAdmin === false` y `session.user.role !== "ADMIN"`
- Card con fondo púrpura
- Mensaje: "¡Sé el primer administrador!"
- Botón "Hacerme Admin" → POST a `/api/admin/setup`

---

### 3. TAB: RUTINA (RoutineManager)

#### 3.1 Sin Rutina Activa
- Icono de pesas grande
- Mensaje: "No tienes una rutina activa"
- Botón "Crear Nueva Rutina"
- Lista de rutinas archivadas (si existen) con botón "Activar"

#### 3.2 Con Rutina Activa

**Header de Rutina**:
- Nombre de la rutina
- Descripción (si existe)
- Botones: "Exportar", "Archivar", "Agregar Ejercicio"

**Tabs de Días**:
- Un tab por cada día de la rutina
- Botón "+" para agregar nuevo día (máximo 7 días)
- Cada día muestra:
  - Nombre editable (input inline)
  - Badge con cantidad de ejercicios
  - Botón eliminar día (si hay más de 1)

**Lista de Ejercicios** (por cada día):
```
┌────────────────────────────────────────────┐
│ ⬆️⬇️ [1] Nombre del ejercicio             │
│              [4 series] [8-12 reps] [80kg] │
│              ✏️ Editar  🗑️ Eliminar        │
└────────────────────────────────────────────┘
```

**Funcionalidades de Ejercicios**:
- Flechas ⬆️⬇️ para reordenar
- Click en ✏️ → Abre diálogo de edición
- Click en 🗑️ → Elimina ejercicio

**Diálogo Agregar Ejercicio**:
- Select de día
- Input: Nombre del ejercicio
- Inputs: Series (número), Reps (texto), Peso (número)
- Botón "Agregar Ejercicio"

**Diálogo Editar Ejercicio**:
- Input: Nombre
- Inputs: Series, Reps, Peso
- Textarea: Notas
- Botones: Cancelar, Guardar

#### 3.3 Análisis de IA (RoutineAnalysis)
- Card al final de la rutina
- Inputs: Objetivo (opcional), Descripción de dieta (opcional)
- Botón "Analizar Rutina"
- Muestra análisis generado por IA

---

### 4. TAB: PROGRESO (ProgressManager)

#### 4.1 Header
- Botón "Registrar Progreso" → Abre diálogo
- Botón "Exportar" → Descarga JSON

#### 4.2 Gráficos de Progreso (ProgressCharts)

**Selector de tipo de gráfico**:
- Botones: "Línea" | "Barras"

**Selector de métricas**:
- Badges clickeables: Peso, Pecho, Espalda, Brazo Izq, Brazo Der, Abdomen, Glúteos, Pierna Izq, Pierna Der
- Colores únicos por métrica

**Gráfico**:
- ResponsiveContainer con Recharts
- Eje X: Fechas
- Eje Y: Valores
- Tooltip y Legend

#### 4.3 Historial de Registros

**Lista de registros**:
```
┌────────────────────────────────────────────┐
│ 📅 [Fecha]                                 │
│    [75 kg] [📷 Fotos]              ➡️     │
└────────────────────────────────────────────┘
```
- Click en registro → Abre diálogo de detalle

#### 4.4 Diálogo Registrar Progreso

**Campos**:
- Fecha (date picker)
- Peso Corporal (kg)
- Medidas Corporales (cm):
  - Espalda, Pecho, Brazo Izq, Brazo Der
  - Abdomen, Glúteos, Pierna Izq, Pierna Der
- Fotos de Progreso:
  - 4 áreas: Frente, Lateral, Espalda, Extra
  - Click → Abre selector de archivo
  - Muestra preview de imagen
- Notas (textarea)

**Botón**: "Guardar Progreso"

#### 4.5 Diálogo Ver Progreso

**Contenido**:
- Fecha del registro
- Peso corporal (destacado)
- Grid de medidas (si existen)
- Grid de fotos con:
  - Click para ampliar (lightbox)
  - Botón de descarga
- Notas

**Botones**:
- "Editar" → Abre diálogo de edición
- "Eliminar" → Elimina registro

#### 4.6 Diálogo Editar Progreso
- Mismos campos que "Registrar Progreso"
- Pre-llenado con datos existentes
- Botón "Guardar Cambios"

#### 4.7 Lightbox de Fotos
- Fondo negro semi-transparente
- Imagen centrada a pantalla completa
- Botón cerrar (X)
- Botón "Descargar Foto"

---

### 5. TAB: NUTRICIÓN (DietManager)

#### 5.1 Sin Dieta Activa
- Mensaje "No tienes una dieta activa"
- Botón "Crear Nueva Dieta"
- Lista de dietas archivadas

#### 5.2 Con Dieta Activa

**Header de Dieta**:
- Nombre
- Badge: "Día de Entrenamiento" o "Día de Descanso"
- Botón "Archivar"

**Resumen de Macros**:
```
┌────────┬────────┬────────┬────────┐
│ Calorías│Proteína│Carbs   │Grasas │
│ 2500   │ 150g   │ 250g   │ 65g   │
└────────┴────────┴────────┴────────┘
```
- Barras de progreso hacia metas

**Sección de Comidas**:
- 5 comidas: Desayuno, Colación Matutina, Almuerzo, Colación Vespertina, Cena
- Cada comida:
  - Card con icono
  - Textarea para descripción
  - Badge con macros (si fue analizado)

**Botón**: "Analizar Dieta Completa con IA"
- Analiza cada comida
- Guarda macros en BD
- Muestra análisis general

**Diálogo Crear Dieta**:
- Input: Nombre
- Textarea: Descripción
- Select: Tipo (Día de Entrenamiento / Día de Descanso)

---

### 6. TAB: RECETAS (RecipeManager)

#### 6.1 Generador de Recetas (RecipeGenerator)

**Inputs**:
- Ingredientes disponibles (chips agregables)
- Tipo de comida (opcional)
- Calorías objetivo (opcional)

**Botón**: "Generar Receta"

**Resultado**:
- Nombre de receta
- Descripción
- Ingredientes
- Pasos de preparación
- Macros
- Tips
- Botón "Guardar Receta"

#### 6.2 Recetas Guardadas (SavedRecipes)

**Grid de cards**:
```
┌─────────────────────────┐
│ Nombre de Receta  [🗑️] │
│ [IA] Badge              │
├─────────────────────────┤
│ Kcal │ Prot │ Carb │ Fat│
│ 350  │ 25g  │ 30g  │ 12g│
├─────────────────────────┤
│ Prep: 15min • 2 porciones│
└─────────────────────────┘
```

---

### 7. TAB: ADMIN (AdminPanel) - SOLO PARA ADMIN

**Verificación**: Solo se muestra si `session.user.role === "ADMIN"`

#### 7.1 Header
- Título "Panel de Administración"
- Botón "Actualizar"

#### 7.2 Tarjetas de Estadísticas
```
┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ Activos  │ Bloqueados│ Admins  │
│ Usuarios │          │           │         │
└──────────┴──────────┴──────────┴──────────┘
```

#### 7.3 Estadísticas de Contenido
- Rutinas, Dietas, Recetas, Progresos totales

#### 7.4 Búsqueda y Filtros
- Input de búsqueda (email o nombre)
- Botones: Todos | Activos | Bloqueados

#### 7.5 Tabla de Usuarios

| Email | Nombre | Rol | Estado | Creado | Último Login | Acciones |
|-------|--------|-----|--------|--------|--------------|----------|
| ... | ... | USER/ADMIN | Activo/Bloqueado | fecha | fecha | 👁️🔒✓🛡️🗑️ |

**Acciones por usuario**:
- 👁️ Ver Progreso → Abre diálogo con progresos del usuario
- 🔒 Bloquear/Desbloquear
- ✓ Activar/Desactivar
- 🛡️ Hacer/Quitar Admin
- 🗑️ Eliminar

#### 7.6 Diálogo Ver Progreso de Usuario

**Lista de registros**:
- Click para expandir cada registro
- Muestra: peso, medidas, fotos, notas
- Fotos con lightbox y descarga

---

## =====================
## APIS NECESARIAS
## =====================

### Autenticación
- `GET/POST /api/auth/[...nextauth]` - NextAuth handler

### Usuario
- `GET /api/user` - Obtiene usuario con rutina y dieta activa

### Rutinas
- `GET /api/routines?archived=true` - Lista rutinas
- `POST /api/routines` - Crear rutina
- `GET /api/routines/[id]` - Obtener rutina específica
- `PUT /api/routines/[id]` - Actualizar rutina
- `DELETE /api/routines/[id]` - Eliminar rutina

### Días de Rutina
- `POST /api/days` - Crear día
- `PUT /api/days/[id]` - Actualizar nombre de día
- `DELETE /api/days/[id]` - Eliminar día

### Ejercicios
- `POST /api/exercises` - Crear ejercicio
- `PUT /api/exercises/[id]` - Actualizar ejercicio (incluye order)
- `DELETE /api/exercises/[id]` - Eliminar ejercicio

### Progreso Físico
- `GET /api/progress` - Lista progresos del usuario
- `POST /api/progress` - Crear registro
- `GET /api/progress/[id]` - Obtener registro específico
- `PUT /api/progress/[id]` - Actualizar registro
- `DELETE /api/progress/[id]` - Eliminar registro

### Dietas
- `GET /api/diets?archived=true` - Lista dietas
- `POST /api/diets` - Crear dieta
- `PUT /api/diets/[id]` - Actualizar dieta
- `DELETE /api/diets/[id]` - Eliminar dieta

### Comidas
- `POST /api/meals` - Crear/actualizar comida
- `POST /api/meal-items` - Crear item de comida

### Recetas
- `GET /api/recipes` - Lista recetas
- `POST /api/recipes` - Crear receta
- `DELETE /api/recipes/[id]` - Eliminar receta

### IA (Endpoints opcionales)
- `POST /api/ai/routine-analysis` - Analiza rutina
- `POST /api/ai/recipe-generator` - Genera receta
- `POST /api/ai/meal-analyzer` - Analiza comida
- `POST /api/ai/diet-analyzer` - Analiza dieta completa

### Admin
- `GET /api/admin/setup` - Verifica si hay admin
- `POST /api/admin/setup` - Primer usuario se hace admin
- `GET /api/admin/stats` - Estadísticas generales
- `GET /api/admin/users` - Lista usuarios
- `PUT /api/admin/users/[id]` - Acciones sobre usuario
- `DELETE /api/admin/users/[id]` - Eliminar usuario
- `GET /api/admin/users/[id]/progress` - Ver progreso de usuario
- `POST /api/admin/sync-role` - Sincronizar rol de admin

---

## =====================
## FUNCIONALIDADES ESPECIALES
## =====================

### 1. Subida de Fotos (Base64)
```typescript
const handlePhotoUpload = (type: 'front' | 'side' | 'back' | 'extra', file: File) => {
  const reader = new FileReader()
  reader.onloadend = () => {
    setProgressPhotos(prev => ({ ...prev, [type]: reader.result as string }))
  }
  reader.readAsDataURL(file)
}
```

### 2. Descarga de Fotos
```typescript
const downloadPhoto = async (url: string, filename: string) => {
  const response = await fetch(url)
  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}
```

### 3. Lightbox de Fotos
- Diálogo fullscreen con fondo negro
- Imagen centrada con `max-h-[85vh]`
- Botón de cerrar y descargar

### 4. Reordenamiento de Ejercicios
- Botones ⬆️⬇️ intercambian el campo `order`
- PUT a `/api/exercises/[id]` con nuevo order

### 5. Exportación de Datos
- Rutinas: JSON con estructura completa
- Progresos: JSON con todos los registros

### 6. Sincronización de Rol Admin
- La sesión JWT puede estar desactualizada
- POST a `/api/admin/sync-role` actualiza rol en BD
- Recargar página para refrescar sesión

---

## =====================
## CONSIDERACIONES DE UI/UX
## =====================

### Colores Principales
- **Primario**: emerald-600 (verde)
- **Secundario**: purple-600 (púrpura para admin)
- **Fondo**: white / gray-900 (dark mode)
- **Textos**: gray-900 / gray-100 (dark mode)

### Componentes shadcn/ui Utilizados
- Button, Input, Label, Textarea
- Card, CardHeader, CardContent, CardTitle, CardDescription
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
- Tabs, TabsList, TabsTrigger, TabsContent
- Badge
- Progress
- Separator
- Checkbox (para training/rest day)
- Select (para tipo de comida, día de rutina)

### Responsive Design
- Mobile-first
- Headers con texto oculto en mobile (`hidden sm:inline`)
- Grids adaptativos (`grid-cols-2 md:grid-cols-4`)
- Tabs scrollables en mobile

### Dark Mode
- Soporte completo con `dark:` prefix
- Variables CSS para temas

---

## =====================
## FLUJO DE AUTENTICACIÓN
## =====================

1. Usuario ingresa → Ve AuthPage
2. Click "Continuar con Google"
3. Si usuario nuevo → Se crea en BD con role="USER"
4. Si usuario existente → Se actualiza lastLoginAt
5. Sesión JWT incluye: id, email, name, role
6. Usuario ve Dashboard según su rol
7. Si es ADMIN → Ve tab adicional "Admin"

---

## =====================
## VARIABLES DE ENTORNO
## =====================

```env
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_SECRET="random-string"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## =====================
## NOTAS IMPORTANTES
## =====================

1. **Single Page App**: Toda la aplicación está en `page.tsx` (~4000 líneas)

2. **Estados Globales**: Manejados con useState en componente Dashboard

3. **Toasts**: Usar `toast()` de `@/hooks/use-toast` para notificaciones

4. **Loader**: Usar `<Loader2 className="w-X h-X animate-spin" />` para estados de carga

5. **Confirmación**: Usar `confirm()` nativo para acciones destructivas

6. **Fotos**: Se guardan como Base64 en la base de datos (String)

7. **Orden de Ejercicios**: Campo `order` numérico, se actualiza al reordenar

8. **Rutina Activa**: User tiene `activeRoutineId`, solo una activa a la vez

9. **Dieta Activa**: User tiene `activeDietId`, solo una activa a la vez

10. **Admin Setup**: Solo el primer usuario puede hacerse admin automáticamente

---

Este prompt contiene toda la información necesaria para recrear el proyecto GymPro desde cero.
