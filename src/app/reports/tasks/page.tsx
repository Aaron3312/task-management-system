// src/app/reports/tasks/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ITask, IProject, TaskStatus, UserRole } from '@/core/interfaces/models';
import {
  ChevronLeft,
  Download,
  Clock,
  AlertTriangle,
  Check,
  Search,
  Timer,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

// Importamos los servicios reales de API
import { TaskService, ProjectService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PDFExportService } from '@/utils/pdfExport';

// Tipo extendido para las tareas con metadatos
type TaskWithMetadata = ITask & {
  daysUntilDue?: number;
  isOverdue?: boolean;
  projectName?: string;
  efficiency?: number;
  timeVariance?: number;
};

interface TimeKPIs {
  averageEfficiency: number;
  onTimeDelivery: number;
  totalHoursEstimated: number;
  totalHoursReal: number;
  productivityIndex: number;
  tasksWithTimeData: number;
  timeOverruns: number;
  averageTimeVariance: number;
}

export default function TaskReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskWithMetadata[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithMetadata[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [statistics, setStatistics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    blockedTasks: 0,
    overdueTasks: 0,
    dueSoonTasks: 0,
    completionRate: 0,
  });
  const [timeKPIs, setTimeKPIs] = useState<TimeKPIs>({
    averageEfficiency: 0,
    onTimeDelivery: 0,
    totalHoursEstimated: 0,
    totalHoursReal: 0,
    productivityIndex: 0,
    tasksWithTimeData: 0,
    timeOverruns: 0,
    averageTimeVariance: 0,
  });

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
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

  // Función para calcular KPIs de tiempo
  const calculateTimeKPIs = (tasks: TaskWithMetadata[]): TimeKPIs => {
    const tasksWithTimeData = tasks.filter(
      (task) => task.real_hours && task.estimated_hours && task.status === TaskStatus.COMPLETED
    );

    if (tasksWithTimeData.length === 0) {
      return {
        averageEfficiency: 0,
        onTimeDelivery: 0,
        totalHoursEstimated: 0,
        totalHoursReal: 0,
        productivityIndex: 0,
        tasksWithTimeData: 0,
        timeOverruns: 0,
        averageTimeVariance: 0,
      };
    }

    const totalEstimated = tasksWithTimeData.reduce((acc, task) => acc + task.estimated_hours, 0);
    const totalReal = tasksWithTimeData.reduce((acc, task) => acc + (task.real_hours || 0), 0);
    
    const efficiencies = tasksWithTimeData.map((task) => 
      task.estimated_hours / (task.real_hours || 1)
    );
    const averageEfficiency = efficiencies.reduce((acc, eff) => acc + eff, 0) / efficiencies.length;

    const onTimeDeliveries = tasksWithTimeData.filter((task) => (task.real_hours || 0) <= task.estimated_hours);
    const onTimeDeliveryRate = (onTimeDeliveries.length / tasksWithTimeData.length) * 100;

    const timeOverruns = tasksWithTimeData.filter((task) => (task.real_hours || 0) > task.estimated_hours).length;

    const timeVariances = tasksWithTimeData.map((task) => 
      ((task.real_hours || 0) - task.estimated_hours) / task.estimated_hours * 100
    );
    const averageTimeVariance = timeVariances.reduce((acc, variance) => acc + variance, 0) / timeVariances.length;

    const productivityIndex = totalEstimated / totalReal;

    return {
      averageEfficiency: averageEfficiency * 100,
      onTimeDelivery: onTimeDeliveryRate,
      totalHoursEstimated: totalEstimated,
      totalHoursReal: totalReal,
      productivityIndex: productivityIndex * 100,
      tasksWithTimeData: tasksWithTimeData.length,
      timeOverruns,
      averageTimeVariance,
    };
  };

  // Función para formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para exportar PDF
  const handleExportPDF = () => {
    try {
      // Preparar datos para la exportación
      const tasksForExport = filteredTasks.map(task => ({
        id: task.id || 0,
        title: task.title,
        description: task.description,
        projectName: task.projectName || 'Sin proyecto',
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        estimatedHours: task.estimated_hours,
        realHours: task.real_hours || undefined,
        efficiency: task.efficiency,
        daysUntilDue: task.daysUntilDue,
        isOverdue: task.isOverdue || false
      }));

      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `informe-tareas-${timestamp}.pdf`;

      // Exportar PDF
      PDFExportService.exportTasksReport(
        tasksForExport,
        statistics,
        timeKPIs,
        fileName
      );
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      // Aquí podrías agregar un toast de error si lo deseas
    }
  };

  // Función para obtener etiqueta de estado de la tarea
  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return (
          <Badge variant="outline" className="bg-muted">
            Por hacer
          </Badge>
        );
      case TaskStatus.IN_PROGRESS:
        return (
          <Badge variant="default" className="bg-blue-500">
            En progreso
          </Badge>
        );
      case TaskStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-green-500">
            Completado
          </Badge>
        );
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
        return (
          <Badge variant="outline" className="bg-muted">
            Baja
          </Badge>
        );
      case 2:
        return (
          <Badge variant="default" className="bg-yellow-500">
            Media
          </Badge>
        );
      case 3:
        return <Badge variant="destructive">Alta</Badge>;
      default:
        return <Badge variant="outline">Desconocida</Badge>;
    }
  };

  // Función para obtener badge de eficiencia
  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 100) {
      return <Badge className="bg-green-500">Eficiente ({efficiency.toFixed(0)}%)</Badge>;
    } else if (efficiency >= 67) {
      return <Badge className="bg-yellow-500">Aceptable ({efficiency.toFixed(0)}%)</Badge>;
    } else {
      return <Badge variant="destructive">Ineficiente ({efficiency.toFixed(0)}%)</Badge>;
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
        console.log('Tareas cargadas:', tasksData.length, 'tareas');

        // Crear un mapa de sprint_id -> project_id para evitar múltiples llamadas API
        const sprintToProjectMap = new Map<number, number>();
        
        // Obtener project_id para cada sprint único
        const uniqueSprintIds = [...new Set(tasksData.map(task => task.sprint_id).filter(Boolean))];
        console.log('Sprints únicos:', uniqueSprintIds);
        
        for (const sprintId of uniqueSprintIds) {
          try {
            // Buscar el sprint en los proyectos cargados
            let foundProjectId = null;
            for (const project of projectsData) {
              if (project.sprints) {
                const sprint = project.sprints.find(s => s.id === sprintId);
                if (sprint) {
                  foundProjectId = project.id;
                  break;
                }
              }
            }
            if (foundProjectId) {
              sprintToProjectMap.set(sprintId, foundProjectId);
            }
          } catch (error) {
            console.error(`Error finding project for sprint ${sprintId}:`, error);
          }
        }
        
        console.log('Mapa sprint -> proyecto:', sprintToProjectMap);

        // Procesar las tareas con metadatos
        const tasksWithMetadata: TaskWithMetadata[] = await Promise.all(
          tasksData.map(async (task) => {
            // Calcular días hasta vencimiento
            const daysUntilDue = task.due_date ? getDaysUntilDueDate(task.due_date) : null;

            // Determinar si está vencida
            const isOverdue =
              daysUntilDue !== null && daysUntilDue < 0 && task.status !== TaskStatus.COMPLETED;

            // Calcular eficiencia si tiene datos de tiempo
            let efficiency = 0;
            let timeVariance = 0;
            if (task.real_hours && task.estimated_hours && task.real_hours > 0) {
              efficiency = (task.estimated_hours / task.real_hours) * 100;
              timeVariance = ((task.real_hours - task.estimated_hours) / task.estimated_hours) * 100;
            }

            // Obtener project_id y nombre del proyecto a través del sprint
            let projectId = null;
            let projectName = 'Sin proyecto';
            
            if (task.sprint_id && sprintToProjectMap.has(task.sprint_id)) {
              projectId = sprintToProjectMap.get(task.sprint_id);
              const project = projectsData.find((p) => p.id === projectId);
              if (project) {
                projectName = project.name;
              }
            }

            return {
              ...task,
              project_id: projectId, // Agregar el project_id derivado del sprint
              daysUntilDue,
              isOverdue,
              projectName,
              efficiency,
              timeVariance,
            };
          })
        );

        setTasks(tasksWithMetadata);
        setFilteredTasks(tasksWithMetadata);
        

        // Calcular estadísticas básicas
        const stats = {
          totalTasks: tasksWithMetadata.length,
          completedTasks: tasksWithMetadata.filter((t) => t.status === TaskStatus.COMPLETED).length,
          pendingTasks: tasksWithMetadata.filter(
            (t) => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS
          ).length,
          blockedTasks: tasksWithMetadata.filter((t) => t.status === TaskStatus.BLOCKED).length,
          overdueTasks: tasksWithMetadata.filter((t) => t.isOverdue).length,
          dueSoonTasks: tasksWithMetadata.filter(
            (t) =>
              t.daysUntilDue !== null &&
              t.daysUntilDue !== undefined &&
              t.daysUntilDue >= 0 &&
              t.daysUntilDue <= 3 &&
              t.status !== TaskStatus.COMPLETED
          ).length,
          completionRate: 0,
        };

        // Calcular tasa de completado
        if (stats.totalTasks > 0) {
          stats.completionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
        }

        setStatistics(stats);

        // Calcular KPIs de tiempo
        const kpis = calculateTimeKPIs(tasksWithMetadata);
        setTimeKPIs(kpis);
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
    if (selectedProject !== 'all' && selectedProject !== '' && selectedProject !== '0') {
      const projectId = parseInt(selectedProject);
      if (!isNaN(projectId)) {
        filtered = filtered.filter((task) => task.project_id === projectId);
      }
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === parseInt(statusFilter));
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          (task.projectName && task.projectName.toLowerCase().includes(query))
      );
    }

    // Ordenar tareas
    switch (sortBy) {
      case 'dueDate':
        filtered.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
        break;
      case 'priority':
        filtered.sort((a, b) => b.priority - a.priority);
        break;
      case 'status':
        filtered.sort((a, b) => a.status - b.status);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'efficiency':
        filtered.sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0));
        break;
    }

    setFilteredTasks(filtered);

    // Actualizar estadísticas si hay filtros activos
    if (selectedProject !== 'all' || statusFilter !== 'all' || searchQuery.trim()) {
      const stats = {
        totalTasks: filtered.length,
        completedTasks: filtered.filter((t) => t.status === TaskStatus.COMPLETED).length,
        pendingTasks: filtered.filter(
          (t) => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS
        ).length,
        blockedTasks: filtered.filter((t) => t.status === TaskStatus.BLOCKED).length,
        overdueTasks: filtered.filter((t) => t.isOverdue).length,
        dueSoonTasks: filtered.filter(
          (t) =>
            t.daysUntilDue !== null &&
            t.daysUntilDue !== undefined &&
            t.daysUntilDue >= 0 &&
            t.daysUntilDue <= 3 &&
            t.status !== TaskStatus.COMPLETED
        ).length,
        completionRate: 0,
      };

      if (stats.totalTasks > 0) {
        stats.completionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
      }

      setStatistics(stats);
      
      // Recalcular KPIs de tiempo para tareas filtradas
      const kpis = calculateTimeKPIs(filtered);
      setTimeKPIs(kpis);
    }
  }, [tasks, selectedProject, statusFilter, searchQuery, sortBy]);

  return (
    <ProtectedRoute
      requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER]}
    >
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/reports" passHref>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Informe de Tareas</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1" /> Exportar PDF
            </Button>
          </div>

          {/* Métricas principales */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase">Total</p>
                <h3 className="text-2xl font-bold text-foreground">{statistics.totalTasks}</h3>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase">Completadas</p>
                <h3 className="text-2xl font-bold text-green-600">{statistics.completedTasks}</h3>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase">Pendientes</p>
                <h3 className="text-2xl font-bold text-blue-600">{statistics.pendingTasks}</h3>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase">Bloqueadas</p>
                <h3 className="text-2xl font-bold text-red-600">{statistics.blockedTasks}</h3>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase">Vencidas</p>
                <h3 className="text-2xl font-bold text-red-600">{statistics.overdueTasks}</h3>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase">Completado</p>
                <h3 className="text-2xl font-bold text-purple-600">{statistics.completionRate}%</h3>
              </CardContent>
            </Card>
          </div>

          {/* KPIs de Tiempo */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">KPIs de Tiempo y Productividad</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Eficiencia Promedio</p>
                      <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {timeKPIs.averageEfficiency.toFixed(0)}%
                      </h3>
                    </div>
                    <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                    Estimado vs Real
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Entrega a Tiempo</p>
                      <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {timeKPIs.onTimeDelivery.toFixed(0)}%
                      </h3>
                    </div>
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                    Dentro del tiempo estimado
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Índice de Productividad</p>
                      <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {timeKPIs.productivityIndex.toFixed(0)}%
                      </h3>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">
                    Eficiencia general
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Horas Totales</p>
                      <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {timeKPIs.totalHoursReal}h
                      </h3>
                    </div>
                    <Timer className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                    Est: {timeKPIs.totalHoursEstimated}h
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id?.toString() || '0'}>
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
                <SelectItem value="efficiency">Eficiencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de tareas */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="py-2 px-4 text-left text-foreground">Título</th>
                    <th className="py-2 px-4 text-left text-foreground">Proyecto</th>
                    <th className="py-2 px-4 text-left text-foreground">Estado</th>
                    <th className="py-2 px-4 text-left text-foreground">Prioridad</th>
                    <th className="py-2 px-4 text-left text-foreground">Fecha de vencimiento</th>
                    <th className="py-2 px-4 text-left text-foreground">Tiempo restante</th>
                    <th className="py-2 px-4 text-left text-foreground">Horas Est.</th>
                    <th className="py-2 px-4 text-left text-foreground">Horas Real</th>
                    <th className="py-2 px-4 text-left text-foreground">Eficiencia</th>
                    <th className="py-2 px-4 text-left text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{task.title}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-xs">
                            {task.description?.substring(0, 50)}
                            {task.description && task.description.length > 50 ? '...' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-foreground">{task.projectName}</td>
                      <td className="py-2 px-4">{getTaskStatusBadge(task.status)}</td>
                      <td className="py-2 px-4">{getTaskPriorityBadge(task.priority)}</td>
                      <td className="py-2 px-4 text-foreground">{formatDate(task.due_date)}</td>
                      <td className="py-2 px-4">
                        {task.status === TaskStatus.COMPLETED ? (
                          <span className="text-green-600 flex items-center">
                            <Check className="h-4 w-4 mr-1" /> Completada
                          </span>
                        ) : task.isOverdue ? (
                          <span className="text-red-600 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" /> Vencida (
                            {Math.abs(task.daysUntilDue || 0)} días)
                          </span>
                        ) : (
                          <span
                            className={`
                    ${task.daysUntilDue !== undefined && task.daysUntilDue <= 3 ? 'text-amber-600' : 'text-muted-foreground'}
                    flex items-center
                  `}
                          >
                            <Clock className="h-4 w-4 mr-1" /> {task.daysUntilDue} días
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-foreground">{task.estimated_hours}h</td>
                      <td className="py-2 px-4 text-foreground">
                        {task.real_hours ? `${task.real_hours}h` : '-'}
                      </td>
                      <td className="py-2 px-4">
                        {task.efficiency && task.real_hours ? 
                          getEfficiencyBadge(task.efficiency) : 
                          <span className="text-muted-foreground">-</span>
                        }
                      </td>
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
<div className="flex justify-center items-center h-40 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">
                {searchQuery || selectedProject !== 'all' || statusFilter !== 'all'
                  ? 'No hay tareas que coincidan con los filtros'
                  : 'No hay tareas disponibles'}
              </p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}