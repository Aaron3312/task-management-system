// src/app/tasks/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITask, TaskStatus, UserRole } from '@/core/interfaces/models';
import TaskList from '@/components/tasks/TaskList';
import Link from 'next/link';
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Importamos los servicios mock para desarrollo
import { MockTaskService } from '@/services/mock';

export default function TasksPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'john.doe',
    userRole: UserRole.MANAGER
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const allTasks = await MockTaskService.getTasks();
        setTasks(allTasks);
        setFilteredTasks(allTasks);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Efecto para filtrar tareas cuando cambia el filtro o la búsqueda
  useEffect(() => {
    let filtered = [...tasks];
    
    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        task => task.status === parseInt(statusFilter)
      );
    }
    
    // Aplicar filtro de prioridad
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        task => task.priority === parseInt(priorityFilter)
      );
    }
    
    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task => task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredTasks(filtered);
  }, [statusFilter, priorityFilter, searchQuery, tasks]);

  // Cambiar el estado de una tarea
  const handleTaskStatusChange = async (taskId: number | undefined, status: TaskStatus) => {
    if (!taskId) return;
    
    await MockTaskService.updateTask(taskId, { status });
    
    // Actualizar la lista de tareas
    const allTasks = await MockTaskService.getTasks();
    setTasks(allTasks);
  };

  return (
    <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tareas</h1>
          <div className="flex space-x-2">
            <Link href="/tasks/new" passHref>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" /> Nueva tarea
              </Button>
            </Link>
          </div>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value={TaskStatus.TODO.toString()}>Por hacer</SelectItem>
              <SelectItem value={TaskStatus.IN_PROGRESS.toString()}>En progreso</SelectItem>
              <SelectItem value={TaskStatus.COMPLETED.toString()}>Completado</SelectItem>
              <SelectItem value={TaskStatus.BLOCKED.toString()}>Bloqueado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filtrar por prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="1">Baja</SelectItem>
              <SelectItem value="2">Media</SelectItem>
              <SelectItem value="3">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de tareas */}
        <TaskList 
          tasks={filteredTasks}
          onTaskClick={(id) => console.log(`Ver tarea ${id}`)}
          onStatusChange={handleTaskStatusChange}
          isLoading={isLoading}
          emptyMessage={
            searchQuery || statusFilter !== "all" || priorityFilter !== "all"
              ? "No hay tareas que coincidan con los filtros" 
              : "No hay tareas disponibles"
          }
        />
      </div>
    </MainLayout>
  );
}