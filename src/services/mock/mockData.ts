import { 
    ITask, 
    ISubtask, 
    IProject, 
    IUser, 
    IProjectMember, 
    IComment, 
    ISprint,
    TaskStatus,
    ProjectStatus,
    UserRole,
    WorkMode,
    SprintStatus
  } from '../../core/interfaces/models';
  
  // Usuarios mock
  export const mockUsers: IUser[] = [
    {
      id: 1,
      username: "john.doe",
      email: "john.doe@example.com",
      full_name: "John Doe",
      role: UserRole.MANAGER,
      work_mode: WorkMode.HYBRID,
      created_at: "2024-03-01T09:00:00Z",
      updated_at: "2024-03-01T09:00:00Z"
    },
    {
      id: 2,
      username: "jane.smith",
      email: "jane.smith@example.com",
      full_name: "Jane Smith",
      role: UserRole.DEVELOPER,
      work_mode: WorkMode.REMOTE,
      created_at: "2024-03-01T10:00:00Z",
      updated_at: "2024-03-01T10:00:00Z"
    },
    {
      id: 3,
      username: "bob.johnson",
      email: "bob.johnson@example.com",
      full_name: "Bob Johnson",
      role: UserRole.TESTER,
      work_mode: WorkMode.OFFICE,
      created_at: "2024-03-01T11:00:00Z",
      updated_at: "2024-03-01T11:00:00Z"
    }
  ];
  
  // Proyectos mock
  export const mockProjects: IProject[] = [
    {
      id: 1,
      name: "Project Management System",
      description: "Develop a Jira-like project management system",
      start_date: "2024-03-01T00:00:00Z",
      end_date: "2024-05-31T23:59:59Z",
      status: ProjectStatus.ACTIVE,
      created_at: "2024-03-01T08:00:00Z",
      updated_at: "2024-03-01T08:00:00Z"
    },
    {
      id: 2,
      name: "E-commerce Platform",
      description: "Build an online shopping platform",
      start_date: "2024-04-01T00:00:00Z",
      end_date: "2024-07-31T23:59:59Z",
      status: ProjectStatus.PLANNING,
      created_at: "2024-03-15T08:00:00Z",
      updated_at: "2024-03-15T08:00:00Z"
    },
    {
      id: 3,
      name: "Mobile App Redesign",
      description: "Redesign the mobile app UI/UX",
      start_date: "2024-02-01T00:00:00Z",
      end_date: "2024-03-15T23:59:59Z",
      status: ProjectStatus.COMPLETED,
      created_at: "2024-01-20T08:00:00Z",
      updated_at: "2024-03-16T10:00:00Z"
    }
  ];
  
  // Sprints mock
  export const mockSprints: ISprint[] = [
    {
      id: 1,
      name: "Sprint 1: Core Features",
      description: "Implement core features of the project management system",
      start_date: "2024-03-01T00:00:00Z",
      end_date: "2024-03-14T23:59:59Z",
      status: SprintStatus.COMPLETED,
      project_id: 1,
      created_at: "2024-02-25T10:00:00Z",
      updated_at: "2024-03-15T09:00:00Z"
    },
    {
      id: 2,
      name: "Sprint 2: UI Implementation",
      description: "Implement the user interface for the project management system",
      start_date: "2024-03-15T00:00:00Z",
      end_date: "2024-03-28T23:59:59Z",
      status: SprintStatus.ACTIVE,
      project_id: 1,
      created_at: "2024-03-10T11:00:00Z",
      updated_at: "2024-03-15T10:00:00Z"
    },
    {
      id: 3,
      name: "Sprint 3: Advanced Features",
      description: "Implement advanced features of the project management system",
      start_date: "2024-03-29T00:00:00Z",
      end_date: "2024-04-11T23:59:59Z",
      status: SprintStatus.PLANNING,
      project_id: 1,
      created_at: "2024-03-20T14:00:00Z",
      updated_at: "2024-03-20T14:00:00Z"
    },
    {
      id: 4,
      name: "Sprint 1: Planning",
      description: "Planning phase for the e-commerce platform",
      start_date: "2024-04-01T00:00:00Z",
      end_date: "2024-04-14T23:59:59Z",
      status: SprintStatus.PLANNING,
      project_id: 2,
      created_at: "2024-03-25T09:00:00Z",
      updated_at: "2024-03-25T09:00:00Z"
    }
  ];
  
  // Tareas mock
  export const mockTasks: ITask[] = [
    {
      id: 1,
      title: "Design Database Schema",
      description: "Create the database schema for the project management system",
      created_at: "2024-03-02T09:00:00Z",
      updated_at: "2024-03-02T09:00:00Z",
      due_date: "2024-03-07T17:00:00Z",
      priority: 3,
      status: TaskStatus.COMPLETED,
      estimated_hours: 8,
      project_id: 1,
      sprint_id: 1
    },
    {
      id: 2,
      title: "Implement User Authentication",
      description: "Create user authentication system with JWT",
      created_at: "2024-03-03T10:00:00Z",
      updated_at: "2024-03-10T15:30:00Z",
      due_date: "2024-03-12T17:00:00Z",
      priority: 3,
      status: TaskStatus.COMPLETED,
      estimated_hours: 16,
      project_id: 1,
      sprint_id: 1,
      subtasks: [
        {
          id: 1,
          title: "Create Login Form",
          description: "Design and implement the login form",
          created_at: "2024-03-03T10:30:00Z",
          updated_at: "2024-03-05T11:00:00Z",
          status: TaskStatus.COMPLETED,
          task_id: 2
        },
        {
          id: 2,
          title: "Implement JWT Authentication",
          description: "Add JWT authentication middleware",
          created_at: "2024-03-03T10:35:00Z",
          updated_at: "2024-03-08T14:00:00Z",
          status: TaskStatus.COMPLETED,
          task_id: 2
        },
        {
          id: 3,
          title: "Create Registration Form",
          description: "Design and implement the registration form",
          created_at: "2024-03-03T10:40:00Z",
          updated_at: "2024-03-10T15:30:00Z",
          status: TaskStatus.COMPLETED,
          task_id: 2
        }
      ]
    },
    {
      id: 3,
      title: "Create Task Management UI",
      description: "Design and implement task management interface",
      created_at: "2024-03-15T09:00:00Z",
      updated_at: "2024-03-20T16:45:00Z",
      due_date: "2024-03-25T17:00:00Z",
      priority: 2,
      status: TaskStatus.IN_PROGRESS,
      estimated_hours: 24,
      project_id: 1,
      sprint_id: 2,
      subtasks: [
        {
          id: 4,
          title: "Design Task List View",
          description: "Create wireframes for task list view",
          created_at: "2024-03-15T09:30:00Z",
          updated_at: "2024-03-18T11:00:00Z",
          status: TaskStatus.COMPLETED,
          task_id: 3
        },
        {
          id: 5,
          title: "Implement Task List Component",
          description: "Create React component for task list",
          created_at: "2024-03-15T09:35:00Z",
          updated_at: "2024-03-20T16:45:00Z",
          status: TaskStatus.IN_PROGRESS,
          task_id: 3
        },
        {
          id: 6,
          title: "Design Task Detail View",
          description: "Create wireframes for task detail view",
          created_at: "2024-03-15T09:40:00Z",
          updated_at: "2024-03-19T14:00:00Z",
          status: TaskStatus.COMPLETED,
          task_id: 3
        },
        {
          id: 7,
          title: "Implement Task Detail Component",
          description: "Create React component for task details",
          created_at: "2024-03-15T09:45:00Z",
          updated_at: "2024-03-15T09:45:00Z",
          status: TaskStatus.TODO,
          task_id: 3
        }
      ]
    },
    {
      id: 4,
      title: "Implement Drag and Drop",
      description: "Add drag and drop functionality for task management",
      created_at: "2024-03-16T10:00:00Z",
      updated_at: "2024-03-16T10:00:00Z",
      due_date: "2024-03-27T17:00:00Z",
      priority: 2,
      status: TaskStatus.TODO,
      estimated_hours: 12,
      project_id: 1,
      sprint_id: 2
    },
    {
      id: 5,
      title: "Setup Project Structure",
      description: "Set up initial project structure for e-commerce platform",
      created_at: "2024-03-20T09:00:00Z",
      updated_at: "2024-03-20T09:00:00Z",
      due_date: "2024-04-05T17:00:00Z",
      priority: 3,
      status: TaskStatus.TODO,
      estimated_hours: 6,
      project_id: 2,
      sprint_id: 4
    }
  ];
  
  // Subtareas mock (aquellas que no están dentro de tareas)
  export const mockSubtasks: ISubtask[] = [
    {
      id: 8,
      title: "Add Error Handling",
      description: "Implement error handling for authentication",
      created_at: "2024-03-05T09:00:00Z",
      updated_at: "2024-03-05T09:00:00Z",
      status: TaskStatus.TODO,
      task_id: 2
    },
    {
      id: 9,
      title: "Write Documentation",
      description: "Document the authentication process",
      created_at: "2024-03-05T09:05:00Z",
      updated_at: "2024-03-05T09:05:00Z",
      status: TaskStatus.TODO,
      task_id: 2
    }
  ];
  
  // Miembros de proyecto mock
  export const mockProjectMembers: IProjectMember[] = [
    {
      id: { projectId: 1, userId: 1 },
      project_id: 1,
      user_id: 1
    },
    {
      id: { projectId: 1, userId: 2 },
      project_id: 1,
      user_id: 2
    },
    {
      id: { projectId: 1, userId: 3 },
      project_id: 1,
      user_id: 3
    },
    {
      id: { projectId: 2, userId: 1 },
      project_id: 2,
      user_id: 1
    },
    {
      id: { projectId: 2, userId: 2 },
      project_id: 2,
      user_id: 2
    },
    {
      id: { projectId: 3, userId: 3 },
      project_id: 3,
      user_id: 3
    }
  ];
  
  // Comentarios mock
  export const mockComments: IComment[] = [
    {
      id: 1,
      content: "Database schema looks good, but we should add indexes to improve performance.",
      task_id: 1,
      user_id: 1,
      created_at: "2024-03-02T14:30:00Z",
      updated_at: "2024-03-02T14:30:00Z"
    },
    {
      id: 2,
      content: "I've started working on the login form. Should be done by tomorrow.",
      task_id: 2,
      user_id: 2,
      created_at: "2024-03-04T10:15:00Z",
      updated_at: "2024-03-04T10:15:00Z"
    },
    {
      id: 3,
      content: "Login form is ready for review.",
      task_id: 2,
      user_id: 2,
      created_at: "2024-03-05T09:45:00Z",
      updated_at: "2024-03-05T09:45:00Z"
    },
    {
      id: 4,
      content: "Looks good! Approved.",
      task_id: 2,
      user_id: 1,
      created_at: "2024-03-05T11:00:00Z",
      updated_at: "2024-03-05T11:00:00Z"
    },
    {
      id: 5,
      content: "I'm having issues with the task list component. Can someone help?",
      task_id: 3,
      user_id: 2,
      created_at: "2024-03-19T15:30:00Z",
      updated_at: "2024-03-19T15:30:00Z"
    },
    {
      id: 6,
      content: "What issues are you experiencing? Let's discuss in a meeting tomorrow.",
      task_id: 3,
      user_id: 1,
      created_at: "2024-03-19T16:00:00Z",
      updated_at: "2024-03-19T16:00:00Z"
    }
  ];