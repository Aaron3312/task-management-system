// src/utils/pdfExport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProjectReportData {
  projectName: string;
  status: string;
  startDate: string;
  endDate: string;
  taskCount: number;
  completedTaskCount: number;
  completionRate: number;
  sprintCount: number;
  memberCount: number;
  riskLevel: string;
  daysRemaining?: number;
  description?: string;
}

interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;
  onHoldProjects: number;
  avgCompletionRate: number;
  projectsAtRisk: number;
  delayedProjects: number;
}

interface TaskReportData {
  id: number;
  title: string;
  description?: string;
  projectName?: string;
  status: number;
  priority: number;
  dueDate: string;
  estimatedHours: number;
  realHours?: number;
  efficiency?: number;
  daysUntilDue?: number;
  isOverdue?: boolean;
}

interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  completionRate: number;
}

interface TimeKPIs {
  averageEfficiency: number;
  onTimeDelivery: number;
  totalHoursEstimated: number;
  totalHoursReal: number;
  productivityIndex: number;
  tasksWithTimeData: number;
  timeOverruns: number;
  averageTimeVariance: number;
}

interface SprintReportData {
  id: number;
  name: string;
  description?: string;
  projectName?: string;
  status: number;
  startDate: string;
  endDate: string;
  daysRemaining?: number;
  completionRate?: number;
  taskCount?: number;
  completedTaskCount?: number;
  velocity?: number;
  avgTasksPerDay?: number;
  predictedCompletion?: number;
}

interface SprintMetrics {
  activeSprints: number;
  completedSprints: number;
  planningSprints: number;
  avgVelocity: number;
  avgCompletionRate: number;
  avgTasksPerSprint: number;
  sprintsAtRisk: number;
}

export class PDFExportService {
  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private static getStatusText(status: string): string {
    switch (status) {
      case '0': return 'Planificación';
      case '1': return 'Activo';
      case '2': return 'Completado';
      case '3': return 'En Pausa';
      default: return 'Desconocido';
    }
  }

  private static getRiskText(risk: string): string {
    switch (risk) {
      case 'low': return 'Bajo';
      case 'medium': return 'Medio';
      case 'high': return 'Alto';
      default: return 'Desconocido';
    }
  }

  private static getTaskStatusText(status: number): string {
    switch (status) {
      case 0: return 'Por hacer';
      case 1: return 'En progreso';
      case 2: return 'Completado';
      case 3: return 'Bloqueado';
      default: return 'Desconocido';
    }
  }

  private static getTaskPriorityText(priority: number): string {
    switch (priority) {
      case 1: return 'Baja';
      case 2: return 'Media';
      case 3: return 'Alta';
      case 4: return 'Crítica';
      default: return 'Desconocida';
    }
  }

  private static formatDueDate(task: TaskReportData): string {
    if (task.status === 2) return 'Completada';
    if (task.isOverdue) return `Vencida (${Math.abs(task.daysUntilDue || 0)} días)`;
    return `${task.daysUntilDue || 0} días`;
  }

  private static getSprintStatusText(status: number): string {
    switch (status) {
      case 0: return 'Planificación';
      case 1: return 'Activo';
      case 2: return 'Completado';
      default: return 'Desconocido';
    }
  }

  private static formatSprintPeriod(startDate: string, endDate: string): string {
    return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
  }

  private static formatDaysRemaining(sprint: SprintReportData): string {
    if (sprint.status === 2) return 'Completado';
    if (sprint.daysRemaining !== undefined) {
      if (sprint.daysRemaining > 0) return `${sprint.daysRemaining} días restantes`;
      if (sprint.daysRemaining === 0) return 'Vence hoy';
      return `Vencido (${Math.abs(sprint.daysRemaining)} días)`;
    }
    return 'N/A';
  }

