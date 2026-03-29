"use client"

import { useState, useEffect, useRef } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dumbbell, 
  LogOut, 
  Plus, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  Archive, 
  Camera,
  Save,
  ChevronRight,
  Utensils,
  ChefHat,
  Brain,
  LineChart,
  BarChart3,
  Sparkles,
  Loader2,
  X,
  Image as ImageIcon,
  Eye,
  Edit,
  Copy,
  Download,
  FileText,
  Shield,
  RefreshCw,
  Users,
  Ban,
  UserCheck,
  Search,
  Filter,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Pencil,
  ZoomIn,
  Maximize2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area
} from "recharts"

// Exercise thumbnail mapping - using muscle group icons
const muscleGroupIcons: Record<string, string> = {
  chest: "💪",
  back: "🔙",
  shoulders: "🏋️",
  biceps: "💪",
  triceps: "💪",
  legs: "🦵",
  quads: "🦵",
  hamstrings: "🦵",
  glutes: "🍑",
  calves: "🦶",
  abs: "🎯",
  core: "🎯",
  arms: "💪",
  cardio: "❤️",
  full_body: "🏋️",
  default: "🏋️"
}

// Common exercises with muscle groups
const exerciseDatabase: Record<string, { muscleGroup: string; thumbnail: string }> = {
  "press de banca": { muscleGroup: "chest", thumbnail: "🫁" },
  "bench press": { muscleGroup: "chest", thumbnail: "🫁" },
  "press inclinado": { muscleGroup: "chest", thumbnail: "🫁" },
  "aperturas": { muscleGroup: "chest", thumbnail: "🫁" },
  "dominadas": { muscleGroup: "back", thumbnail: "🔙" },
  "remo": { muscleGroup: "back", thumbnail: "🔙" },
  "peso muerto": { muscleGroup: "back", thumbnail: "🔙" },
  "sentadilla": { muscleGroup: "legs", thumbnail: "🦵" },
  "squats": { muscleGroup: "legs", thumbnail: "🦵" },
  "prensa": { muscleGroup: "legs", thumbnail: "🦵" },
  "curl de biceps": { muscleGroup: "biceps", thumbnail: "💪" },
  "curl biceps": { muscleGroup: "biceps", thumbnail: "💪" },
  "triceps": { muscleGroup: "triceps", thumbnail: "💪" },
  "press militar": { muscleGroup: "shoulders", thumbnail: "🏋️" },
  "elevaciones laterales": { muscleGroup: "shoulders", thumbnail: "🏋️" },
  "crunches": { muscleGroup: "abs", thumbnail: "🎯" },
  "abdominales": { muscleGroup: "abs", thumbnail: "🎯" },
  "plancha": { muscleGroup: "core", thumbnail: "🎯" },
  "zancadas": { muscleGroup: "legs", thumbnail: "🦵" },
  "extensiones": { muscleGroup: "legs", thumbnail: "🦵" },
  "curl femoral": { muscleGroup: "hamstrings", thumbnail: "🦵" },
  "elevacion de talones": { muscleGroup: "calves", thumbnail: "🦶" }
}

// Helper to get exercise thumbnail
function getExerciseThumbnail(name: string, muscleGroup?: string): { emoji: string; group: string } {
  const lowerName = name.toLowerCase()
  
  // Check database first
  for (const [key, value] of Object.entries(exerciseDatabase)) {
    if (lowerName.includes(key)) {
      return { emoji: value.thumbnail, group: value.muscleGroup }
    }
  }
  
  // Use muscle group if provided
  if (muscleGroup && muscleGroupIcons[muscleGroup.toLowerCase()]) {
    return { emoji: muscleGroupIcons[muscleGroup.toLowerCase()], group: muscleGroup }
  }
  
  return { emoji: muscleGroupIcons.default, group: "general" }
}

// Types
interface Exercise {
  id: string
  name: string
  sets: number | null
  reps: string | null
  weight: number | null
  weightUnit: string
  notes: string | null
  muscleGroup?: string | null
  thumbnailUrl?: string | null
  order: number
}

interface WorkoutDay {
  id: string
  name: string
  dayNumber: number
  exercises: Exercise[]
}

interface Routine {
  id: string
  name: string
  description: string | null
  isActive: boolean
  isArchived: boolean
  aiAnalysis?: string | null
  days: WorkoutDay[]
  createdAt: string
}

interface MealItem {
  id: string
  name: string
  quantity: number
  unit: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

interface Meal {
  id: string
  mealType: string
  name?: string | null
  description?: string | null
  time?: string | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
  items: MealItem[]
}

interface Diet {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  isArchived: boolean
  dietType?: string | null
  startDate?: string | null
  endDate?: string | null
  totalCalories: number | null
  totalProtein: number | null
  totalCarbs: number | null
  totalFat: number | null
  meals: Meal[]
}

interface PhysicalProgress {
  id: string
  date: Date | string
  bodyWeight: number | null
  backMeasurement: number | null
  chestMeasurement: number | null
  leftArmMeasurement: number | null
  rightArmMeasurement: number | null
  abdomenMeasurement: number | null
  glutesMeasurement: number | null
  rightLegMeasurement: number | null
  leftLegMeasurement: number | null
  frontPhoto: string | null
  sidePhoto: string | null
  backPhoto: string | null
  extraPhoto: string | null
  notes: string | null
}

interface Recipe {
  id: string
  name: string
  description?: string | null
  instructions: string
  ingredients: string
  servings: number
  prepTime?: number | null
  cookTime?: number | null
  calories?: number | null
  protein?: number | null
  carbs?: number | null
  fat?: number | null
  isAiGenerated: boolean
}

// Admin User interface
interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  bannedAt: string | null
  lastLoginAt: string | null
  createdAt: string
  _count?: {
    routines: number
    progress: number
    diets: number
    recipes: number
  }
}

// Admin Stats interface
interface AdminStats {
  users: {
    total: number
    active: number
    banned: number
    admins: number
    newToday: number
    newThisWeek: number
    newThisMonth: number
  }
  content: {
    routines: number
    progress: number
    diets: number
    recipes: number
  }
}

