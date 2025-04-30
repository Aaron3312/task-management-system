// src/app/reports/tasks/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ITask, 
  IProject, 
  TaskStatus, 
  UserRole 
} from '@/core/interfaces/models';
import { 
  ChevronLeft, 
  Download, 
  Clock,
  AlertTriangle,
  Check,
  Search
} from "lucide-react";
import Link from 'next/link';
import { Input } from "@/components/ui/input";

// Importamos los servicios reales de API
import { 
  TaskService, 
  ProjectService 
} from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Tipo extendido para las tareas con metadatos
type TaskWithMetadata = ITask & {
  daysUntilDue?: number;
  isOverdue?: boolean;
  projectName?: string;
};

export default function TaskReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskWithMetadata[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithMetadata[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [statistics, setStatistics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    blockedTasks: 0,
    overdueTasks: 0,
    dueSoonTasks: 0,
    completionRate: 0
  });

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER
  };

  // Función auxiliar para obtener días hasta la fecha de vencimiento
  const getDaysUntilDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Función para formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para obtener etiqueta de estado de la tarea
  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return <Badge variant="outline" className="bg-gray-100">Por hacer</Badge>;
      case TaskStatus.IN_PROGRESS:
        return <Badge variant="default" className="bg-blue-500">En progreso</Badge>;
      case TaskStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-500">Completado</Badge>;
      case TaskStatus.BLOCKED:
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Función para obtener etiqueta de prioridad
  const getTaskPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge variant="outline" className="bg-gray-100">Baja</Badge>;
      case 2:
        return <Badge variant="default" className="bg-yellow-500">Media</Badge>;
      case 3:
        return <Badge variant="destructive">Alta</Badge>;
      default:
        return <Badge variant="outline">Desconocida</Badge>;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Obtener proyectos para el filtro
        const projectsData = await ProjectService.getProjects();
        setProjects(projectsData);
        
        // Obtener todas las tareas
        const tasksData = await TaskService.getTasks();
        
        // Procesar las tareas con metadatos
        const tasksWithMetadata: TaskWithMetadata[] = await Promise.all(
          tasksData.map(async (task) => {
            // Calcular días hasta vencimiento
            const daysUntilDue = task.due_date ? getDaysUntilDueDate(task.due_date) : null;
            
            // Determinar si está vencida
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== TaskStatus.COMPLETED;
            
            // Obtener nombre del proyecto
            let projectName = "Sin proyecto";
            if (task.project_id) {
              try {
                const project = projectsData.find(p => p.id === task.project_id);
                if (project) {
                  projectName = project.name;
                }
              } catch (error) {
                console.error(`Error fetching project for task ${task.id}:`, error);
              }
            }
            
            return {
              ...task,
              daysUntilDue,
              isOverdue,
              projectName
            };
          })
        );
        
        setTasks(tasksWithMetadata);
        setFilteredTasks(tasksWithMetadata);
        
// Calcular estadísticas
const stats = {
    totalTasks: tasksWithMetadata.length,
    completedTasks: tasksWithMetadata.filter(t => t.status === TaskStatus.COMPLETED).length,
    pendingTasks: tasksWithMetadata.filter(t => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS).length,
    blockedTasks: tasksWithMetadata.filter(t => t.status === TaskStatus.BLOCKED).length,
    overdueTasks: tasksWithMetadata.filter(t => t.isOverdue).length,
    dueSoonTasks: tasksWithMetadata.filter(t => 
      t.daysUntilDue !== null && 
      t.daysUntilDue !== undefined && 
      t.daysUntilDue >= 0 && 
      t.daysUntilDue <= 3 && 
      t.status !== TaskStatus.COMPLETED
    ).length,
    completionRate: 0
  };
  
  // Calcular tasa de completado
  if (stats.totalTasks > 0) {
    stats.completionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
  }
  
  setStatistics(stats);
} catch (error) {
  console.error('Error fetching task report data:', error);
} finally {
  setIsLoading(false);
}
};

fetchData();
}, []);

// Filtrar tareas cuando cambian los filtros
useEffect(() => {
let filtered = [...tasks];

// Filtrar por proyecto
if (selectedProject !== "all") {
filtered = filtered.filter(task => 
  task.project_id === parseInt(selectedProject)
);
}

// Filtrar por estado
if (statusFilter !== "all") {
filtered = filtered.filter(task => 
  task.status === parseInt(statusFilter)
);
}

// Filtrar por búsqueda
if (searchQuery.trim()) {
const query = searchQuery.toLowerCase();
filtered = filtered.filter(task => 
  task.title.toLowerCase().includes(query) ||
  (task.description && task.description.toLowerCase().includes(query)) ||
  (task.projectName && task.projectName.toLowerCase().includes(query))
);
}

// Ordenar tareas
switch (sortBy) {
case "dueDate":
  filtered.sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
  break;
case "priority":
  filtered.sort((a, b) => b.priority - a.priority);
  break;
case "status":
  filtered.sort((a, b) => a.status - b.status);
  break;
case "title":
  filtered.sort((a, b) => a.title.localeCompare(b.title));
  break;
}

setFilteredTasks(filtered);

// Actualizar estadísticas si hay filtros activos
if (selectedProject !== "all" || statusFilter !== "all" || searchQuery.trim()) {
const stats = {
  totalTasks: filtered.length,
  completedTasks: filtered.filter(t => t.status === TaskStatus.COMPLETED).length,
  pendingTasks: filtered.filter(t => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS).length,
  blockedTasks: filtered.filter(t => t.status === TaskStatus.BLOCKED).length,
  overdueTasks: filtered.filter(t => t.isOverdue).length,
  dueSoonTasks: filtered.filter(t => 
    t.daysUntilDue !== null && 
    t.daysUntilDue !== undefined && 
    t.daysUntilDue >= 0 && 
    t.daysUntilDue <= 3 && 
    t.status !== TaskStatus.COMPLETED
  ).length,
  completionRate: 0
};

if (stats.totalTasks > 0) {
  stats.completionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
}

setStatistics(stats);
}
}, [tasks, selectedProject, statusFilter, searchQuery, sortBy]);

