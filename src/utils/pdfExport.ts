// utils/pdfExport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

interface ExportData {
  performanceData: DeveloperPerformance[];
  totalHoursPerSprintData: ChartData[];
  hoursWorkedChartData: ChartData[];
  tasksCompletedChartData: ChartData[];
  developers: Developer[];
  selectedSprint: string;
  selectedDeveloper: string;
  totalTasksCompleted: number;
  totalHoursWorked: number;
  activeDevelopers: number;
  activeSprints: number;
  sprints: any[];
}

export class PerformancePDFExporter {
  private doc: jsPDF;
  private yPosition: number = 20;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly margin: number = 20;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  public async exportPerformanceReport(data: ExportData): Promise<void> {
    try {
      this.validateExportData(data);
      
      this.addHeader();
      this.addSummarySection(data);
      this.addMetricsOverview(data);
      this.addPerformanceTable(data);
      this.addSprintAnalysis(data);
      this.addDeveloperEfficiency(data);
      await this.addAIAnalysis(data);
      this.addRecommendations(data);
      this.addFooter();
      
      const filename = this.generateFilename(data);
      this.doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  private validateExportData(data: ExportData): void {
    if (!data.performanceData || data.performanceData.length === 0) {
      throw new Error('No performance data available for export');
    }
    if (!data.developers || data.developers.length === 0) {
      throw new Error('No developer data available for export');
    }
  }

  private addHeader(): void {
    this.doc.setFillColor(79, 70, 229);
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');
    
    this.doc.setFillColor(99, 102, 241);
    this.doc.rect(0, 0, this.pageWidth, 35, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Reporte de Rendimiento de Desarrolladores', this.pageWidth / 2, 20, { align: 'center' });

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Analisis detallado del desempeno del equipo', this.pageWidth / 2, 28, { align: 'center' });

    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    this.doc.setFontSize(10);
    this.doc.text(`Generado el: ${currentDate}`, this.pageWidth - this.margin, 35, { align: 'right' });

    this.yPosition = 50;
    this.doc.setTextColor(0, 0, 0);
  }

  private addSummarySection(data: ExportData): void {
    this.addSectionTitle('Resumen Ejecutivo');

    const filterInfo = [
      `Sprint: ${data.selectedSprint === 'all' ? 'Todos los sprints' : this.getSprintName(data, data.selectedSprint)}`,
      `Desarrollador: ${data.selectedDeveloper === 'all' ? 'Todos los desarrolladores' : this.getDeveloperName(data, data.selectedDeveloper)}`,
      `Periodo de analisis: ${this.getDateRange(data.sprints, data.selectedSprint)}`
    ];

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    filterInfo.forEach(info => {
      this.doc.text(info, this.margin, this.yPosition);
      this.yPosition += 6;
    });

    this.yPosition += 10;
  }

  private addMetricsOverview(data: ExportData): void {
    this.addSectionTitle('Metricas Principales');

    const avgHoursPerSprint = data.activeSprints > 0 ? (data.totalHoursWorked / data.activeSprints).toFixed(1) : '0';
    const avgTasksPerDev = data.activeDevelopers > 0 ? (data.totalTasksCompleted / data.activeDevelopers).toFixed(1) : '0';

    const metrics = [
      ['Desarrolladores Activos', data.activeDevelopers.toString()],
      ['Sprints Analizados', data.activeSprints.toString()],
      ['Tareas Completadas', data.totalTasksCompleted.toString()],
      ['Horas Trabajadas', `${Math.round(data.totalHoursWorked)}h`],
      ['Promedio Horas/Sprint', `${avgHoursPerSprint}h`],
      ['Promedio Tareas/Desarrollador', avgTasksPerDev]
    ];

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [['Metrica', 'Valor']],
      body: metrics,
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'center' }
      }
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addPerformanceTable(data: ExportData): void {
    this.checkPageBreak(80);
    this.addSectionTitle('Rendimiento Detallado por Desarrollador');

    const developerSummary = this.groupPerformanceByDeveloper(data.performanceData);

    const tableData = developerSummary.map(dev => [
      dev.name,
      dev.totalHours.toFixed(1),
      dev.totalTasks.toString(),
      dev.avgEfficiency.toFixed(1) + '%',
      dev.sprintsParticipated.toString(),
      dev.sprintsParticipated > 0 ? (dev.totalHours / dev.sprintsParticipated).toFixed(1) : '0'
    ]);

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [['Desarrollador', 'Horas Total', 'Tareas', 'Eficiencia', 'Sprints', 'Hrs/Sprint']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244]
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' }
      }
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addSprintAnalysis(data: ExportData): void {
    this.checkPageBreak(80);
    this.addSectionTitle('Analisis por Sprint');

    const sprintData = data.totalHoursPerSprintData.map(sprint => {
      const sprintPerf = data.performanceData.filter(p => p.sprintName === sprint.sprint);
      const totalTasks = sprintPerf.reduce((sum, p) => sum + p.tasksCompleted, 0);
      const activeDevelopers = [...new Set(sprintPerf.filter(p => p.hoursWorked > 0).map(p => p.developerId))].length;
      const avgEfficiency = sprintPerf.length > 0 
        ? Math.min(sprintPerf.reduce((sum, p) => sum + p.efficiency, 0) / sprintPerf.length, 100)
        : 0;
      
      return [
        sprint.sprint,
        (sprint.totalHours as number).toFixed(1),
        totalTasks.toString(),
        avgEfficiency.toFixed(1) + '%',
        activeDevelopers.toString()
      ];
    });

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [['Sprint', 'Horas Total', 'Tareas', 'Eficiencia Prom.', 'Desarrolladores']],
      body: sprintData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 243, 255]
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
        4: { cellWidth: 35, halign: 'center' }
      }
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addDeveloperEfficiency(data: ExportData): void {
    this.checkPageBreak(70);
    this.addSectionTitle('Analisis de Eficiencia');

    const efficiencyData = this.groupPerformanceByDeveloper(data.performanceData)
      .sort((a, b) => b.avgEfficiency - a.avgEfficiency)
      .map((dev, index) => [
        (index + 1).toString(),
        dev.name,
        dev.avgEfficiency.toFixed(1) + '%',
        this.getEfficiencyRating(dev.avgEfficiency),
        dev.totalHours.toFixed(1),
        dev.totalTasks.toString()
      ]);

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [['Rank', 'Desarrollador', 'Eficiencia', 'Rating', 'Horas', 'Tareas']],
      body: efficiencyData,
      theme: 'grid',
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [255, 251, 235]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 50 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' }
      }
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private async addAIAnalysis(data: ExportData): Promise<void> {
    this.checkPageBreak(100);
    this.addSectionTitle('Analisis de IA con Gemini');

    try {
      const aiResponse = await fetch('/api/ai-analysis/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          performanceData: data.performanceData,
          sprints: data.sprints,
          developers: data.developers,
          metrics: {
            totalHours: data.totalHoursWorked,
            totalTasks: data.totalTasksCompleted,
            efficiency: data.performanceData.length > 0 
              ? data.performanceData.reduce((sum, p) => sum + p.efficiency, 0) / data.performanceData.length 
              : 0
          }
        })
      });

