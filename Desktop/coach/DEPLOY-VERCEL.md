# 🚀 COACH - Guía de Despliegue en Vercel

## Vista Previa

Esta guía te ayudará a desplegar COACH en Vercel usando Turso como base de datos (completamente gratis).

---

## Paso 1: Crear Base de Datos en Turso

1. Ve a [https://turso.tech](https://turso.tech) y regístrate (gratis)
2. Crea una base de datos llamada `coach`
3. Ve a **Settings > Connect** y copia:
   - **Database URL** (ej: `libsql://coach-xxx.turso.io`)
   - **Auth Token** (genera uno nuevo)

---

## Paso 2: Subir a GitHub

```bash
git init
git add .
git commit -m "COACH 1.0 - Ready for deployment"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/coach.git
git push -u origin main
```

---

## Paso 3: Desplegar en Vercel

1. Ve a [https://vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio
3. Configura las variables de entorno:

| Variable | Valor | Cómo obtenerlo |
|----------|-------|----------------|
| `DATABASE_URL` | `file:./dev.db` | Valor fijo |
| `TURSO_DATABASE_URL` | `libsql://coach-xxx.turso.io` | Turso Dashboard |
| `TURSO_AUTH_TOKEN` | `eyJ...` | Turso Dashboard |
| `NEXTAUTH_SECRET` | (generar) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-app.vercel.app` | Tu URL de Vercel |

4. Haz clic en **Deploy**

---

## Paso 4: Configurar para Turso

Antes del primer despliegue, cambia la importación de la base de datos:

1. Abre `src/lib/db.ts`
2. Reemplaza el contenido con el de `src/lib/db-turso.ts`
3. O simplemente renombra `db-turso.ts` a `db.ts`

```bash
# Opción rápida
cp src/lib/db-turso.ts src/lib/db.ts
```

---

## Paso 5: Crear Tablas en Turso

Tu base de datos Turso está vacía. Crea las tablas:

### Usando Turso CLI:
```bash
# Instalar CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Conectar
turso db shell coach
```

### SQL para crear tablas:
```sql
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  password TEXT,
  image TEXT,
  role TEXT DEFAULT 'STUDENT',
  isActive INTEGER DEFAULT 1,
  bannedAt DATETIME,
  lastLoginAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  activeRoutineId TEXT UNIQUE,
  activeDietId TEXT UNIQUE,
  trainerId TEXT
);

CREATE TABLE IF NOT EXISTS Routine (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  isActive INTEGER DEFAULT 0,
  isArchived INTEGER DEFAULT 0,
  aiAnalysis TEXT,
  userId TEXT,
  createdById TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS WorkoutDay (
  id TEXT PRIMARY KEY,
  name TEXT,
  dayNumber INTEGER,
  routineId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Exercise (
  id TEXT PRIMARY KEY,
  name TEXT,
  muscleGroup TEXT,
  thumbnailUrl TEXT,
  sets INTEGER,
  reps TEXT,
  weight REAL,
  weightUnit TEXT DEFAULT 'kg',
  notes TEXT,
  "order" INTEGER DEFAULT 0,
  workoutDayId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PhysicalProgress (
  id TEXT PRIMARY KEY,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  bodyWeight REAL,
  backMeasurement REAL,
  chestMeasurement REAL,
  leftArmMeasurement REAL,
  rightArmMeasurement REAL,
  abdomenMeasurement REAL,
  glutesMeasurement REAL,
  rightLegMeasurement REAL,
  leftLegMeasurement REAL,
  frontPhoto TEXT,
  sidePhoto TEXT,
  backPhoto TEXT,
  extraPhoto TEXT,
  notes TEXT,
  userId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Diet (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  isActive INTEGER DEFAULT 0,
  isArchived INTEGER DEFAULT 0,
  dietType TEXT DEFAULT 'training_day',
  startDate DATETIME,
  endDate DATETIME,
  totalCalories REAL,
  totalProtein REAL,
  totalCarbs REAL,
  totalFat REAL,
  totalFiber REAL,
  vitaminA REAL,
  vitaminC REAL,
  vitaminD REAL,
  calcium REAL,
  iron REAL,
  userId TEXT,
  createdById TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Meal (
  id TEXT PRIMARY KEY,
  mealType TEXT,
  name TEXT,
  description TEXT,
  time TEXT,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  fiber REAL,
  dietId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS MealItem (
  id TEXT PRIMARY KEY,
  name TEXT,
  quantity REAL,
  unit TEXT DEFAULT 'g',
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  fiber REAL,
  mealId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Recipe (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  instructions TEXT,
  ingredients TEXT,
  servings INTEGER DEFAULT 1,
  prepTime INTEGER,
  cookTime INTEGER,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  imageUrl TEXT,
  isAiGenerated INTEGER DEFAULT 0,
  userId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ExerciseLibrary (
  id TEXT PRIMARY KEY,
  name TEXT,
  muscleGroup TEXT,
  videoUrl TEXT,
  thumbnailUrl TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  createdById TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS StudentPaymentConfig (
  id TEXT PRIMARY KEY,
  studentId TEXT UNIQUE,
  monthlyFee REAL DEFAULT 0,
  dueDay INTEGER DEFAULT 10,
  startDate DATETIME,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Payment (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  month INTEGER,
  year INTEGER,
  amount REAL DEFAULT 0,
  isGifted INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  paymentMethod TEXT,
  otherWalletName TEXT,
  dueDate DATETIME,
  paidDate DATETIME,
  reference TEXT,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  configId TEXT,
  UNIQUE(studentId, month, year)
);
```

---

## Paso 6: Crear Usuario Admin

1. Regístrate en tu app desplegada
2. En Turso Console, ejecuta:
```sql
UPDATE User SET role = 'TRAINER' WHERE email = 'tu@email.com';
```

---

## Límites del Plan Gratis

| Servicio | Límite |
|----------|--------|
| Turso | 9GB + 1B lecturas/mes |
| Vercel | 100GB bandwidth/mes |

---

## Actualizaciones

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel desplegará automáticamente.
