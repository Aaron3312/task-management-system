// src/services/mock/mockService.ts
// Servicios mock para desarrollo que simulan interacción con la API

import { AppState } from '../../core/patterns/singleton';
import {
  mockUsers,
  mockProjects,
  mockTasks,
  mockSubtasks,
  mockProjectMembers,
  mockComments,
  mockSprints,
} from './mockData';
import {
  ITask,
  ISubtask,
  IProject,
  IUser,
  IProjectMember,
  IComment,
  ISprint,
  TaskFilter,
  ProjectFilter,
  SprintFilter,
} from '../../core/interfaces/models';
import { TaskFactory } from '../../core/patterns/factory';

// Inicializa el estado de la aplicación con datos mock
export const initializeMockData = () => {
  const appState = AppState.getInstance();

  // Cargar datos mock en el estado de la aplicación
  mockUsers.forEach((user) => {
    if (user.id) appState.addUser(user);
  });

  mockProjects.forEach((project) => {
    if (project.id) appState.addProject(project);
  });

  mockTasks.forEach((task) => {
    if (task.id) appState.addTask(task);
  });

  mockSubtasks.forEach((subtask) => {
    if (subtask.id) appState.addSubtask(subtask);
  });

  appState.setProjectMembers(mockProjectMembers);

  mockComments.forEach((comment) => {
    if (comment.id) appState.addComment(comment);
  });

  mockSprints.forEach((sprint) => {
    if (sprint.id) appState.addSprint(sprint);
  });
};

// Mock service para las tareas
export class MockTaskService {
  // Obtener todas las tareas
  static async getTasks(filter?: TaskFilter): Promise<ITask[]> {
    const appState = AppState.getInstance();
    let tasks = appState.getTasks();

    if (filter) {
      // Aplicar filtros
      if (filter.project_id !== undefined) {
        tasks = tasks.filter((task) => task.project_id === filter.project_id);
      }

      if (filter.status !== undefined) {
        tasks = tasks.filter((task) => task.status === filter.status);
      }

      if (filter.priority !== undefined) {
        tasks = tasks.filter((task) => task.priority === filter.priority);
      }

      if (filter.sprint_id !== undefined) {
        tasks = tasks.filter((task) => task.sprint_id === filter.sprint_id);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(tasks), 300); // Simular latencia
    });
  }

  // Obtener una tarea por ID
  static async getTaskById(id: number): Promise<ITask | null> {
    const appState = AppState.getInstance();
    const task = appState.getTaskById(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(task || null), 300);
    });
  }

  // Crear una nueva tarea
  static async createTask(
    taskData: Omit<ITask, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ITask | null> {
    const appState = AppState.getInstance();
    const tasks = appState.getTasks();

    // Generar nuevo ID
    const newId = tasks.length > 0 ? Math.max(...tasks.map((task) => task.id || 0)) + 1 : 1;

    // Usar Factory para crear la tarea
    const taskWithSubtasks = TaskFactory.createTask({
      ...taskData,
      id: newId,
    });

    appState.addTask(taskWithSubtasks);

    // Si hay subtareas, agregarlas también
    if (taskWithSubtasks.subtasks && taskWithSubtasks.subtasks.length > 0) {
      const subtasks = appState.getSubtasks();
      const newSubtaskBaseId =
        subtasks.length > 0 ? Math.max(...subtasks.map((subtask) => subtask.id || 0)) + 1 : 1;

      taskWithSubtasks.subtasks.forEach((subtask, index) => {
        const newSubtask: ISubtask = {
          ...subtask,
          id: newSubtaskBaseId + index,
          task_id: newId,
        };
        appState.addSubtask(newSubtask);
      });
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(taskWithSubtasks), 300);
    });
  }

  // Actualizar una tarea existente
  static async updateTask(id: number, taskData: Partial<ITask>): Promise<ITask | null> {
    const appState = AppState.getInstance();
    const existingTask = appState.getTaskById(id);

    if (!existingTask) {
      return Promise.resolve(null);
    }

    const updatedTask: ITask = {
      ...existingTask,
      ...taskData,
      updated_at: new Date().toISOString(),
    };

    appState.updateTask(updatedTask);

    return new Promise((resolve) => {
      setTimeout(() => resolve(updatedTask), 300);
    });
  }

  // Eliminar una tarea
  static async deleteTask(id: number): Promise<boolean> {
    const appState = AppState.getInstance();
    const success = appState.deleteTask(id);

    // Si se elimina la tarea, también eliminar sus subtareas
    if (success) {
      const subtasks = appState.getSubtasks();
      const taskSubtasks = subtasks.filter((subtask) => subtask.task_id === id);

      taskSubtasks.forEach((subtask) => {
        if (subtask.id) appState.deleteSubtask(subtask.id);
      });
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(success), 300);
    });
  }
}