  static exportProjectsReport(
    projects: ProjectReportData[], 
    metrics: ProjectMetrics,
    fileName: string = 'informe-proyectos.pdf'
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Configurar fuentes
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Informe de Proyectos', pageWidth / 2, 25, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado el: ${currentDate}`, pageWidth / 2, 35, { align: 'center' });
    
    // Métricas generales
    let yPosition = 50;
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Resumen Ejecutivo', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const metricsText = [
      `• Total de proyectos: ${metrics.totalProjects}`,
      `• Proyectos activos: ${metrics.activeProjects}`,
      `• Proyectos completados: ${metrics.completedProjects}`,
      `• Proyectos en planificación: ${metrics.planningProjects}`,
      `• Proyectos en pausa: ${metrics.onHoldProjects}`,
      `• Tasa de completado promedio: ${metrics.avgCompletionRate}%`,
      `• Proyectos en riesgo: ${metrics.projectsAtRisk}`,
      `• Proyectos retrasados: ${metrics.delayedProjects}`
    ];
    
    metricsText.forEach((text, index) => {
      doc.text(text, 25, yPosition + (index * 6));
    });
    
    yPosition += (metricsText.length * 6) + 15;
    
    // Verificar si necesitamos una nueva página
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Tabla de proyectos
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Detalle de Proyectos', 20, yPosition);
    
    yPosition += 10;
    
    // Preparar datos para la tabla
    const tableData = projects.map(project => [
      project.projectName,
      this.getStatusText(project.status),
      `${this.formatDate(project.startDate)} - ${this.formatDate(project.endDate)}`,
      `${project.completedTaskCount}/${project.taskCount}`,
      `${project.completionRate}%`,
      `${project.sprintCount}`,
      `${project.memberCount}`,
      this.getRiskText(project.riskLevel),
      project.daysRemaining !== undefined ? 
        (project.daysRemaining > 0 ? `${project.daysRemaining} días` : 'Vencido') : 
        'N/A'
    ]);
    
    // Crear tabla con autoTable
    autoTable(doc, {
      startY: yPosition,
      head: [[
        'Proyecto', 
        'Estado', 
        'Período', 
        'Tareas', 
        'Progreso', 
        'Sprints', 
        'Equipo', 
        'Riesgo',
        'Tiempo Rest.'
      ]],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Proyecto
        1: { cellWidth: 20 }, // Estado
        2: { cellWidth: 35 }, // Período
        3: { cellWidth: 20 }, // Tareas
        4: { cellWidth: 15 }, // Progreso
        5: { cellWidth: 15 }, // Sprints
        6: { cellWidth: 15 }, // Equipo
        7: { cellWidth: 15 }, // Riesgo
        8: { cellWidth: 20 }  // Tiempo Restante
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Footer en cada página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${data.pageNumber}`, 
          pageWidth / 2, 
          pageHeight - 10, 
          { align: 'center' }
        );
      }
    });
    
    // Agregar página de detalles si hay espacio o crear nueva página
    const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
    
    if (finalY > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = finalY + 20;
    }
    
    // Sección de análisis de riesgo
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Análisis de Riesgo', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const highRiskProjects = projects.filter(p => p.riskLevel === 'high');
    const mediumRiskProjects = projects.filter(p => p.riskLevel === 'medium');
    
    if (highRiskProjects.length > 0) {
      doc.setTextColor(220, 53, 69); // Rojo
      doc.text('Proyectos de Alto Riesgo:', 25, yPosition);
      yPosition += 8;
      
      highRiskProjects.forEach(project => {
        doc.setTextColor(60, 60, 60);
        doc.text(`• ${project.projectName} - ${project.completionRate}% completado`, 30, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }
    
    if (mediumRiskProjects.length > 0) {
      doc.setTextColor(255, 193, 7); // Amarillo
      doc.text('Proyectos de Riesgo Medio:', 25, yPosition);
      yPosition += 8;
      
      mediumRiskProjects.forEach(project => {
        doc.setTextColor(60, 60, 60);
        doc.text(`• ${project.projectName} - ${project.completionRate}% completado`, 30, yPosition);
        yPosition += 6;
      });
    }
    
    // Descargar el PDF
    doc.save(fileName);
  }

  static exportTasksReport(
    tasks: TaskReportData[],
    statistics: TaskStatistics,
    timeKPIs: TimeKPIs,
    fileName: string = 'informe-tareas.pdf'
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Configurar fuentes
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Informe de Tareas', pageWidth / 2, 25, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado el: ${currentDate}`, pageWidth / 2, 35, { align: 'center' });
    
    // Estadísticas generales
    let yPosition = 50;
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Estadísticas Generales', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const statsText = [
      `• Total de tareas: ${statistics.totalTasks}`,
      `• Tareas completadas: ${statistics.completedTasks}`,
      `• Tareas pendientes: ${statistics.pendingTasks}`,
      `• Tareas bloqueadas: ${statistics.blockedTasks}`,
      `• Tareas vencidas: ${statistics.overdueTasks}`,
      `• Tareas que vencen pronto: ${statistics.dueSoonTasks}`,
      `• Tasa de completado: ${statistics.completionRate}%`
    ];
    
