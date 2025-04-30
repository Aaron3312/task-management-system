// src/components/tasks/TaskCard.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ITask, TaskStatus } from '@/core/interfaces/models';
import { CalendarIcon, Clock, CheckCircle2, BarChart2 } from "lucide-react";
import { useRouter } from 'next/navigation';

interface TaskCardProps {
  task: ITask;
  onClick?: () => void;
  onStatusChange?: (taskId: number | undefined, status: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onStatusChange }) => {
  const router = useRouter();

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

  // Calcular si la fecha de vencimiento está próxima o ya pasó
  const getDueDateClass = () => {
    if (!task.due_date) return "text-gray-600";
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    
    if (dueDate < today) {
      return "text-red-600";
    } else if (dueDate < threeDaysLater) {
      return "text-amber-600";
    }
    return "text-gray-600";
  };

  // Manejar click en completar tarea
  const handleCompleteTask = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el click se propague a la tarjeta
    if (onStatusChange) {
      onStatusChange(task.id, TaskStatus.COMPLETED);
    }
  };

  // Manejar click en ver detalles
  const handleViewDetails = () => {
    // Si hay un manejador onClick personalizado, usarlo
    if (onClick) {
      onClick();
    } else {
      // De lo contrario, navegar a la página de detalles de la tarea
      router.push(`/tasks/${task.id}`);
    }
  };

  return (
    <Card className="w-full h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium line-clamp-2">{task.title}</CardTitle>
          {getPriorityBadge(task.priority)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{task.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className={`h-4 w-4 ${getDueDateClass()}`} />
            <span className={`${getDueDateClass()}`}>Vence: {formatDate(task.due_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span>{task.estimated_hours} horas estimadas</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-gray-600" />
            <span>
              {task.subtasks?.length ? `${task.subtasks.length} subtareas` : 'Sin subtareas'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <div>{getStatusBadge(task.status)}</div>
        <div className="flex gap-2">
          {task.status !== TaskStatus.COMPLETED && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCompleteTask}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" /> Completar
            </Button>
          )}
          <Button 
            variant="default" 
            size="sm"
            onClick={handleViewDetails}
          >
            Ver detalles
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;