// src/services/api/index.ts
// Archivo de exportación principal - Ahora usando servicios MOCK
import {
  MockTaskService,
  MockProjectService,
  MockSprintService,
  MockUserService
} from '../mockService';

// Exportar servicios mock con los mismos nombres
export const TaskService = MockTaskService;
export const ProjectService = MockProjectService;
export const SprintService = MockSprintService;
export const UserService = MockUserService;

// Servicios mock stub para compatibilidad
export const ProjectMemberService = {
  getProjectMembersByProject: async () => [],
  addProjectMember: async () => null,
  removeProjectMember: async () => false,
};

export const CommentService = {
  getCommentsByTask: async () => [],
  createComment: async () => null,
};

export const SubtaskService = {
  getSubtasksByTask: async () => [],
  createSubtask: async () => null,
};

export const TaskAssigneeService = {
  getAssigneesByTask: async () => [],
  assignTask: async () => null,
};

export const WorkLogService = {
  getWorkLogsByTask: async () => [],
  createWorkLog: async () => null,
};