    statsText.forEach((text, index) => {
      doc.text(text, 25, yPosition + (index * 6));
    });
    
    yPosition += (statsText.length * 6) + 15;
    
    // KPIs de Tiempo y Productividad
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('KPIs de Tiempo y Productividad', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const kpiText = [
      `• Eficiencia promedio: ${timeKPIs.averageEfficiency.toFixed(1)}%`,
      `• Entrega a tiempo: ${timeKPIs.onTimeDelivery.toFixed(1)}%`,
      `• Horas estimadas totales: ${timeKPIs.totalHoursEstimated}h`,
      `• Horas reales totales: ${timeKPIs.totalHoursReal}h`,
      `• Índice de productividad: ${timeKPIs.productivityIndex.toFixed(1)}%`,
      `• Tareas con datos de tiempo: ${timeKPIs.tasksWithTimeData}`,
      `• Tareas con sobrecostos: ${timeKPIs.timeOverruns}`,
      `• Variación de tiempo promedio: ${timeKPIs.averageTimeVariance.toFixed(1)}%`
    ];
    
    kpiText.forEach((text, index) => {
      doc.text(text, 25, yPosition + (index * 6));
    });
    
    yPosition += (kpiText.length * 6) + 15;
    
    // Verificar si necesitamos una nueva página
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Tabla de tareas
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Detalle de Tareas', 20, yPosition);
    
    yPosition += 10;
    
    // Preparar datos para la tabla
    const tableData = tasks.map(task => [
      task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title,
      task.projectName || 'Sin proyecto',
      this.getTaskStatusText(task.status),
      this.getTaskPriorityText(task.priority),
      this.formatDate(task.dueDate),
      this.formatDueDate(task),
      `${task.estimatedHours}h`,
      task.realHours ? `${task.realHours}h` : '-',
      task.efficiency && task.realHours ? `${task.efficiency.toFixed(0)}%` : '-'
    ]);
    
    // Crear tabla con autoTable
    autoTable(doc, {
      startY: yPosition,
      head: [[
        'Título', 
        'Proyecto', 
        'Estado', 
        'Prioridad', 
        'Vencimiento', 
        'Tiempo Rest.', 
        'Est. (h)', 
        'Real (h)', 
        'Eficiencia'
      ]],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Título
        1: { cellWidth: 20 }, // Proyecto
        2: { cellWidth: 20 }, // Estado
        3: { cellWidth: 15 }, // Prioridad
        4: { cellWidth: 20 }, // Vencimiento
        5: { cellWidth: 20 }, // Tiempo Restante
        6: { cellWidth: 15 }, // Estimado
        7: { cellWidth: 15 }, // Real
        8: { cellWidth: 15 }  // Eficiencia
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        // Footer en cada página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${data.pageNumber}`, 
          pageWidth / 2, 
          pageHeight - 10, 
          { align: 'center' }
        );
      }
    });
    
    // Agregar página de análisis si hay espacio o crear nueva página
    const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
    
    if (finalY > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = finalY + 20;
    }
    
    // Análisis de productividad
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Análisis de Productividad', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    // Tareas vencidas
    const overdueTasks = tasks.filter(t => t.isOverdue);
    if (overdueTasks.length > 0) {
      doc.setTextColor(220, 53, 69); // Rojo
      doc.text('Tareas Vencidas:', 25, yPosition);
      yPosition += 8;
      
      overdueTasks.slice(0, 5).forEach(task => { // Mostrar máximo 5
        doc.setTextColor(60, 60, 60);
        doc.text(`• ${task.title.substring(0, 40)}${task.title.length > 40 ? '...' : ''}`, 30, yPosition);
        yPosition += 6;
      });
      
      if (overdueTasks.length > 5) {
        doc.text(`• ... y ${overdueTasks.length - 5} tareas más`, 30, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }
    
    // Tareas con baja eficiencia
    const inefficientTasks = tasks.filter(t => t.efficiency && t.efficiency < 70);
    if (inefficientTasks.length > 0) {
      doc.setTextColor(255, 193, 7); // Amarillo
      doc.text('Tareas con Baja Eficiencia (<70%):', 25, yPosition);
      yPosition += 8;
      
      inefficientTasks.slice(0, 5).forEach(task => { // Mostrar máximo 5
        doc.setTextColor(60, 60, 60);
        doc.text(`• ${task.title.substring(0, 30)}${task.title.length > 30 ? '...' : ''} - ${task.efficiency?.toFixed(0)}%`, 30, yPosition);
        yPosition += 6;
      });
      
      if (inefficientTasks.length > 5) {
        doc.text(`• ... y ${inefficientTasks.length - 5} tareas más`, 30, yPosition);
        yPosition += 6;
      }
    }
    
    // Descargar el PDF
    doc.save(fileName);
  }

  static exportSprintsReport(
    sprints: SprintReportData[],
    metrics: SprintMetrics,
    fileName: string = 'informe-sprints.pdf'
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Configurar fuentes
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Informe de Sprints', pageWidth / 2, 25, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado el: ${currentDate}`, pageWidth / 2, 35, { align: 'center' });
    
    // Métricas de sprints
    let yPosition = 50;
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Métricas de Sprints', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const metricsText = [
      `• Sprints activos: ${metrics.activeSprints}`,
      `• Sprints completados: ${metrics.completedSprints}`,
      `• Sprints en planificación: ${metrics.planningSprints}`,
      `• Velocidad promedio: ${metrics.avgVelocity} tareas/día`,
      `• Tasa de completado promedio: ${metrics.avgCompletionRate}%`,
      `• Tareas promedio por sprint: ${metrics.avgTasksPerSprint}`,
      `• Sprints en riesgo: ${metrics.sprintsAtRisk}`
    ];
    
    metricsText.forEach((text, index) => {
      doc.text(text, 25, yPosition + (index * 6));
    });
    
    yPosition += (metricsText.length * 6) + 15;
    
    // Verificar si necesitamos una nueva página
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Tabla de sprints
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Detalle de Sprints', 20, yPosition);
    
    yPosition += 10;
    
    // Preparar datos para la tabla
    const tableData = sprints.map(sprint => [
      sprint.name.length > 18 ? sprint.name.substring(0, 18) + '...' : sprint.name,
      sprint.projectName || 'Sin proyecto',
      this.getSprintStatusText(sprint.status),
      this.formatSprintPeriod(sprint.startDate, sprint.endDate),
      `${sprint.completedTaskCount || 0}/${sprint.taskCount || 0}`,
      `${sprint.completionRate || 0}%`,
      `${sprint.velocity || 0}`,
      `${sprint.predictedCompletion || 0}%`,
      this.formatDaysRemaining(sprint)
    ]);
    
    // Crear tabla con autoTable
    autoTable(doc, {
      startY: yPosition,
      head: [[
        'Sprint', 
        'Proyecto', 
        'Estado', 
        'Período', 
        'Tareas', 
        'Progreso', 
        'Velocidad', 
        'Predicción',
        'Tiempo Rest.'
      ]],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 22 }, // Sprint
        1: { cellWidth: 22 }, // Proyecto
        2: { cellWidth: 18 }, // Estado
        3: { cellWidth: 30 }, // Período
        4: { cellWidth: 18 }, // Tareas
        5: { cellWidth: 18 }, // Progreso
        6: { cellWidth: 18 }, // Velocidad
        7: { cellWidth: 18 }, // Predicción
        8: { cellWidth: 25 }  // Tiempo Restante
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        // Footer en cada página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${data.pageNumber}`, 
          pageWidth / 2, 
          pageHeight - 10, 
          { align: 'center' }
        );
      }
    });
    
    // Agregar página de análisis si hay espacio o crear nueva página
    const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
    
    if (finalY > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = finalY + 20;
    }
    
    // Análisis de rendimiento de sprints
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Análisis de Rendimiento', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    // Sprints en riesgo
    const sprintsAtRisk = sprints.filter(s => 
      s.status === 1 && // Activo
      s.daysRemaining !== undefined && 
      s.daysRemaining > 0 && 
      (s.predictedCompletion || 0) < 85
    );
    
    if (sprintsAtRisk.length > 0) {
      doc.setTextColor(220, 53, 69); // Rojo
      doc.text('Sprints en Riesgo:', 25, yPosition);
      yPosition += 8;
      
      sprintsAtRisk.slice(0, 5).forEach(sprint => { // Mostrar máximo 5
        doc.setTextColor(60, 60, 60);
        doc.text(`• ${sprint.name} - ${sprint.completionRate || 0}% completado, predicción: ${sprint.predictedCompletion || 0}%`, 30, yPosition);
        yPosition += 6;
      });
      
      if (sprintsAtRisk.length > 5) {
        doc.text(`• ... y ${sprintsAtRisk.length - 5} sprints más`, 30, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }
    
    // Sprints con baja velocidad
    const avgVelocity = metrics.avgVelocity;
    const lowVelocitySprints = sprints.filter(s => 
      s.status === 1 && // Activo
      (s.velocity || 0) < avgVelocity * 0.7 // Menos del 70% de la velocidad promedio
    );
    
    if (lowVelocitySprints.length > 0 && avgVelocity > 0) {
      doc.setTextColor(255, 193, 7); // Amarillo
      doc.text(`Sprints con Baja Velocidad (<${(avgVelocity * 0.7).toFixed(1)} tareas/día):`, 25, yPosition);
      yPosition += 8;
      
      lowVelocitySprints.slice(0, 5).forEach(sprint => { // Mostrar máximo 5
        doc.setTextColor(60, 60, 60);
        doc.text(`• ${sprint.name} - ${sprint.velocity || 0} tareas/día`, 30, yPosition);
        yPosition += 6;
      });
      
      if (lowVelocitySprints.length > 5) {
        doc.text(`• ... y ${lowVelocitySprints.length - 5} sprints más`, 30, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }
    
    // Sprints vencidos
    const overdueSprints = sprints.filter(s => 
      s.status === 1 && // Activo pero vencido
      s.daysRemaining !== undefined && 
      s.daysRemaining < 0
    );
    
    if (overdueSprints.length > 0) {
      doc.setTextColor(220, 53, 69); // Rojo
      doc.text('Sprints Vencidos:', 25, yPosition);
      yPosition += 8;
      
      overdueSprints.forEach(sprint => {
        doc.setTextColor(60, 60, 60);
        doc.text(`• ${sprint.name} - Vencido hace ${Math.abs(sprint.daysRemaining || 0)} días`, 30, yPosition);
        yPosition += 6;
      });
    }
    
    // Descargar el PDF
    doc.save(fileName);
  }
}