return (
  <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER ]}>
<MainLayout username={demoUser.username} userRole={demoUser.userRole}>
<div className="space-y-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <Link href="/reports" passHref>
        <Button variant="outline" size="sm">
          <ChevronLeft className="h-4 w-4 mr-1" /> Volver
        </Button>
      </Link>
      <h1 className="text-2xl font-bold">Informe de Tareas</h1>
    </div>
    <Button variant="outline" size="sm">
      <Download className="h-4 w-4 mr-1" /> Exportar
    </Button>
  </div>

  {/* Métricas principales */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-gray-500 uppercase">Total</p>
        <h3 className="text-2xl font-bold">{statistics.totalTasks}</h3>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-gray-500 uppercase">Completadas</p>
        <h3 className="text-2xl font-bold text-green-600">{statistics.completedTasks}</h3>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-gray-500 uppercase">Pendientes</p>
        <h3 className="text-2xl font-bold text-blue-600">{statistics.pendingTasks}</h3>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-gray-500 uppercase">Bloqueadas</p>
        <h3 className="text-2xl font-bold text-red-600">{statistics.blockedTasks}</h3>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-gray-500 uppercase">Vencidas</p>
        <h3 className="text-2xl font-bold text-red-600">{statistics.overdueTasks}</h3>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-gray-500 uppercase">Completado</p>
        <h3 className="text-2xl font-bold text-purple-600">{statistics.completionRate}%</h3>
      </CardContent>
    </Card>
  </div>

  {/* Filtros */}
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Buscar tareas..."
        className="pl-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    
    <Select value={selectedProject} onValueChange={setSelectedProject}>
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue placeholder="Proyecto" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los proyectos</SelectItem>
        {projects.map(project => (
          <SelectItem key={project.id} value={project.id?.toString() || ''}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue placeholder="Estado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los estados</SelectItem>
        <SelectItem value={TaskStatus.TODO.toString()}>Por hacer</SelectItem>
        <SelectItem value={TaskStatus.IN_PROGRESS.toString()}>En progreso</SelectItem>
        <SelectItem value={TaskStatus.COMPLETED.toString()}>Completado</SelectItem>
        <SelectItem value={TaskStatus.BLOCKED.toString()}>Bloqueado</SelectItem>
      </SelectContent>
    </Select>
    
    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dueDate">Fecha de vencimiento</SelectItem>
        <SelectItem value="priority">Prioridad</SelectItem>
        <SelectItem value="status">Estado</SelectItem>
        <SelectItem value="title">Título</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Lista de tareas */}
  {isLoading ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ) : filteredTasks.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Título</th>
            <th className="py-2 px-4 text-left">Proyecto</th>
            <th className="py-2 px-4 text-left">Estado</th>
            <th className="py-2 px-4 text-left">Prioridad</th>
            <th className="py-2 px-4 text-left">Fecha de vencimiento</th>
            <th className="py-2 px-4 text-left">Tiempo restante</th>
            <th className="py-2 px-4 text-left">Horas estimadas</th>
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => (
            <tr key={task.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">
                <div className="flex flex-col">
                  <span className="font-medium">{task.title}</span>
                  <span className="text-xs text-gray-500 truncate max-w-xs">
                    {task.description?.substring(0, 50)}
                    {task.description && task.description.length > 50 ? '...' : ''}
                  </span>
                </div>
              </td>
              <td className="py-2 px-4">{task.projectName}</td>
              <td className="py-2 px-4">{getTaskStatusBadge(task.status)}</td>
              <td className="py-2 px-4">{getTaskPriorityBadge(task.priority)}</td>
              <td className="py-2 px-4">{formatDate(task.due_date)}</td>
              <td className="py-2 px-4">
                {task.status === TaskStatus.COMPLETED ? (
                  <span className="text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" /> Completada
                  </span>
                ) : task.isOverdue ? (
                  <span className="text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" /> Vencida ({Math.abs(task.daysUntilDue || 0)} días)
                  </span>
                ) : (
                  <span className={`
                    ${task.daysUntilDue !== undefined && task.daysUntilDue <= 3 ? 'text-amber-600' : 'text-gray-600'}
                    flex items-center
                  `}>
                    <Clock className="h-4 w-4 mr-1" /> {task.daysUntilDue} días
                  </span>
                )}
              </td>
              <td className="py-2 px-4">{task.estimated_hours}h</td>
              <td className="py-2 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/tasks/${task.id}`)}
                >
                  Ver
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="flex justify-center items-center h-40 border border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">
        {searchQuery || selectedProject !== "all" || statusFilter !== "all"
          ? "No hay tareas que coincidan con los filtros"
          : "No hay tareas disponibles"}
      </p>
    </div>
  )}
</div>
</MainLayout>
</ProtectedRoute>
);
}