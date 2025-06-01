// services/api/aiAnalysisService.ts
interface AnalysisRequest {
  performanceData: any[];
  sprints: any[];
  developers: any[];
  metrics: {
    totalHours: number;
    totalTasks: number;
    efficiency: number;
  };
}

interface AIInsight {
  category: 'performance' | 'efficiency' | 'workload' | 'sprint' | 'general';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  data_points?: string[];
}

interface AnalysisResponse {
  success: boolean;
  insights: AIInsight[];
  summary: string;
  error?: string;
}

export class AIAnalysisService {
  static async analyzePerformance(data: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await fetch('/api/ai-analysis/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Analysis error:', error);
      return {
        success: false,
        insights: [],
        summary: 'Error al realizar el análisis. Inténtalo de nuevo.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getRecommendations(sprintId?: number): Promise<string[]> {
    try {
      const url = sprintId 
        ? `/api/ai-analysis/recommendations?sprintId=${sprintId}`
        : '/api/ai-analysis/recommendations';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Recommendations error:', error);
      return ['Error al obtener recomendaciones'];
    }
  }
}

export type { AnalysisRequest, AIInsight, AnalysisResponse };