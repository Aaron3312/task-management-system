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
import { PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';

// Importamos los servicios reales de API
import { TaskService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TasksPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const allTasks = await TaskService.getTasks();
        
        // Asegurarnos de que cada tarea tenga un valor para due_date
        const tasksWithDefaults = allTasks.map(task => {
          if (!task.due_date) {
            // Si no tiene fecha de vencimiento, asignar una fecha futura (1 semana)
            const oneWeekLater = new Date();
            oneWeekLater.setDate(oneWeekLater.getDate() + 7);
            return {
              ...task,
              due_date: oneWeekLater.toISOString()
            };
          }
          return task;
        });
        
        setTasks(tasksWithDefaults);
        setFilteredTasks(tasksWithDefaults);
      } catch (error) {
        console.error('Error fetching tasks:', error);
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
        task => 
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredTasks(filtered);
  }, [statusFilter, priorityFilter, searchQuery, tasks]);

  // Cambiar el estado de una tarea
  const handleTaskStatusChange = async (taskId: number | undefined, status: TaskStatus) => {
    if (!taskId) return;
    
    try {      
      const currentTask = await TaskService.getTaskById(taskId);
      
      if (!currentTask) {
        console.error(`Task with ID ${taskId} not found`);
        return;
      }
      
      const updatedTaskData = {
        title: currentTask.title,
        description: currentTask.description,
        created_at: currentTask.created_at,
        updated_at: new Date().toISOString(),
        due_date: currentTask.due_date,
        priority: currentTask.priority,
        status: status,
        estimated_hours: currentTask.estimated_hours
      };
      
      const updatedTask = await TaskService.updateTask(taskId, updatedTaskData);
      
      if (updatedTask) {
        // Actualizar la lista de tareas
        const allTasks = await TaskService.getTasks();
        
        // Actualizar el estado local
        setTasks(allTasks);
        
        // Aplicar los filtros nuevamente
        let filtered = [...allTasks];
        
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
            task => 
              task.title.toLowerCase().includes(query) ||
              (task.description && task.description.toLowerCase().includes(query))
          );
        }
        
        setFilteredTasks(filtered);
        
        console.log(`Tarea ${taskId} actualizada a estado ${status}`);
      }
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
    }
  };

  return (
    <ProtectedRoute>
    <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Tareas</h1>
          <Link href="/tasks/new" className="inline-flex items-center">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nueva tarea
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="0">Pendiente</SelectItem>
                <SelectItem value="1">En progreso</SelectItem>
                <SelectItem value="2">Completado</SelectItem>
                <SelectItem value="3">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="3">Alta</SelectItem>
                <SelectItem value="2">Media</SelectItem>
                <SelectItem value="1">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TaskList 
          tasks={filteredTasks}
          onTaskClick={(id) => {
            if (id) {
              router.push(`/tasks/${id}`);
            }
          }}
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
    </ProtectedRoute>
  );
}
