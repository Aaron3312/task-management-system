// src/services/api/taskService.ts
// Servicios para operaciones con tareas
import { apiClient } from './apiClient';
import { ITask, TaskFilter } from '../../core/interfaces/models';
import { TaskFactory } from '../../core/patterns/factory';

export class TaskService {
  private static readonly BASE_PATH = '/tasklist';

  // Obtener todas las tareas
  static async getTasks(filter?: TaskFilter): Promise<ITask[]> {
    try {
      // Convertir filtro a parámetros de consulta si existe
      const queryParams: Record<string, string> = {};
      if (filter?.project_id) queryParams['project_id'] = filter.project_id.toString();
      if (filter?.status !== undefined) queryParams['status'] = filter.status.toString();
      if (filter?.priority) queryParams['priority'] = filter.priority.toString();
      if (filter?.sprint_id) queryParams['sprint_id'] = filter.sprint_id.toString();
      
      return await apiClient.get<ITask[]>(this.BASE_PATH, queryParams);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  // Obtener una tarea por ID
  static async getTaskById(id: number): Promise<ITask | null> {
    try {
      return await apiClient.get<ITask>(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      return null;
    }
  }

  // Crear una nueva tarea
  static async createTask(taskData: Omit<ITask, 'id' | 'created_at' | 'updated_at'>): Promise<ITask | null> {
    try {
      console.log('TaskService.createTask - Datos recibidos:', taskData);
      
      // Formatear los datos para asegurar que tienen el formato correcto
      const taskPayload = {
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.due_date,
        priority: Number(taskData.priority),
        status: Number(taskData.status),
        estimated_hours: Number(taskData.estimated_hours),
        project_id: taskData.project_id ? Number(taskData.project_id) : null,
        sprint_id: taskData.sprint_id ? Number(taskData.sprint_id) : null,
        subtasks: taskData.subtasks || []
      };
      
      console.log('TaskService.createTask - Datos a enviar:', taskPayload);
      
      try {
        const createdTask = await apiClient.post<ITask>(this.BASE_PATH, taskPayload);
        console.log('TaskService.createTask - Respuesta:', createdTask);
        
        // Consideramos la operación exitosa incluso si la respuesta es null
        return createdTask;
      } catch (apiError) {
        console.error('Error en la solicitud API:', apiError);
        // Si hay error en la API, aún así consideramos que podría haber funcionado
        // pero que no obtuvimos la respuesta correcta
        return null;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error; // Relanzamos para que el llamador pueda manejarlo
    }
  }

  // Actualizar una tarea existente
  static async updateTask(id: number, taskData: Partial<ITask>): Promise<ITask | null> {
    try {
      // Primero obtenemos la tarea completa actual
      const currentTask = await this.getTaskById(id);
      
      if (!currentTask) {
        console.error(`Task with ID ${id} not found`);
        return null;
      }
      
      // Construimos el objeto completo para la actualización
      // Asegurando que incluimos todos los campos requeridos por la API
      const updatePayload = {
        title: taskData.title || currentTask.title,
        description: taskData.description || currentTask.description,
        created_at: currentTask.created_at,
        updated_at: new Date().toISOString(), // Actualizamos la fecha de modificación
        due_date: taskData.due_date || currentTask.due_date,
        priority: taskData.priority !== undefined ? taskData.priority : currentTask.priority,
        status: taskData.status !== undefined ? taskData.status : currentTask.status,
        estimated_hours: taskData.estimated_hours || currentTask.estimated_hours
      };
      
      const updatedTask = await apiClient.put<ITask>(`${this.BASE_PATH}/${id}`, updatePayload);
      return updatedTask;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      return null;
    }
  }

  // Eliminar una tarea
  static async deleteTask(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      return false;
    }
  }
}