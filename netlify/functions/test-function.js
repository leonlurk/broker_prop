// Función de test simple para verificar que Netlify Functions funciona
exports.handler = async (event, context) => {
  console.log('🧪 Test function ejecutándose...');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight' }),
    };
  }

  try {
    // Verificar variables de entorno
    const envCheck = {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'DEFINIDA' : 'NO DEFINIDA',
      SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'NO DEFINIDA',
      SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME || 'NO DEFINIDA'
    };

    console.log('📋 Variables de entorno:', envCheck);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Función de test funcionando correctamente',
        environment: envCheck,
        timestamp: new Date().toISOString()
      }),
    };
    
  } catch (error) {
    console.error('❌ Error en función de test:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
}; 