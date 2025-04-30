// src/app/reports/projects/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
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
  IProject, 
  ITask, 
  ISprint,
  ProjectStatus, 
  TaskStatus,
  UserRole 
} from '@/core/interfaces/models';
import { 
  ChevronLeft, 
  Download, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  BarChart,
  Layers,
  Search
} from "lucide-react";
import Link from 'next/link';
import { Input } from "@/components/ui/input";

// Importamos los servicios reales de API
import { 
  ProjectService, 
  TaskService, 
  SprintService,
  ProjectMemberService
} from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Tipo extendido para los proyectos con metadatos
type ProjectWithMetadata = IProject & {
  daysRemaining?: number;
  daysTotal?: number;
  taskCount?: number;
  completedTaskCount?: number;
  completionRate?: number;
  progressIndex?: number; // 0-100, indica si el progreso está acorde al tiempo transcurrido
  sprintCount?: number;
  memberCount?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  isDelayed?: boolean;
  delayDays?: number;
};

export default function ProjectReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithMetadata[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("endDate");
  const [projectMetrics, setProjectMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    planningProjects: 0,
    onHoldProjects: 0,
    avgCompletionRate: 0,
    projectsAtRisk: 0,
    delayedProjects: 0
  });

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER
  };

// Función para calcular días restantes del proyecto
const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Función para calcular días totales del proyecto
  const getDaysTotal = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 1; // Evitar división por cero
  };

  // Función para calcular el índice de progreso (progreso vs tiempo transcurrido)
  const calculateProgressIndex = useCallback(
    (startDate: string, endDate: string, completionRate: number) => {
      const today = new Date();
      const end = new Date(endDate);
  
      // If the project is completed or the end date has passed
      if (today > end) {
        return completionRate;
      }
  
      // Calculate the percentage of elapsed time
      const totalDays = getDaysTotal(startDate, endDate);
      const daysElapsed = getDaysTotal(startDate, today.toISOString());
      const timeElapsedPercent = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
  
      // Compare progress with elapsed time
      const progressIndex = Math.min(100, Math.round((completionRate / timeElapsedPercent) * 100));
  
      return progressIndex;
    },
    [] // Empty dependency array ensures the function is memoized
  );

  // Función para determinar el nivel de riesgo
  const determineRiskLevel = (
    progressIndex: number, 
    daysRemaining: number, 
    completionRate: number
  ): 'low' | 'medium' | 'high' => {
    if (daysRemaining < 0) {
      // Proyecto vencido
      return completionRate >= 95 ? 'low' : 'high';
    }
    
    if (progressIndex >= 90) return 'low';
    if (progressIndex >= 70) return 'medium';
    return 'high';
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
        // Obtener todos los proyectos
        const projectsData = await ProjectService.getProjects();
        
        // Procesar proyectos con metadatos adicionales
        const projectsWithMetadata: ProjectWithMetadata[] = await Promise.all(
          projectsData.map(async (project) => {
            // Obtener tareas del proyecto
            let tasks: ITask[] = [];
            try {
              tasks = await TaskService.getTasks({ project_id: project.id });
            } catch (error) {
              console.error(`Error fetching tasks for project ${project.id}:`, error);
            }
            
            // Obtener sprints del proyecto
            let sprints: ISprint[] = [];
            try {
              sprints = await SprintService.getSprints({ project_id: project.id });
            } catch (error) {
              console.error(`Error fetching sprints for project ${project.id}:`, error);
            }
            
            // Obtener miembros del proyecto
            let members = [];
            try {
              members = await ProjectMemberService.getProjectMembersByProject(project.id!);
            } catch (error) {
              console.error(`Error fetching members for project ${project.id}:`, error);
            }
            
            const taskCount = tasks.length;
            const completedTaskCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
            
            // Calcular tasa de completado
            let completionRate = 0;
            if (taskCount > 0) {
              completionRate = Math.round((completedTaskCount / taskCount) * 100);
            }
            
            // Calcular días restantes
            const daysRemaining = getDaysRemaining(project.end_date);
            
            // Calcular días totales
            const daysTotal = getDaysTotal(project.start_date, project.end_date);
            
            // Calcular índice de progreso
            const progressIndex = calculateProgressIndex(
              project.start_date, 
              project.end_date, 
              completionRate
            );
            
            // Determinar nivel de riesgo
            const riskLevel = determineRiskLevel(progressIndex, daysRemaining, completionRate);
            
            // Determinar si está retrasado
            const isDelayed = progressIndex < 70;
            
            // Calcular días de retraso
            let delayDays = 0;
            if (isDelayed) {
              // Estimamos los días de retraso basándonos en el progreso actual
              // y la velocidad esperada de completado
              const expectedDailyProgress = 100 / daysTotal;
              const currentProgress = completionRate;
              const expectedProgressByNow = (daysTotal - daysRemaining) * expectedDailyProgress;
              const progressDifference = expectedProgressByNow - currentProgress;
              
              // Convertir la diferencia de progreso a días
              delayDays = Math.ceil(progressDifference / expectedDailyProgress);
              delayDays = Math.max(0, delayDays);
            }
            
            return {
              ...project,
              daysRemaining,
              daysTotal,
              taskCount,
              completedTaskCount,
              completionRate,
              progressIndex,
              sprintCount: sprints.length,
              memberCount: members.length,
              riskLevel,
              isDelayed,
              delayDays
            };
          })
        );
        
        setProjects(projectsWithMetadata);
        setFilteredProjects(projectsWithMetadata);
        
        // Calcular métricas de proyectos
        if (projectsWithMetadata.length > 0) {
          const metrics = {
            totalProjects: projectsWithMetadata.length,
            activeProjects: projectsWithMetadata.filter(p => p.status === ProjectStatus.ACTIVE).length,
            completedProjects: projectsWithMetadata.filter(p => p.status === ProjectStatus.COMPLETED).length,
            planningProjects: projectsWithMetadata.filter(p => p.status === ProjectStatus.PLANNING).length,
            onHoldProjects: projectsWithMetadata.filter(p => p.status === ProjectStatus.ON_HOLD).length,
            avgCompletionRate: Math.round(projectsWithMetadata.reduce((sum, p) => sum + (p.completionRate || 0), 0) / projectsWithMetadata.length),
            projectsAtRisk: projectsWithMetadata.filter(p => p.riskLevel === 'high').length,
            delayedProjects: projectsWithMetadata.filter(p => p.isDelayed).length
          };
          
          setProjectMetrics(metrics);
        }
      } catch (error) {
        console.error('Error fetching project report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [calculateProgressIndex]);

  // Filtrar proyectos cuando cambian los filtros
  useEffect(() => {
    let filtered = [...projects];
    
    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => 
        project.status === parseInt(statusFilter)
      );
    }
    
    // Filtrar por nivel de riesgo
    if (riskFilter !== "all") {
      filtered = filtered.filter(project => 
        project.riskLevel === riskFilter
      );
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query))
      );
    }
    
    // Ordenar proyectos
    switch (sortBy) {
      case "endDate":
        filtered.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        break;
      case "completionRate":
        filtered.sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0));
        break;
      case "risk":
        const riskValue = { 'high': 3, 'medium': 2, 'low': 1 };
        filtered.sort((a, b) => 
          riskValue[b.riskLevel || 'low'] - riskValue[a.riskLevel || 'low']
        );
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    setFilteredProjects(filtered);
    
    // Actualizar métricas si hay filtros activos
    if (statusFilter !== "all" || riskFilter !== "all" || searchQuery.trim()) {
      if (filtered.length > 0) {
        const metrics = {
          totalProjects: filtered.length,
          activeProjects: filtered.filter(p => p.status === ProjectStatus.ACTIVE).length,
          completedProjects: filtered.filter(p => p.status === ProjectStatus.COMPLETED).length,
          planningProjects: filtered.filter(p => p.status === ProjectStatus.PLANNING).length,
          onHoldProjects: filtered.filter(p => p.status === ProjectStatus.ON_HOLD).length,
          avgCompletionRate: Math.round(filtered.reduce((sum, p) => sum + (p.completionRate || 0), 0) / filtered.length),
          projectsAtRisk: filtered.filter(p => p.riskLevel === 'high').length,
          delayedProjects: filtered.filter(p => p.isDelayed).length
        };
        
        setProjectMetrics(metrics);
      } else {
        setProjectMetrics({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          planningProjects: 0,
          onHoldProjects: 0,
          avgCompletionRate: 0,
          projectsAtRisk: 0,
          delayedProjects: 0
        });
      }
    }
  }, [projects, statusFilter, riskFilter, searchQuery, sortBy]);

  // Obtener badge de estado del proyecto
  const getProjectStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Planificación</Badge>;
      case ProjectStatus.ACTIVE:
        return <Badge variant="default" className="bg-green-500">Activo</Badge>;
      case ProjectStatus.COMPLETED:
        return <Badge variant="default" className="bg-blue-500">Completado</Badge>;
      case ProjectStatus.ON_HOLD:
        return <Badge variant="default" className="bg-amber-500">En pausa</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Obtener badge de nivel de riesgo
  const getRiskBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return <Badge variant="default" className="bg-green-500">Bajo</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-amber-500">Medio</Badge>;
      case 'high':
        return <Badge variant="destructive">Alto</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

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
            <h1 className="text-2xl font-bold">Informe de Proyectos</h1>
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
                  <p className="text-sm text-gray-500">Proyectos activos</p>
                  <h3 className="text-xl font-bold">{projectMetrics.activeProjects} de {projectMetrics.totalProjects}</h3>
                  <p className="text-xs text-gray-500">{projectMetrics.completedProjects} completados</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Completado promedio</p>
                  <h3 className="text-xl font-bold">{projectMetrics.avgCompletionRate}%</h3>
                  <p className="text-xs text-gray-500">por proyecto</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Proyectos en riesgo</p>
                  <h3 className="text-xl font-bold">{projectMetrics.projectsAtRisk}</h3>
                  <p className="text-xs text-gray-500">alto riesgo de retraso</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Proyectos retrasados</p>
                  <h3 className="text-xl font-bold">{projectMetrics.delayedProjects}</h3>
                  <p className="text-xs text-gray-500">progreso menor al esperado</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
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
              placeholder="Buscar proyectos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value={ProjectStatus.PLANNING.toString()}>Planificación</SelectItem>
              <SelectItem value={ProjectStatus.ACTIVE.toString()}>Activo</SelectItem>
              <SelectItem value={ProjectStatus.COMPLETED.toString()}>Completado</SelectItem>
              <SelectItem value={ProjectStatus.ON_HOLD.toString()}>En pausa</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Nivel de riesgo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              <SelectItem value="low">Bajo</SelectItem>
              <SelectItem value="medium">Medio</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="endDate">Fecha de fin</SelectItem>
              <SelectItem value="completionRate">Progreso</SelectItem>
              <SelectItem value="risk">Nivel de riesgo</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de proyectos */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Nombre</th>
                  <th className="py-2 px-4 text-left">Estado</th>
                  <th className="py-2 px-4 text-left">Período</th>
                  <th className="py-2 px-4 text-left">Tareas</th>
                  <th className="py-2 px-4 text-left">Progreso</th>
                  <th className="py-2 px-4 text-left">Equipo</th>
                  <th className="py-2 px-4 text-left">Riesgo</th>
                  <th className="py-2 px-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-gray-500 truncate max-w-xs">
                          {project.description?.substring(0, 50)}
                          {project.description && project.description.length > 50 ? '...' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4">{getProjectStatusBadge(project.status)}</td>
                    <td className="py-2 px-4">
                      {formatDate(project.start_date)} - {formatDate(project.end_date)}
                      {project.status !== ProjectStatus.COMPLETED && (
                        <div className="text-xs mt-1">
                          {project.daysRemaining && project.daysRemaining > 0 
                            ? <span className="text-blue-600">{project.daysRemaining} días restantes</span>
                            : <span className="text-red-600">Vencido ({Math.abs(project.daysRemaining || 0)} días)</span>
                          }
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col">
                        <span>{project.completedTaskCount || 0}/{project.taskCount || 0} completadas</span>
                        <span className="text-xs text-gray-500">{project.sprintCount} sprints</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 h-2 rounded-full mr-2">
                          <div 
                            className={`h-full rounded-full ${
                              (project.completionRate || 0) < 30 ? 'bg-red-500' : 
                              (project.completionRate || 0) < 70 ? 'bg-amber-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${project.completionRate || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{project.completionRate || 0}%</span>
                      </div>
                      {project.isDelayed && project.status !== ProjectStatus.COMPLETED && (
                        <div className="text-xs text-red-600 mt-1">
                          {project.delayDays} días de retraso estimado
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-500 mr-1" />
                        <span>{project.memberCount || 0} miembros</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col">
                        {getRiskBadge(project.riskLevel || 'low')}
                        <div className="text-xs mt-1">
                          {project.progressIndex && project.progressIndex < 70 ? (
                            <span className="text-red-600 flex items-center text-xs">
                              <XCircle className="h-3 w-3 mr-1" /> Progreso lento
                            </span>
                          ) : (
                            <span className="text-green-600 flex items-center text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" /> Progreso adecuado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/projects/${project.id}`)}
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
              {searchQuery || statusFilter !== "all" || riskFilter !== "all"
                ? "No hay proyectos que coincidan con los filtros"
                : "No hay proyectos disponibles"}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}