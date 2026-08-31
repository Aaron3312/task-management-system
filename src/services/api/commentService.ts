// src/services/api/commentService.ts
// Servicios para operaciones con comentarios
import { apiClient } from './apiClient';
import { IComment } from '../../core/interfaces/models';

export class CommentService {
  private static readonly BASE_PATH = '/commentlist';

  // Obtener un comentario por ID
  static async getCommentById(id: number): Promise<IComment | null> {
    try {
      const comment = await apiClient.get<IComment>(`${this.BASE_PATH}/${id}`);
      return comment;
    } catch (error) {
      console.error(`Error fetching comment ${id}:`, error);
      return null;
    }
  }

  // Obtener comentarios por tarea
  static async getCommentsByTaskId(taskId: number): Promise<IComment[]> {
    try {
      // Corregido: Usar el mismo patrón que otros servicios con endpoint específico
      const comments = await apiClient.get<IComment[]>(`${this.BASE_PATH}/task/${taskId}`);
      return comments;
    } catch (error) {
      console.error(`Error fetching comments for task ${taskId}:`, error);
      return [];
    }
  }

  // Obtener todos los comentarios
  static async getAllComments(): Promise<IComment[]> {
    try {
      const comments = await apiClient.get<IComment[]>(this.BASE_PATH);
      return comments;
    } catch (error) {
      console.error('Error fetching all comments:', error);
      return [];
    }
  }

  // Crear un nuevo comentario
  static async createComment(
    commentData: Omit<IComment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<IComment | null> {
    try {
      const createdComment = await apiClient.post<IComment>(this.BASE_PATH, commentData);
      return createdComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  // Actualizar un comentario existente
  static async updateComment(id: number, commentData: Partial<IComment>): Promise<IComment | null> {
    try {
      const updatedComment = await apiClient.put<IComment>(`${this.BASE_PATH}/${id}`, commentData);
      return updatedComment;
    } catch (error) {
      console.error(`Error updating comment ${id}:`, error);
      return null;
    }
  }

  // Eliminar un comentario
  static async deleteComment(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting comment ${id}:`, error);
      return false;
    }
  }
}
