// src/services/mockService.ts
import mockData from '@/data/mockData.json';
import { ITask, IProject, ISprint, IUser, TaskStatus, ProjectStatus } from '@/core/interfaces/models';

// Simular delay de red
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Estado local para simular base de datos
let localData = {
  tasks: [...mockData.tasks] as ITask[],
  projects: [...mockData.projects] as IProject[],
  sprints: [...mockData.sprints] as ISprint[],
  users: [...mockData.users] as IUser[],
};

// Resetear datos a valores iniciales
export const resetMockData = () => {
  localData = {
    tasks: [...mockData.tasks] as ITask[],
    projects: [...mockData.projects] as IProject[],
    sprints: [...mockData.sprints] as ISprint[],
    users: [...mockData.users] as IUser[],
  };
};

// ============= TASK SERVICES =============
export const MockTaskService = {
  async getTasks(filters?: { status?: TaskStatus; project_id?: number; sprint_id?: number }): Promise<ITask[]> {
    await delay();
    let tasks = [...localData.tasks];

    if (filters?.status !== undefined) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters?.project_id !== undefined) {
      tasks = tasks.filter(t => t.project_id === filters.project_id);
    }
    if (filters?.sprint_id !== undefined) {
      tasks = tasks.filter(t => t.sprint_id === filters.sprint_id);
    }

    return tasks;
  },

  async getTaskById(id: number): Promise<ITask | null> {
    await delay();
    return localData.tasks.find(t => t.id === id) || null;
  },

  async createTask(taskData: Partial<ITask>): Promise<ITask> {
    await delay();
    const newTask: ITask = {
      id: Math.max(...localData.tasks.map(t => t.id || 0)) + 1,
      title: taskData.title || '',
      description: taskData.description || '',
      project_id: taskData.project_id,
      sprint_id: taskData.sprint_id,
      assigned_to: taskData.assigned_to,
      status: taskData.status || TaskStatus.TODO,
      priority: taskData.priority || 'MEDIUM',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: taskData.due_date,
      estimated_hours: taskData.estimated_hours || 0,
    };
    localData.tasks.push(newTask);
    return newTask;
  },

  async updateTask(id: number, taskData: Partial<ITask>): Promise<ITask | null> {
    await delay();
    const index = localData.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    localData.tasks[index] = {
      ...localData.tasks[index],
      ...taskData,
      updated_at: new Date().toISOString(),
    };
    return localData.tasks[index];
  },

  async deleteTask(id: number): Promise<boolean> {
    await delay();
    const index = localData.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;

    localData.tasks.splice(index, 1);
    return true;
  },
};

// ============= PROJECT SERVICES =============
export const MockProjectService = {
  async getProjects(filters?: { status?: ProjectStatus }): Promise<IProject[]> {
    await delay();
    let projects = [...localData.projects];

    if (filters?.status !== undefined) {
      projects = projects.filter(p => p.status === filters.status);
    }

    return projects;
  },

  async getProjectById(id: number): Promise<IProject | null> {
    await delay();
    return localData.projects.find(p => p.id === id) || null;
  },

  async createProject(projectData: Partial<IProject>): Promise<IProject> {
    await delay();
    const newProject: IProject = {
      id: Math.max(...localData.projects.map(p => p.id || 0)) + 1,
      name: projectData.name || '',
      description: projectData.description || '',
      start_date: projectData.start_date || new Date().toISOString(),
      end_date: projectData.end_date || new Date().toISOString(),
      status: projectData.status || ProjectStatus.ACTIVE,
      created_at: new Date().toISOString(),
    };
    localData.projects.push(newProject);
    return newProject;
  },

  async updateProject(id: number, projectData: Partial<IProject>): Promise<IProject | null> {
    await delay();
    const index = localData.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    localData.projects[index] = {
      ...localData.projects[index],
      ...projectData,
    };
    return localData.projects[index];
  },

  async deleteProject(id: number): Promise<boolean> {
    await delay();
    const index = localData.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    localData.projects.splice(index, 1);
    return true;
  },
};

// ============= SPRINT SERVICES =============
export const MockSprintService = {
  async getSprints(filters?: { status?: number; project_id?: number }): Promise<ISprint[]> {
    await delay();
    let sprints = [...localData.sprints];

    if (filters?.status !== undefined) {
      sprints = sprints.filter(s => s.status === filters.status);
    }
    if (filters?.project_id !== undefined) {
      sprints = sprints.filter(s => s.project_id === filters.project_id);
    }

    return sprints;
  },

  async getSprintById(id: number): Promise<ISprint | null> {
    await delay();
    return localData.sprints.find(s => s.id === id) || null;
  },

  async createSprint(sprintData: Partial<ISprint>): Promise<ISprint> {
    await delay();
    const newSprint: ISprint = {
      id: Math.max(...localData.sprints.map(s => s.id || 0)) + 1,
      name: sprintData.name || '',
      project_id: sprintData.project_id,
      start_date: sprintData.start_date || new Date().toISOString(),
      end_date: sprintData.end_date || new Date().toISOString(),
      status: sprintData.status || 1,
      goal: sprintData.goal || '',
    };
    localData.sprints.push(newSprint);
    return newSprint;
  },

  async updateSprint(id: number, sprintData: Partial<ISprint>): Promise<ISprint | null> {
    await delay();
    const index = localData.sprints.findIndex(s => s.id === id);
    if (index === -1) return null;

    localData.sprints[index] = {
      ...localData.sprints[index],
      ...sprintData,
    };
    return localData.sprints[index];
  },

  async deleteSprint(id: number): Promise<boolean> {
    await delay();
    const index = localData.sprints.findIndex(s => s.id === id);
    if (index === -1) return false;

    localData.sprints.splice(index, 1);
    return true;
  },
};

// ============= USER SERVICES =============
export const MockUserService = {
  async getUsers(): Promise<IUser[]> {
    await delay();
    return [...localData.users];
  },

  async getUserById(id: number): Promise<IUser | null> {
    await delay();
    return localData.users.find(u => u.id === id) || null;
  },

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    await delay();
    const newUser: IUser = {
      id: Math.max(...localData.users.map(u => u.id || 0)) + 1,
      username: userData.username || '',
      email: userData.email || '',
      full_name: userData.full_name || '',
      role: userData.role || 'DEVELOPER',
      work_mode: userData.work_mode || 'REMOTO',
      created_at: new Date().toISOString(),
    };
    localData.users.push(newUser);
    return newUser;
  },

  async updateUser(id: number, userData: Partial<IUser>): Promise<IUser | null> {
    await delay();
    const index = localData.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    localData.users[index] = {
      ...localData.users[index],
      ...userData,
    };
    return localData.users[index];
  },

  async deleteUser(id: number): Promise<boolean> {
    await delay();
    const index = localData.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    localData.users.splice(index, 1);
    return true;
  },
};

// Exportar todos los servicios mock
export const MockServices = {
  TaskService: MockTaskService,
  ProjectService: MockProjectService,
  SprintService: MockSprintService,
  UserService: MockUserService,
};

export default MockServices;
