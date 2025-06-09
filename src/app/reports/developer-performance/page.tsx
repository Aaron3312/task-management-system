// pages/DeveloperPerformancePage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { UserRole, ITask, ISprint, IProject } from '@/core/interfaces/models';
import { TaskService, SprintService, UserService, TaskAssigneeService, ProjectService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useDarkMode } from '@/hooks/useDarkMode';
import { PerformancePDFExporter } from '@/utils/pdfExport';
import { toast } from 'sonner';

// Import our components
import { PerformanceHeader } from '@/components/performance/PerformanceHeader';
import { PerformanceFilters } from '@/components/performance/PerformanceFilters';
import { PerformanceMetrics } from '@/components/performance/PerformanceMetrics';
import { PerformanceCharts } from '@/components/performance/PerformanceCharts';
import { AIAnalysis } from '@/components/performance/AIAnalysis';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DeveloperPerformance {
  sprintId: number;
  sprintName: string;
  developerId: number;
  developerName: string;
  hoursWorked: number;
  tasksCompleted: number;
  tasksAssigned: number;
  efficiency: number;
}

interface ChartData {
  sprint: string;
  [key: string]: string | number;
}

interface Developer {
  id: number;
  username: string;
  full_name?: string;
}

export default function DeveloperPerformancePage() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedSprint, setSelectedSprint] = useState<string>('all');
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all');
  const [performanceData, setPerformanceData] = useState<DeveloperPerformance[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [sprints, setSprints] = useState<ISprint[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [hoursWorkedChartData, setHoursWorkedChartData] = useState<ChartData[]>([]);
  const [tasksCompletedChartData, setTasksCompletedChartData] = useState<ChartData[]>([]);
  const [totalHoursPerSprintData, setTotalHoursPerSprintData] = useState<ChartData[]>([]);
  const [rawTasksData, setRawTasksData] = useState<any[]>([]);
  const [rawAssigneesData, setRawAssigneesData] = useState<any[]>([]);

  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  const developerColors = isDarkMode ? [
    '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', 
    '#3b82f6', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ] : [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', 
    '#3b82f6', '#f97316', '#84cc16', '#06b6d4', '#8b5cf6'
  ];

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data
        const [tasksData, sprintsData, usersData, assigneesData, projectsData] = await Promise.all([
          TaskService.getTasks(),
          SprintService.getSprints(),
          UserService.getUsers(),
          TaskAssigneeService.getTaskAssignees(),
          ProjectService.getProjects()
        ]);

        setProjects(projectsData);
        
        // Set default project if not selected
        const defaultProjectId = projectsData.length > 0 ? projectsData[0].id!.toString() : '';
        if (!selectedProject) {
          setSelectedProject(defaultProjectId);
        }

        // Calculate data for the default or selected project
        const currentProjectId = selectedProject || defaultProjectId;
        calculateProjectData(tasksData, sprintsData, usersData, assigneesData, projectsData, currentProjectId);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        toast.error('Error al cargar los datos de rendimiento');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Recalculate when project changes
  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      fetchData();
    }
  }, [selectedProject]);

  const calculateProjectData = async (tasksData: any, sprintsData: any, usersData: any, assigneesData: any, projectsData: any, projectId: string) => {
    // Calculate performance data - only for selected project
    const performance: DeveloperPerformance[] = [];
    const currentProjectId = parseInt(projectId);
    
    // Store raw data for unique task counting
    setRawTasksData(tasksData);
    setRawAssigneesData(assigneesData);
    
    // Filter sprints by selected project
    const projectSprints = sprintsData.filter((sprint: any) => sprint.project_id === currentProjectId);
    setSprints(projectSprints);

    // Debug: Find the selected project name
    const selectedProjectName = projectsData.find((p: any) => p.id === currentProjectId)?.name || 'Unknown';
    
    console.log('=== DEBUG: Task Count Analysis ===');
    console.log(`Selected Project: ${selectedProjectName} (ID: ${currentProjectId})`);
    console.log(`Project Sprints Found: ${projectSprints.length}`);
    console.log('Project Sprints:', projectSprints.map((s: any) => ({ id: s.id, name: s.name })));

    // Count all tasks in project (through sprints)
    const allProjectTasks = tasksData.filter((task: any) => 
      projectSprints.some((sprint: any) => sprint.id === task.sprint_id)
    );
    console.log(`Total tasks in project (via sprints): ${allProjectTasks.length}`);
    
    // Count completed tasks using TaskStatus.COMPLETED (status === 2)
    const completedTasksByStatus = allProjectTasks.filter((task: any) => task.status === 2);
    console.log(`Tasks with status === 2 (COMPLETED): ${completedTasksByStatus.length}`);
    
    // Count tasks with real_hours > 0 (our current metric)
    const tasksWithRealHours = allProjectTasks.filter((task: any) => task.real_hours > 0);
    console.log(`Tasks with real_hours > 0: ${tasksWithRealHours.length}`);

    for (const sprint of projectSprints) {
      for (const developer of usersData) {
        // Get tasks assigned to this developer in this sprint
        const developerAssignments = assigneesData.filter(
          (assignee: any) => assignee.user_id === developer.id && 
          assignee.task?.sprint_id === sprint.id
        );

        const assignedTasks = developerAssignments.map((a: any) => a.task).filter(Boolean);
        const completedTasks = assignedTasks.filter((task: any) => task.real_hours > 0);

        // Calculate total hours worked
        const hoursWorked = completedTasks.reduce((sum: number, task: any) => {
          const taskAssignees = assigneesData.filter((a: any) => a.task_id === task.id);
          const assigneeCount = taskAssignees.length || 1;
          return sum + ((task.real_hours || 0) / assigneeCount);
        }, 0);

        // Calculate efficiency
        const totalEstimated = completedTasks.reduce((sum: number, task: any) => 
          sum + task.estimated_hours, 0
        );
        
        const efficiency = totalEstimated > 0 && hoursWorked > 0 
          ? (totalEstimated / hoursWorked) * 100 
          : 0;

        performance.push({
          sprintId: sprint.id!,
          sprintName: sprint.name,
          developerId: developer.id!,
          developerName: developer.full_name || developer.username,
          hoursWorked,
          tasksCompleted: completedTasks.length,
          tasksAssigned: assignedTasks.length,
          efficiency
        });
      }
    }

    setPerformanceData(performance);
    
    // Debug: Show final performance calculation
    const totalTasksCompletedDebug = performance.reduce((sum, p) => sum + p.tasksCompleted, 0);
    console.log(`Final calculated completed tasks count: ${totalTasksCompletedDebug}`);
    
    console.log('Performance breakdown by developer:');
    const performanceByDev = performance.reduce((acc: any, p) => {
      if (!acc[p.developerName]) {
        acc[p.developerName] = { totalTasks: 0, sprints: [] };
      }
      acc[p.developerName].totalTasks += p.tasksCompleted;
      acc[p.developerName].sprints.push({
        sprint: p.sprintName,
        tasks: p.tasksCompleted
      });
      return acc;
    }, {});
    
    Object.entries(performanceByDev).forEach(([devName, data]: [string, any]) => {
      console.log(`${devName}: ${data.totalTasks} tasks`);
      data.sprints.forEach((s: any) => console.log(`  - ${s.sprint}: ${s.tasks} tasks`));
    });
    console.log('=== END DEBUG ===');
    
    // Filter developers with actual data
    const developersWithData = usersData.filter((dev: any) => 
      performance.some(p => p.developerId === dev.id && (p.hoursWorked > 0 || p.tasksCompleted > 0))
    );
    setDevelopers(developersWithData);

    prepareChartData(performance, sprintsData, developersWithData);
  };

  const fetchData = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    try {
      // Fetch all required data
      const [tasksData, sprintsData, usersData, assigneesData] = await Promise.all([
        TaskService.getTasks(),
        SprintService.getSprints(),
        UserService.getUsers(),
        TaskAssigneeService.getTaskAssignees()
      ]);

      await calculateProjectData(tasksData, sprintsData, usersData, assigneesData, projects, selectedProject);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Error al cargar los datos de rendimiento');
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (
    performance: DeveloperPerformance[],
    sprintsData: ISprint[],
    developersData: Developer[]
  ) => {
    // Filter sprints by selected project first
    const currentProjectId = selectedProject ? parseInt(selectedProject) : projects[0]?.id;
    const projectSprints = sprintsData.filter(sprint => sprint.project_id === currentProjectId);
    
    // Filter based on current selections
    const filteredSprints = selectedSprint === 'all' 
      ? projectSprints 
      : projectSprints.filter(s => s.id === parseInt(selectedSprint));
    
    const filteredDevelopers = selectedDeveloper === 'all'
      ? developersData
      : developersData.filter(d => d.id === parseInt(selectedDeveloper));

    const filteredPerformance = performance.filter(p => 
      (selectedSprint === 'all' || p.sprintId === parseInt(selectedSprint)) &&
      (selectedDeveloper === 'all' || p.developerId === parseInt(selectedDeveloper))
    );

    // 1. Total hours per sprint
    const totalHoursData: ChartData[] = filteredSprints.map(sprint => {
      const sprintPerf = filteredPerformance.filter(p => p.sprintId === sprint.id);
      return {
        sprint: sprint.name,
        totalHours: sprintPerf.reduce((sum, p) => sum + p.hoursWorked, 0)
      };
    });
    setTotalHoursPerSprintData(totalHoursData);

    // 2. Hours worked by developer per sprint
    const hoursData: ChartData[] = filteredSprints.map(sprint => {
      const sprintData: ChartData = { sprint: sprint.name };
      
      filteredDevelopers.forEach(dev => {
        const devPerf = filteredPerformance.find(
          p => p.sprintId === sprint.id && p.developerId === dev.id
        );
        sprintData[dev.username] = devPerf ? devPerf.hoursWorked : 0;
      });
      
      return sprintData;
    });
    setHoursWorkedChartData(hoursData);

    // 3. Tasks completed by developer per sprint
    const tasksData: ChartData[] = filteredSprints.map(sprint => {
      const sprintData: ChartData = { sprint: sprint.name };
      
      filteredDevelopers.forEach(dev => {
        const devPerf = filteredPerformance.find(
          p => p.sprintId === sprint.id && p.developerId === dev.id
        );
        sprintData[dev.username] = devPerf ? devPerf.tasksCompleted : 0;
      });
      
      return sprintData;
    });
    setTasksCompletedChartData(tasksData);
  };

  // Re-prepare chart data when filters change
  useEffect(() => {
    if (performanceData.length > 0) {
      prepareChartData(performanceData, sprints, developers);
    }
  }, [selectedSprint, selectedDeveloper]);

  // Calculate filtered totals for metrics
  const filteredPerformance = performanceData.filter(p => 
    (selectedSprint === 'all' || p.sprintId === parseInt(selectedSprint)) &&
    (selectedDeveloper === 'all' || p.developerId === parseInt(selectedDeveloper))
  );

  // FIX: Count unique completed tasks instead of summing per developer to avoid double counting
  const totalTasksCompleted = React.useMemo(() => {
    if (rawTasksData.length === 0 || rawAssigneesData.length === 0) {
      return 0;
    }

    // Get current project ID
    const currentProjectId = selectedProject ? parseInt(selectedProject) : null;
    if (!currentProjectId) return 0;

    // Filter sprints by current project
    const projectSprints = sprints.filter(sprint => sprint.project_id === currentProjectId);
    const projectSprintIds = projectSprints.map(s => s.id);

    // Get all tasks in the current project
    const projectTasks = rawTasksData.filter(task => 
      projectSprintIds.includes(task.sprint_id)
    );

    // Apply sprint filter if not 'all'
    let filteredTasks = projectTasks;
    if (selectedSprint !== 'all') {
      const sprintId = parseInt(selectedSprint);
      filteredTasks = projectTasks.filter(task => task.sprint_id === sprintId);
    }

    // Apply developer filter if not 'all'
    if (selectedDeveloper !== 'all') {
      const developerId = parseInt(selectedDeveloper);
      const developerTaskIds = rawAssigneesData
        .filter(assignee => assignee.user_id === developerId)
        .map(assignee => assignee.task_id);
      
      filteredTasks = filteredTasks.filter(task => 
        developerTaskIds.includes(task.id)
      );
    }

    // Count unique tasks with real_hours > 0 (our "completed" criteria)
    const uniqueCompletedTasks = filteredTasks.filter(task => task.real_hours > 0);
    
    console.log(`FIXED - Unique completed tasks count: ${uniqueCompletedTasks.length}`);
    return uniqueCompletedTasks.length;
  }, [rawTasksData, rawAssigneesData, selectedProject, selectedSprint, selectedDeveloper, sprints]);
  const totalHoursWorked = filteredPerformance.reduce((sum, p) => sum + p.hoursWorked, 0);

  const activeDevelopers = selectedDeveloper === 'all' 
    ? [...new Set(filteredPerformance.map(p => p.developerId))].length
    : 1;

  const activeSprints = selectedSprint === 'all'
    ? [...new Set(filteredPerformance.map(p => p.sprintId))].length
    : 1;

  // Calculate average efficiency for AI analysis
  const averageEfficiency = filteredPerformance.length > 0
    ? filteredPerformance.reduce((sum, p) => sum + p.efficiency, 0) / filteredPerformance.length
    : 0;

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    toast.loading('Generando reporte PDF con análisis IA...');

    try {
      // Validate data before export
      if (filteredPerformance.length === 0) {
        throw new Error('No hay datos disponibles para exportar con los filtros seleccionados');
      }

      // Prepare export data
      const exportData = {
        performanceData: filteredPerformance,
        totalHoursPerSprintData,
        hoursWorkedChartData,
        tasksCompletedChartData,
        developers,
        selectedSprint,
        selectedDeveloper,
        totalTasksCompleted,
        totalHoursWorked,
        activeDevelopers,
        activeSprints,
        sprints // Add sprints data for real date ranges
      };

      // Create PDF exporter and generate report with AI
      const exporter = new PerformancePDFExporter();
      await exporter.exportPerformanceReport(exportData);

      toast.dismiss();
      toast.success('Reporte PDF con análisis IA generado exitosamente');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Error al generar el reporte PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 transition-colors duration-300">
          
          {/* Header Component */}
          <PerformanceHeader 
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onExport={handleExport}
            isExporting={isExporting}
          />

          <div className="px-6 space-y-8">
            {/* Filters Component */}
            <PerformanceFilters
              selectedProject={selectedProject}
              selectedSprint={selectedSprint}
              selectedDeveloper={selectedDeveloper}
              projects={projects}
              sprints={sprints}
              developers={developers}
              onProjectChange={setSelectedProject}
              onSprintChange={setSelectedSprint}
              onDeveloperChange={setSelectedDeveloper}
            />

            {/* Metrics Component */}
            <PerformanceMetrics
              activeDevelopers={activeDevelopers}
              activeSprints={activeSprints}
              totalTasksCompleted={totalTasksCompleted}
              totalHoursWorked={totalHoursWorked}
            />

            {/* Loading or Charts */}
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <PerformanceCharts
                  totalHoursPerSprintData={totalHoursPerSprintData}
                  hoursWorkedChartData={hoursWorkedChartData}
                  tasksCompletedChartData={tasksCompletedChartData}
                  developers={developers}
                  selectedDeveloper={selectedDeveloper}
                  isDarkMode={isDarkMode}
                  developerColors={developerColors}
                  performanceData={performanceData}
                  selectedSprint={selectedSprint}
                />
                
                {/* AI Analysis Component */}
                <AIAnalysis
                  performanceData={filteredPerformance}
                  sprints={sprints}
                  developers={developers}
                  totalHours={totalHoursWorked}
                  totalTasks={totalTasksCompleted}
                  averageEfficiency={averageEfficiency}
                />
              </>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}