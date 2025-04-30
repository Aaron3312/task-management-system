// src/core/patterns/factory.ts
// Factory Pattern: Crear tareas y dividirlas si superan un umbral de horas

import { ITask, ISubtask, TaskStatus } from "../interfaces/models";

export class TaskFactory {
  // Umbral de horas para dividir tareas
  private static HOURS_THRESHOLD = 4;

  // Crear una tarea sencilla
  static createSimpleTask(taskData: Omit<ITask, "id" | "created_at" | "updated_at">): ITask {
    const now = new Date().toISOString();
    
    return {
      ...taskData,
      created_at: now,
      updated_at: now,
      subtasks: []
    };
  }

  // Crear una tarea con subtareas si supera el umbral de horas
  static createTask(taskData: Omit<ITask, "id" | "created_at" | "updated_at">): ITask {
    const now = new Date().toISOString();
    
    const task: ITask = {
      ...taskData,
      created_at: now,
      updated_at: now
    };

    // Si la tarea supera el umbral de horas y no tiene subtareas, la dividimos
    if (taskData.estimated_hours > TaskFactory.HOURS_THRESHOLD && (!taskData.subtasks || taskData.subtasks.length === 0)) {
      const numSubtasks = Math.ceil(taskData.estimated_hours / TaskFactory.HOURS_THRESHOLD);
      const subtasks: ISubtask[] = [];
      
      for (let i = 0; i < numSubtasks; i++) {
        subtasks.push({
          title: `${task.title} - Part ${i + 1}`,
          description: `Subtask ${i + 1} of ${numSubtasks} for task: ${task.description}`,
          status: TaskStatus.TODO,
          created_at: now,
          updated_at: now
        });
      }
      
      task.subtasks = subtasks;
    }
    
    return task;
  }
  
  // Método específico para crear tareas relacionadas con documentación
  static createDocumentationTask(
    title: string, 
    description: string, 
    dueDate: string, 
    projectId?: number
  ): ITask {
    return TaskFactory.createTask({
      title,
      description,
      due_date: dueDate,
      priority: 2, // Prioridad media por defecto
      status: TaskStatus.TODO,
      estimated_hours: 6, // Las tareas de documentación suelen llevar tiempo
      project_id: projectId,
    });
  }
  
  // Método específico para crear tareas de tipo bug
  static createBugTask(
    title: string, 
    description: string, 
    priority: number, 
    dueDate: string, 
    projectId?: number
  ): ITask {
    return TaskFactory.createTask({
      title: `[BUG] ${title}`,
      description,
      due_date: dueDate,
      priority, // Los bugs suelen tener prioridad variable
      status: TaskStatus.TODO,
      estimated_hours: 3, // Estimación por defecto
      project_id: projectId,
    });
  }
  
  // Método para crear tareas de tipo feature
  static createFeatureTask(
    title: string, 
    description: string, 
    dueDate: string, 
    estimatedHours: number,
    projectId?: number
  ): ITask {
    return TaskFactory.createTask({
      title: `[FEATURE] ${title}`,
      description,
      due_date: dueDate,
      priority: 3, // Las features suelen tener alta prioridad
      status: TaskStatus.TODO,
      estimated_hours: estimatedHours,
      project_id: projectId,
    });
  }
}
