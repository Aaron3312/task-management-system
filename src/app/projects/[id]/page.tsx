'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import SprintCard from '@/components/sprints/SprintCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IProject,
  IProjectMember,
  ProjectStatus,
  UserRole,
  SprintStatus,
} from '@/core/interfaces/models';
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  PenSquare,
  Trash2,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ProjectService, ProjectMemberService, UserService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProjectForm from '@/components/projects/ProjectForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const ProjectDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<IProject | null>(null);
  const [members, setMembers] = useState<IProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Estados para añadir miembros
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('Member');
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  // Estado para eliminar miembro
  const [isDeletingMember, setIsDeletingMember] = useState<number | null>(null);

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  // Cargar datos del proyecto
  const fetchProjectData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);

    try {
      console.log(`Cargando datos del proyecto ${projectId}...`);
      
      // Cargar proyecto con el método actualizado
      const projectData = await ProjectService.getProjectById(projectId);
      
      if (!projectData) {
        setError('No se encontró el proyecto especificado.');
        return;
      }
      
      console.log('Datos del proyecto cargados:', projectData.name);
      setProject(projectData);

      // Cargar miembros del proyecto
      const memberData = await ProjectMemberService.getProjectMembersByProject(projectId);
      setMembers(memberData);
      
      // Si estamos refrescando, mostrar mensaje
      if (!showLoading) {
        setSuccessMessage('Datos actualizados correctamente');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error al cargar datos del proyecto:', err);
      setError('Error al cargar el proyecto. Por favor, inténtelo de nuevo.');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  // Cargar usuarios disponibles para añadir al proyecto
  const fetchAvailableUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Obtener todos los usuarios
      const users = await UserService.getUsers();
      
      // Filtrar los usuarios que ya son miembros del proyecto
      const existingMemberIds = members.map(member => member.user_id);
      const filteredUsers = users.filter(user => !existingMemberIds.includes(user.id));
      
      setAvailableUsers(filteredUsers);
    } catch (err) {
      console.error('Error al cargar usuarios disponibles:', err);
      setError('Error al cargar usuarios. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Función para añadir un miembro al proyecto
  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError('Por favor, selecciona un usuario.');
      return;
    }

    setIsAddingMember(true);
    setError(null);

    try {
      const newMember = {
        project_id: projectId,
        user_id: parseInt(selectedUserId),
        role: selectedRole
      };

      // Llamar al API para añadir el miembro
      const addedMember = await ProjectMemberService.addProjectMember(newMember);
      
      if (addedMember) {
        // Actualizar la lista de miembros
        await fetchProjectData(false);
        
        // Cerrar el diálogo y mostrar mensaje de éxito
        setIsAddMemberDialogOpen(false);
        setSuccessMessage('Miembro añadido correctamente');
        
        // Limpiar el formulario
        setSelectedUserId('');
        setSelectedRole('Member');
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error('No se pudo añadir el miembro');
      }
    } catch (err) {
      console.error('Error al añadir miembro:', err);
      setError('Error al añadir miembro. Por favor, inténtelo de nuevo.');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Función para eliminar un miembro del proyecto
  const handleDeleteMember = async (userId: number) => {
    setIsDeletingMember(userId);
    setError(null);

    try {
      // Llamar al API para eliminar el miembro
      const success = await ProjectMemberService.removeProjectMember(projectId, userId);
      
      if (success) {
        // Actualizar la lista de miembros
        const updatedMembers = members.filter(member => member.user_id !== userId);
        setMembers(updatedMembers);
        
        setSuccessMessage('Miembro eliminado correctamente');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error('No se pudo eliminar el miembro');
      }
    } catch (err) {
      console.error('Error al eliminar miembro:', err);
      setError('Error al eliminar miembro. Por favor, inténtelo de nuevo.');
    } finally {
      setIsDeletingMember(null);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);
  
  // Cargar usuarios disponibles cuando se abre el diálogo
  useEffect(() => {
    if (isAddMemberDialogOpen) {
      fetchAvailableUsers();
    }
  }, [isAddMemberDialogOpen]);

  // Función para formatear fechas
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: es });
  };

  // Función para obtener estado del proyecto
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Planificación
          </Badge>
        );
      case ProjectStatus.ACTIVE:
        return (
          <Badge variant="default" className="bg-green-500">
            Activo
          </Badge>
        );
      case ProjectStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-blue-500">
            Completado
          </Badge>
        );
      case ProjectStatus.ON_HOLD:
        return (
          <Badge variant="default" className="bg-amber-500">
            En pausa
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Función para obtener estado del sprint
  const getSprintStatusBadge = (status: SprintStatus) => {
    switch (status) {
      case SprintStatus.PLANNING:
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Planificación
          </Badge>
        );
      case SprintStatus.ACTIVE:
        return (
          <Badge variant="default" className="bg-green-500">
            Activo
          </Badge>
        );
      case SprintStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-blue-500">
            Completado
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Calcular días restantes
  const getRemainingDays = () => {
    if (!project) return '';

    const endDate = new Date(project.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Vence hoy';
    return `${diffDays} días restantes`;
  };

  // Calcular la clase para los días restantes
  const getRemainingDaysClass = () => {
    if (!project) return '';

    const endDate = new Date(project.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 7) return 'text-amber-600';
    return 'text-gray-600';
  };

  // Función para refrescar manualmente los datos
  const handleRefresh = () => {
    fetchProjectData(false);
  };

  // Manejar actualización de proyecto
  const handleUpdateProject = async (
    projectData: Omit<IProject, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!project) return;

    setIsUpdating(true);
    setError(null);

    try {
      const updatedProject = await ProjectService.updateProject(projectId, projectData);
      if (updatedProject) {
        setProject(updatedProject);
        setSuccessMessage('Proyecto actualizado correctamente');
        setIsEditDialogOpen(false);

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error('No se pudo actualizar el proyecto');
      }
    } catch (err) {
      console.error('Error al actualizar el proyecto:', err);
      setError('Error al actualizar el proyecto. Por favor, inténtelo de nuevo.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar eliminación de proyecto
  const handleDeleteProject = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const success = await ProjectService.deleteProject(projectId);
      if (success) {
        // Forzar recarga de la lista de proyectos
        await ProjectService.refreshProjects();
        
        // Redirigir a la página de proyectos
        router.push('/projects');
      } else {
        throw new Error('No se pudo eliminar el proyecto');
      }
    } catch (err) {
      console.error('Error al eliminar el proyecto:', err);
      setError('Error al eliminar el proyecto. Por favor, inténtelo de nuevo.');
      setIsDeleting(false);
    }
  };

  // Obtener estadísticas de tareas para el proyecto
  const getTaskStats = () => {
    if (!project || !project.sprints) return { total: 0, completed: 0, inProgress: 0, pending: 0 };

    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    project.sprints.forEach(sprint => {
      if (sprint.tasks && sprint.tasks.length > 0) {
        total += sprint.tasks.length;
        
        sprint.tasks.forEach(task => {
          if (task.status === 2) { // Completada
            completed++;
          } else if (task.status === 1) { // En progreso
            inProgress++;
          } else { // Pendiente
            pending++;
          }
        });
      }
    });

    return { total, completed, inProgress, pending };
  };

  const taskStats = getTaskStats();

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.TESTER]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          {/* Cabecera con botones de acción */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href="/projects" className="text-gray-500 hover:text-gray-700">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="m15 18-6-6 6-6"></path>
                    </svg>
                    Proyectos
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-64" /> : project?.name}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                project && getStatusBadge(project.status)
              )}
            </div>

            <div className="flex space-x-2 self-end sm:self-start">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={isLoading}>
                    <PenSquare className="h-4 w-4 mr-2" /> Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Editar Proyecto</DialogTitle>
                    <DialogDescription>
                      Actualiza los detalles del proyecto. Los campos marcados con * son
                      obligatorios.
                    </DialogDescription>
                  </DialogHeader>
                    {project && (
                    <ProjectForm
                      project={project}
                      onSubmit={(updatedProject) => {
                      console.log('Project before update:', project);
                      handleUpdateProject(updatedProject);
                      }}
                      onCancel={() => setIsEditDialogOpen(false)}
                      isSubmitting={isUpdating}
                    />
                    )}
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading || isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente este proyecto y
                      todos sus datos relacionados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProject}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Resumen del proyecto */}
          {!isLoading && project && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="py-4 px-6">
                  <CardTitle className="text-sm font-medium text-gray-500">TAREAS TOTALES</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-6 pb-4">
                  <div className="text-2xl font-bold">{taskStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-4 px-6">
                  <CardTitle className="text-sm font-medium text-gray-500">COMPLETADAS</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-6 pb-4">
                  <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-4 px-6">
                  <CardTitle className="text-sm font-medium text-gray-500">EN PROGRESO</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-6 pb-4">
                  <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-4 px-6">
                  <CardTitle className="text-sm font-medium text-gray-500">PENDIENTES</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-6 pb-4">
                  <div className="text-2xl font-bold text-amber-600">{taskStats.pending}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contenido principal con pestañas */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="members">Miembros</TabsTrigger>
              <TabsTrigger value="sprints">Sprints</TabsTrigger>
            </TabsList>

            {/* Pestaña de Detalles */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Proyecto</CardTitle>
                  <CardDescription>Detalles completos y estado actual del proyecto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </>
                  ) : project ? (
                    <>
                      <div>
                        <h3 className="font-medium flex items-center mb-1">
                          <FileText className="h-4 w-4 mr-2" /> Descripción
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">
                          {project.description || 'Sin descripción'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium flex items-center mb-1">
                            <CalendarIcon className="h-4 w-4 mr-2" /> Fechas
                          </h3>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Inicio:</span>{' '}
                              {formatDate(project.start_date)}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Fin:</span>{' '}
                              {formatDate(project.end_date)}
                            </p>
                            <p className={`text-sm font-medium ${getRemainingDaysClass()}`}>
                              {getRemainingDays()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium flex items-center mb-1">
                            <Clock className="h-4 w-4 mr-2" /> Tiempos del Proyecto
                          </h3>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Creado:</span>{' '}
                              {project.created_at ? formatDate(project.created_at) : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Actualizado:</span>{' '}
                              {project.updated_at ? formatDate(project.updated_at) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-700">No se encontró información del proyecto.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de Miembros */}
            <TabsContent value="members">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Miembros del Proyecto</CardTitle>
                    <CardDescription>Equipo asignado a este proyecto</CardDescription>
                  </div>
                  {/* Diálogo para añadir miembros */}
                  <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Añadir miembro
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Miembro al Proyecto</DialogTitle>
                        <DialogDescription>
                          Selecciona un usuario y asígnale un rol en el proyecto.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="user">Usuario</Label>
                          <Select 
                            onValueChange={setSelectedUserId} 
                            value={selectedUserId}
                          >
                            <SelectTrigger id="user" className="w-full">
                              <SelectValue placeholder="Selecciona un usuario" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingUsers ? (
                                <SelectItem value="loading" disabled>Cargando usuarios...</SelectItem>
                              ) : availableUsers.length > 0 ? (
                                availableUsers.map(user => (
                                  <SelectItem key={user.id} value={String(user.id)}>
                                    {user.username} ({user.email})
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>No hay usuarios disponibles</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role">Rol</Label>
                          <Select 
                            onValueChange={setSelectedRole} 
                            value={selectedRole}
                          >
                            <SelectTrigger id="role" className="w-full">
                              <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Member">Miembro</SelectItem>
                              <SelectItem value="Developer">Desarrollador</SelectItem>
                              <SelectItem value="Tester">Tester</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddMember} disabled={isAddingMember || !selectedUserId}>
                          {isAddingMember ? 'Añadiendo...' : 'Añadir Miembro'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : members.length > 0 ? (
                    <div className="space-y-4">
                      <div className="overflow-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-4 font-medium">ID</th>
                              <th className="text-left py-2 px-4 font-medium">Nombre</th>
                              <th className="text-left py-2 px-4 font-medium">Correo</th>
                              <th className="text-left py-2 px-4 font-medium">Rol</th>
                              <th className="text-left py-2 px-4 font-medium">Fecha de Unión</th>
                              <th className="text-left py-2 px-4 font-medium">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map((member) => (
                              <tr
                                key={`${member.project_id}-${member.user_id}`}
                                className="border-b"
                              >
                                <td className="py-2 px-4">{member.user_id}</td>
                                <td className="py-2 px-4">
                                  {member.user ? member.user.username : 'Usuario no encontrado'}
                                </td>
                                <td className="py-2 px-4">
                                  {member.user ? member.user.email : 'Correo no disponible'}
                                </td>
                                <td className="py-2 px-4">{member.role || 'Miembro'}</td>
                                <td className="py-2 px-4">
                                  {member.joined_date ? formatDate(member.joined_date) : 'N/A'}
                                </td>
                                <td className="py-2 px-4">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        disabled={isDeletingMember === member.user_id}
                                      >
                                        {isDeletingMember === member.user_id ? (
                                          <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        )}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          ¿Estás seguro de que deseas eliminar a {member.user?.username || 'este miembro'} del proyecto? 
                                          Esta acción no se puede deshacer.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteMember(member.user_id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay miembros asignados a este proyecto.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsAddMemberDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Añadir miembros
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de Sprints */}
<TabsContent value="sprints">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Sprints</CardTitle>
        <CardDescription>Ciclos de desarrollo del proyecto</CardDescription>
      </div>
      <Button variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" /> Nuevo sprint
      </Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : project && project.sprints && project.sprints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.sprints.map((sprint) => {
            // Calcular estadísticas de tareas para cada sprint
            const taskCount = sprint.tasks ? sprint.tasks.length : 0;
            const completedTaskCount = sprint.tasks ? 
              sprint.tasks.filter(task => task.status === 2).length : 0; // 2 = COMPLETED
            
            return (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                taskCount={taskCount}
                completedTaskCount={completedTaskCount}
onViewDetails={() => router.push(`/sprints/${sprint.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay sprints definidos para este proyecto.</p>
          <Button variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" /> Crear sprint
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default ProjectDetailsPage;