// Mock service para las subtareas
export class MockSubtaskService {
  // Obtener una subtarea por ID
  static async getSubtaskById(id: number): Promise<ISubtask | null> {
    const appState = AppState.getInstance();
    const subtask = appState.getSubtaskById(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(subtask || null), 300);
    });
  }

  // Obtener subtareas por tarea
  static async getSubtasksByTaskId(taskId: number): Promise<ISubtask[]> {
    const appState = AppState.getInstance();
    const subtasks = appState.getSubtasksByTask(taskId);

    return new Promise((resolve) => {
      setTimeout(() => resolve(subtasks), 300);
    });
  }

  // Crear una nueva subtarea
  static async createSubtask(
    subtaskData: Omit<ISubtask, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ISubtask | null> {
    const appState = AppState.getInstance();
    const subtasks = appState.getSubtasks();

    // Generar nuevo ID
    const newId =
      subtasks.length > 0 ? Math.max(...subtasks.map((subtask) => subtask.id || 0)) + 1 : 1;

    const now = new Date().toISOString();
    const newSubtask: ISubtask = {
      ...subtaskData,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    appState.addSubtask(newSubtask);

    return new Promise((resolve) => {
      setTimeout(() => resolve(newSubtask), 300);
    });
  }

  // Actualizar una subtarea existente
  static async updateSubtask(id: number, subtaskData: Partial<ISubtask>): Promise<ISubtask | null> {
    const appState = AppState.getInstance();
    const existingSubtask = appState.getSubtaskById(id);

    if (!existingSubtask) {
      return Promise.resolve(null);
    }

    const updatedSubtask: ISubtask = {
      ...existingSubtask,
      ...subtaskData,
      updated_at: new Date().toISOString(),
    };

    appState.updateSubtask(updatedSubtask);

    return new Promise((resolve) => {
      setTimeout(() => resolve(updatedSubtask), 300);
    });
  }

  // Eliminar una subtarea
  static async deleteSubtask(id: number): Promise<boolean> {
    const appState = AppState.getInstance();
    const success = appState.deleteSubtask(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(success), 300);
    });
  }
}

// Mock service para los proyectos
export class MockProjectService {
  // Obtener todos los proyectos
  static async getProjects(filter?: ProjectFilter): Promise<IProject[]> {
    const appState = AppState.getInstance();
    let projects = appState.getProjects();

    if (filter && filter.status !== undefined) {
      projects = projects.filter((project) => project.status === filter.status);
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(projects), 300);
    });
  }

  // Obtener un proyecto por ID
  static async getProjectById(id: number): Promise<IProject | null> {
    const appState = AppState.getInstance();
    const project = appState.getProjectById(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(project || null), 300);
    });
  }

  // Crear un nuevo proyecto
  static async createProject(
    projectData: Omit<IProject, 'id' | 'created_at' | 'updated_at'>
  ): Promise<IProject | null> {
    const appState = AppState.getInstance();
    const projects = appState.getProjects();

    // Generar nuevo ID
    const newId =
      projects.length > 0 ? Math.max(...projects.map((project) => project.id || 0)) + 1 : 1;

    const now = new Date().toISOString();
    const newProject: IProject = {
      ...projectData,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    appState.addProject(newProject);

    return new Promise((resolve) => {
      setTimeout(() => resolve(newProject), 300);
    });
  }

  // Actualizar un proyecto existente
  static async updateProject(id: number, projectData: Partial<IProject>): Promise<IProject | null> {
    const appState = AppState.getInstance();
    const existingProject = appState.getProjectById(id);

    if (!existingProject) {
      return Promise.resolve(null);
    }

    const updatedProject: IProject = {
      ...existingProject,
      ...projectData,
      updated_at: new Date().toISOString(),
    };

    appState.updateProject(updatedProject);

    return new Promise((resolve) => {
      setTimeout(() => resolve(updatedProject), 300);
    });
  }

  // Eliminar un proyecto
  static async deleteProject(id: number): Promise<boolean> {
    const appState = AppState.getInstance();
    const success = appState.deleteProject(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(success), 300);
    });
  }
}

