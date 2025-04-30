// src/app/sprints/page.tsx
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
import { ISprint, IProject, SprintStatus, UserRole } from '@/core/interfaces/models';
import Link from 'next/link';
import { PlusCircle, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Importamos los servicios reales de API
import { SprintService, ProjectService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Tipo extendido para los sprints con metadatos
type SprintWithMetadata = ISprint & {
  taskCount: number;
  completedTaskCount: number;
  project?: IProject;
};

export default function SprintsPage() {
  const router = useRouter();
  const [sprints, setSprints] = useState<SprintWithMetadata[]>([]);
  const [filteredSprints, setFilteredSprints] = useState<SprintWithMetadata[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Obtener todos los proyectos para el filtro
        const projectsData = await ProjectService.getProjects();
        setProjects(projectsData);

        // Obtener todos los sprints
        const sprintsData = await SprintService.getSprints();
        
        // Para cada sprint, obtenemos información adicional
        const sprintsWithMetadata = await Promise.all(
          sprintsData.map(async (sprint) => {
            let taskCount = 0;
            let completedTaskCount = 0;
            let projectInfo = undefined;
            
            try {
              // Si el sprint tiene tareas directamente, las contamos
              if (sprint.tasks && sprint.tasks.length > 0) {
                taskCount = sprint.tasks.length;
                completedTaskCount = sprint.tasks.filter(task => task.status === 2).length;
              }
              
              // Intentar obtener el proyecto asociado
              if (sprint.project_id) {
                const project = await ProjectService.getProjectById(sprint.project_id);
                if (project) {
                  projectInfo = project;
                }
              }
            } catch (error) {
              console.error(`Error getting metadata for sprint ${sprint.id}:`, error);
            }
            
            return {
              ...sprint,
              taskCount,
              completedTaskCount,
              project: projectInfo
            };
          })
        );
        
        setSprints(sprintsWithMetadata);
        setFilteredSprints(sprintsWithMetadata);
      } catch (error) {
        console.error('Error fetching sprints:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Efecto para filtrar sprints cuando cambia el filtro o la búsqueda
  useEffect(() => {
    let filtered = [...sprints];
    
    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        sprint => sprint.status === parseInt(statusFilter)
      );
    }
    
    // Aplicar filtro de proyecto
    if (projectFilter !== "all") {
      filtered = filtered.filter(
        sprint => sprint.project_id === parseInt(projectFilter)
      );
    }
    
    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        sprint => 
          sprint.name.toLowerCase().includes(query) ||
          (sprint.description && sprint.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredSprints(filtered);
  }, [statusFilter, projectFilter, searchQuery, sprints]);

  // Función para obtener el badge de estado
  const getStatusBadge = (status: SprintStatus) => {
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

  // Función para obtener el progreso
  const getProgress = (taskCount: number, completedTaskCount: number) => {
    if (taskCount === 0) return 0;
    return Math.round((completedTaskCount / taskCount) * 100);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calcular días restantes
  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Terminado";
    if (diffDays === 0) return "Termina hoy";
    return `${diffDays} días restantes`;
  };

  // Calcular la clase para los días restantes
  const getRemainingDaysClass = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-red-600";
    if (diffDays <= 3) return "text-amber-600";
    return "text-gray-600";
  };

  return (
    <ProtectedRoute>
    <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sprints</h1>
          <div className="flex space-x-2">
            <Link href="/sprints/new" passHref>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" /> Nuevo sprint
              </Button>
            </Link>
          </div>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value={SprintStatus.PLANNING.toString()}>Planificación</SelectItem>
              <SelectItem value={SprintStatus.ACTIVE.toString()}>Activo</SelectItem>
              <SelectItem value={SprintStatus.COMPLETED.toString()}>Completado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filtrar por proyecto" />
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
        </div>

        {/* Lista de sprints */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <span className="mt-2 text-gray-500">Cargando sprints...</span>
            </div>
          </div>
        ) : filteredSprints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSprints.map((sprint) => (
              <Card 
                key={sprint.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/sprints/${sprint.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{sprint.name}</CardTitle>
                    {getStatusBadge(sprint.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {sprint.description || 'Sin descripción'}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    {sprint.project && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Proyecto:</span>
                        <span>{sprint.project.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span>
                        {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${getRemainingDaysClass(sprint.end_date)}`} />
                      <span className={getRemainingDaysClass(sprint.end_date)}>
                        {getRemainingDays(sprint.end_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span>{sprint.completedTaskCount}/{sprint.taskCount} tareas completadas</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${getProgress(sprint.taskCount, sprint.completedTaskCount)}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-600">
                      {getProgress(sprint.taskCount, sprint.completedTaskCount)}% completado
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all" || projectFilter !== "all"
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