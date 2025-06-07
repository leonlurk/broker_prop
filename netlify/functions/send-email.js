const sgMail = require('@sendgrid/mail');

// Configurar SendGrid con logging mejorado
console.log('🔧 Inicializando sistema de emails multi-plantilla...');

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;
const fromName = process.env.SENDGRID_FROM_NAME;

sgMail.setApiKey(apiKey);

// ============================
// PLANTILLAS DE EMAIL
// ============================

// Plantilla base común para todos los emails
const getEmailBase = () => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AGM PROP</title>
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
        .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .alert-success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .alert-warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .alert-danger { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="banner">
            <img src="https://assets.unlayer.com/projects/242663/1749256293521-Banner%20Mail%20-%20AGM%20(1).png?w=1000px&v=2025" alt="AGM PROP Banner" />
        </div>
        <div class="content">
            {{CONTENT}}
        </div>
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
</html>`;

// 1. VERIFICACIÓN DE EMAIL
const createVerificationTemplate = (code, username = 'Usuario') => {
  const content = `
    <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">¡Código de Verificación!</h1>
    <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Completa tu registro en AGM PROP</p>
    
    <div style="color: #333; font-size: 18px; margin-bottom: 25px;">
        Hola <strong>${username}</strong>,
    </div>
    
    <p style="color: #555; font-size: 16px; margin: 25px 0;">
        Para completar tu registro y verificar tu cuenta, ingresa el siguiente código:
    </p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; margin: 30px 0;">
        <div style="font-size: 42px; font-weight: 800; color: #ffffff; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${code}</div>
    </div>
    
    <div class="alert-warning">
        <p style="color: #e65100; font-size: 14px; margin: 0; font-weight: 500;">
            ⏰ Este código expirará en <strong>10 minutos</strong> por seguridad
        </p>
    </div>
  `;
  return getEmailBase().replace('{{CONTENT}}', content);
};

// 2. BIENVENIDA TRAS VERIFICACIÓN
const createWelcomeTemplate = (username = 'Usuario') => {
  const content = `
    <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">¡Bienvenido a AGM PROP!</h1>
    <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Tu cuenta ha sido verificada exitosamente</p>
    
    <div style="color: #333; font-size: 18px; margin-bottom: 25px;">
        Hola <strong>${username}</strong>,
    </div>
    
    <div class="alert-success">
        <p style="color: #155724; font-size: 16px; margin: 0;">
            ✅ <strong>¡Tu email ha sido verificado!</strong> Ya puedes acceder a todas las funcionalidades de AGM PROP.
        </p>
    </div>
    
    <p style="color: #555; font-size: 16px; margin: 25px 0;">
        Ahora puedes disfrutar de:
    </p>
    
    <ul style="text-align: left; max-width: 400px; margin: 0 auto; color: #555;">
        <li>💰 Trading en tiempo real</li>
        <li>📊 Análisis de mercado</li>
        <li>💳 Gestión de fondos</li>
        <li>📱 Plataforma móvil</li>
    </ul>
    
    <a href="#" class="button">Acceder a mi cuenta</a>
  `;
  return getEmailBase().replace('{{CONTENT}}', content);
};

// 3. RECUPERACIÓN DE CONTRASEÑA
const createPasswordResetTemplate = (resetLink, username = 'Usuario') => {
  const content = `
    <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">Restablece tu Contraseña</h1>
    <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Solicitud de cambio de contraseña</p>
    
    <div style="color: #333; font-size: 18px; margin-bottom: 25px;">
        Hola <strong>${username}</strong>,
    </div>
    
    <p style="color: #555; font-size: 16px; margin: 25px 0;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta AGM PROP.
    </p>
    
    <div class="alert-warning">
        <p style="color: #856404; font-size: 14px; margin: 0;">
            🔐 Si no solicitaste este cambio, ignora este email. Tu cuenta está segura.
        </p>
    </div>
    
    <a href="${resetLink}" class="button">Restablecer Contraseña</a>
    
    <p style="color: #777; font-size: 14px; margin-top: 30px;">
        Este enlace expirará en 1 hora por seguridad.
    </p>
  `;
  return getEmailBase().replace('{{CONTENT}}', content);
};

// 4. CONFIRMACIÓN DE DEPÓSITO
const createDepositConfirmationTemplate = (amount, currency, transactionId, username = 'Usuario') => {
  const content = `
    <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">¡Depósito Confirmado!</h1>
    <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Tu depósito ha sido procesado exitosamente</p>
    
    <div style="color: #333; font-size: 18px; margin-bottom: 25px;">
        Hola <strong>${username}</strong>,
    </div>
    
    <div class="alert-success">
        <p style="color: #155724; font-size: 16px; margin: 0;">
            ✅ <strong>Depósito confirmado:</strong> ${amount} ${currency}
        </p>
    </div>
    
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: left;">
        <h3 style="margin-top: 0; color: #333;">Detalles de la transacción:</h3>
        <p style="margin: 5px 0;"><strong>Monto:</strong> ${amount} ${currency}</p>
        <p style="margin: 5px 0;"><strong>ID de transacción:</strong> ${transactionId}</p>
        <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p style="margin: 5px 0;"><strong>Estado:</strong> <span style="color: #28a745;">Confirmado</span></p>
    </div>
    
    <a href="#" class="button">Ver mi cuenta</a>
  `;
  return getEmailBase().replace('{{CONTENT}}', content);
};

// 5. ALERTA DE TRADING
const createTradingAlertTemplate = (alertType, message, username = 'Usuario') => {
  const content = `
    <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">🚨 Alerta de Trading</h1>
    <p style="color: #666; font-size: 16px; margin-bottom: 30px;">${alertType}</p>
    
    <div style="color: #333; font-size: 18px; margin-bottom: 25px;">
        Hola <strong>${username}</strong>,
    </div>
    
    <div class="alert-warning">
        <p style="color: #856404; font-size: 16px; margin: 0;">
            📊 <strong>${message}</strong>
        </p>
    </div>
    
    <p style="color: #555; font-size: 16px; margin: 25px 0;">
        Te recomendamos revisar tu portfolio y considerar tus próximas estrategias de trading.
    </p>
    
    <a href="#" class="button">Ver Dashboard</a>
  `;
  return getEmailBase().replace('{{CONTENT}}', content);
};

// ============================
// CONFIGURACIÓN DE PLANTILLAS
// ============================

const EMAIL_TEMPLATES = {
  'email_verification': {
    subject: '🔐 Tu código de verificación - Alpha Global Market',
    template: createVerificationTemplate
  },
  'welcome': {
    subject: '🎉 ¡Bienvenido a Alpha Global Market!',
    template: createWelcomeTemplate
  },
  'password_reset': {
    subject: '🔑 Restablece tu contraseña - Alpha Global Market',
    template: createPasswordResetTemplate
  },
  'deposit_confirmation': {
    subject: '💰 Depósito confirmado - Alpha Global Market',
    template: createDepositConfirmationTemplate
  },
  'trading_alert': {
    subject: '🚨 Alerta de Trading - Alpha Global Market',
    template: createTradingAlertTemplate
  }
};

// ============================
// HANDLER PRINCIPAL
// ============================

exports.handler = async (event, context) => {
  console.log('🚀 Sistema de emails multi-plantilla ejecutándose...');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'CORS preflight' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Método no permitido' }) };
  }

  try {
    // Verificar variables de entorno
    if (!process.env.SENDGRID_API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'SendGrid API Key no configurada' }) };
    }

    const { email, type, username, ...templateData } = JSON.parse(event.body || '{}');
    
    console.log('📋 Datos recibidos:', { email, type, username, templateData });
    
    if (!email || !type) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Email y tipo son requeridos' }) };
    }

    // Verificar que el tipo de plantilla existe
    if (!EMAIL_TEMPLATES[type]) {
      return { statusCode: 400, headers, body: JSON.stringify({ 
        success: false, 
        error: `Tipo de email no válido. Tipos disponibles: ${Object.keys(EMAIL_TEMPLATES).join(', ')}` 
      }) };
    }

    const emailConfig = EMAIL_TEMPLATES[type];
    
    // Generar el HTML basado en el tipo
    let htmlContent;
    
    switch(type) {
      case 'email_verification':
        htmlContent = emailConfig.template(templateData.code, username);
        break;
      case 'welcome':
        htmlContent = emailConfig.template(username);
        break;
      case 'password_reset':
        htmlContent = emailConfig.template(templateData.resetLink, username);
        break;
      case 'deposit_confirmation':
        htmlContent = emailConfig.template(templateData.amount, templateData.currency, templateData.transactionId, username);
        break;
      case 'trading_alert':
        htmlContent = emailConfig.template(templateData.alertType, templateData.message, username);
        break;
      default:
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Tipo de plantilla no implementado' }) };
    }

    // Configurar el mensaje
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'team@alphaglobalmarket.io',
        name: process.env.SENDGRID_FROM_NAME || 'Alpha Global Market'
      },
      subject: emailConfig.subject,
      html: htmlContent
    };
    
    console.log(`📤 Enviando email tipo "${type}" a ${email}`);
    
    // Enviar email
    await sgMail.send(msg);
    
    console.log(`✅ Email "${type}" enviado exitosamente a ${email}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `Email ${type} enviado exitosamente`,
        type: type
      }),
    };
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    
    let errorMessage = 'Error al enviar email';
    let statusCode = 500;
    
    if (error.response && error.response.body && error.response.body.errors) {
      const sgError = error.response.body.errors[0];
      errorMessage = sgError.message || errorMessage;
    }
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({ success: false, error: errorMessage }),
    };
  }
}; 