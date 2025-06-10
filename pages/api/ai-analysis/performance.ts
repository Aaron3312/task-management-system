// pages/api/ai-analysis/performance.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');



function isAuthenticated(req: NextApiRequest): boolean {
  return req.headers.authorization !== undefined;
}

function filterActiveDevelopers(performanceData: any[]): any[] {
  // Filtra solo desarrolladores que tienen tareas asignadas y/o horas trabajadas
  return performanceData.filter(dev => 
    (dev.tasksAssigned && dev.tasksAssigned > 0) || 
    (dev.hoursWorked && dev.hoursWorked > 0) ||
    (dev.tasksCompleted && dev.tasksCompleted > 0)
  );
}

function normalizeEfficiencyData(performanceData: any[]): any[] {
  if (performanceData.length === 0) return [];

  // Agrupar por desarrollador para calcular eficiencia promedio
  const developerStats = new Map();
  
  performanceData.forEach(p => {
    const devId = p.developerId;
    if (!developerStats.has(devId)) {
      developerStats.set(devId, {
        name: p.developerName,
        efficiencyValues: [],
        totalHours: 0,
        totalTasks: 0,
        totalAssigned: 0
      });
    }
    
    const stats = developerStats.get(devId);
    if (p.efficiency && p.efficiency > 0) {
      stats.efficiencyValues.push(p.efficiency);
    }
    stats.totalHours += p.hoursWorked || 0;
    stats.totalTasks += p.tasksCompleted || 0;
    stats.totalAssigned += p.tasksAssigned || 0;
  });

  // Calcular eficiencia promedio por desarrollador
  const developerEfficiencies = Array.from(developerStats.values())
    .filter(stats => stats.efficiencyValues.length > 0)
    .map(stats => ({
      ...stats,
      avgEfficiency: stats.efficiencyValues.reduce((sum, val) => sum + val, 0) / stats.efficiencyValues.length
    }));

  if (developerEfficiencies.length === 0) return performanceData;

  // Encontrar la eficiencia máxima para normalizar
  const maxEfficiency = Math.max(...developerEfficiencies.map(dev => dev.avgEfficiency));
  
  // Normalizar los datos originales
  return performanceData.map(p => {
    const devStats = developerEfficiencies.find(dev => dev.name === p.developerName);
    const normalizedEfficiency = devStats && maxEfficiency > 0 
      ? (devStats.avgEfficiency / maxEfficiency) * 100 
      : p.efficiency;
      
    return {
      ...p,
      originalEfficiency: p.efficiency,
      efficiency: normalizedEfficiency
    };
  });
}

