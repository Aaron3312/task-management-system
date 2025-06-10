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

// Performance report interfaces
interface PerformanceReportData {
  performanceData: any[];
  totalHoursPerSprintData: any[];
  hoursWorkedChartData: any[];
  tasksCompletedChartData: any[];
  developers: any[];
  selectedSprint: string;
  selectedDeveloper: string;
  totalTasksCompleted: number;
  totalHoursWorked: number;
  activeDevelopers: number;
  activeSprints: number;
  sprints: any[];
  advancedMetrics?: {
    totalTasksAssigned: number;
    completionRate: number;
    averageHoursPerTask: number;
    productivityIndex: number;
    totalEstimatedHours: number;
    totalRealHours: number;
    timeVariance: number;
    onTimeDeliveryRate: number;
    totalTasks: number;
    averageEfficiency: number;
  };
}

export class PerformancePDFExporter {
  async exportPerformanceReport(data: PerformanceReportData): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Configurar fuentes
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Informe de Rendimiento de Desarrolladores', pageWidth / 2, 25, { align: 'center' });
    
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
    
    // Filtros aplicados
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    let filtersText = `Filtros aplicados: Proyecto seleccionado`;
    if (data.selectedSprint !== 'all') {
      filtersText += `, Sprint específico`;
    }
    if (data.selectedDeveloper !== 'all') {
      filtersText += `, Desarrollador específico`;
    }
    doc.text(filtersText, pageWidth / 2, 42, { align: 'center' });
    
