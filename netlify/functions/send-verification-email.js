const sgMail = require('@sendgrid/mail');

// Configurar SendGrid con logging mejorado
console.log('🔧 Inicializando función de Netlify...');

// Verificar variables de entorno
const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;
const fromName = process.env.SENDGRID_FROM_NAME;

console.log('📋 Variables de entorno:');
console.log('- SENDGRID_API_KEY:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NO DEFINIDA');
console.log('- SENDGRID_FROM_EMAIL:', fromEmail || 'NO DEFINIDA');
console.log('- SENDGRID_FROM_NAME:', fromName || 'NO DEFINIDA');

if (!apiKey) {
  console.error('❌ SENDGRID_API_KEY no está definida');
}

sgMail.setApiKey(apiKey);

// Template del email con el mismo diseño que ya usamos
const createVerificationEmailTemplate = (code, username = 'Usuario') => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Verificación - AGM PROP</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                background-color: #f4f4f4;
                line-height: 1.6;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .banner {
                width: 100%;
                height: 120px;
                background-color: #000000;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .banner img {
                width: 100%;
                height: 120px;
                object-fit: cover;
                object-position: center;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .logo {
                width: 80px;
                height: auto;
                margin-bottom: 30px;
            }
            .title {
                color: #333333;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 10px;
                letter-spacing: -0.5px;
            }
            .subtitle {
                color: #666666;
                font-size: 16px;
                margin-bottom: 30px;
                font-weight: 400;
            }
            .greeting {
                color: #333333;
                font-size: 18px;
                margin-bottom: 25px;
                font-weight: 500;
            }
            .code-container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 30px;
                margin: 30px 0;
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
            }
            .code {
                font-size: 42px;
                font-weight: 800;
                color: #ffffff;
                letter-spacing: 8px;
                margin: 0;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                font-family: 'Courier New', monospace;
            }
            .instructions {
                color: #555555;
                font-size: 16px;
                margin: 25px 0;
                line-height: 1.8;
            }
            .warning {
                background-color: #fff8e1;
                border-left: 4px solid #ffb300;
                padding: 15px 20px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
            }
            .warning-text {
                color: #e65100;
                font-size: 14px;
                margin: 0;
                font-weight: 500;
            }
            .footer {
                background-color: #1a1a1a;
                color: #cccccc;
                padding: 30px;
                text-align: center;
                font-size: 14px;
            }
            .footer-title {
                color: #ffffff;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            .footer-text {
                margin: 8px 0;
                opacity: 0.8;
            }
            .divider {
                height: 2px;
                background: linear-gradient(90deg, #667eea, #764ba2);
                margin: 30px 0;
                border: none;
            }
            @media only screen and (max-width: 600px) {
                .content {
                    padding: 30px 20px;
                }
                .code {
                    font-size: 36px;
                    letter-spacing: 6px;
                }
                .title {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Banner fullwidth -->
            <div class="banner">
                <img src="https://assets.unlayer.com/projects/242663/1749256293521-Banner%20Mail%20-%20AGM%20(1).png?w=1000px&v=2025" alt="AGM PROP Banner" />
            </div>
            
            <!-- Contenido principal -->
            <div class="content">
                <h1 class="title">¡Código de Verificación!</h1>
                <p class="subtitle">Completa tu registro en AGM PROP</p>
                
                <div class="greeting">
                    Hola <strong>${username}</strong>,
                </div>
                
                <p class="instructions">
                    Para completar tu registro y verificar tu cuenta, ingresa el siguiente código de verificación en la aplicación:
                </p>
                
                <div class="code-container">
                    <div class="code">${code}</div>
                </div>
                
                <div class="warning">
                    <p class="warning-text">
                        ⏰ Este código expirará en <strong>10 minutos</strong> por seguridad
                    </p>
                </div>
                
                <hr class="divider">
                
                <p class="instructions">
                    Si no solicitaste este código, puedes ignorar este email de forma segura.
                </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-title">AGM PROP</div>
                <div class="footer-text">Trading Platform</div>
                <div class="footer-text">team@alphaglobalmarket.io</div>
                <div class="footer-text" style="margin-top: 15px; opacity: 0.6;">
                    © 2025 AGM PROP. Todos los derechos reservados.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Handler de la función Netlify
exports.handler = async (event, context) => {
  console.log('🚀 Función ejecutándose...');
  console.log('📝 Event details:', {
    httpMethod: event.httpMethod,
    headers: event.headers,
    bodyLength: event.body ? event.body.length : 0
  });

  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Manejar preflight request
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ CORS preflight request');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight' }),
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    console.log('❌ Método no permitido:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Método no permitido' 
      }),
    };
  }

  try {
    // Verificar variables de entorno críticas
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY no configurada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'SendGrid API Key no configurada' 
        }),
      };
    }

    // Parsear el body de la request
    console.log('📦 Parseando body de la request...');
    const { email, code, username, type } = JSON.parse(event.body || '{}');
    
    // Validar datos requeridos
    console.log('📋 Datos recibidos:', { email, code, username, type });
    
    if (!email || !code) {
      console.log('❌ Datos faltantes - email o código');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Email y código son requeridos' 
        }),
      };
    }
    
    console.log(`📧 Enviando email de verificación a ${email} con código ${code}`);
    
    // Configurar el mensaje
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'team@alphaglobalmarket.io',
        name: process.env.SENDGRID_FROM_NAME || 'AGM PROP'
      },
      subject: '🔐 Tu código de verificación - AGM PROP',
      html: createVerificationEmailTemplate(code, username || 'Usuario')
    };
    
    console.log('📤 Configuración del mensaje:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });
    
    // Enviar email
    console.log('🔄 Enviando email via SendGrid...');
    await sgMail.send(msg);
    
    console.log(`✅ Email enviado exitosamente a ${email}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email de verificación enviado exitosamente' 
      }),
    };
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Manejar errores específicos de SendGrid
    let errorMessage = 'Error al enviar email de verificación';
    let statusCode = 500;
    
    if (error.response && error.response.body && error.response.body.errors) {
      const sgError = error.response.body.errors[0];
      console.error('SendGrid error details:', sgError);
      
      if (sgError.field === 'from') {
        errorMessage = 'Error de configuración: Verificar sender en SendGrid';
      } else if (sgError.message.includes('API key')) {
        errorMessage = 'Error de configuración: API Key inválida';
        statusCode = 401;
      } else {
        errorMessage = sgError.message || errorMessage;
      }
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Error de conexión con SendGrid';
    }
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
    };
  }
}; 