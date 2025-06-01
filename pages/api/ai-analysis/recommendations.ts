// pages/api/ai-analysis/recommendations.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function isAuthenticated(req: NextApiRequest): boolean {
  return req.headers.authorization !== undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { sprintId } = req.query;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
Como experto en gestión ágil, proporciona 5 recomendaciones específicas para mejorar el rendimiento del equipo${sprintId ? ` en el sprint ${sprintId}` : ''}.

Recomendaciones deben ser:
- Específicas y accionables
- Basadas en mejores prácticas ágiles
- Implementables en corto plazo
- Enfocadas en productividad y calidad

Responde con array JSON de strings:
["recomendación 1", "recomendación 2", ...]
`;

    console.log(`🔄 Getting recommendations${sprintId ? ` for sprint ${sprintId}` : ''}`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`🤖 Recommendations response:`, text);
    
    const recommendations = JSON.parse(text.replace(/```json|```/g, '').trim());
    
    res.status(200).json({ recommendations });
    
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ 
      recommendations: [
        'Revisar planificación del sprint',
        'Implementar pair programming',
        'Mejorar documentación técnica',
        'Establecer retrospectivas regulares',
        'Optimizar code review'
      ]
    });
  }
}