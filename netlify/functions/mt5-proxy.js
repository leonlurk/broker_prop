exports.handler = async (event, context) => {
  // Configurar CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extraer la ruta y parámetros de la URL
    const { path } = event;
    const queryParams = event.queryStringParameters || {};
    
    // Construir la URL del servidor MT5
    const mt5BaseUrl = 'https://62.171.177.212:5000';
    
    // Extraer la ruta después de /mt5-proxy
    const apiPath = path.replace('/.netlify/functions/mt5-proxy', '');
    
    // Construir query string si hay parámetros
    const queryString = Object.keys(queryParams).length > 0 
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    
    const targetUrl = `${mt5BaseUrl}${apiPath}${queryString}`;
    
    console.log('Proxying request to:', targetUrl);
    
    // Configurar opciones de fetch
    const fetchOptions = {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AGM-Trading-Proxy/1.0'
      }
    };
    
    // Agregar body si es POST/PUT
    if (event.body && ['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
      fetchOptions.body = event.body;
    }
    
    // Hacer la petición al servidor MT5
    const response = await fetch(targetUrl, fetchOptions);
    
    // Obtener el contenido de la respuesta
    let responseBody;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }
    
    // Retornar la respuesta con headers CORS
    return {
      statusCode: response.status,
      headers,
      body: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
    };
    
  } catch (error) {
    console.error('Error in MT5 proxy:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Proxy error',
        message: error.message,
        details: 'Error connecting to MT5 server'
      })
    };
  }
}; 