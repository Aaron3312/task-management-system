
// src/components/projects/ProjectForm.tsx
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
import { IProject, ProjectStatus } from '@/core/interfaces/models';
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProjectFormProps {
  project?: IProject;
  onSubmit: (projectData: Omit<IProject, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Omit<IProject, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    status: ProjectStatus.PLANNING,
  });

  // Inicializar formulario con datos de proyecto si existe
  useEffect(() => {
    if (project) {
      const { name, description, start_date, end_date, status } = project;
      setFormData({ name, description, start_date, end_date, status });
    }
  }, [project]);

  // Manejador de cambio para inputs y textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejador para selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
          Nombre del Proyecto <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre del proyecto"
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
          placeholder="Descripción detallada del proyecto"
          required
          rows={4}
        />
      </div>

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
          <SelectItem value={ProjectStatus.PLANNING.toString()}>Planificación</SelectItem>
          <SelectItem value={ProjectStatus.ACTIVE.toString()}>Activo</SelectItem>
          <SelectItem value={ProjectStatus.COMPLETED.toString()}>Completado</SelectItem>
          <SelectItem value={ProjectStatus.ON_HOLD.toString()}>En pausa</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : project ? 'Actualizar proyecto' : 'Crear proyecto'}
      </Button>
    </div>
  </form>
);
};

export default ProjectForm;
