// src/app/reports/sprints/page.tsx
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
  ISprint, 
  IProject, 
  ITask,
  SprintStatus, 
  TaskStatus,
  UserRole 
} from '@/core/interfaces/models';
import { 
  ChevronLeft, 
  Download, 
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
  BarChart,
  Clock,
  TrendingUp,
  Search
} from "lucide-react";
import Link from 'next/link';
import { Input } from "@/components/ui/input";

// Importamos los servicios reales de API
import { 
  SprintService, 
  ProjectService,
  TaskService
} from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Tipo extendido para los sprints con metadatos
type SprintWithMetadata = ISprint & {
  daysRemaining?: number;
  completionRate?: number;
  taskCount?: number;
  completedTaskCount?: number;
  velocity?: number;
  projectName?: string;
  avgTasksPerDay?: number;
  predictedCompletion?: number; // porcentaje
};

export default function SprintReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sprints, setSprints] = useState<SprintWithMetadata[]>([]);
  const [filteredSprints, setFilteredSprints] = useState<SprintWithMetadata[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("startDate");
  const [sprintMetrics, setSprintMetrics] = useState({
    activeSprints: 0,
    completedSprints: 0,
    planningSprints: 0,
    avgVelocity: 0,
    avgCompletionRate: 0,
    avgTasksPerSprint: 0,
    sprintsAtRisk: 0
  });

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER
  };

  // Función auxiliar para obtener días restantes
  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Función para calcular velocidad del sprint (tareas completadas por día)
  const calculateVelocity = (startDate: string, endDateOrNow: string, completedTasks: number) => {
    const start = new Date(startDate);
    const end = new Date(endDateOrNow);
    
    // Calcular días transcurridos
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Evitar división por cero
    if (diffDays <= 0) return 0;
    
    return parseFloat((completedTasks / diffDays).toFixed(2));
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Obtener proyectos para el filtro
        const projectsData = await ProjectService.getProjects();
        setProjects(projectsData);
        
        // Obtener todos los sprints
        const sprintsData = await SprintService.getSprints();
        
        // Procesar sprints con metadatos adicionales
        const sprintsWithMetadata: SprintWithMetadata[] = await Promise.all(
          sprintsData.map(async (sprint) => {
            // Obtener tareas del sprint
            let tasks: ITask[] = [];
            if (sprint.tasks && sprint.tasks.length > 0) {
              tasks = sprint.tasks;
            } else {
              // Intentar obtener tareas por sprint_id
              try {
                tasks = await TaskService.getTasks({ sprint_id: sprint.id });
              } catch (error) {
                console.error(`Error fetching tasks for sprint ${sprint.id}:`, error);
              }
            }
            
            const taskCount = tasks.length;
            const completedTaskCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
            
            // Calcular días restantes
            let daysRemaining = 0;
            
            if (sprint.status !== SprintStatus.COMPLETED) {
              daysRemaining = getDaysRemaining(sprint.end_date);
            }
            
            // Calcular tasa de completado
            let completionRate = 0;
            if (taskCount > 0) {
              completionRate = Math.round((completedTaskCount / taskCount) * 100);
            }
            
            // Calcular velocidad (tareas completadas por día)
            const endDateOrNow = sprint.status === SprintStatus.COMPLETED 
              ? sprint.end_date 
              : new Date().toISOString();
            
            const velocity = calculateVelocity(sprint.start_date, endDateOrNow, completedTaskCount);
            
            // Calcular promedio de tareas por día
            const totalDays = getDaysRemaining(sprint.end_date) * -1 + getDaysRemaining(sprint.start_date);
            const avgTasksPerDay = totalDays > 0 ? parseFloat((taskCount / totalDays).toFixed(2)) : 0;
            
            // Predecir porcentaje de completado al final del sprint
            let predictedCompletion = completionRate;
            if (sprint.status !== SprintStatus.COMPLETED && daysRemaining > 0 && velocity > 0) {
              const potentialAdditionalCompleted = velocity * daysRemaining;
              const predictedCompleted = completedTaskCount + potentialAdditionalCompleted;
              predictedCompletion = Math.min(100, Math.round((predictedCompleted / taskCount) * 100));
            }
            
            // Obtener nombre del proyecto
            let projectName = "Sin proyecto";
            if (sprint.project_id) {
              try {
                const project = projectsData.find(p => p.id === sprint.project_id);
                if (project) {
                  projectName = project.name;
                }
              } catch (error) {
                console.error(`Error getting project name for sprint ${sprint.id}:`, error);
              }
            }
            
            return {
              ...sprint,
              daysRemaining,
              completionRate,
              taskCount,
              completedTaskCount,
              velocity,
              projectName,
              avgTasksPerDay,
              predictedCompletion
            };
          })
        );
        
        setSprints(sprintsWithMetadata);
        setFilteredSprints(sprintsWithMetadata);
        
        // Calcular métricas de sprints
        if (sprintsWithMetadata.length > 0) {
          const metrics = {
            activeSprints: sprintsWithMetadata.filter(s => s.status === SprintStatus.ACTIVE).length,
            completedSprints: sprintsWithMetadata.filter(s => s.status === SprintStatus.COMPLETED).length,
            planningSprints: sprintsWithMetadata.filter(s => s.status === SprintStatus.PLANNING).length,
            avgVelocity: parseFloat((sprintsWithMetadata.reduce((sum, s) => sum + (s.velocity || 0), 0) / sprintsWithMetadata.length).toFixed(2)),
            avgCompletionRate: Math.round(sprintsWithMetadata.reduce((sum, s) => sum + (s.completionRate || 0), 0) / sprintsWithMetadata.length),
            avgTasksPerSprint: Math.round(sprintsWithMetadata.reduce((sum, s) => sum + (s.taskCount || 0), 0) / sprintsWithMetadata.length),
            sprintsAtRisk: sprintsWithMetadata.filter(s => 
              s.status === SprintStatus.ACTIVE && 
              s.daysRemaining! > 0 && 
              s.predictedCompletion! < 85
            ).length
          };
          
          setSprintMetrics(metrics);
        }
      } catch (error) {
        console.error('Error fetching sprint report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar sprints cuando cambian los filtros
  useEffect(() => {
    let filtered = [...sprints];
    
    // Filtrar por proyecto
    if (selectedProject !== "all") {
      filtered = filtered.filter(sprint => 
        sprint.project_id === parseInt(selectedProject)
      );
    }
    
    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(sprint => 
        sprint.status === parseInt(statusFilter)
      );
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sprint => 
        sprint.name.toLowerCase().includes(query) ||
        (sprint.description && sprint.description.toLowerCase().includes(query)) ||
        (sprint.projectName && sprint.projectName.toLowerCase().includes(query))
      );
    }
    
    // Ordenar sprints
    switch (sortBy) {
      case "startDate":
        filtered.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        break;
      case "endDate":
        filtered.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        break;
      case "completionRate":
        filtered.sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0));
        break;
      case "velocity":
        filtered.sort((a, b) => (b.velocity || 0) - (a.velocity || 0));
        break;
    }
    
    setFilteredSprints(filtered);
    
    // Actualizar métricas si hay filtros activos
    if (selectedProject !== "all" || statusFilter !== "all" || searchQuery.trim()) {
      if (filtered.length > 0) {
        const metrics = {
          activeSprints: filtered.filter(s => s.status === SprintStatus.ACTIVE).length,
          completedSprints: filtered.filter(s => s.status === SprintStatus.COMPLETED).length,
          planningSprints: filtered.filter(s => s.status === SprintStatus.PLANNING).length,
          avgVelocity: parseFloat((filtered.reduce((sum, s) => sum + (s.velocity || 0), 0) / filtered.length).toFixed(2)) || 0,
          avgCompletionRate: Math.round(filtered.reduce((sum, s) => sum + (s.completionRate || 0), 0) / filtered.length) || 0,
          avgTasksPerSprint: Math.round(filtered.reduce((sum, s) => sum + (s.taskCount || 0), 0) / filtered.length) || 0,
          sprintsAtRisk: filtered.filter(s => 
            s.status === SprintStatus.ACTIVE && 
            s.daysRemaining! > 0 && 
            s.predictedCompletion! < 85
          ).length
        };
        
        setSprintMetrics(metrics);
      } else {
        setSprintMetrics({
          activeSprints: 0,
          completedSprints: 0,
          planningSprints: 0,
          avgVelocity: 0,
          avgCompletionRate: 0,
          avgTasksPerSprint: 0,
          sprintsAtRisk: 0
        });
      }
    }
  }, [sprints, selectedProject, statusFilter, searchQuery, sortBy]);

  // Obtener etiqueta de estado del sprint
  const getSprintStatusBadge = (status: SprintStatus) => {
    switch (status) {
      case SprintStatus.PLANNING:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Planificación</Badge>;
      case SprintStatus.ACTIVE:
        return <Badge variant="default" className="bg-green-500">Activo</Badge>;
      case SprintStatus.COMPLETED:
        return <Badge variant="default" className="bg-blue-500">Completado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.TESTER, UserRole.ADMIN]}>
    <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/reports" passHref>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" /> Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Informe de Sprints</h1>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> Exportar
          </Button>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Velocidad promedio</p>
                  <h3 className="text-xl font-bold">{sprintMetrics.avgVelocity}</h3>
                  <p className="text-xs text-gray-500">tareas/día</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Completado promedio</p>
                  <h3 className="text-xl font-bold">{sprintMetrics.avgCompletionRate}%</h3>
                  <p className="text-xs text-gray-500">de tareas por sprint</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Tareas promedio</p>
                  <h3 className="text-xl font-bold">{sprintMetrics.avgTasksPerSprint}</h3>
                  <p className="text-xs text-gray-500">por sprint</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Sprints en riesgo</p>
                  <h3 className="text-xl font-bold">{sprintMetrics.sprintsAtRisk}</h3>
                  <p className="text-xs text-gray-500">de {sprintMetrics.activeSprints} activos</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar sprints..."
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
              <SelectItem value={SprintStatus.PLANNING.toString()}>Planificación</SelectItem>
              <SelectItem value={SprintStatus.ACTIVE.toString()}>Activo</SelectItem>
              <SelectItem value={SprintStatus.COMPLETED.toString()}>Completado</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startDate">Fecha de inicio</SelectItem>
              <SelectItem value="endDate">Fecha de fin</SelectItem>
              <SelectItem value="completionRate">Tasa de completado</SelectItem>
              <SelectItem value="velocity">Velocidad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de sprints */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredSprints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Nombre</th>
                  <th className="py-2 px-4 text-left">Proyecto</th>
                  <th className="py-2 px-4 text-left">Estado</th>
                  <th className="py-2 px-4 text-left">Período</th>
                  <th className="py-2 px-4 text-left">Progreso</th>
                  <th className="py-2 px-4 text-left">Velocidad</th>
                  <th className="py-2 px-4 text-left">Predicción</th>
                  <th className="py-2 px-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSprints.map((sprint) => (
                  <tr key={sprint.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{sprint.name}</span>
                        <span className="text-xs text-gray-500 truncate max-w-xs">
                          {sprint.description?.substring(0, 50)}
                          {sprint.description && sprint.description.length > 50 ? '...' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4">{sprint.projectName}</td>
                    <td className="py-2 px-4">{getSprintStatusBadge(sprint.status)}</td>
                    <td className="py-2 px-4">
                      {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                      {sprint.status === SprintStatus.ACTIVE && (
                        <div className="text-xs mt-1">
                          {sprint.daysRemaining && sprint.daysRemaining > 0 
                            ? <span className="text-blue-600">{sprint.daysRemaining} días restantes</span>
                            : <span className="text-red-600">Vencido ({Math.abs(sprint.daysRemaining || 0)} días)</span>
                          }
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 h-2 rounded-full mr-2">
                          <div 
                            className={`h-full rounded-full ${
                              (sprint.completionRate || 0) < 50 ? 'bg-red-500' : 
                              (sprint.completionRate || 0) < 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${sprint.completionRate || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{sprint.completionRate || 0}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {sprint.completedTaskCount || 0}/{sprint.taskCount || 0} tareas
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <span className="font-medium">{sprint.velocity || 0}</span>
                        <span className="text-xs text-gray-500 ml-1">tareas/día</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {sprint.avgTasksPerDay || 0} tareas planificadas/día
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {sprint.status === SprintStatus.COMPLETED ? (
                        <span className="text-green-600 font-medium">Completado</span>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 h-2 rounded-full mr-2">
                              <div 
                                className={`h-full rounded-full ${
                                  (sprint.predictedCompletion || 0) < 70 ? 'bg-red-500' : 
                                  (sprint.predictedCompletion || 0) < 90 ? 'bg-yellow-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${sprint.predictedCompletion || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{sprint.predictedCompletion || 0}%</span>
                          </div>
                          <div className="text-xs mt-1">
                            {(sprint.predictedCompletion || 0) < 85 ? (
                              <span className="text-red-600 flex items-center">
                                <ArrowDownRight className="h-3 w-3 mr-1" /> En riesgo
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" /> En buen camino
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/sprints/${sprint.id}`)}
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
                ? "No hay sprints que coincidan con los filtros"
                : "No hay sprints disponibles"}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}