// Mock service para los usuarios
export class MockUserService {
  // Obtener todos los usuarios
  static async getUsers(): Promise<IUser[]> {
    const appState = AppState.getInstance();
    const users = appState.getUsers();

    return new Promise((resolve) => {
      setTimeout(() => resolve(users), 300);
    });
  }

  // Obtener un usuario por ID
  static async getUserById(id: number): Promise<IUser | null> {
    const appState = AppState.getInstance();
    const user = appState.getUserById(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(user || null), 300);
    });
  }

  // Crear un nuevo usuario
  static async createUser(
    userData: Omit<IUser, 'id' | 'created_at' | 'updated_at'>
  ): Promise<IUser | null> {
    const appState = AppState.getInstance();
    const users = appState.getUsers();

    // Generar nuevo ID
    const newId = users.length > 0 ? Math.max(...users.map((user) => user.id || 0)) + 1 : 1;

    const now = new Date().toISOString();
    const newUser: IUser = {
      ...userData,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    appState.addUser(newUser);

    return new Promise((resolve) => {
      setTimeout(() => resolve(newUser), 300);
    });
  }

  // Actualizar un usuario existente
  static async updateUser(id: number, userData: Partial<IUser>): Promise<IUser | null> {
    const appState = AppState.getInstance();
    const existingUser = appState.getUserById(id);

    if (!existingUser) {
      return Promise.resolve(null);
    }

    const updatedUser: IUser = {
      ...existingUser,
      ...userData,
      updated_at: new Date().toISOString(),
    };

    appState.updateUser(updatedUser);

    return new Promise((resolve) => {
      setTimeout(() => resolve(updatedUser), 300);
    });
  }

  // Eliminar un usuario
  static async deleteUser(id: number): Promise<boolean> {
    const appState = AppState.getInstance();
    const success = appState.deleteUser(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(success), 300);
    });
  }
}

// Mock service para los miembros de proyectos
export class MockProjectMemberService {
  // Obtener todos los miembros de proyectos
  static async getProjectMembers(): Promise<IProjectMember[]> {
    const appState = AppState.getInstance();
    const projectMembers = appState.getProjectMembers();

    return new Promise((resolve) => {
      setTimeout(() => resolve(projectMembers), 300);
    });
  }

  // Obtener miembros por proyecto
  static async getProjectMembersByProject(projectId: number): Promise<IProjectMember[]> {
    const appState = AppState.getInstance();
    const projectMembers = appState.getProjectMembersByProject(projectId);

    return new Promise((resolve) => {
      setTimeout(() => resolve(projectMembers), 300);
    });
  }

  // Obtener proyectos por usuario
  static async getProjectMembersByUser(userId: number): Promise<IProjectMember[]> {
    const appState = AppState.getInstance();
    const projectMembers = appState.getProjectMembersByUser(userId);

    return new Promise((resolve) => {
      setTimeout(() => resolve(projectMembers), 300);
    });
  }

  // Añadir un miembro a un proyecto
  static async addProjectMember(projectMember: IProjectMember): Promise<IProjectMember | null> {
    const appState = AppState.getInstance();

    // Comprobar si el proyecto y usuario existen
    const project = appState.getProjectById(projectMember.project_id);
    const user = appState.getUserById(projectMember.user_id);

    if (!project || !user) {
      return Promise.resolve(null);
    }

    // Comprobar si ya existe esta relación
    const existingMembers = appState.getProjectMembers();
    const alreadyExists = existingMembers.some(
      (pm) => pm.project_id === projectMember.project_id && pm.user_id === projectMember.user_id
    );

    if (alreadyExists) {
      return Promise.resolve(null);
    }

    // Crear nueva relación
    const newProjectMember: IProjectMember = {
      ...projectMember,
      id: {
        projectId: projectMember.project_id,
        userId: projectMember.user_id,
      },
    };

    appState.addProjectMember(newProjectMember);

    return new Promise((resolve) => {
      setTimeout(() => resolve(newProjectMember), 300);
    });
  }

  // Eliminar un miembro de un proyecto
  static async removeProjectMember(projectId: number, userId: number): Promise<boolean> {
    const appState = AppState.getInstance();
    const success = appState.deleteProjectMember(projectId, userId);

    return new Promise((resolve) => {
      setTimeout(() => resolve(success), 300);
    });
  }
}

