// src/components/tasks/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITask, TaskStatus, IProject, ISprint } from '@/core/interfaces/models';
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TaskFormProps {
  task?: ITask;
  projects: IProject[];
  sprints?: ISprint[];
  onSubmit: (taskData: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  projects,
  sprints = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Omit<ITask, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    due_date: new Date().toISOString(),
    priority: 2,
    status: TaskStatus.TODO,
    estimated_hours: 1,
    project_id: undefined,
    sprint_id: undefined,
  });

  // Inicializar formulario con datos de tarea si existe
  useEffect(() => {
    if (task) {
      const { title, description, due_date, priority, status, estimated_hours, project_id, sprint_id } = task; // Only destructure the needed properties
      setFormData({ title, description, due_date, priority, status, estimated_hours, project_id, sprint_id });
    }
  }, [task]);

  // Manejador de cambio para inputs y textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejador para selects
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'project_id' || name === 'sprint_id') {
      // Convertir a número si no está vacío
      const numValue = value ? parseInt(value, 10) : undefined;
      setFormData(prev => ({ ...prev, [name]: numValue }));
      
      // Si cambiamos el proyecto, resetear el sprint_id
      if (name === 'project_id') {
        setFormData(prev => ({ ...prev, sprint_id: undefined }));
      }
    } else if (name === 'status' || name === 'priority') {
      // Convertir a número para los enums
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejador para fecha
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, due_date: date.toISOString() }));
    }
  };

  // Manejador para números
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  // Filtrar sprints por proyecto seleccionado
  const filteredSprints = formData.project_id 
    ? sprints.filter(sprint => sprint.project_id === formData.project_id)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones antes de enviar
    if (!formData.title.trim()) {
      alert('El título es obligatorio');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('La descripción es obligatoria');
      return;
    }

    console.log('Enviando datos de formulario:', formData);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Título de la tarea"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción detallada de la tarea"
          required
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
            Proyecto
          </label>
          <Select
            value={formData.project_id?.toString() || ''}
            onValueChange={(value) => handleSelectChange('project_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un proyecto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id?.toString() || ''}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="sprint_id" className="block text-sm font-medium text-gray-700 mb-1">
            Sprint
          </label>
          <Select
            value={formData.sprint_id?.toString() || ''}
            onValueChange={(value) => handleSelectChange('sprint_id', value)}
            disabled={!formData.project_id || filteredSprints.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={!formData.project_id ? "Selecciona un proyecto primero" : "Selecciona un sprint"} />
            </SelectTrigger>
            <SelectContent>
              {filteredSprints.map((sprint) => (
                <SelectItem key={sprint.id} value={sprint.id?.toString() || ''}>
                  {sprint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.priority.toString()}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Baja</SelectItem>
              <SelectItem value="2">Media</SelectItem>
              <SelectItem value="3">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.status.toString()}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TaskStatus.TODO.toString()}>Por hacer</SelectItem>
              <SelectItem value={TaskStatus.IN_PROGRESS.toString()}>En progreso</SelectItem>
              <SelectItem value={TaskStatus.COMPLETED.toString()}>Completado</SelectItem>
              <SelectItem value={TaskStatus.BLOCKED.toString()}>Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">
            Horas estimadas <span className="text-red-500">*</span>
          </label>
          <Input
            id="estimated_hours"
            name="estimated_hours"
            type="number"
            min="1"
            step="0.5"
            value={formData.estimated_hours}
            onChange={handleNumberChange}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de vencimiento <span className="text-red-500">*</span>
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.due_date ? format(new Date(formData.due_date), 'PP') : <span>Selecciona una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={new Date(formData.due_date)}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : task ? 'Actualizar tarea' : 'Crear tarea'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;