      if (!aiResponse.ok) {
        throw new Error('AI analysis failed');
      }

      const aiData = await aiResponse.json();

      if (aiData.success && aiData.insights) {
        // Add AI Summary
        this.doc.setFillColor(240, 248, 255);
        this.doc.rect(this.margin - 5, this.yPosition - 5, this.pageWidth - 2 * this.margin + 10, 15, 'F');
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Resumen Ejecutivo IA:', this.margin, this.yPosition + 5);
        this.yPosition += 15;
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        const summaryLines = this.doc.splitTextToSize(aiData.summary, this.pageWidth - 2 * this.margin);
        this.doc.text(summaryLines, this.margin, this.yPosition);
        this.yPosition += summaryLines.length * 5 + 15;

        // Add Insights Table
        const tableData = aiData.insights.map((insight: any) => [
          this.getSeveritySymbol(insight.severity),
          this.getCategoryName(insight.category),
          insight.title,
          insight.description.length > 150 ? insight.description.substring(0, 150) + '...' : insight.description,
          insight.recommendation.length > 120 ? insight.recommendation.substring(0, 120) + '...' : insight.recommendation
        ]);

        autoTable(this.doc, {
          startY: this.yPosition,
          head: [['Sev.', 'Categoria', 'Insight', 'Descripcion', 'Recomendacion']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 25 },
            2: { cellWidth: 40, fontStyle: 'bold' },
            3: { cellWidth: 60 },
            4: { cellWidth: 50 }
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          }
        });