// Admin Panel Component
function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [userProgress, setUserProgress] = useState<PhysicalProgress[]>([])
  const [progressLoading, setProgressLoading] = useState(false)
  const [viewUserProgressOpen, setViewUserProgressOpen] = useState(false)
  const [selectedProgressRecord, setSelectedProgressRecord] = useState<PhysicalProgress | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null)

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProgress = async (userId: string) => {
    setProgressLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/progress`)
      if (res.ok) {
        const data = await res.json()
        setUserProgress(data)
      } else {
        setUserProgress([])
      }
    } catch (error) {
      console.error("Error fetching user progress:", error)
      setUserProgress([])
    } finally {
      setProgressLoading(false)
    }
  }

  const openUserProgress = (user: AdminUser) => {
    setSelectedUser(user)
    setViewUserProgressOpen(true)
    fetchUserProgress(user.id)
  }

  const openLightbox = (url: string, title: string) => {
    setLightboxImage({ url, title })
    setLightboxOpen(true)
  }

  const downloadPhoto = async (url: string, filename: string) => {
    try {
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
      toast({ title: "Foto descargada" })
    } catch {
      toast({ title: "Error", description: "No se pudo descargar la foto", variant: "destructive" })
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })

      if (res.ok) {
        toast({ title: "Usuario actualizado", description: `Acción: ${action} completada` })
        fetchUsers()
        fetchStats()
      } else {
        const data = await res.json()
        toast({ title: "Error", description: data.error || "Error al actualizar usuario", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al actualizar usuario", variant: "destructive" })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        toast({ title: "Usuario eliminado", description: "El usuario ha sido eliminado permanentemente" })
        fetchUsers()
        fetchStats()
        setSelectedUser(null)
      } else {
        const data = await res.json()
        toast({ title: "Error", description: data.error || "Error al eliminar usuario", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al eliminar usuario", variant: "destructive" })
    }
  }

  const refreshData = () => {
    fetchStats()
    fetchUsers()
  }

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.name?.toLowerCase().includes(search.toLowerCase()) || false)
    
    const matchesFilter = statusFilter === "all" ||
      (statusFilter === "active" && user.isActive && !user.bannedAt) ||
      (statusFilter === "banned" && (!user.isActive || user.bannedAt))
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            Panel de Administración
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Gestión de usuarios y estadísticas</p>
        </div>
        <Button onClick={refreshData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 dark:bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Usuarios</p>
                <p className="text-3xl font-bold text-white">{stats?.users.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-900 dark:bg-emerald-800 border-emerald-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300">Activos</p>
                <p className="text-3xl font-bold text-white">{stats?.users.active || 0}</p>
              </div>
              <UserCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-900 dark:bg-red-800 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">Bloqueados</p>
                <p className="text-3xl font-bold text-white">{stats?.users.banned || 1}</p>
              </div>
              <Ban className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-900 dark:bg-purple-800 border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Admins</p>
                <p className="text-3xl font-bold text-white">{stats?.users.admins || 1}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <Card className="border-0 shadow-md bg-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white">Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 dark:bg-gray-800 p-3 rounded-lg text-center">
              <Dumbbell className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.content.routines || 1}</p>
              <p className="text-xs text-gray-400">Rutinas</p>
            </div>
            <div className="bg-gray-700 dark:bg-gray-800 p-3 rounded-lg text-center">
                <Utensils className="w-6 h-6 mx-auto text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.content.diets || 1}</p>
              <p className="text-xs text-gray-400">Dietas</p>
            </div>
            <div className="bg-gray-700 dark:bg-gray-800 p-3 rounded-lg text-center">
              <ChefHat className="w-6 h-6 mx-auto text-amber-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.content.recipes || 1}</p>
              <p className="text-xs text-gray-400">Recetas</p>
            </div>
            <div className="bg-gray-700 dark:bg-gray-800 p-3 rounded-lg text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.content.progress || 1}</p>
              <p className="text-xs text-gray-400">Progresos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por email o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-gray-700" : ""}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("active")}
                className={statusFilter === "active" ? "bg-emerald-600" : ""}
              >
                Activos
              </Button>
              <Button
                variant={statusFilter === "banned" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("banned")}
                className={statusFilter === "banned" ? "bg-red-600" : ""}
              >
                Bloqueados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Último Login</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 text-sm text-gray-900 dark:text-white">{user.email}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white">{user.name || "-"}</td>
                      <td className="p-3 text-center">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className={user.role === "ADMIN" ? "bg-purple-600" : ""}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        {user.bannedAt ? (
                          <Badge variant="destructive">Bloqueado</Badge>
                        ) : user.isActive ? (
                          <Badge variant="default" className="bg-emerald-600">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </td>
                      <td className="p-3 text-center text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="p-3 text-center text-sm text-gray-500">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('es-ES') : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => openUserProgress(user)} title="Ver Progreso" className="text-blue-600 hover:text-blue-700">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.bannedAt ? (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, "unban")} title="Desbloquear">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, "ban")} title="Bloquear">
                              <Ban className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                          {user.isActive ? (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, "deactivate")} title="Desactivar">
                              <UserCheck className="w-4 h-4 text-gray-600" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, "activate")} title="Activar">
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                            </Button>
                          )}
                          {user.role === "ADMIN" ? (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, "removeAdmin")} title="Quitar Admin">
                              <Shield className="w-4 h-4 text-gray-600" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, "makeAdmin")} title="Hacer Admin">
                              <Shield className="w-4 h-4 text-purple-600" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user.id)} title="Eliminar" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Progress Dialog */}
      <Dialog open={viewUserProgressOpen} onOpenChange={setViewUserProgressOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Progreso de {selectedUser?.name || selectedUser?.email}
            </DialogTitle>
            <DialogDescription>Registros de progreso del usuario</DialogDescription>
          </DialogHeader>
          
          {progressLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : userProgress.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Este usuario no tiene registros de progreso</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userProgress.map((record) => (
                <Card key={record.id} className="border-0 shadow-sm">
                  <CardHeader className="py-3 cursor-pointer" onClick={() => setSelectedProgressRecord(selectedProgressRecord?.id === record.id ? null : record)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {new Date(record.date).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h4>
                          <div className="flex gap-2">
                            {record.bodyWeight && (
                              <Badge variant="secondary" className="text-xs">{record.bodyWeight} kg</Badge>
                            )}
                            {(record.frontPhoto || record.sidePhoto || record.backPhoto || record.extraPhoto) && (
                              <Badge variant="outline" className="text-xs">
                                <Camera className="w-3 h-3 mr-1" />
                                Fotos
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedProgressRecord?.id === record.id ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                  
                  {selectedProgressRecord?.id === record.id && (
                    <CardContent className="pt-0 space-y-4">
                      {/* Weight */}
                      {record.bodyWeight && (
                        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Peso Corporal</p>
                          <p className="text-2xl font-bold text-emerald-600">{record.bodyWeight} kg</p>
                        </div>
                      )}

                      {/* Measurements */}
                      <div>
                        <h5 className="font-medium mb-2 text-sm text-gray-500">Medidas (cm)</h5>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Espalda', value: record.backMeasurement },
                            { label: 'Pecho', value: record.chestMeasurement },
                            { label: 'Brazo Izq.', value: record.leftArmMeasurement },
                            { label: 'Brazo Der.', value: record.rightArmMeasurement },
                            { label: 'Abdomen', value: record.abdomenMeasurement },
                            { label: 'Glúteos', value: record.glutesMeasurement },
                            { label: 'Pierna Izq.', value: record.leftLegMeasurement },
                            { label: 'Pierna Der.', value: record.rightLegMeasurement },
                          ].filter(m => m.value).map(m => (
                            <div key={m.label} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
                              <p className="text-xs text-gray-500">{m.label}</p>
                              <p className="font-semibold">{m.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Photos */}
                      {(record.frontPhoto || record.sidePhoto || record.backPhoto || record.extraPhoto) && (
                        <div>
                          <h5 className="font-medium mb-2 text-sm text-gray-500">Fotos</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { key: 'frontPhoto', label: 'Frente', photo: record.frontPhoto },
                              { key: 'sidePhoto', label: 'Lateral', photo: record.sidePhoto },
                              { key: 'backPhoto', label: 'Espalda', photo: record.backPhoto },
                              { key: 'extraPhoto', label: 'Extra', photo: record.extraPhoto }
                            ].filter(p => p.photo).map(p => (
                              <div key={p.key} className="relative group">
                                <img 
                                  src={p.photo!} 
                                  alt={p.label} 
                                  className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => openLightbox(p.photo!, `${selectedUser?.name || 'Usuario'} - ${p.label}`)}
                                />
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    size="icon" 
                                    variant="secondary" 
                                    className="h-7 w-7 bg-white/90 hover:bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openLightbox(p.photo!, `${selectedUser?.name || 'Usuario'} - ${p.label}`)
                                    }}
                                  >
                                    <Maximize2 className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="secondary" 
                                    className="h-7 w-7 bg-white/90 hover:bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const date = new Date(record.date).toISOString().split('T')[0]
                                      downloadPhoto(p.photo!, `${selectedUser?.name || 'usuario'}-${date}-${p.label.toLowerCase()}.jpg`)
                                    }}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                                <p className="text-center text-xs text-gray-500 mt-1">{p.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div>
                          <h5 className="font-medium mb-2 text-sm text-gray-500">Notas</h5>
                          <p className="text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                            {record.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox for Admin */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0 bg-black/95 border-none">
          {lightboxImage && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
              <div className="absolute top-4 left-4 text-white font-medium">
                {lightboxImage.title}
              </div>
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    downloadPhoto(lightboxImage.url, `${lightboxImage.title}.jpg`)
                  }}
                >
                  <Download className="w-4 h-4" />
                  Descargar Foto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Meal type labels
const mealTypeLabels: Record<string, string> = {
  breakfast: "Desayuno",
  morning_snack: "Colación Matutina",
  lunch: "Almuerzo",
  afternoon_snack: "Colación Vespertina",
  dinner: "Cena"
}

const mealTypeOrder = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"]

// Auth Component - Solo Google OAuth
function AuthPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 text-white mb-4">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GymPro</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Tu registro de progreso y rutinas</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Bienvenido</CardTitle>
            <CardDescription>Inicia sesión o regístrate con Google</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 text-base"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continuar con Google
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2024 GymPro - Registro de Progreso Fitness
      </footer>
    </div>
  )
}

// Progress Chart Component
function ProgressCharts({ progressRecords }: { progressRecords: PhysicalProgress[] }) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["bodyWeight"])
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  const metrics = [
    { key: "bodyWeight", label: "Peso (kg)", color: "#10b981" },
    { key: "chestMeasurement", label: "Pecho (cm)", color: "#3b82f6" },
    { key: "backMeasurement", label: "Espalda (cm)", color: "#8b5cf6" },
    { key: "leftArmMeasurement", label: "Brazo Izq (cm)", color: "#f59e0b" },
    { key: "rightArmMeasurement", label: "Brazo Der (cm)", color: "#ef4444" },
    { key: "abdomenMeasurement", label: "Abdomen (cm)", color: "#ec4899" },
    { key: "glutesMeasurement", label: "Glúteos (cm)", color: "#06b6d4" },
    { key: "leftLegMeasurement", label: "Pierna Izq (cm)", color: "#84cc16" },
    { key: "rightLegMeasurement", label: "Pierna Der (cm)", color: "#f97316" }
  ]

  const chartData = progressRecords
    .slice()
    .reverse()
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      bodyWeight: record.bodyWeight,
      chestMeasurement: record.chestMeasurement,
      backMeasurement: record.backMeasurement,
      leftArmMeasurement: record.leftArmMeasurement,
      rightArmMeasurement: record.rightArmMeasurement,
      abdomenMeasurement: record.abdomenMeasurement,
      glutesMeasurement: record.glutesMeasurement,
      leftLegMeasurement: record.leftLegMeasurement,
      rightLegMeasurement: record.rightLegMeasurement
    }))

  const toggleMetric = (key: string) => {
    setSelectedMetrics(prev => 
      prev.includes(key) 
        ? prev.filter(m => m !== key)
        : [...prev, key]
    )
  }

  if (progressRecords.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
          <LineChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay datos de progreso para mostrar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart Type Toggle */}
      <div className="flex gap-2">
        <Button 
          variant={chartType === "line" ? "default" : "outline"} 
          size="sm"
          onClick={() => setChartType("line")}
          className={chartType === "line" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          <LineChart className="w-4 h-4 mr-2" />
          Línea
        </Button>
        <Button 
          variant={chartType === "bar" ? "default" : "outline"} 
          size="sm"
          onClick={() => setChartType("bar")}
          className={chartType === "bar" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Barras
        </Button>
      </div>

      {/* Metric Selection */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Seleccionar Métricas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {metrics.map(metric => (
              <Badge 
                key={metric.key}
                variant={selectedMetrics.includes(metric.key) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${selectedMetrics.includes(metric.key) ? "opacity-100" : "opacity-60"}`}
                style={{ 
                  backgroundColor: selectedMetrics.includes(metric.key) ? metric.color : "transparent",
                  borderColor: metric.color,
                  color: selectedMetrics.includes(metric.key) ? "white" : metric.color
                }}
                onClick={() => toggleMetric(metric.key)}
              >
                {metric.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Progreso Físico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  {metrics.map(metric => 
                    selectedMetrics.includes(metric.key) && (
                      <Line 
                        key={metric.key}
                        type="monotone" 
                        dataKey={metric.key} 
                        name={metric.label}
                        stroke={metric.color} 
                        strokeWidth={2}
                        dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    )
                  )}
                </RechartsLineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  {metrics.map(metric => 
                    selectedMetrics.includes(metric.key) && (
                      <Bar 
                        key={metric.key}
                        dataKey={metric.key} 
                        name={metric.label}
                        fill={metric.color}
                        radius={[4, 4, 0, 0]}
                      />
                    )
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// AI Routine Analysis Component
function RoutineAnalysis({ routine, onAnalyze }: { routine: Routine; onAnalyze: (goal: string, diet: string) => void }) {
  const [goal, setGoal] = useState("")
  const [diet, setDiet] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(routine.aiAnalysis)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/routine-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineId: routine.id,
          userGoal: goal,
          userDiet: diet
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setAnalysis(data.analysis)
      } else {
        toast({ title: "Error", description: "No se pudo analizar la rutina", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Error en el análisis", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Análisis IA de Rutina
        </CardTitle>
        <CardDescription>Análisis profesional como Personal Trainer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <>
            <div className="space-y-2">
              <Label>Tu objetivo (opcional)</Label>
              <Input 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ej: Hipertrofia, Fuerza, Pérdida de grasa..."
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción de tu dieta actual (opcional)</Label>
              <Textarea 
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                placeholder="Ej: Alta en proteínas, 2500 kcal diarias..."
                rows={3}
              />
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analizar Rutina
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm">{analysis}</div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setAnalysis(null)}
              className="w-full"
            >
              <Edit className="w-4 h-4 mr-2" />
              Nuevo Análisis
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// AI Recipe Generator Component
function RecipeGenerator({ onRecipeGenerated }: { onRecipeGenerated: (recipe: Recipe) => void }) {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState("")
  const [mealType, setMealType] = useState("")
  const [calories, setCalories] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null)
  const [saveEnabled, setSaveEnabled] = useState(true)

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()])
      setNewIngredient("")
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      toast({ title: "Error", description: "Agrega al menos un ingrediente", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/ai/recipe-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          mealType,
          calories: calories ? parseFloat(calories) : undefined,
          saveRecipe: false
        })
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedRecipe(data.recipe)
      } else {
        toast({ title: "Error", description: "No se pudo generar la receta", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Error al generar receta", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const saveRecipe = async () => {
    if (!generatedRecipe) return

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generatedRecipe.name,
          description: generatedRecipe.description,
          instructions: generatedRecipe.instructions,
          ingredients: generatedRecipe.ingredients,
          prepTime: generatedRecipe.prepTime,
          cookTime: generatedRecipe.cookTime,
          servings: generatedRecipe.servings,
          calories: generatedRecipe.calories,
          protein: generatedRecipe.protein,
          carbs: generatedRecipe.carbs,
          fat: generatedRecipe.fat,
          isAiGenerated: true
        })
      })

      if (res.ok) {
        const data = await res.json()
        toast({ title: "Receta guardada" })
        onRecipeGenerated(data)
        setSaveEnabled(false)
      }
    } catch {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" })
    }
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-amber-600" />
          Generador de Recetas IA
        </CardTitle>
        <CardDescription>Ingresa tus ingredientes y obtén ideas de platillos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ingredient Input */}
        <div className="space-y-2">
          <Label>Ingredientes disponibles</Label>
          <div className="flex gap-2">
            <Input 
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addIngredient()}
              placeholder="Ej: Pollo, arroz, brócoli..."
            />
            <Button onClick={addIngredient} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {ingredients.map((ing, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {ing}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeIngredient(i)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de comida (opcional)</Label>
            <select 
              className="w-full p-2 border rounded-md bg-background"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="">Cualquiera</option>
              <option value="breakfast">Desayuno</option>
              <option value="lunch">Almuerzo</option>
              <option value="dinner">Cena</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Calorías objetivo (opcional)</Label>
            <Input 
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="500"
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateRecipe} 
          disabled={loading || ingredients.length === 0}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando receta...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generar Receta
            </>
          )}
        </Button>

        {/* Generated Recipe */}
        {generatedRecipe && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-lg">{generatedRecipe.name}</h4>
              {saveEnabled && (
                <Button size="sm" onClick={saveRecipe} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              )}
            </div>
            
            {generatedRecipe.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">{generatedRecipe.description}</p>
            )}

            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div className="p-2 bg-white dark:bg-gray-700 rounded">
                <p className="text-gray-500">Calorías</p>
                <p className="font-semibold">{generatedRecipe.calories || '-'}</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-700 rounded">
                <p className="text-gray-500">Proteína</p>
                <p className="font-semibold">{generatedRecipe.protein || '-'}g</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-700 rounded">
                <p className="text-gray-500">Carbos</p>
                <p className="font-semibold">{generatedRecipe.carbs || '-'}g</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-700 rounded">
                <p className="text-gray-500">Grasa</p>
                <p className="font-semibold">{generatedRecipe.fat || '-'}g</p>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Ingredientes:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                {generatedRecipe.ingredients?.map((ing: string, i: number) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-2">Preparación:</h5>
              <ol className="list-decimal list-inside text-sm space-y-2">
                {generatedRecipe.instructions?.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            {generatedRecipe.tips && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded text-sm">
                <strong>💡 Tips:</strong> {generatedRecipe.tips}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Diet Manager Component
function DietManager({ 
  activeDiet, 
  archivedDiets, 
  onCreateDiet, 
  onArchiveDiet, 
  onDeleteDiet,
  onActivateDiet,
  onSaveMeal,
  onSaveAllMeals
}: { 
  activeDiet: Diet | null
  archivedDiets: Diet[]
  onCreateDiet: (name: string, description: string, dietType: string) => void
  onArchiveDiet: () => void
  onDeleteDiet: (id: string) => void
  onActivateDiet: (id: string) => void
  onSaveMeal: (dietId: string, mealType: string, description: string, macros: any) => void
  onSaveAllMeals: (dietId: string, meals: Record<string, {description: string, macros: any}>) => void
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [newDietName, setNewDietName] = useState("")
  const [newDietDesc, setNewDietDesc] = useState("")
  const [newDietType, setNewDietType] = useState("training_day")
  const [mealDescriptions, setMealDescriptions] = useState<Record<string, string>>({})
  const [mealMacros, setMealMacros] = useState<Record<string, any>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dietAnalysis, setDietAnalysis] = useState<any>(null)

  const handleCreate = () => {
    if (!newDietName.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" })
      return
    }
    onCreateDiet(newDietName, newDietDesc, newDietType)
    setCreateOpen(false)
    setNewDietName("")
    setNewDietDesc("")
    setNewDietType("training_day")
  }

  const dietTypeLabels: Record<string, string> = {
    training_day: "Día de Entrenamiento",
    rest_day: "Día de Descanso"
  }

  // Analyze entire diet with single button
  const analyzeEntireDiet = async () => {
    if (!activeDiet) return
    
    // Check if at least one meal has description
    const hasAnyMeal = Object.values(mealDescriptions).some(d => d?.trim())
    if (!hasAnyMeal) {
      toast({ title: "Error", description: "Describe al menos una comida", variant: "destructive" })
      return
    }

    setIsAnalyzing(true)
    try {
      // Analyze each meal
      const updatedMacros: Record<string, any> = {}
      
      for (const mealType of mealTypeOrder) {
        const description = mealDescriptions[mealType]
        if (description?.trim()) {
          const res = await fetch("/api/ai/meal-analyzer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mealDescription: description,
              mealType: mealTypeLabels[mealType]
            })
          })
          
          if (res.ok) {
            const data = await res.json()
            updatedMacros[mealType] = data.macros
          }
        }
      }
      
      setMealMacros(updatedMacros)
      
      // Save all meals to database
      const mealsToSave: Record<string, {description: string, macros: any}> = {}
      for (const mealType of mealTypeOrder) {
        if (mealDescriptions[mealType]?.trim()) {
          mealsToSave[mealType] = {
            description: mealDescriptions[mealType],
            macros: updatedMacros[mealType] || {}
          }
        }
      }
      
      onSaveAllMeals(activeDiet.id, mealsToSave)
      
      // Now get overall diet analysis
      const analysisRes = await fetch("/api/ai/diet-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: mealDescriptions })
      })
      
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json()
        setDietAnalysis(analysisData.analysis)
      }
      
      toast({ 
        title: "Dieta analizada",
        description: "Todas las comidas han sido procesadas"
      })
    } catch (error) {
      console.error("Error analyzing diet:", error)
      toast({ title: "Error", description: "Error al analizar la dieta", variant: "destructive" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Initialize meal descriptions from saved data
  useEffect(() => {
    if (activeDiet?.meals) {
      const descriptions: Record<string, string> = {}
      const macros: Record<string, any> = {}
      
      activeDiet.meals.forEach(meal => {
        if (meal.description) {
          descriptions[meal.mealType] = meal.description
        }
        if (meal.calories) {
          macros[meal.mealType] = {
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            fiber: meal.fiber
          }
        }
      })
      
      setMealDescriptions(descriptions)
      setMealMacros(macros)
    }
  }, [activeDiet])

  // Calculate totals from meals
  const calculateTotals = () => {
    if (!activeDiet?.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    
    return activeDiet.meals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  return (
    <div className="space-y-6">
      {activeDiet ? (
        <>
          {/* Diet Header */}
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{activeDiet.name}</CardTitle>
                  {activeDiet.dietType && (
                    <Badge variant={activeDiet.dietType === "training_day" ? "default" : "secondary"} className="text-xs">
                      {dietTypeLabels[activeDiet.dietType] || activeDiet.dietType}
                    </Badge>
                  )}
                </div>
                <CardDescription>{activeDiet.description || "Tu dieta activa"}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onArchiveDiet}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archivar
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Macro Summary */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Balance de Macros Diarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                {(() => {
                  const totals = calculateTotals()
                  return (
                    <>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Calorías</p>
                        <p className="text-2xl font-bold text-red-600">{Math.round(totals.calories)}</p>
                        <p className="text-xs text-gray-400">kcal</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Proteína</p>
                        <p className="text-2xl font-bold text-blue-600">{Math.round(totals.protein)}</p>
                        <p className="text-xs text-gray-400">gramos</p>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Carbohidratos</p>
                        <p className="text-2xl font-bold text-amber-600">{Math.round(totals.carbs)}</p>
                        <p className="text-xs text-gray-400">gramos</p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Grasas</p>
                        <p className="text-2xl font-bold text-purple-600">{Math.round(totals.fat)}</p>
                        <p className="text-xs text-gray-400">gramos</p>
                      </div>
                    </>
                  )
                })()}
              </div>
              
              {/* Macro Progress Bars */}
              {(() => {
                const totals = calculateTotals()
                const proteinGoal = 150
                const carbsGoal = 250
                const fatGoal = 65
                
                return (
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Proteína</span>
                        <span>{Math.round(totals.protein)}g / {proteinGoal}g</span>
                      </div>
                      <Progress value={(totals.protein / proteinGoal) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Carbohidratos</span>
                        <span>{Math.round(totals.carbs)}g / {carbsGoal}g</span>
                      </div>
                      <Progress value={(totals.carbs / carbsGoal) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Grasas</span>
                        <span>{Math.round(totals.fat)}g / {fatGoal}g</span>
                      </div>
                      <Progress value={(totals.fat / fatGoal) * 100} className="h-2" />
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {/* Meals - Text Inputs */}
          <div className="space-y-4">
            {mealTypeOrder.map(mealType => {
              const macros = mealMacros[mealType]
              
              return (
                <Card key={mealType} className="border-0 shadow-md">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-emerald-600" />
                        </div>
                        <CardTitle className="text-base">{mealTypeLabels[mealType]}</CardTitle>
                      </div>
                      {macros && (
                        <div className="flex gap-2 text-xs">
                          <Badge variant="outline">{macros.calories} kcal</Badge>
                          <Badge variant="outline">P: {macros.protein}g</Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea 
                      value={mealDescriptions[mealType] || ""}
                      onChange={(e) => setMealDescriptions(prev => ({
                        ...prev,
                        [mealType]: e.target.value
                      }))}
                      placeholder={`¿Qué comiste en el ${mealTypeLabels[mealType].toLowerCase()}?`}
                      rows={2}
                      className="resize-none"
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Single Analyze Button */}
          <Button 
            onClick={analyzeEntireDiet}
            disabled={isAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analizando toda la dieta...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Analizar Dieta Completa con IA
              </>
            )}
          </Button>

          {/* Diet Analysis Results */}
          {dietAnalysis && (
            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Análisis de tu Dieta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-2">RESUMEN</h4>
                  <p className="text-gray-700 dark:text-gray-300">{dietAnalysis.summary}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-2">ANÁLISIS DE MACROS</h4>
                  <p className="text-gray-700 dark:text-gray-300">{dietAnalysis.macroAnalysis}</p>
                </div>
                
                {dietAnalysis.qualityScore && (
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="text-4xl font-bold text-purple-600">{dietAnalysis.qualityScore}/10</div>
                    <div>
                      <p className="font-medium">Puntuación de Calidad</p>
                      <p className="text-sm text-gray-500">Evaluación nutricional general</p>
                    </div>
                  </div>
                )}
                
                {dietAnalysis.strengths && dietAnalysis.strengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-emerald-600 mb-2">✅ PUNTOS FUERTES</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {dietAnalysis.strengths.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {dietAnalysis.improvements && dietAnalysis.improvements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-amber-600 mb-2">⚡ MEJORAS SUGERIDAS</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {dietAnalysis.improvements.map((i: string, idx: number) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {dietAnalysis.recommendations && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <h4 className="font-semibold text-sm text-emerald-700 dark:text-emerald-400 mb-2">💡 RECOMENDACIONES PARA HIPERTROFIA</h4>
                    <p className="text-gray-700 dark:text-gray-300">{dietAnalysis.recommendations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-semibold mb-2">No tienes una dieta activa</h2>
          <p className="text-gray-500 mb-6">Crea una nueva dieta o activa una del archivo</p>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-5 h-5 mr-2" />
                Crear Nueva Dieta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Dieta</DialogTitle>
                <DialogDescription>Configura tu plan nutricional</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nombre de la dieta</Label>
                  <Input 
                    value={newDietName}
                    onChange={(e) => setNewDietName(e.target.value)}
                    placeholder="Mi dieta de volumen"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de día</Label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={newDietType}
                    onChange={(e) => setNewDietType(e.target.value)}
                  >
                    <option value="training_day">Día de Entrenamiento</option>
                    <option value="rest_day">Día de Descanso</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Descripción (opcional)</Label>
                  <Textarea 
                    value={newDietDesc}
                    onChange={(e) => setNewDietDesc(e.target.value)}
                    placeholder="Descripción de la dieta..."
                  />
                </div>
                <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Crear Dieta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Archived Diets */}
      {archivedDiets.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Dietas Archivadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {archivedDiets.map(diet => (
                <div key={diet.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium">{diet.name}</h4>
                    <p className="text-sm text-gray-500">
                      {diet.startDate ? new Date(diet.startDate).toLocaleDateString('es-ES') : 'Sin fecha'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onActivateDiet(diet.id)}>
                      Activar
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteDiet(diet.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Saved Recipes Component
function SavedRecipes({ recipes, onDelete }: { recipes: Recipe[]; onDelete: (id: string) => void }) {
  if (recipes.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center text-gray-500">
          <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tienes recetas guardadas</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {recipes.map(recipe => (
        <Card key={recipe.id} className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg">{recipe.name}</CardTitle>
              <div className="flex gap-2 mt-1">
                {recipe.isAiGenerated && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    IA
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(recipe.id)} className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-center text-sm mb-3">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-gray-500 text-xs">Kcal</p>
                <p className="font-semibold">{recipe.calories || '-'}</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-gray-500 text-xs">Prot</p>
                <p className="font-semibold">{recipe.protein || '-'}g</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-gray-500 text-xs">Carb</p>
                <p className="font-semibold">{recipe.carbs || '-'}g</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-gray-500 text-xs">Grasa</p>
                <p className="font-semibold">{recipe.fat || '-'}g</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              {recipe.prepTime && <span>Prep: {recipe.prepTime}min</span>}
              {recipe.cookTime && <span>• Cocción: {recipe.cookTime}min</span>}
              <span>• {recipe.servings} porciones</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Dashboard Component
function Dashboard() {
  const { data: session, update: updateSession } = useSession()
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null)
  const [archivedRoutines, setArchivedRoutines] = useState<Routine[]>([])
  const [progressRecords, setProgressRecords] = useState<PhysicalProgress[]>([])
  const [activeDiet, setActiveDiet] = useState<Diet | null>(null)
  const [archivedDiets, setArchivedDiets] = useState<Diet[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("routine")
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const [adminSetupLoading, setAdminSetupLoading] = useState(false)
  
  // Dialogs
  const [createRoutineOpen, setCreateRoutineOpen] = useState(false)
  const [addExerciseOpen, setAddExerciseOpen] = useState(false)
  const [addProgressOpen, setAddProgressOpen] = useState(false)
  const [viewProgressOpen, setViewProgressOpen] = useState(false)
  const [editProgressOpen, setEditProgressOpen] = useState(false)
  const [editExerciseOpen, setEditExerciseOpen] = useState(false)
  const [selectedProgress, setSelectedProgress] = useState<PhysicalProgress | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  
  // Form states
  const [newRoutineName, setNewRoutineName] = useState("")
  const [newRoutineDescription, setNewRoutineDescription] = useState("")
  const [newRoutineDays, setNewRoutineDays] = useState(3)
  const [selectedDayId, setSelectedDayId] = useState("")
  const [newExercise, setNewExercise] = useState({ name: "", sets: "", reps: "", weight: "", notes: "" })
  const [newProgress, setNewProgress] = useState<Partial<PhysicalProgress>>({})
  const [progressPhotos, setProgressPhotos] = useState({ front: "", side: "", back: "", extra: "" })
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null)

  // Fetch data
  const fetchData = async () => {
    try {
      const [userRes, routinesRes, progressRes, dietsRes, recipesRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/routines?archived=true"),
        fetch("/api/progress"),
        fetch("/api/diets?archived=true"),
        fetch("/api/recipes")
      ])
      
      if (userRes.ok) {
        const userData = await userRes.json()
        setActiveRoutine(userData.activeRoutine)
        setActiveDiet(userData.activeDiet)
      }
      
      if (routinesRes.ok) {
        const routinesData = await routinesRes.json()
        setArchivedRoutines(routinesData.filter((r: Routine) => r.isArchived))
      }
      
      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setProgressRecords(progressData)
      }

      if (dietsRes.ok) {
        const dietsData = await dietsRes.json()
        setArchivedDiets(dietsData.filter((d: Diet) => d.isArchived))
      }

      if (recipesRes.ok) {
        const recipesData = await recipesRes.json()
        setRecipes(recipesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    checkAdminStatus()
  }, [])

  // Check if admin exists
  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/admin/setup")
      if (res.ok) {
        const data = await res.json()
        setHasAdmin(data.hasAdmin)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
    }
  }

  // Handle become admin
  const handleBecomeAdmin = async () => {
    setAdminSetupLoading(true)
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST"
      })
      
      if (res.ok) {
        const data = await res.json()
        toast({ 
          title: "¡Felicidades!", 
          description: "Ahora eres administrador. Recarga la página para ver el panel de admin." 
        })
        setHasAdmin(true)
        // Update session to reflect new role
        await updateSession()
      } else {
        const errorData = await res.json()
        toast({ 
          title: "Error", 
          description: errorData.error || "No se pudo configurar como admin", 
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error("Error becoming admin:", error)
      toast({ 
        title: "Error", 
        description: "Error al configurar administrador", 
        variant: "destructive" 
      })
    } finally {
      setAdminSetupLoading(false)
    }
  }

  // Create routine
  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" })
      return
    }

    try {
      const days = Array.from({ length: newRoutineDays }, (_, i) => ({
        name: `Día ${i + 1}`,
        dayNumber: i + 1,
        exercises: []
      }))

      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoutineName,
          description: newRoutineDescription,
          days
        })
      })

      if (res.ok) {
        const routine = await res.json()
        setActiveRoutine(routine)
        setCreateRoutineOpen(false)
        setNewRoutineName("")
        setNewRoutineDescription("")
        setNewRoutineDays(3)
        toast({ title: "Rutina creada", description: "Tu nueva rutina está lista" })
      } else {
        const errorData = await res.json()
        toast({ title: "Error", description: errorData.error || "No se pudo crear la rutina", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error creating routine:", error)
      toast({ title: "Error", description: "No se pudo crear la rutina", variant: "destructive" })
    }
  }

  // Add exercise
  const handleAddExercise = async () => {
    if (!newExercise.name.trim() || !selectedDayId) return

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutDayId: selectedDayId,
          name: newExercise.name,
          sets: newExercise.sets ? parseInt(newExercise.sets) : null,
          reps: newExercise.reps || null,
          weight: newExercise.weight ? parseFloat(newExercise.weight) : null
        })
      })

      if (res.ok) {
        fetchData()
        setAddExerciseOpen(false)
        setNewExercise({ name: "", sets: "", reps: "", weight: "", notes: "" })
        toast({ title: "Ejercicio agregado" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo agregar el ejercicio", variant: "destructive" })
    }
  }

  // Delete exercise
  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const res = await fetch(`/api/exercises/${exerciseId}`, { method: "DELETE" })
      if (res.ok) {
        fetchData()
        toast({ title: "Ejercicio eliminado" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  // Add day
  const handleAddDay = async () => {
    if (!activeRoutine || activeRoutine.days.length >= 7) return

    try {
      const res = await fetch("/api/days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineId: activeRoutine.id,
          name: `Día ${activeRoutine.days.length + 1}`,
          dayNumber: activeRoutine.days.length + 1
        })
      })

      if (res.ok) {
        fetchData()
        toast({ title: "Día agregado" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo agregar el día", variant: "destructive" })
    }
  }

  // Delete day
  const handleDeleteDay = async (dayId: string) => {
    if (!activeRoutine || activeRoutine.days.length <= 1) {
      toast({ title: "Error", description: "Debe haber al menos un día en la rutina", variant: "destructive" })
      return
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este día y todos sus ejercicios?")) return

    try {
      const res = await fetch(`/api/days/${dayId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        fetchData()
        toast({ title: "Día eliminado" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el día", variant: "destructive" })
    }
  }

  // Update day name
  const handleUpdateDayName = async (dayId: string, name: string) => {
    try {
      const res = await fetch(`/api/days/${dayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })
      if (res.ok) fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  // Archive routine
  const handleArchiveRoutine = async () => {
    if (!activeRoutine) return

    try {
      const res = await fetch(`/api/routines/${activeRoutine.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true, isActive: false })
      })

      if (res.ok) {
        setActiveRoutine(null)
        fetchData()
        toast({ title: "Rutina archivada" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo archivar", variant: "destructive" })
    }
  }

  // Set active routine
  const handleSetActiveRoutine = async (routineId: string) => {
    try {
      const res = await fetch(`/api/routines/${routineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true, isArchived: false })
      })

      if (res.ok) {
        fetchData()
        toast({ title: "Rutina activada" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo activar", variant: "destructive" })
    }
  }

  // Delete routine
  const handleDeleteRoutine = async (routineId: string) => {
    try {
      const res = await fetch(`/api/routines/${routineId}`, { method: "DELETE" })
      if (res.ok) {
        fetchData()
        toast({ title: "Rutina eliminada" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  // Handle photo upload
  const handlePhotoUpload = (type: 'front' | 'side' | 'back' | 'extra', file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setProgressPhotos(prev => ({ ...prev, [type]: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  // Save progress
  const handleSaveProgress = async () => {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProgress,
          frontPhoto: progressPhotos.front || null,
          sidePhoto: progressPhotos.side || null,
          backPhoto: progressPhotos.back || null,
          extraPhoto: progressPhotos.extra || null
        })
      })

      if (res.ok) {
        fetchData()
        setAddProgressOpen(false)
        setNewProgress({})
        setProgressPhotos({ front: "", side: "", back: "", extra: "" })
        toast({ title: "Progreso guardado" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" })
    }
  }

  // Delete progress
  const handleDeleteProgress = async (id: string) => {
    try {
      const res = await fetch(`/api/progress/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchData()
        setViewProgressOpen(false)
        toast({ title: "Registro eliminado" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  // Update progress
  const handleUpdateProgress = async () => {
    if (!selectedProgress) return
    
    try {
      const res = await fetch(`/api/progress/${selectedProgress.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedProgress,
          frontPhoto: progressPhotos.front || selectedProgress.frontPhoto,
          sidePhoto: progressPhotos.side || selectedProgress.sidePhoto,
          backPhoto: progressPhotos.back || selectedProgress.backPhoto,
          extraPhoto: progressPhotos.extra || selectedProgress.extraPhoto
        })
      })

      if (res.ok) {
        fetchData()
        setEditProgressOpen(false)
        setProgressPhotos({ front: "", side: "", back: "", extra: "" })
        toast({ title: "Progreso actualizado" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" })
    }
  }

  // Update exercise
  const handleUpdateExercise = async () => {
    if (!selectedExercise) return
    
    try {
      const res = await fetch(`/api/exercises/${selectedExercise.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedExercise.name,
          sets: selectedExercise.sets,
          reps: selectedExercise.reps,
          weight: selectedExercise.weight,
          notes: selectedExercise.notes
        })
      })

      if (res.ok) {
        fetchData()
        setEditExerciseOpen(false)
        setSelectedExercise(null)
        toast({ title: "Ejercicio actualizado" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el ejercicio", variant: "destructive" })
    }
  }

  // Open photo in lightbox
  const openLightbox = (url: string, title: string) => {
    setLightboxImage({ url, title })
    setLightboxOpen(true)
  }

  // Download photo
  const downloadPhoto = async (url: string, filename: string) => {
    try {
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
      toast({ title: "Foto descargada" })
    } catch {
      toast({ title: "Error", description: "No se pudo descargar la foto", variant: "destructive" })
    }
  }

  // Move exercise order
  const handleMoveExercise = async (exerciseId: string, direction: 'up' | 'down', dayExercises: Exercise[]) => {
    const currentIndex = dayExercises.findIndex(e => e.id === exerciseId)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= dayExercises.length) return

    const exercisesToUpdate = [...dayExercises]
    const temp = exercisesToUpdate[currentIndex].order
    exercisesToUpdate[currentIndex].order = exercisesToUpdate[newIndex].order
    exercisesToUpdate[newIndex].order = temp

    try {
      // Update both exercises
      await Promise.all([
        fetch(`/api/exercises/${exercisesToUpdate[currentIndex].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: exercisesToUpdate[currentIndex].order })
        }),
        fetch(`/api/exercises/${exercisesToUpdate[newIndex].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: exercisesToUpdate[newIndex].order })
        })
      ])
      
      fetchData()
    } catch {
      toast({ title: "Error", description: "No se pudo reordenar", variant: "destructive" })
    }
  }

  // Diet handlers
  const handleCreateDiet = async (name: string, description: string, dietType: string) => {
    try {
      const meals = mealTypeOrder.map(mealType => ({
        mealType,
        name: mealTypeLabels[mealType]
      }))

      const res = await fetch("/api/diets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, meals, dietType })
      })

      if (res.ok) {
        fetchData()
        toast({ title: "Dieta creada" })
      } else {
        const errorData = await res.json()
        toast({ title: "Error", description: errorData.error || "No se pudo crear la dieta", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error creating diet:", error)
      toast({ title: "Error", description: "No se pudo crear la dieta", variant: "destructive" })
    }
  }

  const handleArchiveDiet = async () => {
    if (!activeDiet) return

    try {
      const res = await fetch(`/api/diets/${activeDiet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isArchived: true, 
          isActive: false,
          endDate: new Date().toISOString()
        })
      })

      if (res.ok) {
        setActiveDiet(null)
        fetchData()
        toast({ title: "Dieta archivada" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo archivar", variant: "destructive" })
    }
  }

  const handleDeleteDiet = async (id: string) => {
    try {
      const res = await fetch(`/api/diets/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchData()
        toast({ title: "Dieta eliminada" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  const handleActivateDiet = async (id: string) => {
    try {
      const res = await fetch(`/api/diets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true, isArchived: false })
      })

      if (res.ok) {
        fetchData()
        toast({ title: "Dieta activada" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo activar", variant: "destructive" })
    }
  }

  const handleSaveMeal = async (dietId: string, mealType: string, description: string, macros: any) => {
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dietId, 
          mealType, 
          description,
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          fiber: macros.fiber
        })
      })

      if (res.ok) {
        fetchData()
      }
    } catch {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" })
    }
  }

  const handleSaveAllMeals = async (dietId: string, meals: Record<string, {description: string, macros: any}>) => {
    try {
      // Save each meal
      for (const [mealType, data] of Object.entries(meals)) {
        await fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            dietId, 
            mealType, 
            description: data.description,
            calories: data.macros?.calories || 0,
            protein: data.macros?.protein || 0,
            carbs: data.macros?.carbs || 0,
            fat: data.macros?.fat || 0,
            fiber: data.macros?.fiber || 0
          })
        })
      }
      fetchData()
    } catch {
      toast({ title: "Error", description: "No se pudieron guardar las comidas", variant: "destructive" })
    }
  }

  // Recipe handlers
  const handleDeleteRecipe = async (id: string) => {
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchData()
        toast({ title: "Receta eliminada" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  // Export handlers
  const handleExportRoutine = () => {
    if (!activeRoutine) return

    const printContent = document.createElement('div')
    printContent.id = 'print-content'
    printContent.className = 'print-only'
    
    let html = `
      <html>
      <head>
        <title>${activeRoutine.name} - GymPro</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #10b981; margin-bottom: 5px; }
          h2 { color: #374151; margin-top: 30px; border-bottom: 2px solid #10b981; padding-bottom: 10px; page-break-before: always; }
          h2:first-of-type { page-break-before: auto; }
          .day-section { margin-bottom: 30px; }
          .exercise { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .exercise-name { font-weight: 500; }
          .exercise-details { color: #6b7280; }
          .description { color: #6b7280; font-style: italic; margin-bottom: 20px; }
          @media print { body { print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${activeRoutine.name}</h1>
        ${activeRoutine.description ? `<p class="description">${activeRoutine.description}</p>` : ''}
    `

    activeRoutine.days.forEach(day => {
      html += `
        <div class="day-section">
          <h2>${day.name}</h2>
          ${day.exercises.length > 0 ? day.exercises.map((ex, i) => `
            <div class="exercise">
              <span class="exercise-name">${i + 1}. ${ex.name}</span>
              <span class="exercise-details">
                ${ex.sets ? `${ex.sets} series` : ''} 
                ${ex.reps ? `× ${ex.reps} reps` : ''} 
                ${ex.weight ? `${ex.weight} ${ex.weightUnit}` : ''}
              </span>
            </div>
          `).join('') : '<p style="color: #9ca3af;">Sin ejercicios</p>'}
        </div>
      `
    })

    html += '</body></html>'

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleExportProgress = () => {
    if (progressRecords.length === 0) {
      toast({ title: "Error", description: "No hay datos de progreso para exportar", variant: "destructive" })
      return
    }

    const metrics = [
      { key: "bodyWeight", label: "Peso (kg)" },
      { key: "chestMeasurement", label: "Pecho (cm)" },
      { key: "backMeasurement", label: "Espalda (cm)" },
      { key: "leftArmMeasurement", label: "Brazo Izq (cm)" },
      { key: "rightArmMeasurement", label: "Brazo Der (cm)" },
      { key: "abdomenMeasurement", label: "Abdomen (cm)" },
      { key: "glutesMeasurement", label: "Glúteos (cm)" },
      { key: "leftLegMeasurement", label: "Pierna Izq (cm)" },
      { key: "rightLegMeasurement", label: "Pierna Der (cm)" }
    ]

    let html = `
      <html>
      <head>
        <title>Progreso Físico - GymPro</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #10b981; margin-bottom: 20px; }
          h2 { color: #374151; margin-top: 30px; border-bottom: 2px solid #10b981; padding-bottom: 10px; page-break-before: always; }
          h2:first-of-type { page-break-before: auto; }
          .metric-section { margin-bottom: 40px; }
          .chart-placeholder { 
            background: #f3f4f6; 
            border: 2px dashed #d1d5db; 
            padding: 40px; 
            text-align: center; 
            color: #6b7280;
            border-radius: 8px;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
          th { background: #f9fafb; color: #374151; }
          tr:nth-child(even) { background: #f9fafb; }
          @media print { body { print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>Progreso Físico - GymPro</h1>
    `

    // Summary table
    html += `
      <h2>Resumen de Mediciones</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            ${metrics.map(m => `<th>${m.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${progressRecords.slice().reverse().map(record => `
            <tr>
              <td>${new Date(record.date).toLocaleDateString('es-ES')}</td>
              ${metrics.map(m => `<td>${(record as any)[m.key] || '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    // Individual metric sections
    metrics.forEach(metric => {
      const data = progressRecords.filter(r => (r as any)[metric.key]).map(r => ({
        date: new Date(r.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        value: (r as any)[metric.key]
      }))

      if (data.length > 0) {
        html += `
          <div class="metric-section">
            <h2>${metric.label}</h2>
            <div class="chart-placeholder">
              [Gráfico de ${metric.label}]
              <br><br>
              Datos: ${data.map(d => `${d.date}: ${d.value}`).join(' | ')}
            </div>
          </div>
        `
      }
    })

    html += '</body></html>'

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 animate-pulse mx-auto text-emerald-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GymPro</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hola, {session?.user?.name || session?.user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Admin Setup Banner */}
        {hasAdmin === false && session?.user?.role !== "ADMIN" && (
          <Card className="mb-6 border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">¡Sé el primer administrador!</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">No hay administradores en el sistema. Puedes convertirte en admin para gestionar usuarios.</p>
                  </div>
                </div>
                <Button 
                  onClick={handleBecomeAdmin}
                  disabled={adminSetupLoading}
                  className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                >
                  {adminSetupLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Configurando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Hacerme Admin
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-6 ${session?.user?.role === "ADMIN" ? "grid-cols-5" : "grid-cols-4"}`}>
            <TabsTrigger value="routine" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">Rutina</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Progreso</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              <span className="hidden sm:inline">Nutrición</span>
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              <span className="hidden sm:inline">Recetas</span>
            </TabsTrigger>
            {session?.user?.role === "ADMIN" && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Routine Tab */}
          <TabsContent value="routine">
            {activeRoutine ? (
              <div className="space-y-6">
                {/* Routine Header */}
                <Card className="border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{activeRoutine.name}</CardTitle>
                      <CardDescription>{activeRoutine.description || "Tu rutina activa"}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExportRoutine}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                      <Button variant="outline" onClick={handleArchiveRoutine}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archivar
                      </Button>
                      <Dialog open={addExerciseOpen} onOpenChange={setAddExerciseOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Ejercicio
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Agregar Ejercicio</DialogTitle>
                            <DialogDescription>Añade un nuevo ejercicio a tu rutina</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Día</Label>
                              <select 
                                className="w-full p-2 border rounded-md bg-background"
                                value={selectedDayId}
                                onChange={(e) => setSelectedDayId(e.target.value)}
                              >
                                <option value="">Seleccionar día</option>
                                {activeRoutine.days.map(day => (
                                  <option key={day.id} value={day.id}>{day.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label>Nombre del ejercicio</Label>
                              <Input 
                                value={newExercise.name}
                                onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                                placeholder="Press de banca"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Series</Label>
                                <Input 
                                  type="number"
                                  value={newExercise.sets}
                                  onChange={(e) => setNewExercise({...newExercise, sets: e.target.value})}
                                  placeholder="4"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Reps</Label>
                                <Input 
                                  value={newExercise.reps}
                                  onChange={(e) => setNewExercise({...newExercise, reps: e.target.value})}
                                  placeholder="8-12"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Peso (kg)</Label>
                                <Input 
                                  type="number"
                                  step="0.5"
                                  value={newExercise.weight}
                                  onChange={(e) => setNewExercise({...newExercise, weight: e.target.value})}
                                  placeholder="80"
                                />
                              </div>
                            </div>
                            <Button onClick={handleAddExercise} className="w-full bg-emerald-600 hover:bg-emerald-700">
                              Agregar Ejercicio
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                </Card>

                {/* Days Tabs */}
                <Tabs defaultValue={activeRoutine.days[0]?.id} className="w-full">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <TabsList className="flex-nowrap">
                      {activeRoutine.days.map(day => (
                        <TabsTrigger key={day.id} value={day.id} className="min-w-fit">
                          {day.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {activeRoutine.days.length < 7 && (
                      <Button variant="outline" size="sm" onClick={handleAddDay}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {activeRoutine.days.map(day => (
                    <TabsContent key={day.id} value={day.id}>
                      <Card className="border-0 shadow-md">
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <Input 
                              value={day.name}
                              onChange={(e) => handleUpdateDayName(day.id, e.target.value)}
                              className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 bg-transparent flex-1"
                            />
                            <Badge variant="secondary">{day.exercises.length} ejercicios</Badge>
                            {activeRoutine.days.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteDay(day.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {day.exercises.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No hay ejercicios en este día</p>
                              <p className="text-sm">Agrega ejercicios usando el botón superior</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {day.exercises.map((exercise, index) => {
                                return (
                                  <div 
                                    key={exercise.id}
                                    className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    {/* Reorder Buttons */}
                                    <div className="flex flex-col gap-0.5">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-6 w-6"
                                        disabled={index === 0}
                                        onClick={() => handleMoveExercise(exercise.id, 'up', day.exercises)}
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-6 w-6"
                                        disabled={index === day.exercises.length - 1}
                                        onClick={() => handleMoveExercise(exercise.id, 'down', day.exercises)}
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    
                                    {/* Order Number */}
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                                      {index + 1}
                                    </div>
                                    
                                    {/* Exercise Info */}
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {exercise.sets && (
                                          <Badge variant="outline">{exercise.sets} series</Badge>
                                        )}
                                        {exercise.reps && (
                                          <Badge variant="outline">{exercise.reps} reps</Badge>
                                        )}
                                        {exercise.weight && (
                                          <Badge variant="outline">{exercise.weight} {exercise.weightUnit}</Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Edit Button */}
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {
                                        setSelectedExercise(exercise)
                                        setEditExerciseOpen(true)
                                      }}
                                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    
                                    {/* Delete Button */}
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleDeleteExercise(exercise.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>

                {/* AI Analysis - Below the routine */}
                <RoutineAnalysis routine={activeRoutine} onAnalyze={() => fetchData()} />

                {/* Archived Routines */}
                {archivedRoutines.length > 0 && (
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg">Rutinas Archivadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {archivedRoutines.map(routine => (
                          <div 
                            key={routine.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">{routine.name}</h4>
                              <p className="text-sm text-gray-500">
                                {routine.days.length} días • {routine.days.reduce((acc, d) => acc + d.exercises.length, 0)} ejercicios
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleSetActiveRoutine(routine.id)}>
                                Activar
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteRoutine(routine.id)} className="text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <Dumbbell className="w-16 h-16 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No tienes una rutina activa</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Crea una nueva rutina o activa una del archivo</p>
                
                <Dialog open={createRoutineOpen} onOpenChange={setCreateRoutineOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-5 h-5 mr-2" />
                      Crear Nueva Rutina
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Rutina</DialogTitle>
                      <DialogDescription>Configura tu nueva rutina de entrenamiento</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Nombre de la rutina</Label>
                        <Input 
                          value={newRoutineName}
                          onChange={(e) => setNewRoutineName(e.target.value)}
                          placeholder="Mi rutina de fuerza"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción (opcional)</Label>
                        <Textarea 
                          value={newRoutineDescription}
                          onChange={(e) => setNewRoutineDescription(e.target.value)}
                          placeholder="Descripción de la rutina..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cantidad de días: {newRoutineDays}</Label>
                        <input 
                          type="range"
                          min="1"
                          max="7"
                          value={newRoutineDays}
                          onChange={(e) => setNewRoutineDays(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1 día</span>
                          <span>7 días</span>
                        </div>
                      </div>
                      <Button onClick={handleCreateRoutine} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Crear Rutina
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Archived Routines */}
                {archivedRoutines.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Rutinas Archivadas</h3>
                    <div className="space-y-3 max-w-md mx-auto">
                      {archivedRoutines.map(routine => (
                        <div 
                          key={routine.id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                        >
                          <div>
                            <h4 className="font-medium">{routine.name}</h4>
                            <p className="text-sm text-gray-500">
                              {routine.days.length} días • {routine.days.reduce((acc, d) => acc + d.exercises.length, 0)} ejercicios
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleSetActiveRoutine(routine.id)}>
                              Activar
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRoutine(routine.id)} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="space-y-6">
              {/* Progress Header Actions */}
              <div className="flex gap-2">
                <Dialog open={addProgressOpen} onOpenChange={setAddProgressOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Progreso
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Progreso Físico</DialogTitle>
                    <DialogDescription>Ingresa tus medidas y fotos de progreso</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Date */}
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input 
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setNewProgress({...newProgress, date: new Date(e.target.value)})}
                      />
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                      <Label>Peso Corporal (kg)</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={newProgress.bodyWeight || ""}
                        onChange={(e) => setNewProgress({...newProgress, bodyWeight: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </div>

                    <Separator />

                    {/* Measurements */}
                    <div>
                      <h4 className="font-medium mb-4">Medidas Corporales (cm)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Espalda</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={newProgress.backMeasurement || ""}
                            onChange={(e) => setNewProgress({...newProgress, backMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pecho</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={newProgress.chestMeasurement || ""}
                            onChange={(e) => setNewProgress({...newProgress, chestMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Brazo Izquierdo</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={newProgress.leftArmMeasurement || ""}
                            onChange={(e) => setNewProgress({...newProgress, leftArmMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Brazo Derecho</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={newProgress.rightArmMeasurement || ""}
                            onChange={(e) => setNewProgress({...newProgress, rightArmMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Abdomen</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={newProgress.abdomenMeasurement || ""}
                            onChange={(e) => setNewProgress({...newProgress, abdomenMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Glúteos</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={newProgress.glutesMeasurement || ""}
                            onChange={(e) => setNewProgress({...newProgress, glutesMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pierna Izquierda</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={newProgress.leftLegMeasurement || ""}
                            onChange={(e) => setNewProgress({...newProgress, leftLegMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pierna Derecha</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={newProgress.rightLegMeasurement || ""}
                            onChange={(e) => setNewProgress({...newProgress, rightLegMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Photos */}
                    <div>
                      <h4 className="font-medium mb-4">Fotos de Progreso</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { key: 'front', label: 'Frente' },
                          { key: 'side', label: 'Lateral' },
                          { key: 'back', label: 'Espalda' },
                          { key: 'extra', label: 'Extra' }
                        ].map(photo => (
                          <div key={photo.key} className="space-y-2">
                            <Label>{photo.label}</Label>
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id={`photo-${photo.key}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handlePhotoUpload(photo.key as 'front' | 'side' | 'back' | 'extra', file)
                                }}
                              />
                              <label
                                htmlFor={`photo-${photo.key}`}
                                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                {progressPhotos[photo.key as keyof typeof progressPhotos] ? (
                                  <img 
                                    src={progressPhotos[photo.key as keyof typeof progressPhotos]} 
                                    alt={photo.label}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <>
                                    <Camera className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-1">{photo.label}</span>
                                  </>
                                )}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Notas</Label>
                      <Textarea 
                        value={newProgress.notes || ""}
                        onChange={(e) => setNewProgress({...newProgress, notes: e.target.value})}
                        placeholder="Notas adicionales..."
                      />
                    </div>

                    <Button onClick={handleSaveProgress} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Progreso
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleExportProgress} disabled={progressRecords.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              </div>

              {/* Progress Charts */}
              <ProgressCharts progressRecords={progressRecords} />

              {/* Progress Records List */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Historial de Registros</CardTitle>
                </CardHeader>
                <CardContent>
                  {progressRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay registros de progreso</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {progressRecords.map(record => (
                        <div 
                          key={record.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            setSelectedProgress(record)
                            setViewProgressOpen(true)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">
                                {new Date(record.date).toLocaleDateString('es-ES', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </h4>
                              <div className="flex gap-2">
                                {record.bodyWeight && (
                                  <Badge variant="secondary" className="text-xs">{record.bodyWeight} kg</Badge>
                                )}
                                {(record.frontPhoto || record.sidePhoto || record.backPhoto) && (
                                  <Badge variant="outline" className="text-xs">
                                    <Camera className="w-3 h-3 mr-1" />
                                    Fotos
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition">
            <DietManager 
              activeDiet={activeDiet}
              archivedDiets={archivedDiets}
              onCreateDiet={handleCreateDiet}
              onArchiveDiet={handleArchiveDiet}
              onDeleteDiet={handleDeleteDiet}
              onActivateDiet={handleActivateDiet}
              onSaveMeal={handleSaveMeal}
              onSaveAllMeals={handleSaveAllMeals}
            />
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes">
            <div className="space-y-6">
              {/* Recipe Generator */}
              <RecipeGenerator onRecipeGenerated={(recipe) => setRecipes([recipe, ...recipes])} />
              
              {/* Saved Recipes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Mis Recetas Guardadas</h3>
                <SavedRecipes recipes={recipes} onDelete={handleDeleteRecipe} />
              </div>
            </div>
          </TabsContent>

          {/* Admin Tab */}
          {session?.user?.role === "ADMIN" && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* View Progress Dialog */}
      <Dialog open={viewProgressOpen} onOpenChange={setViewProgressOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProgress && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {new Date(selectedProgress.date).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </DialogTitle>
                <DialogDescription>Detalle del registro de progreso</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                {/* Weight */}
                {selectedProgress.bodyWeight && (
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Peso Corporal</p>
                    <p className="text-3xl font-bold text-emerald-600">{selectedProgress.bodyWeight} kg</p>
                  </div>
                )}

                {/* Measurements */}
                <div>
                  <h4 className="font-medium mb-4">Medidas Corporales (cm)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Espalda', value: selectedProgress.backMeasurement },
                      { label: 'Pecho', value: selectedProgress.chestMeasurement },
                      { label: 'Brazo Izq.', value: selectedProgress.leftArmMeasurement },
                      { label: 'Brazo Der.', value: selectedProgress.rightArmMeasurement },
                      { label: 'Abdomen', value: selectedProgress.abdomenMeasurement },
                      { label: 'Glúteos', value: selectedProgress.glutesMeasurement },
                      { label: 'Pierna Izq.', value: selectedProgress.leftLegMeasurement },
                      { label: 'Pierna Der.', value: selectedProgress.rightLegMeasurement },
                    ].filter(m => m.value).map(measurement => (
                      <div key={measurement.label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{measurement.label}</p>
                        <p className="text-lg font-semibold">{measurement.value} cm</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photos */}
                {(selectedProgress.frontPhoto || selectedProgress.sidePhoto || selectedProgress.backPhoto || selectedProgress.extraPhoto) && (
                  <div>
                    <h4 className="font-medium mb-4">Fotos de Progreso</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'frontPhoto', label: 'Frente', photo: selectedProgress.frontPhoto },
                        { key: 'sidePhoto', label: 'Lateral', photo: selectedProgress.sidePhoto },
                        { key: 'backPhoto', label: 'Espalda', photo: selectedProgress.backPhoto },
                        { key: 'extraPhoto', label: 'Extra', photo: selectedProgress.extraPhoto }
                      ].filter(p => p.photo).map(p => (
                        <div key={p.key} className="relative group">
                          <img 
                            src={p.photo!} 
                            alt={p.label} 
                            className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openLightbox(p.photo!, p.label)}
                          />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="icon" 
                              variant="secondary" 
                              className="h-8 w-8 bg-white/90 hover:bg-white"
                              onClick={() => openLightbox(p.photo!, p.label)}
                            >
                              <Maximize2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="secondary" 
                              className="h-8 w-8 bg-white/90 hover:bg-white"
                              onClick={() => {
                                const date = new Date(selectedProgress.date).toISOString().split('T')[0]
                                downloadPhoto(p.photo!, `progreso-${date}-${p.label.toLowerCase()}.jpg`)
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-center text-xs text-gray-500 mt-1">{p.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedProgress.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notas</h4>
                    <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {selectedProgress.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setViewProgressOpen(false)
                      setEditProgressOpen(true)
                    }}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteProgress(selectedProgress.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Progress Dialog */}
      <Dialog open={editProgressOpen} onOpenChange={setEditProgressOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProgress && (
            <>
              <DialogHeader>
                <DialogTitle>Editar Progreso</DialogTitle>
                <DialogDescription>Modifica los datos del registro</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input 
                    type="date"
                    value={selectedProgress.date ? new Date(selectedProgress.date).toISOString().split('T')[0] : ""}
                    onChange={(e) => setSelectedProgress({...selectedProgress, date: new Date(e.target.value)})}
                  />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label>Peso Corporal (kg)</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={selectedProgress.bodyWeight || ""}
                    onChange={(e) => setSelectedProgress({...selectedProgress, bodyWeight: e.target.value ? parseFloat(e.target.value) : null})}
                  />
                </div>

                <Separator />

                {/* Measurements */}
                <div>
                  <h4 className="font-medium mb-4">Medidas Corporales (cm)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Espalda</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={selectedProgress.backMeasurement || ""}
                        onChange={(e) => setSelectedProgress({...selectedProgress, backMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pecho</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={selectedProgress.chestMeasurement || ""}
                        onChange={(e) => setSelectedProgress({...selectedProgress, chestMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Brazo Izquierdo</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={selectedProgress.leftArmMeasurement || ""}
                        onChange={(e) => setSelectedProgress({...selectedProgress, leftArmMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Brazo Derecho</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={selectedProgress.rightArmMeasurement || ""}
                        onChange={(e) => setSelectedProgress({...selectedProgress, rightArmMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Abdomen</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={selectedProgress.abdomenMeasurement || ""}
                        onChange={(e) => setSelectedProgress({...selectedProgress, abdomenMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Glúteos</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={selectedProgress.glutesMeasurement || ""}
                        onChange={(e) => setSelectedProgress({...selectedProgress, glutesMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pierna Izquierda</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={selectedProgress.leftLegMeasurement || ""}
                        onChange={(e) => setSelectedProgress({...selectedProgress, leftLegMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pierna Derecha</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={selectedProgress.rightLegMeasurement || ""}
                        onChange={(e) => setSelectedProgress({...selectedProgress, rightLegMeasurement: e.target.value ? parseFloat(e.target.value) : null})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Photos */}
                <div>
                  <h4 className="font-medium mb-4">Fotos de Progreso</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'front', label: 'Frente', current: selectedProgress.frontPhoto },
                      { key: 'side', label: 'Lateral', current: selectedProgress.sidePhoto },
                      { key: 'back', label: 'Espalda', current: selectedProgress.backPhoto },
                      { key: 'extra', label: 'Extra', current: selectedProgress.extraPhoto }
                    ].map(photo => (
                      <div key={photo.key} className="space-y-2">
                        <Label>{photo.label}</Label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`edit-photo-${photo.key}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  setProgressPhotos(prev => ({ ...prev, [photo.key]: reader.result as string }))
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                          <label
                            htmlFor={`edit-photo-${photo.key}`}
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {progressPhotos[photo.key as keyof typeof progressPhotos] ? (
                              <img 
                                src={progressPhotos[photo.key as keyof typeof progressPhotos]} 
                                alt={photo.label}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : photo.current ? (
                              <img 
                                src={photo.current} 
                                alt={photo.label}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <>
                                <Camera className="w-6 h-6 text-gray-400" />
                                <span className="text-xs text-gray-500 mt-1">{photo.label}</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea 
                    value={selectedProgress.notes || ""}
                    onChange={(e) => setSelectedProgress({...selectedProgress, notes: e.target.value})}
                    placeholder="Notas adicionales..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditProgressOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpdateProgress}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={editExerciseOpen} onOpenChange={setEditExerciseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ejercicio</DialogTitle>
            <DialogDescription>Modifica los datos del ejercicio</DialogDescription>
          </DialogHeader>
          {selectedExercise && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nombre del ejercicio</Label>
                <Input 
                  value={selectedExercise.name}
                  onChange={(e) => setSelectedExercise({...selectedExercise, name: e.target.value})}
                  placeholder="Press de banca"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Series</Label>
                  <Input 
                    type="number"
                    value={selectedExercise.sets || ""}
                    onChange={(e) => setSelectedExercise({...selectedExercise, sets: e.target.value ? parseInt(e.target.value) : null})}
                    placeholder="4"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reps</Label>
                  <Input 
                    value={selectedExercise.reps || ""}
                    onChange={(e) => setSelectedExercise({...selectedExercise, reps: e.target.value})}
                    placeholder="8-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input 
                    type="number"
                    step="0.5"
                    value={selectedExercise.weight || ""}
                    onChange={(e) => setSelectedExercise({...selectedExercise, weight: e.target.value ? parseFloat(e.target.value) : null})}
                    placeholder="80"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea 
                  value={selectedExercise.notes || ""}
                  onChange={(e) => setSelectedExercise({...selectedExercise, notes: e.target.value})}
                  placeholder="Notas adicionales..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditExerciseOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateExercise}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0 bg-black/95 border-none">
          {lightboxImage && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Title */}
              <div className="absolute top-4 left-4 text-white font-medium">
                {lightboxImage.title}
              </div>

              {/* Image */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />

              {/* Download button */}
              <div className="absolute bottom-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    const date = selectedProgress ? new Date(selectedProgress.date).toISOString().split('T')[0] : 'progreso'
                    downloadPhoto(lightboxImage.url, `${date}-${lightboxImage.title.toLowerCase()}.jpg`)
                  }}
                >
                  <Download className="w-4 h-4" />
                  Descargar Foto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          © 2024 GymPro - Registro de Progreso Fitness
        </div>
      </footer>
    </div>
  )
}

// Main Page
export default function Page() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 animate-pulse mx-auto text-emerald-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return <Dashboard />
}
