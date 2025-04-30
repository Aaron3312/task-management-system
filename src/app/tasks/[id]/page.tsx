// src/app/tasks/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ITask, ISubtask, IComment, TaskStatus, UserRole } from '@/core/interfaces/models';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Clock, 
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Edit,
  Trash,
  PlusCircle
} from "lucide-react";

// Importamos los servicios reales de API
import { TaskService, SubtaskService, CommentService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);
  
  const [task, setTask] = useState<ITask | null>(null);
  const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
    id: 12 // Este ID se usará para los comentarios
  };

  useEffect(() => {
    const fetchTaskDetails = async () => {
      setIsLoading(true);
      try {
        // Obtener la tarea
        const taskData = await TaskService.getTaskById(taskId);
        if (taskData) {
          setTask(taskData);
          
          // Obtener subtareas
          if (taskData.subtasks) {
            setSubtasks(taskData.subtasks);
          }
          
          // Obtener comentarios
          if (taskData.comments) {
            setComments(taskData.comments);
          }
        } else {
          console.error(`Task with ID ${taskId} not found`);
          router.push('/tasks');
        }
      } catch (error) {
        console.error(`Error fetching task ${taskId}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, router]);

  // Helper para obtener badge según el estado
  const getStatusBadge = (status: TaskStatus) => {
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

  // Helper para obtener badge según la prioridad
  const getPriorityBadge = (priority: number) => {
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

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Cambiar el estado de una tarea
  const handleStatusChange = async (status: TaskStatus) => {
    if (!task) return;
    
    try {
      const updatedTask = await TaskService.updateTask(task.id!, { status });
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (error) {
      console.error(`Error updating task status:`, error);
    }
  };

  // Cambiar el estado de una subtarea
  const handleSubtaskStatusChange = async (subtaskId: number, status: TaskStatus) => {
    try {
      const updatedSubtask = await SubtaskService.updateSubtask(subtaskId, { status });
      if (updatedSubtask) {
        // Actualizar la lista de subtareas
        setSubtasks(prev => 
          prev.map(subtask => 
            subtask.id === subtaskId ? updatedSubtask : subtask
          )
        );
      }
    } catch (error) {
      console.error(`Error updating subtask status:`, error);
    }
  };

  // Añadir un comentario
  const handleAddComment = async () => {
    if (!newComment.trim() || !task || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    try {
      const commentData = {
        content: newComment,
        task_id: task.id!,
        user_id: demoUser.id
      };
      
      const createdComment = await CommentService.createComment(commentData);
      if (createdComment) {
        // Añadir el nuevo comentario a la lista
        setComments(prev => [...prev, createdComment]);
        setNewComment(''); // Limpiar el input
      }
    } catch (error) {
      console.error(`Error adding comment:`, error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER ]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!task) {
    return (
      <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER ]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tarea no encontrada</h2>
          <p className="text-gray-600 mb-6">La tarea que estás buscando no existe o ha sido eliminada.</p>
          <Link href="/tasks" passHref>
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver a la lista de tareas
            </Button>
          </Link>
        </div>
      </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER ]}>
    <MainLayout username={demoUser.username} userRole={demoUser.userRole}>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/tasks" passHref>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" /> Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{task.title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/tasks/${task.id}/edit`} passHref>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" /> Editar
              </Button>
            </Link>
            <Button variant="destructive" size="sm">
              <Trash className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles de la tarea</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                  <p className="text-gray-800">{task.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Estado</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Prioridad</h3>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Fecha de vencimiento</h3>
                      <p className="text-gray-800">{formatDate(task.due_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Horas estimadas</h3>
                      <p className="text-gray-800">{task.estimated_hours} horas</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Cambiar estado</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={task.status === TaskStatus.TODO ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleStatusChange(TaskStatus.TODO)}
                    >
                      Por hacer
                    </Button>
                    <Button 
                      variant={task.status === TaskStatus.IN_PROGRESS ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                    >En progreso
                    </Button>
                    <Button 
                      variant={task.status === TaskStatus.COMPLETED ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleStatusChange(TaskStatus.COMPLETED)}
                    >
                      Completado
                    </Button>
                    <Button 
                      variant={task.status === TaskStatus.BLOCKED ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleStatusChange(TaskStatus.BLOCKED)}
                    >
                      Bloqueado
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subtareas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Subtareas</CardTitle>
                <Link href={`/tasks/${task.id}/subtasks/new`} passHref>
                  <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-1" /> Añadir subtarea
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {subtasks && subtasks.length > 0 ? (
                  <div className="space-y-3">
                    {subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <h4 className="font-medium">{subtask.title}</h4>
                          <p className="text-sm text-gray-600">{subtask.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(subtask.status)}
                          {subtask.status !== TaskStatus.COMPLETED ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSubtaskStatusChange(subtask.id!, TaskStatus.COMPLETED)}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSubtaskStatusChange(subtask.id!, TaskStatus.TODO)}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay subtareas para esta tarea
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comentarios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comentarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments && comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-4 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="ml-2">
                                <p className="font-medium">{comment.user?.username || 'Usuario'}</p>
                                <p className="text-xs text-gray-500">
                                  {comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Sin fecha'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-800">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No hay comentarios para esta tarea
                    </div>
                  )}

                  <div className="mt-4">
                    <Textarea
                      placeholder="Añadir un comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="mb-2"
                    />
                    <Button 
                      onClick={handleAddComment} 
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? 'Enviando...' : 'Añadir comentario'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Proyecto</h3>
                  <p className="text-gray-800">
                    {task.sprint_id ? (
                      <Link href={`/projects/${task.sprint_id}`} className="text-blue-500 hover:underline">
                        Proyecto #{task.sprint_id}
                      </Link>
                    ) : (
                      'Sin proyecto asignado'
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Sprint</h3>
                  <p className="text-gray-800">
                    {task.sprint_id ? (
                      <Link href={`/sprints/${task.sprint_id}`} className="text-blue-500 hover:underline">
                        Sprint #{task.sprint_id}
                      </Link>
                    ) : (
                      'Sin sprint asignado'
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de creación</h3>
                  <p className="text-gray-800">{formatDate(task.created_at)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Última actualización</h3>
                  <p className="text-gray-800">{formatDate(task.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Miembros asignados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Asignados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    D
                  </div>
                  <div>
                    <p className="font-medium">Diego Villanueva</p>
                    <p className="text-xs text-gray-500">Responsable principal</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Users className="h-4 w-4 mr-1" /> Asignar usuarios
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}