        this.yPosition = (this.doc as any).lastAutoTable.finalY + 20;
      } else {
        throw new Error('Invalid AI response');
      }
      
    } catch (error) {
      console.error('Error adding AI analysis to PDF:', error);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(128, 128, 128);
      this.doc.text('Analisis de IA no disponible en este momento.', this.margin, this.yPosition);
      this.yPosition += 20;
      this.doc.setTextColor(0, 0, 0);
    }
  }

  private addRecommendations(data: ExportData): void {
    this.checkPageBreak(80);
    this.addSectionTitle('Recomendaciones y Analisis');

    const insights = this.generateInsights(data);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    let yPos = this.yPosition;
    insights.forEach((insight, index) => {
      this.checkPageBreak(20);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}.`, this.margin, yPos);
      
      this.doc.setFont('helvetica', 'normal');
      const textLines = this.doc.splitTextToSize(insight, this.pageWidth - this.margin * 2 - 10);
      this.doc.text(textLines, this.margin + 10, yPos);
      
      yPos += textLines.length * 5 + 5;
      if (yPos !== this.yPosition) {
        this.yPosition = yPos;
      }
    });

    this.yPosition = yPos + 10;
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(20);
    
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(this.margin - 5, this.yPosition - 8, this.pageWidth - 2 * this.margin + 10, 12, 'F');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(55, 65, 81);
    
    const cleanTitle = title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    this.doc.text(cleanTitle, this.margin, this.yPosition);
    
    this.yPosition += 15;
    this.doc.setTextColor(0, 0, 0);
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.yPosition + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.yPosition = this.margin;
    }
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(0, this.pageHeight - 15, this.pageWidth, 15, 'F');
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128);
      
      this.doc.text(
        'Reporte generado automaticamente - Sistema de Gestion de Proyectos',
        this.margin,
        this.pageHeight - 8
      );
      
      this.doc.text(
        `Pagina ${i} de ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight - 8,
        { align: 'right' }
      );
    }
  }

  private groupPerformanceByDeveloper(performanceData: DeveloperPerformance[]) {
    const grouped = performanceData.reduce((acc, perf) => {
      if (!acc[perf.developerId]) {
        acc[perf.developerId] = {
          id: perf.developerId,
          name: perf.developerName,
          totalHours: 0,
          totalTasks: 0,
          totalEstimated: 0,
          sprintsParticipated: 0
        };
      }
      
      const dev = acc[perf.developerId];
      dev.totalHours += perf.hoursWorked;
      dev.totalTasks += perf.tasksCompleted;
      
      if (perf.efficiency > 0 && perf.hoursWorked > 0) {
        const estimated = perf.efficiency * perf.hoursWorked / 100;
        dev.totalEstimated += estimated;
        dev.sprintsParticipated += 1;
      }
      
      return acc;
    }, {} as any);

    const developers = Object.values(grouped)
      .map((dev: any) => ({
        ...dev,
        rawEfficiency: dev.totalHours > 0 ? (dev.totalEstimated / dev.totalHours) * 100 : 0
      }))
      .filter(dev => dev.totalHours > 0 || dev.totalTasks > 0);

    const maxEfficiency = Math.max(...developers.map(dev => dev.rawEfficiency));
    
    return developers.map(dev => ({
      ...dev,
      avgEfficiency: maxEfficiency > 0 ? (dev.rawEfficiency / maxEfficiency) * 100 : 0
    }));
  }

  private getEfficiencyRating(efficiency: number): string {
    if (efficiency >= 90) return '5 estrellas';
    if (efficiency >= 80) return '4 estrellas';
    if (efficiency >= 60) return '3 estrellas';
    if (efficiency >= 40) return '2 estrellas';
    if (efficiency >= 20) return '1 estrella';
    return 'Sin rating';
  }

  private getSeveritySymbol(severity: string): string {
    switch (severity) {
      case 'high': return '!!!';
      case 'medium': return '!!';
      case 'low': return '!';
      default: return '-';
    }
  }

  private getCategoryName(category: string): string {
    const categories: Record<string, string> = {
      'performance': 'Rendimiento',
      'efficiency': 'Eficiencia',
      'workload': 'Carga',
      'sprint': 'Sprint',
      'general': 'General'
    };
    return categories[category] || category;
  }

  private generateInsights(data: ExportData): string[] {
    const insights: string[] = [];
    const groupedData = this.groupPerformanceByDeveloper(data.performanceData);
    
    if (groupedData.length === 0) {
      insights.push('No se encontraron datos suficientes para generar recomendaciones específicas.');
      return insights;
    }
    
    const avgEfficiency = groupedData.reduce((sum, dev) => sum + dev.avgEfficiency, 0) / groupedData.length;
    if (avgEfficiency > 100) {
      insights.push('El equipo muestra una eficiencia excepcional con estimaciones precisas. Mantener las practicas actuales de estimacion y desarrollo.');
    } else if (avgEfficiency < 70) {
      insights.push('La eficiencia del equipo esta por debajo del 70%. Considerar revisar los procesos de estimacion y identificar cuellos de botella en el desarrollo.');
    }

    const maxHours = Math.max(...groupedData.map(dev => dev.totalHours));
    const minHours = Math.min(...groupedData.map(dev => dev.totalHours));
    if (maxHours > minHours * 2 && groupedData.length > 1) {
      insights.push('Existe una distribucion desigual de la carga de trabajo. Considerar rebalancear las asignaciones para optimizar la productividad del equipo.');
    }

    if (data.totalHoursPerSprintData.length > 1) {
      const sprintHours = data.totalHoursPerSprintData.map(s => s.totalHours as number);
      const avgSprintHours = sprintHours.reduce((sum, hours) => sum + hours, 0) / sprintHours.length;
      const lastSprintHours = sprintHours[sprintHours.length - 1];
      if (lastSprintHours > avgSprintHours * 1.5) {
        insights.push('El ultimo sprint muestra un incremento significativo en las horas trabajadas. Monitorear la sostenibilidad del ritmo de trabajo.');
      }
    }

    const totalAssigned = data.performanceData.reduce((sum, p) => sum + p.tasksAssigned, 0);
    if (totalAssigned > 0) {
      const completionRate = (data.totalTasksCompleted / totalAssigned) * 100;
      if (completionRate > 90) {
        insights.push('Excelente tasa de completacion de tareas (>90%). El equipo esta cumpliendo consistentemente con los compromisos del sprint.');
      } else if (completionRate < 70) {
        insights.push('La tasa de completacion de tareas esta por debajo del 70%. Revisar la planificacion del sprint y los impedimentos recurrentes.');
      }
    }

    if (insights.length === 0) {
      insights.push('El rendimiento del equipo se encuentra dentro de parametros normales. Continuar monitoreando las metricas clave para identificar oportunidades de mejora.');
    }

    return insights;
  }

  private getSprintName(data: ExportData, sprintId: string): string {
    const sprint = data.performanceData.find(p => p.sprintId.toString() === sprintId);
    return sprint ? sprint.sprintName : `Sprint ${sprintId}`;
  }

  private getDeveloperName(data: ExportData, developerId: string): string {
    const developer = data.developers.find(d => d.id.toString() === developerId);
    return developer ? (developer.full_name || developer.username) : `Developer ${developerId}`;
  }

  private getDateRange(sprints: any[], selectedSprint: string): string {
    try {
      const relevantSprints = selectedSprint === 'all' 
        ? sprints 
        : sprints.filter(s => s.id?.toString() === selectedSprint);

      if (relevantSprints.length === 0) {
        return 'Periodo no disponible';
      }

      const dates = relevantSprints.reduce((acc, sprint) => {
        if (sprint.start_date) {
          const startDate = new Date(sprint.start_date);
          acc.startDates.push(startDate);
        }
        if (sprint.end_date) {
          const endDate = new Date(sprint.end_date);
          acc.endDates.push(endDate);
        }
        return acc;
      }, { startDates: [], endDates: [] });

      if (dates.startDates.length === 0 || dates.endDates.length === 0) {
        return 'Fechas no disponibles';
      }

      const minStartDate = new Date(Math.min(...dates.startDates.map(d => d.getTime())));
      const maxEndDate = new Date(Math.max(...dates.endDates.map(d => d.getTime())));

      return `${minStartDate.toLocaleDateString('es-ES')} - ${maxEndDate.toLocaleDateString('es-ES')}`;
    } catch (error) {
      console.error('Error calculating date range:', error);
      return 'Error al calcular periodo';
    }
  }

  private generateFilename(data: ExportData): string {
    const date = new Date().toISOString().split('T')[0];
    const sprintSuffix = data.selectedSprint === 'all' ? 'todos-sprints' : `sprint-${data.selectedSprint}`;
    const devSuffix = data.selectedDeveloper === 'all' ? 'todos-devs' : `dev-${data.selectedDeveloper}`;
    return `reporte-rendimiento-${sprintSuffix}-${devSuffix}-${date}.pdf`;
  }
}