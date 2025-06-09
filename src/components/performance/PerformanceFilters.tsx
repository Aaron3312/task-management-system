// components/performance/PerformanceFilters.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target } from 'lucide-react';
import { ISprint, IProject } from '@/core/interfaces/models';

interface Developer {
  id: number;
  username: string;
  full_name?: string;
}

interface PerformanceFiltersProps {
  selectedProject: string;
  selectedSprint: string;
  selectedDeveloper: string;
  projects: IProject[];
  sprints: ISprint[];
  developers: Developer[];
  onProjectChange: (value: string) => void;
  onSprintChange: (value: string) => void;
  onDeveloperChange: (value: string) => void;
}

export const PerformanceFilters: React.FC<PerformanceFiltersProps> = ({
  selectedProject,
  selectedSprint,
  selectedDeveloper,
  projects,
  sprints,
  developers,
  onProjectChange,
  onSprintChange,
  onDeveloperChange
}) => {
  return (
    <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-primary to-chart-1 rounded-full flex items-center justify-center shadow-lg">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Filtros de Análisis</h3>
              <p className="text-sm text-muted-foreground">Personaliza tu vista de datos</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 ml-auto">
            <Select value={selectedProject} onValueChange={onProjectChange}>
              <SelectTrigger className="w-full sm:w-56 h-12 border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background/50">
                <SelectValue placeholder="Seleccionar Proyecto" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id!.toString()}>
                    📁 {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSprint} onValueChange={onSprintChange}>
              <SelectTrigger className="w-full sm:w-56 h-12 border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background/50">
                <SelectValue placeholder="Seleccionar Sprint" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">🚀 Todos los sprints</SelectItem>
                {sprints.map(sprint => (
                  <SelectItem key={sprint.id} value={sprint.id!.toString()}>
                    📋 {sprint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDeveloper} onValueChange={onDeveloperChange}>
              <SelectTrigger className="w-full sm:w-56 h-12 border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background/50">
                <SelectValue placeholder="Seleccionar Desarrollador" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">👥 Todos los desarrolladores</SelectItem>
                {developers.map(dev => (
                  <SelectItem key={dev.id} value={dev.id.toString()}>
                    👨‍💻 {dev.full_name || dev.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};