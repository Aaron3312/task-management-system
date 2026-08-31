'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/BackendAuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  CheckSquare,
  PlusCircle,
  ArrowRight,
  CalendarIcon,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { ITask, IProject, ISprint, IComment, TaskStatus, ProjectStatus } from '@/core/interfaces/models';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';

// Import API services
import { TaskService, ProjectService, SprintService, CommentService } from '@/services/api';

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth/login');
    }
  }, [loading, currentUser, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [recentTasks, setRecentTasks] = useState<ITask[]>([]);
  const [activeProjects, setActiveProjects] = useState<IProject[]>([]);
  const [activeSprints, setActiveSprints] = useState<ISprint[]>([]);
  const [recentComments, setRecentComments] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState({
    tasks: true,
    projects: true,
    sprints: true,
    comments: true,
  });
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const tasksHeaderRef = useRef<HTMLDivElement>(null);
  const tasksSectionRef = useRef<HTMLDivElement>(null);
  const taskCardsRef = useRef<HTMLDivElement[]>([]);

  const router = useRouter();

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(headerRef.current, 
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
    );

    tl.fromTo(cardsContainerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" },
      "-=0.4"
    );

    tl.fromTo(tasksHeaderRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    );

    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const fetchTasks = async () => {
      try {
        const tasks = await TaskService.getTasks();
        const sortedTasks = tasks
          .filter((task) => task.created_at)
          .sort((a, b) => {
            const dateA = new Date(a.created_at || '').getTime();
            const dateB = new Date(b.created_at || '').getTime();
            return dateB - dateA;
          })
          .slice(0, 3);
        setRecentTasks(sortedTasks);
        
        setTimeout(() => {
          gsap.fromTo(tasksSectionRef.current,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)" }
          );
        }, 100);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading((prev) => ({ ...prev, tasks: false }));
      }
    };

    const fetchProjects = async () => {
      try {
        const projects = await ProjectService.getProjects({ status: ProjectStatus.ACTIVE });
        setActiveProjects(projects.slice(0, 3));
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading((prev) => ({ ...prev, projects: false }));
      }
    };

    const fetchSprints = async () => {
      try {
        const sprints = await SprintService.getSprints({ status: 1 });
        setActiveSprints(sprints.slice(0, 3));
      } catch (error) {
        console.error('Error fetching sprints:', error);
      } finally {
        setIsLoading((prev) => ({ ...prev, sprints: false }));
      }
    };

    const fetchComments = async () => {
      try {
        const comments = await CommentService.getAllComments();
        // Sort by created_at descending and take the last 5
        const sortedComments = comments
          .filter((comment) => comment.created_at)
          .sort((a, b) => {
            const dateA = new Date(a.created_at || '').getTime();
            const dateB = new Date(b.created_at || '').getTime();
            return dateB - dateA;
          })
          .slice(0, 5);
        setRecentComments(sortedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading((prev) => ({ ...prev, comments: false }));
      }
    };

    await Promise.all([fetchTasks(), fetchProjects(), fetchSprints(), fetchComments()]);
  };

  useEffect(() => {
    if (recentTasks.length > 0 && !isLoading.tasks) {
      gsap.fromTo(taskCardsRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [recentTasks, isLoading.tasks]);

  const handleTaskStatusChange = async (taskId: number | undefined, status: TaskStatus) => {
    if (!taskId) return;

    try {
      setLoadingTaskId(taskId);

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
        estimated_hours: currentTask.estimated_hours,
      };

      const updatedTask = await TaskService.updateTask(taskId, updatedTaskData);

      if (updatedTask) {
        const taskElement = taskCardsRef.current.find(el => 
          el?.dataset.taskId === taskId.toString()
        );
        
        if (taskElement) {
          gsap.to(taskElement, {
            scale: 1.1,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "elastic.out(1, 0.3)"
          });
        }

        const allTasks = await TaskService.getTasks();
        const sortedTasks = allTasks
          .filter((task) => task.created_at)
          .sort((a, b) => {
            const dateA = new Date(a.created_at || '').getTime();
            const dateB = new Date(b.created_at || '').getTime();
            return dateB - dateA;
          });

        setRecentTasks(sortedTasks.slice(0, 3));
      }
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const addTaskCardRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      taskCardsRef.current[index] = el;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div 
          ref={headerRef}
          className="flex justify-between items-center group"
        >
          <h1 className="text-2xl font-bold text-foreground transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-105">
            Panel de Control
          </h1>
          <div className="flex space-x-2">
            <Link href="/tasks/new" passHref>
              <Button className="transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25 group/btn">
                <PlusCircle className="h-4 w-4 mr-2 transition-all duration-300 group-hover/btn:rotate-180" /> 
                Nueva tarea
              </Button>
            </Link>
          </div>
        </div>

        <div 
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Active Projects Card */}
          <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-3 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-orange-50/0 group-hover:from-red-50/30 group-hover:to-orange-50/30 dark:group-hover:from-red-950/20 dark:group-hover:to-orange-950/20 transition-all duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/0 to-transparent group-hover:via-red-200/50 dark:group-hover:via-red-700/30 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-lg font-medium flex items-center transition-all duration-300 group-hover:scale-105">
                <Layers className="h-5 w-5 mr-2 text-red-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="transition-all duration-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                  Proyectos activos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoading.projects ? (
                <div className="h-24 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                </div>
              ) : activeProjects.length > 0 ? (
                <div className="space-y-3">
                  {activeProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="flex justify-between items-center border-b border-border pb-2 last:border-0 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded px-2 py-1 transition-all duration-300 hover:translate-x-2 hover:shadow-md"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="transition-all duration-300 hover:scale-105">
                        <p className="font-medium text-foreground">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/projects/${project.id}`} passHref>
                        <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-125 hover:shadow-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex justify-center items-center text-muted-foreground">
                  No hay proyectos activos
                </div>
              )}
              <div className="mt-4">
                <Link href="/projects" passHref>
                  <Button variant="outline" size="sm" className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20">
                    Ver todos los proyectos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Active Sprints Card */}
          <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-3 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-emerald-50/0 group-hover:from-green-50/30 group-hover:to-emerald-50/30 dark:group-hover:from-green-950/20 dark:group-hover:to-emerald-950/20 transition-all duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/0 to-transparent group-hover:via-green-200/50 dark:group-hover:via-green-700/30 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-lg font-medium flex items-center transition-all duration-300 group-hover:scale-105">
                <Calendar className="h-5 w-5 mr-2 text-green-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="transition-all duration-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                  Sprints activos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoading.sprints ? (
                <div className="h-24 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                </div>
              ) : activeSprints.length > 0 ? (
                <div className="space-y-3">
                  {activeSprints.map((sprint, index) => (
                    <div
                      key={sprint.id}
                      className="flex justify-between items-center border-b border-border pb-2 last:border-0 hover:bg-green-50/50 dark:hover:bg-green-950/20 rounded px-2 py-1 transition-all duration-300 hover:translate-x-2 hover:shadow-md"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="transition-all duration-300 hover:scale-105">
                        <p className="font-medium text-foreground">{sprint.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Termina: {new Date(sprint.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/sprints/${sprint.id}`} passHref>
                        <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-125 hover:shadow-lg hover:bg-green-100 dark:hover:bg-green-900/30">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex justify-center items-center text-muted-foreground">
                  No hay sprints activos
                </div>
              )}
              <div className="mt-4">
                <Link href="/sprints" passHref>
                  <Button variant="outline" size="sm" className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20">
                    Ver todos los sprints
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks Card */}
          <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-3 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-yellow-50/0 group-hover:from-amber-50/30 group-hover:to-yellow-50/30 dark:group-hover:from-amber-950/20 dark:group-hover:to-yellow-950/20 transition-all duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/0 to-transparent group-hover:via-amber-200/50 dark:group-hover:via-amber-700/30 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-lg font-medium flex items-center transition-all duration-300 group-hover:scale-105">
                <CheckSquare className="h-5 w-5 mr-2 text-amber-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="transition-all duration-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  Mis tareas recientes
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoading.tasks ? (
                <div className="h-24 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex justify-between items-center border-b border-border pb-2 last:border-0 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 rounded px-2 py-1 transition-all duration-300 hover:translate-x-2 hover:shadow-md"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="transition-all duration-300 hover:scale-105">
                        <p className="font-medium text-foreground">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.due_date
                            ? `Vence: ${new Date(task.due_date).toLocaleDateString()}`
                            : 'Sin fecha'}
                        </p>
                      </div>
                      <Link href={`/tasks/${task.id}`} passHref>
                        <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-125 hover:shadow-lg hover:bg-amber-100 dark:hover:bg-amber-900/30">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex justify-center items-center text-muted-foreground">
                  No hay tareas recientes
                </div>
              )}
              <div className="mt-4">
                <Link href="/tasks" passHref>
                  <Button variant="outline" size="sm" className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20">
                    Ver todas las tareas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-pink-50/0 group-hover:from-purple-50/30 group-hover:to-pink-50/30 dark:group-hover:from-purple-950/20 dark:group-hover:to-pink-950/20 transition-all duration-700"></div>
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-medium flex items-center transition-all duration-300 group-hover:scale-105">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="transition-all duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Actividad Reciente
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoading.comments ? (
                <div className="h-32 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : recentComments.length > 0 ? (
                <div className="space-y-4">
                  {recentComments.map((comment, index) => (
                    <div
                      key={comment.id}
                      className="flex items-start space-x-3 border-b border-border pb-3 last:border-0 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 rounded px-3 py-2 transition-all duration-300 hover:translate-x-2 hover:shadow-md"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <MessageSquare className="h-4 w-4 text-purple-500 transition-all duration-300 group-hover:scale-110" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400">
                          {comment.content}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {comment.created_at
                              ? new Date(comment.created_at).toLocaleString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Sin fecha'}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <Link
                            href={`/tasks/${comment.task_id}`}
                            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                          >
                            Ver tarea
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex justify-center items-center text-muted-foreground">
                  No hay actividad reciente
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks Section */}
        <div>
          <div 
            ref={tasksHeaderRef}
            className="flex justify-between items-center mb-4 group"
          >
            <h2 className="text-xl font-semibold text-foreground transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-105">
              Tareas recientes
            </h2>
            <Link href="/tasks" passHref>
              <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                Ver todas
              </Button>
            </Link>
          </div>
          <Card 
            ref={tasksSectionRef}
            className="w-full group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/20 group-hover:to-indigo-50/20 dark:group-hover:from-blue-950/10 dark:group-hover:to-indigo-950/10 transition-all duration-700"></div>
            
            <CardContent className="pt-6 relative z-10">
              {isLoading.tasks ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map((task, index) => (
                    <Card
                      key={task.id}
                      ref={(el) => addTaskCardRef(el, index)}
                      data-task-id={task.id}
                      className="cursor-pointer group/task relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:scale-[1.02]"
                      onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-purple-50/0 group-hover/task:from-blue-50/30 group-hover/task:to-purple-50/30 dark:group-hover/task:from-blue-950/20 dark:group-hover/task:to-purple-950/20 transition-all duration-500"></div>
                      
                      <CardContent className="p-4 relative z-10">
                        <div className="flex justify-between items-start">
                          <div className="transition-all duration-300 group-hover/task:translate-x-2">
                            <h3 className="font-medium text-foreground transition-all duration-300 group-hover/task:text-blue-600 dark:group-hover/task:text-blue-400 group-hover/task:scale-105">
                              {task.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1 transition-all duration-300 group-hover/task:text-foreground/80">
                              {task.description}
                            </p>
                          </div>
                          <div className="transition-all duration-300 group-hover/task:scale-105">
                            {task.status === TaskStatus.TODO && (
                              <Badge variant="outline" className="bg-muted transition-all duration-300 group-hover/task:shadow-md">
                                Por hacer
                              </Badge>
                            )}
                            {task.status === TaskStatus.IN_PROGRESS && (
                              <Badge variant="default" className="bg-blue-500 transition-all duration-300 group-hover/task:shadow-lg">
                                En progreso
                              </Badge>
                            )}
                            {task.status === TaskStatus.COMPLETED && (
                              <Badge variant="default" className="bg-green-500 transition-all duration-300 group-hover/task:shadow-lg">
                                Completado
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center transition-all duration-300 group-hover/task:translate-x-1">
                            <CalendarIcon className="h-3 w-3 mr-1 transition-all duration-300 group-hover/task:scale-110 group-hover/task:text-blue-500" />
                            <span className="transition-all duration-300 group-hover/task:text-foreground/80">
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString()
                                : 'Sin fecha'}
                            </span>
                          </div>
                          {task.status !== TaskStatus.COMPLETED && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs transition-all duration-300 hover:scale-125 hover:shadow-lg hover:bg-green-100 dark:hover:bg-green-900/30 group/complete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskStatusChange(task.id, TaskStatus.COMPLETED);
                              }}
                              disabled={loadingTaskId === task.id}
                            >
                              {loadingTaskId === task.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                              ) : (
                                <CheckCircle2 className="h-3 w-3 mr-1 transition-all duration-300 group-hover/complete:rotate-180 group-hover/complete:text-green-600" />
                              )}
                              Completar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">No hay tareas recientes para mostrar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </MainLayout>
  );
}