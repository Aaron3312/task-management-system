// pages/api/test-gemini.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing Gemini API...');
    
    // Verificar la API key
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 API Key status:', apiKey ? `Available (${apiKey.substring(0, 10)}...)` : 'NOT FOUND');
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY not configured',
        success: false 
      });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Hacer una prueba simple
    console.log('🚀 Sending test prompt to Gemini...');
    const prompt = "Respond with just the word 'SUCCESS' if you can process this message.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini response:', text);
    
    return res.status(200).json({
      success: true,
      message: 'Gemini API is working correctly',
      response: text,
      apiKeyConfigured: true
    });

  } catch (error) {
    console.error('❌ Gemini test failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : null
    });
  }
}