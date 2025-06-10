// components/performance/AIAnalysis.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, AlertTriangle, CheckCircle, Loader2, Sparkles, Users, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AIAnalysisProps {
  performanceData: any[];
  sprints: any[];
  developers: any[];
  totalHours: number;
  totalTasks: number;
  totalTasksCompleted: number;
  averageEfficiency: number;
}

interface AIInsight {
  category: 'performance' | 'efficiency' | 'workload' | 'sprint' | 'general';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  data_points?: string[];
}

interface AIAnalysisResult {
  success: boolean;
  insights: AIInsight[];
  summary: string;
  error?: string;
  metadata?: {
    activeDevelopers: number;
    totalDevelopers: number;
    normalizedEfficiency: boolean;
    analysisTimestamp: string;
  };
}

interface AIAnalysisMetadata {
  activeDevelopers: number;
  totalDevelopers: number;
  normalizedEfficiency: boolean;
  analysisTimestamp: string;
}

const severityIcons = {
  low: <CheckCircle className="h-4 w-4 text-green-500" />,
  medium: <Lightbulb className="h-4 w-4 text-yellow-500" />,
  high: <AlertTriangle className="h-4 w-4 text-red-500" />
};

const categoryColors = {
  performance: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  efficiency: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  workload: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
  sprint: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
  general: 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
};

// Service para hacer la llamada a la API
class AIAnalysisService {
  static async analyzePerformance(data: {
    performanceData: any[];
    sprints: any[];
    developers: any[];
    metrics: {
      totalHours: number;
      totalTasks: number;
      totalTasksCompleted: number;
      efficiency: number;
    };
  }): Promise<AIAnalysisResult> {
    try {
      const response = await fetch('/api/ai-analysis/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'demo-token'}`,
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI Analysis Service Error:', error);
      throw error;
    }
  }
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({
  performanceData,
  sprints,
  developers,
  totalHours,
  totalTasks,
  totalTasksCompleted,
  averageEfficiency
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [metadata, setMetadata] = useState<AIAnalysisMetadata | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Calcular desarrolladores activos localmente para la UI
  const activeDevelopers = developers.filter(dev => 
    performanceData.some(p => 
      p.developerId === dev.id && 
      ((p.tasksAssigned && p.tasksAssigned > 0) || 
       (p.hoursWorked && p.hoursWorked > 0) ||
       (p.tasksCompleted && p.tasksCompleted > 0))
    )
  );

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    toast.loading('Analizando datos con IA (solo desarrolladores activos)...');

    try {
      const request = {
        performanceData,
        sprints,
        developers,
        metrics: {
          totalHours,
          totalTasks,
          totalTasksCompleted,
          efficiency: averageEfficiency
        }
      };

      const result = await AIAnalysisService.analyzePerformance(request);
      
      if (result.success) {
        setInsights(result.insights);
        setSummary(result.summary);
        setMetadata(result.metadata || null);
        setHasAnalyzed(true);
        toast.dismiss();
        toast.success(`Análisis completado - ${activeDevelopers.length} desarrolladores activos analizados`);
      } else {
        throw new Error(result.error || 'Error en el análisis');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.dismiss();
      toast.error('Error al realizar el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-indigo-950 dark:via-gray-900 dark:to-cyan-950">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white">
        <CardTitle className="text-2xl flex items-center">
          <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm">
            <Brain className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xl font-bold">Análisis IA con Gemini</div>
            <div className="text-sm text-white/80 font-normal">
              Insights y recomendaciones inteligentes (desarrolladores activos)
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8">
        {!hasAnalyzed ? (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Análisis Inteligente de Rendimiento
            </h3>
            <p className="text-muted-foreground mb-4">
              Utiliza IA para obtener insights profundos sobre el rendimiento del equipo activo
            </p>
            
            {/* Información previa al análisis */}
            <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 text-green-600 mr-1" />
                  <span className="font-medium">{activeDevelopers.length} activos</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-600 mr-1" />
                  <span>{developers.length - activeDevelopers.length} inactivos</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Solo se analizarán desarrolladores con tareas asignadas o trabajo realizado
              </p>
            </div>
            
            <Button 
              onClick={runAnalysis} 
              disabled={isAnalyzing || activeDevelopers.length === 0}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : activeDevelopers.length === 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Sin desarrolladores activos
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Ejecutar Análisis IA
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analysis Info Banner */}
            {metadata && (
              <div className="bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium">{metadata.activeDevelopers} desarrolladores activos analizados</span>
                    </div>
                    {metadata.normalizedEfficiency && (
                      <div className="flex items-center">
                        <Sparkles className="h-4 w-4 text-purple-600 mr-1" />
                        <span className="text-sm">Eficiencia normalizada (0-100%)</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metadata.totalDevelopers - metadata.activeDevelopers} inactivos excluidos
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Resumen Ejecutivo
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{summary}</p>
            </div>

            {/* Insights */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Insights Detallados</h3>
                <Button 
                  onClick={runAnalysis} 
                  disabled={isAnalyzing}
                  variant="outline"
                  size="sm"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Actualizar
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid gap-4">
                {insights.map((insight, index) => (
                  <Card 
                    key={index}
                    className={`${categoryColors[insight.category]} border-l-4`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold flex items-center">
                          {severityIcons[insight.severity]}
                          <span className="ml-2">{insight.title}</span>
                        </h4>
                        <span className="text-xs px-2 py-1 bg-white/50 rounded-full capitalize">
                          {insight.category}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {insight.description}
                      </p>
                      
                      <div className="bg-white/70 dark:bg-black/20 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          💡 Recomendación: {insight.recommendation}
                        </p>
                      </div>
                      
                      {insight.data_points && insight.data_points.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Datos clave:</p>
                          <div className="flex flex-wrap gap-1">
                            {insight.data_points.map((point, i) => (
                              <span 
                                key={i}
                                className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded"
                              >
                                {point}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};