    // Métricas generales
    let yPosition = 55;
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Resumen Ejecutivo', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const basicMetricsText = [
      `• Desarrolladores activos: ${data.activeDevelopers}`,
      `• Sprints analizados: ${data.activeSprints}`,
      `• Tareas completadas: ${data.totalTasksCompleted}`,
      `• Horas trabajadas: ${Math.round(data.totalHoursWorked)}h`,
      `• Promedio de horas por desarrollador: ${data.activeDevelopers > 0 ? Math.round(data.totalHoursWorked / data.activeDevelopers) : 0}h`,
      `• Promedio de tareas por desarrollador: ${data.activeDevelopers > 0 ? Math.round(data.totalTasksCompleted / data.activeDevelopers) : 0}`
    ];

    const advancedMetricsText = data.advancedMetrics ? [
      `• Tareas totales asignadas: ${data.advancedMetrics.totalTasks}`,
      `• Tasa de completación: ${data.advancedMetrics.completionRate.toFixed(1)}%`,
      `• Índice de productividad: ${data.advancedMetrics.productivityIndex.toFixed(1)}%`,
      `• Promedio horas por tarea: ${data.advancedMetrics.averageHoursPerTask.toFixed(1)}h`,
      `• Variación de tiempo: ${data.advancedMetrics.timeVariance > 0 ? '+' : ''}${data.advancedMetrics.timeVariance.toFixed(1)}%`,
      `• Eficiencia promedio del equipo: ${data.advancedMetrics.averageEfficiency.toFixed(1)}%`,
      `• Horas estimadas totales: ${Math.round(data.advancedMetrics.totalEstimatedHours)}h`,
      `• Horas reales totales: ${Math.round(data.advancedMetrics.totalRealHours)}h`
    ] : [];

    const allMetricsText = [...basicMetricsText, ...advancedMetricsText];
    
    allMetricsText.forEach((text, index) => {
      doc.text(text, 25, yPosition + (index * 6));
    });
    
    yPosition += (allMetricsText.length * 6) + 15;
    
    // Verificar si necesitamos una nueva página
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }

    // Agregar sección de KPIs de calidad si hay métricas avanzadas
    if (data.advancedMetrics) {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('KPIs de Calidad y Productividad', 20, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const qualityInsights = [
        `Análisis de Eficiencia: ${data.advancedMetrics.averageEfficiency >= 80 ? 'Excelente' : data.advancedMetrics.averageEfficiency >= 60 ? 'Buena' : 'Necesita Mejora'}`,
        `Precisión de Estimaciones: ${Math.abs(data.advancedMetrics.timeVariance) <= 10 ? 'Alta precisión' : Math.abs(data.advancedMetrics.timeVariance) <= 25 ? 'Precisión moderada' : 'Baja precisión'}`,
        `Productividad del Equipo: ${data.advancedMetrics.productivityIndex >= 100 ? 'Por encima de lo esperado' : data.advancedMetrics.productivityIndex >= 80 ? 'Dentro del rango esperado' : 'Por debajo de lo esperado'}`,
        `Tasa de Éxito: ${data.advancedMetrics.completionRate >= 95 ? 'Excelente' : data.advancedMetrics.completionRate >= 80 ? 'Buena' : 'Necesita atención'}`
      ];
      
      qualityInsights.forEach((insight, index) => {
        doc.text(`• ${insight}`, 25, yPosition + (index * 6));
      });
      
      yPosition += (qualityInsights.length * 6) + 15;
    }
    
    // Tabla de rendimiento por desarrollador
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Rendimiento por Desarrollador', 20, yPosition);
    
    yPosition += 10;
    
    // Agrupar datos de performance por desarrollador
    const developerSummary = new Map();
    data.performanceData.forEach(perf => {
      if (!developerSummary.has(perf.developerId)) {
        developerSummary.set(perf.developerId, {
          name: perf.developerName,
          totalHours: 0,
          totalCompleted: 0,
          totalAssigned: 0,
          sprints: 0,
          avgEfficiency: 0
        });
      }
      
      const summary = developerSummary.get(perf.developerId);
      summary.totalHours += perf.hoursWorked || 0;
      summary.totalCompleted += perf.tasksCompleted || 0;
      summary.totalAssigned += perf.tasksAssigned || 0;
      summary.sprints += 1;
      summary.avgEfficiency += perf.efficiency || 0;
    });
    
    // Calcular promedios
    developerSummary.forEach(summary => {
      summary.avgEfficiency = summary.sprints > 0 ? summary.avgEfficiency / summary.sprints : 0;
      summary.completionRate = summary.totalAssigned > 0 ? (summary.totalCompleted / summary.totalAssigned) * 100 : 0;
    });
    
    // Filtrar solo desarrolladores activos
    const activeDeveloperSummaries = Array.from(developerSummary.values())
      .filter(summary => summary.totalHours > 0 || summary.totalCompleted > 0);
    
    // Preparar datos para la tabla
    const tableData = activeDeveloperSummaries.map(summary => [
      summary.name.length > 20 ? summary.name.substring(0, 20) + '...' : summary.name,
      `${Math.round(summary.totalHours)}h`,
      `${summary.totalCompleted}`,
      `${summary.totalAssigned}`,
      `${summary.completionRate.toFixed(1)}%`,
      `${summary.avgEfficiency.toFixed(1)}%`,
      `${summary.sprints}`
    ]);
    
    // Crear tabla con autoTable
    autoTable(doc, {
      startY: yPosition,
      head: [[
        'Desarrollador', 
        'Horas', 
        'Completadas', 
        'Asignadas', 
        'Tasa Compl.', 
        'Eficiencia', 
        'Sprints'
      ]],
      body: tableData,
      styles: {
        fontSize: 9,
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
        0: { cellWidth: 40 }, // Desarrollador
        1: { cellWidth: 20 }, // Horas
        2: { cellWidth: 20 }, // Completadas
        3: { cellWidth: 20 }, // Asignadas
        4: { cellWidth: 25 }, // Tasa Completación
        5: { cellWidth: 25 }, // Eficiencia
        6: { cellWidth: 20 }  // Sprints
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
    
    // Agregar análisis adicional si hay espacio o crear nueva página
    const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
    
    if (finalY > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = finalY + 20;
    }
    
    // Análisis de rendimiento
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Análisis de Rendimiento', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    // Top performers
    const topPerformers = activeDeveloperSummaries
      .sort((a, b) => b.totalCompleted - a.totalCompleted)
      .slice(0, 3);
    
    if (topPerformers.length > 0) {
      doc.setTextColor(40, 167, 69); // Verde
      doc.text('Top Performers (por tareas completadas):', 25, yPosition);
      yPosition += 8;
      
      topPerformers.forEach((dev, index) => {
        doc.setTextColor(60, 60, 60);
        doc.text(`${index + 1}. ${dev.name} - ${dev.totalCompleted} tareas (${dev.completionRate.toFixed(1)}% completación)`, 30, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }
    
    // Desarrolladores con baja eficiencia
    const lowEfficiencyDevs = activeDeveloperSummaries
      .filter(dev => dev.avgEfficiency < 70 && dev.totalCompleted > 0);
    
    if (lowEfficiencyDevs.length > 0) {
      doc.setTextColor(255, 193, 7); // Amarillo
      doc.text('Desarrolladores con Oportunidades de Mejora (<70% eficiencia):', 25, yPosition);
      yPosition += 8;
      
      lowEfficiencyDevs.forEach(dev => {
        doc.setTextColor(60, 60, 60);
        doc.text(`• ${dev.name} - ${dev.avgEfficiency.toFixed(1)}% eficiencia promedio`, 30, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }
    
    // Llamar al análisis IA si es posible
    try {
      await this.addAIAnalysis(doc, data, yPosition);
    } catch (error) {
      console.log('No se pudo agregar análisis IA:', error);
      
      // Agregar nota sobre el análisis IA no disponible
      const pageHeight = doc.internal.pageSize.height;
      if (yPosition < pageHeight - 40) {
        doc.setFontSize(12);
        doc.setTextColor(180, 180, 180);
        doc.text('Análisis IA no disponible en este momento', 20, yPosition + 10);
      }
    }
    
    // Descargar el PDF
    doc.save(`informe-rendimiento-${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  private async addAIAnalysis(doc: any, data: PerformanceReportData, startY: number): Promise<void> {
    // Intentar obtener análisis IA
    try {
      const aiResponse = await fetch('/api/ai-analysis/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'demo-token'}`,
        },
        body: JSON.stringify({
          performanceData: data.performanceData,
          sprints: data.sprints,
          developers: data.developers,
          metrics: {
            totalHours: data.totalHoursWorked,
            totalTasks: data.totalTasksCompleted,
            totalTasksCompleted: data.totalTasksCompleted,
            efficiency: data.performanceData.length > 0 
              ? data.performanceData.reduce((sum, p) => sum + (p.efficiency || 0), 0) / data.performanceData.length 
              : 0
          }
        })
      });
      
      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        
        if (aiResult.success && aiResult.insights) {
          const pageHeight = doc.internal.pageSize.height;
          let yPosition = startY;
          
          // Verificar si necesitamos una nueva página
          if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Título del análisis IA
          doc.setFontSize(14);
          doc.setTextColor(40, 40, 40);
          doc.text('Análisis IA con Gemini', 20, yPosition);
          
          yPosition += 10;
          
          // Resumen ejecutivo
          if (aiResult.summary) {
            doc.setFontSize(11);
            doc.setTextColor(60, 60, 60);
            doc.text('Resumen Ejecutivo:', 25, yPosition);
            yPosition += 8;
            
            doc.setFontSize(9);
            const summaryLines = doc.splitTextToSize(aiResult.summary, 160);
            summaryLines.forEach((line: string) => {
              doc.text(line, 30, yPosition);
              yPosition += 5;
            });
            yPosition += 10;
          }
          
          // Insights principales
          if (aiResult.insights && aiResult.insights.length > 0) {
            doc.setFontSize(11);
            doc.setTextColor(60, 60, 60);
            doc.text('Insights Principales:', 25, yPosition);
            yPosition += 8;
            
            doc.setFontSize(9);
            aiResult.insights.slice(0, 5).forEach((insight: any) => {
              // Verificar espacio en la página
              if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
              }
              
              doc.setTextColor(40, 40, 40);
              doc.text(`• ${insight.title}`, 30, yPosition);
              yPosition += 6;
              
              doc.setTextColor(80, 80, 80);
              const descriptionLines = doc.splitTextToSize(insight.description, 150);
              descriptionLines.forEach((line: string) => {
                doc.text(line, 35, yPosition);
                yPosition += 4;
              });
              
              if (insight.recommendation) {
                doc.setTextColor(25, 135, 84); // Verde
                doc.text('💡 Recomendación:', 35, yPosition);
                yPosition += 4;
                
                doc.setTextColor(60, 60, 60);
                const recLines = doc.splitTextToSize(insight.recommendation, 145);
                recLines.forEach((line: string) => {
                  doc.text(line, 40, yPosition);
                  yPosition += 4;
                });
              }
              
              yPosition += 6;
            });
          }
        }
      }
    } catch (error) {
      console.error('Error obteniendo análisis IA para PDF:', error);
    }
  }
}