// src/components/sprints/SprintForm.tsx
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
import { ISprint, SprintStatus, IProject } from '@/core/interfaces/models';
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SprintFormProps {
  sprint?: ISprint;
  projects: IProject[];
  projectId?: number;
  onSubmit: (sprintData: Omit<ISprint, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SprintForm: React.FC<SprintFormProps> = ({
  sprint,
  projects,
  projectId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Omit<ISprint, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // 2 semanas por defecto
    status: SprintStatus.PLANNING,
    project_id: projectId || 0,
  });

  // Inicializar formulario con datos de sprint si existe
  useEffect(() => {
    if (sprint) {
      const { name, description, start_date, end_date, status, project_id } = sprint;
      setFormData({ name, description, start_date, end_date, status, project_id });
    } else if (projectId) {
      setFormData(prev => ({ ...prev, project_id: projectId }));
    }
  }, [sprint, projectId]);

  // Manejador de cambio para inputs y textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejador para selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: name === 'project_id' ? Number(value) : value }));
  };

  // Manejador para fechas
  const handleDateChange = (name: 'start_date' | 'end_date') => (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date.toISOString() }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Sprint <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre del sprint"
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
          placeholder="Descripción detallada del sprint"
          required
          rows={4}
        />
      </div>

      {!projectId && (
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
            Proyecto <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.project_id.toString()}
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
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio <span className="text-red-500">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date ? format(new Date(formData.start_date), 'PP') : <span>Selecciona una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(formData.start_date)}
                onSelect={handleDateChange('start_date')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de fin <span className="text-red-500">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date ? format(new Date(formData.end_date), 'PP') : <span>Selecciona una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(formData.end_date)}
                onSelect={handleDateChange('end_date')}
                initialFocus
                disabled={(date) => date < new Date(formData.start_date)}
              />
            </PopoverContent>
          </Popover>
        </div>
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
            <SelectItem value={SprintStatus.PLANNING.toString()}>Planificación</SelectItem>
            <SelectItem value={SprintStatus.ACTIVE.toString()}>Activo</SelectItem>
            <SelectItem value={SprintStatus.COMPLETED.toString()}>Completado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : sprint ? 'Actualizar sprint' : 'Crear sprint'}
        </Button>
      </div>
    </form>
  );
};

export default SprintForm;