function formatAnalysisPrompt(data: any): string {
  const { performanceData, sprints, developers, metrics } = data;
  
  // Filtrar solo desarrolladores activos
  const activePerformanceData = filterActiveDevelopers(performanceData);
  const normalizedData = normalizeEfficiencyData(activePerformanceData);
  
  // Obtener lista de desarrolladores activos únicos
  const activeDeveloperIds = [...new Set(activePerformanceData.map(p => p.developerId))];
  const activeDevelopers = developers.filter(dev => activeDeveloperIds.includes(dev.id));
  const inactiveDevelopers = developers.filter(dev => !activeDeveloperIds.includes(dev.id));
  
  // Recalcular métricas solo para desarrolladores activos
  const activeTotalHours = activePerformanceData.reduce((sum, p) => sum + (p.hoursWorked || 0), 0);
  const activeTotalTasks = activePerformanceData.reduce((sum, p) => sum + (p.tasksCompleted || 0), 0);
  const activeTotalAssigned = activePerformanceData.reduce((sum, p) => sum + (p.tasksAssigned || 0), 0);
  
  const activeAvgEfficiency = normalizedData.length > 0 
    ? normalizedData.reduce((sum, p) => sum + (p.efficiency || 0), 0) / normalizedData.length 
    : 0;

  return `
Eres un experto en análisis de proyectos de desarrollo de software. Analiza los siguientes datos de rendimiento de DESARROLLADORES ACTIVOS únicamente.

IMPORTANTE: 
- Los datos de eficiencia ya están NORMALIZADOS (0-100%), donde 100% representa al desarrollador más eficiente
- Solo analiza desarrolladores que tienen tareas asignadas o trabajo realizado
- Excluye a desarrolladores inactivos del análisis principal

DATOS DEL PROYECTO (SOLO DESARROLLADORES ACTIVOS):
- Desarrolladores activos: ${activeDevelopers.length}
- Desarrolladores inactivos (excluidos del análisis): ${inactiveDevelopers.length}
- Sprints analizados: ${sprints.length}
- Horas totales trabajadas: ${activeTotalHours.toFixed(1)}h
- Tareas totales: ${metrics.totalTasks || 0}
- Tareas completadas: ${metrics.totalTasksCompleted || 0}
- Tasa de completación: ${metrics.totalTasks > 0 ? ((metrics.totalTasksCompleted / metrics.totalTasks) * 100).toFixed(1) : 0}%
- Eficiencia promedio normalizada: ${activeAvgEfficiency.toFixed(1)}%

DESARROLLADORES ACTIVOS (Eficiencia Normalizada 0-100%):
${normalizedData.slice(0, 15).map((dev: any) => 
  `- ${dev.developerName}: ${(dev.hoursWorked || 0).toFixed(1)}h, ${dev.tasksCompleted || 0} tareas completadas, ${dev.tasksAssigned || 0} asignadas, ${(dev.efficiency || 0).toFixed(1)}% eficiencia normalizada`
).join('\n')}

${inactiveDevelopers.length > 0 ? `
DESARROLLADORES INACTIVOS (Sin tareas asignadas - Excluidos del análisis):
${inactiveDevelopers.slice(0, 10).map(dev => `- ${dev.full_name || dev.username}`).join('\n')}
${inactiveDevelopers.length > 10 ? `... y ${inactiveDevelopers.length - 10} más` : ''}
` : ''}

SPRINTS:
${sprints.map((sprint: any) => 
  `- ${sprint.name}: ${sprint.start_date || 'N/A'} - ${sprint.end_date || 'N/A'}`
).join('\n')}

ANÁLISIS REQUERIDO:
1. Evalúa el rendimiento SOLO de desarrolladores activos (con tareas asignadas)
2. Analiza la eficiencia normalizada (0-100%) donde 100% es el mejor desempeño relativo
3. Identifica patrones en la distribución de trabajo entre desarrolladores activos
4. Evalúa la tasa de completación de tareas y calidad del trabajo
5. Si hay desarrolladores inactivos, menciona brevemente la necesidad de revisión de asignaciones
6. Proporciona recomendaciones específicas para mejorar el rendimiento del equipo activo

NOTAS IMPORTANTES:
- La eficiencia está normalizada: 100% = mejor desarrollador, otros son relativos a este
- No critiques a desarrolladores inactivos, enfócate en optimizar a los activos
- Considera la carga de trabajo balanceada entre desarrolladores activos

FORMATO DE RESPUESTA (JSON):
{
  "insights": [
    {
      "category": "performance|efficiency|workload|sprint|general",
      "severity": "low|medium|high",
      "title": "Título del insight",
      "description": "Descripción detallada del hallazgo sobre desarrolladores activos",
      "recommendation": "Recomendación específica para mejorar",
      "data_points": ["punto de datos relevante"]
    }
  ],
  "summary": "Resumen ejecutivo enfocado en desarrolladores activos y su rendimiento normalizado"
}

Responde SOLO con el JSON, sin texto adicional.
`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString();
  console.log(`\n=== [${timestamp}] AI ANALYSIS REQUEST START ===`);
  
  if (req.method !== 'POST') {
    console.log(`❌ Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthenticated(req)) {
    console.log(`❌ Unauthorized request`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log(`✅ Request authenticated`);
    
    // Filtrar y normalizar datos antes del análisis
    const activePerformanceData = filterActiveDevelopers(req.body.performanceData || []);
    const normalizedData = normalizeEfficiencyData(activePerformanceData);
    
    console.log(`📊 Original performance data length:`, req.body.performanceData?.length || 0);
    console.log(`📊 Active developers count:`, activePerformanceData.length);
    console.log(`📊 Total developers:`, req.body.developers?.length || 0);
    console.log(`📊 Sprints count:`, req.body.sprints?.length || 0);
    
    // Preparar datos procesados para el análisis
    const processedData = {
      ...req.body,
      performanceData: normalizedData
    };

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = formatAnalysisPrompt(processedData);
    
    console.log(`\n🤖 PROMPT ENVIADO A GEMINI:`);
    console.log(`===========================`);
    console.log(prompt);
    console.log(`===========================`);
    console.log(`📏 Prompt length: ${prompt.length} characters`);
    
    console.log(`\n🔄 Sending request to Gemini...`);
    const startTime = Date.now();
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const endTime = Date.now();
    console.log(`✅ Gemini response received in ${endTime - startTime}ms`);
    
    console.log(`\n🤖 RESPUESTA RAW DE GEMINI:`);
    console.log(`============================`);
    console.log(text);
    console.log(`============================`);
    console.log(`📏 Response length: ${text.length} characters`);
    
    // Clean and parse response
    const cleanText = text.replace(/```json|```/g, '').trim();
    console.log(`\n🧹 RESPUESTA LIMPIA:`);
    console.log(cleanText);
    
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(cleanText);
      console.log(`✅ JSON parsed successfully`);
      console.log(`📊 Insights count: ${aiAnalysis.insights?.length || 0}`);
      console.log(`📝 Summary length: ${aiAnalysis.summary?.length || 0} characters`);
    } catch (parseError) {
      console.error(`❌ JSON parse error:`, parseError);
      throw new Error(`Failed to parse AI response: ${parseError}`);
    }
    
    const finalResponse = {
      success: true,
      ...aiAnalysis,
      metadata: {
        activeDevelopers: activePerformanceData.length,
        totalDevelopers: req.body.developers?.length || 0,
        normalizedEfficiency: true,
        analysisTimestamp: timestamp
      }
    };
    
    console.log(`\n📤 RESPUESTA FINAL:`);
    console.log(JSON.stringify(finalResponse, null, 2));
    console.log(`=== AI ANALYSIS REQUEST END ===\n`);
    
    res.status(200).json(finalResponse);
    
  } catch (error) {
    console.error(`\n❌ ERROR EN AI ANALYSIS:`);
    console.error(`Error type:`, error?.constructor?.name);
    console.error(`Error message:`, error instanceof Error ? error.message : 'Unknown error');
    console.error(`Error stack:`, error instanceof Error ? error.stack : 'No stack');
    console.log(`=== AI ANALYSIS REQUEST END (ERROR) ===\n`);
    
    res.status(500).json({
      success: false,
      insights: [],
      summary: 'Error en el análisis de IA',
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        activeDevelopers: 0,
        totalDevelopers: 0,
        normalizedEfficiency: false,
        analysisTimestamp: timestamp
      }
    });
  }
}