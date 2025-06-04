// pages/api/ai-analysis/performance.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyDdfbfnH3P-Z3JR12WN5ysRmnXMR-wY6jc");

function isAuthenticated(req: NextApiRequest): boolean {
  return req.headers.authorization !== undefined;
}

function formatAnalysisPrompt(data: any): string {
  const { performanceData, sprints, developers, metrics } = data;
  
  return `
Eres un experto en análisis de proyectos de desarrollo de software. Analiza los siguientes datos de rendimiento y proporciona insights específicos.

DATOS DEL PROYECTO:
- Desarrolladores activos: ${developers.length}
- Sprints analizados: ${sprints.length}
- Horas totales trabajadas: ${metrics.totalHours}h
- Tareas completadas: ${metrics.totalTasks}
- Eficiencia promedio: ${metrics.efficiency.toFixed(1)}%

RENDIMIENTO POR DESARROLLADOR:
${performanceData.slice(0, 10).map((dev: any) => 
  `- ${dev.developerName}: ${dev.hoursWorked}h, ${dev.tasksCompleted} tareas, ${dev.efficiency.toFixed(1)}% eficiencia`
).join('\n')}

SPRINTS:
${sprints.map((sprint: any) => 
  `- ${sprint.name}: ${sprint.start_date || 'N/A'} - ${sprint.end_date || 'N/A'}`
).join('\n')}

ANÁLISIS REQUERIDO:
1. Identifica patrones en el rendimiento del equipo
2. Detecta posibles cuellos de botella o áreas problemáticas
3. Analiza la distribución de carga de trabajo
4. Evalúa la eficiencia general del proyecto
5. Proporciona recomendaciones específicas y accionables

FORMATO DE RESPUESTA (JSON):
{
  "insights": [
    {
      "category": "performance|efficiency|workload|sprint|general",
      "severity": "low|medium|high",
      "title": "Título del insight",
      "description": "Descripción detallada del hallazgo",
      "recommendation": "Recomendación específica",
      "data_points": ["punto de datos relevante"]
    }
  ],
  "summary": "Resumen ejecutivo del análisis en 2-3 oraciones"
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
    console.log(`📊 Request body keys:`, Object.keys(req.body));
    console.log(`📊 Performance data length:`, req.body.performanceData?.length || 0);
    console.log(`📊 Developers count:`, req.body.developers?.length || 0);
    console.log(`📊 Sprints count:`, req.body.sprints?.length || 0);
    console.log(`📊 Metrics:`, req.body.metrics);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = formatAnalysisPrompt(req.body);
    
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
      ...aiAnalysis
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}