// Mock service para los comentarios
export class MockCommentService {
  // Obtener un comentario por ID
  static async getCommentById(id: number): Promise<IComment | null> {
    const appState = AppState.getInstance();
    const comment = appState.getCommentById(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(comment || null), 300);
    });
  }

  // Obtener comentarios por tarea
  static async getCommentsByTaskId(taskId: number): Promise<IComment[]> {
    const appState = AppState.getInstance();
    const comments = appState.getCommentsByTask(taskId);

    return new Promise((resolve) => {
      setTimeout(() => resolve(comments), 300);
    });
  }

  // Obtener todos los comentarios
  static async getAllComments(): Promise<IComment[]> {
    const appState = AppState.getInstance();
    const comments = appState.getComments();

    return new Promise((resolve) => {
      setTimeout(() => resolve(comments), 300);
    });
  }

  // Crear un nuevo comentario
  static async createComment(
    commentData: Omit<IComment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<IComment | null> {
    const appState = AppState.getInstance();
    const comments = appState.getComments();

    // Generar nuevo ID
    const newId =
      comments.length > 0 ? Math.max(...comments.map((comment) => comment.id || 0)) + 1 : 1;

    const now = new Date().toISOString();
    const newComment: IComment = {
      ...commentData,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    appState.addComment(newComment);

    return new Promise((resolve) => {
      setTimeout(() => resolve(newComment), 300);
    });
  }

  // Actualizar un comentario existente
  static async updateComment(id: number, commentData: Partial<IComment>): Promise<IComment | null> {
    const appState = AppState.getInstance();
    const existingComment = appState.getCommentById(id);

    if (!existingComment) {
      return Promise.resolve(null);
    }

    const updatedComment: IComment = {
      ...existingComment,
      ...commentData,
      updated_at: new Date().toISOString(),
    };

    appState.updateComment(updatedComment);

    return new Promise((resolve) => {
      setTimeout(() => resolve(updatedComment), 300);
    });
  }

  // Eliminar un comentario
  static async deleteComment(id: number): Promise<boolean> {
    const appState = AppState.getInstance();
    const success = appState.deleteComment(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(success), 300);
    });
  }
}

// Mock service para los sprints
export class MockSprintService {
  // Obtener todos los sprints
  static async getSprints(filter?: SprintFilter): Promise<ISprint[]> {
    const appState = AppState.getInstance();
    let sprints = appState.getSprints();

    if (filter) {
      // Aplicar filtros
      if (filter.project_id !== undefined) {
        sprints = sprints.filter((sprint) => sprint.project_id === filter.project_id);
      }

      if (filter.status !== undefined) {
        sprints = sprints.filter((sprint) => sprint.status === filter.status);
      }

      if (filter.active === true) {
        sprints = sprints.filter((sprint) => sprint.status === 1); // Activo
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(sprints), 300);
    });
  }

  // Obtener sprint por ID
  static async getSprintById(id: number): Promise<ISprint | null> {
    const appState = AppState.getInstance();
    const sprint = appState.getSprintById(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(sprint || null), 300);
    });
  }

  // Obtener sprints activos por proyecto
  static async getActiveSprintsByProject(projectId: number): Promise<ISprint[]> {
    const appState = AppState.getInstance();
    const sprints = appState.getActiveSprintsByProject(projectId);

    return new Promise((resolve) => {
      setTimeout(() => resolve(sprints), 300);
    });
  }

  // Crear un nuevo sprint
  static async createSprint(
    sprintData: Omit<ISprint, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ISprint | null> {
    const appState = AppState.getInstance();
    const sprints = appState.getSprints();

    // Generar nuevo ID
    const newId = sprints.length > 0 ? Math.max(...sprints.map((sprint) => sprint.id || 0)) + 1 : 1;

    const now = new Date().toISOString();
    const newSprint: ISprint = {
      ...sprintData,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    appState.addSprint(newSprint);

    return new Promise((resolve) => {
      setTimeout(() => resolve(newSprint), 300);
    });
  }

  // Actualizar un sprint existente
  static async updateSprint(id: number, sprintData: Partial<ISprint>): Promise<ISprint | null> {
    const appState = AppState.getInstance();
    const existingSprint = appState.getSprintById(id);

    if (!existingSprint) {
      return Promise.resolve(null);
    }

    const updatedSprint: ISprint = {
      ...existingSprint,
      ...sprintData,
      updated_at: new Date().toISOString(),
    };

    appState.updateSprint(updatedSprint);

    return new Promise((resolve) => {
      setTimeout(() => resolve(updatedSprint), 300);
    });
  }

  // Eliminar un sprint
  static async deleteSprint(id: number): Promise<boolean> {
    const appState = AppState.getInstance();
    const success = appState.deleteSprint(id);

    return new Promise((resolve) => {
      setTimeout(() => resolve(success), 300);
    });
  }
}
