"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IProject, ProjectStatus, UserRole } from '@/core/interfaces/models';
import ProjectList from '@/components/projects/ProjectList';
import Link from 'next/link';
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ProjectService, TaskService, ProjectMemberService } from '@/services/api';

type ProjectWithMetadata = IProject & {
  taskCount: number;
  memberCount: number;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithMetadata[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const allProjects = await ProjectService.getProjects();
        const projectsWithData = await Promise.all(
          allProjects.map(async (project) => {
            let taskCount = 0;
            let memberCount = 0;

            try {
              if (project.sprints && project.sprints.length > 0) {
                taskCount = project.sprints.reduce((count, sprint) => {
                  return count + (sprint.tasks ? sprint.tasks.length : 0);
                }, 0);
              } else {
                const tasks = await TaskService.getTasks({ project_id: project.id });
                taskCount = tasks.length;
              }

              if (project.id) {
                const members = await ProjectMemberService.getProjectMembersByProject(project.id);
                memberCount = members.length;
              }
            } catch (error) {
              console.error(`Error fetching details for project ${project.id}:`, error);
            }

            return {
              ...project,
              taskCount,
              memberCount,
            };
          })
        );

        setProjects(projectsWithData);
        setFilteredProjects(projectsWithData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (project) => project.status === parseInt(statusFilter)
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          (project.description && project.description.toLowerCase().includes(query))
      );
    }

    setFilteredProjects(filtered);
  }, [statusFilter, searchQuery, projects]);

  const handleProjectClick = (id: number | undefined) => {
    if (id !== undefined) {
      router.push(`/projects/${id}`);
    }
  };

  const calculateProgressIndex = useCallback(() => {
    // Function logic here...
  }, []);

  useEffect(() => {
    calculateProgressIndex();
  }, [calculateProgressIndex]);

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.TESTER]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Proyectos</h1>
            <div className="flex space-x-2">
              <Link href="/projects/new" passHref>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" /> Nuevo proyecto
                </Button>
              </Link>
            </div>
          </div>

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
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value={ProjectStatus.PLANNING.toString()}>Planificación</SelectItem>
                <SelectItem value={ProjectStatus.ACTIVE.toString()}>Activo</SelectItem>
                <SelectItem value={ProjectStatus.COMPLETED.toString()}>Completado</SelectItem>
                <SelectItem value={ProjectStatus.ON_HOLD.toString()}>En pausa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ProjectList
            projects={filteredProjects}
            onProjectClick={handleProjectClick}
            isLoading={isLoading}
            emptyMessage={
              searchQuery || statusFilter !== "all"
                ? "No hay proyectos que coincidan con los filtros"
                : "No hay proyectos disponibles"
            }
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}