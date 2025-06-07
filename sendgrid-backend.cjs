// SERVIDOR BACKEND PARA SENDGRID
// Ejecutar con: node sendgrid-backend.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de SendGrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Template de email para verificación - Diseño Profesional basado en referencia
const createVerificationEmailTemplate = (code, username) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Verificación de Correo Electrónico | AGM PROP</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Estilos generales del cuerpo del correo */
    body {
      background: #f0f2f5; /* Fondo gris claro más moderno */
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
      color: #333;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      -webkit-text-size-adjust: 100%; /* Asegura que el texto no se ajuste en iOS */
      -ms-text-size-adjust: 100%; /* Asegura que el texto no se ajuste en Windows Phone */
    }

    /* Sección de banner fullwidth */
    .banner-section {
      background-color: #000; /* Fondo negro para el banner */
      text-align: center;
      padding: 0; /* Sin padding para eliminar bordes blancos */
      width: 100%; /* Ancho completo */
      margin: 0; /* Sin márgenes */
      overflow: hidden; /* Oculta los bordes recortados */
      line-height: 0; /* Elimina espacios debajo de la imagen */
    }

    /* Contenedor principal del contenido del correo */
    .container {
      max-width: 600px; /* Ancho máximo aumentado para mayor visibilidad */
      width: 100%; /* Asegura que ocupe el ancho completo en móviles */
      margin: 20px auto; /* Centra el contenedor con margen superior */
      background: #ffffff; /* Fondo blanco para el contenido */
      border-radius: 8px; /* Bordes redondeados sutiles */
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07); /* Sombra más pronunciada pero suave */
      padding: 0; /* Eliminado el padding inicial para manejarlo dentro de secciones */
      overflow: hidden; /* Para contener los bordes redondeados */
    }

    /* Estilos para la imagen del logo/banner */
    .logo {
      width: 100%; /* Ancho completo sin recorte extra */
      max-width: 100%;
      height: 120px; /* Altura aumentada para mejor presencia */
      display: block;
      margin: 0; /* Sin márgenes para centrado perfecto */
      object-fit: cover; /* Recorta la imagen manteniendo proporciones */
      object-position: center; /* Centra la imagen */
      border: none; /* Sin bordes */
      outline: none; /* Sin outline */
      vertical-align: top; /* Elimina espacios debajo */
    }

    /* Sección de contenido principal */
    .content-section {
      padding: 30px 40px; /* Padding interno para el contenido */
    }

    /* Estilos para el título principal */
    h2 {
      color: #1a1a1a;
      font-size: 26px; /* Tamaño de fuente del título ligeramente más grande */
      margin-top: 0;
      margin-bottom: 25px; /* Más margen inferior */
      text-align: center;
    }

    /* Estilos para los párrafos de texto */
    p {
      margin-bottom: 18px; /* Margen inferior para separar párrafos */
      color: #444; /* Color de texto ligeramente más oscuro para mejor contraste */
      font-size: 16px;
    }

    /* Contenedor para centrar el código */
    .code-wrapper {
      text-align: center;
      margin: 35px 0; /* Margen superior e inferior para el código */
      background-color: #f9f9f9;
      border-radius: 12px;
      padding: 30px;
      border: 2px dashed #007bff;
    }

    /* Estilos del código de verificación */
    .verification-code {
      font-size: 36px;
      font-weight: 900;
      color: #007bff;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
      text-align: center;
    }

    .code-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .code-expiry {
      font-size: 14px;
      color: #e11d48;
      margin-top: 15px;
      font-weight: 600;
    }

    /* Estilos para las secciones de características */
    .feature-section {
      background-color: #f9f9f9; /* Fondo ligeramente gris para destacar */
      border-radius: 6px;
      padding: 25px 30px;
      margin-top: 30px;
      border: 1px solid #eee;
    }

    .feature-section h3 {
      color: #1a1a1a;
      font-size: 20px;
      margin-bottom: 15px;
      text-align: center;
    }

    .feature-section p {
      font-size: 15px;
      color: #555;
      margin-bottom: 10px;
    }

    .feature-item {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px dashed #e0e0e0; /* Línea de puntos para separar características */
    }

    .feature-item:last-child {
      border-bottom: none; /* Eliminar borde en el último elemento */
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .feature-item strong {
      color: #000;
      font-size: 16px;
      display: block; /* Para que el texto fuerte esté en su propia línea */
      margin-bottom: 5px;
    }

    /* Estilos para el mensaje de advertencia/seguridad */
    .warning {
      color: #777;
      font-size: 14px;
      margin-top: 30px; /* Margen superior */
      padding-top: 20px; /* Padding superior */
      border-top: 1px solid #eee;
      text-align: center;
      line-height: 1.5;
    }

    /* Estilos para el pie de página */
    .footer {
      color: #888; /* Color de texto más claro */
      font-size: 12px;
      margin-top: 40px; /* Más margen superior */
      text-align: center;
      border-top: 1px solid #eee;
      padding-top: 25px; /* Más padding superior */
      padding-bottom: 20px; /* Padding inferior */
      background-color: #f8f8f8; /* Fondo ligeramente diferente para el footer */
      border-bottom-left-radius: 8px; /* Bordes redondeados para el footer */
      border-bottom-right-radius: 8px;
    }

    /* Media Queries para responsividad */
    @media only screen and (max-width: 620px) {
      .container {
        border-radius: 0; /* Elimina los bordes redondeados en pantallas muy pequeñas */
        box-shadow: none; /* Elimina la sombra en pantallas muy pequeñas */
      }
      .content-section {
        padding: 25px 25px; /* Ajusta el padding en pantallas pequeñas */
      }
      h2 {
        font-size: 22px; /* Tamaño de título más pequeño en móviles */
      }
      .verification-code {
        font-size: 28px; /* Ajusta el tamaño del código en móviles */
        letter-spacing: 6px;
      }
      .feature-section {
        padding: 20px 20px;
      }
      .feature-section h3 {
        font-size: 18px;
      }
      .feature-item strong {
        font-size: 15px;
      }
      .feature-item p {
        font-size: 14px;
      }
    }

    @media only screen and (max-width: 480px) {
      .content-section {
        padding: 20px 20px; /* Reduce aún más el padding */
      }
      h2 {
        font-size: 20px;
        margin-bottom: 20px;
      }
      p {
        font-size: 15px;
      }
      .code-wrapper {
        margin: 25px 0;
        padding: 20px;
      }
      .verification-code {
        font-size: 24px;
        letter-spacing: 4px;
      }
      .warning {
        font-size: 13px;
        margin-top: 20px;
        padding-top: 15px;
      }
      .footer {
        font-size: 11px;
        margin-top: 30px;
        padding-top: 15px;
      }
    }
  </style>
</head>
  <body>
    <!-- Banner fullwidth fuera del contenedor -->
    <div class="banner-section">
      <img src="https://assets.unlayer.com/projects/242663/1749256293521-Banner%20Mail%20-%20AGM%20(1).png?w=1000px&v=2025" alt="AGM PROP" class="logo" />
    </div>
    
    <!-- Contenedor principal con contenido -->
    <div class="container">
      <div class="content-section">
      <h2>¡Verifica tu dirección de correo electrónico!</h2>
      
      <p>Hola ${username || 'Trader'},</p>
      
      <p>Gracias por registrarte en AGM PROP.</p>
      
      <p>Estamos emocionados de que formes parte de nuestra comunidad de traders. Para activar tu cuenta y empezar a disfrutar de todas las ventajas que tenemos para ti, ingresa el siguiente código de verificación en la aplicación:</p>
      
      <div class="code-wrapper">
        <div class="code-label">Tu Código de Verificación</div>
        <div class="verification-code">${code}</div>
        <div class="code-expiry">⏰ Expira en 10 minutos</div>
      </div>

      <div class="feature-section">
        <h3>Tu camino hacia el éxito en el prop trading</h3>
        <p>En AGM PROP, hemos diseñado una plataforma para llevar tu experiencia de trading al siguiente nivel. Una vez verificada tu cuenta, podrás explorar:</p>
        
        <div class="feature-item">
          <strong>Maximiza tus ganancias con capital proporcionado</strong>
          <p>Aprovecha nuestras cuentas de prop trading para operar con capital significativo y aumentar exponencialmente tu potencial de ganancias. Con las herramientas y condiciones adecuadas, cada oportunidad en el mercado se convierte en beneficios reales.</p>
        </div>
        
        <div class="feature-item">
          <strong>Opera con velocidad y precisión profesional</strong>
          <p>Disfruta de una ejecución de órdenes ultrarrápida y en tiempo real a través de nuestra plataforma basada en <strong>MetaTrader 5</strong>. Accede a gráficos avanzados, análisis técnico profesional y todas las herramientas necesarias para operar como un trader institucional.</p>
        </div>

        <div class="feature-item">
          <strong>Accede a financiamiento de hasta $200.000</strong>
          <p>Demuestra tu habilidad en nuestros desafíos de trading y obtén acceso a cuentas financiadas de hasta $200,000. Sin riesgo de tu capital personal, solo ganancias compartidas basadas en tu rendimiento.</p>
        </div>
      </div>
      
      <p class="warning">Este código es esencial para la activación de tu cuenta de AGM PROP. Si no te registraste en nuestro servicio, por favor, ignora este correo con total tranquilidad.</p>
    </div>
    
    <div class="footer">
      ¿Necesitas ayuda o tienes preguntas? No dudes en <a href="mailto:team@alphaglobalmarket.io" style="color: #007bff; text-decoration: none;">contactar con el soporte de AGM PROP</a>.<br>
      © 2025 AGM PROP. Todos los derechos reservados.
      <br>🌐 alphaglobalmarket.io | 📧 team@alphaglobalmarket.io
    </div>
  </div>
</body>
</html>
  `;
};

// Endpoint para enviar emails de verificación
app.post('/api/send-verification-email', async (req, res) => {
  try {
    const { email, code, username } = req.body;
    
    // Validar datos requeridos
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email y código son requeridos' 
      });
    }
    
    console.log(`📧 Enviando email de verificación a ${email} con código ${code}`);
    
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'AGM Trading'
      },
      subject: '🔐 Tu código de verificación - AGM Trading',
      html: createVerificationEmailTemplate(code, username)
    };
    
    // Enviar email
    await sgMail.send(msg);
    
    console.log(`✅ Email enviado exitosamente a ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Email de verificación enviado exitosamente' 
    });
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    
    // Manejar errores específicos de SendGrid
    let errorMessage = 'Error al enviar email de verificación';
    
    if (error.response && error.response.body && error.response.body.errors) {
      const sgError = error.response.body.errors[0];
      console.error('SendGrid error details:', sgError);
      
      if (sgError.field === 'from') {
        errorMessage = 'Error de configuración: Verificar sender en SendGrid';
      } else if (sgError.message.includes('API key')) {
        errorMessage = 'Error de configuración: API Key inválida';
      } else {
        errorMessage = sgError.message || errorMessage;
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'AGM Trading Email Service',
    timestamp: new Date().toISOString(),
    sendgrid: !!process.env.SENDGRID_API_KEY
  });
});

// Endpoint para probar configuración
app.get('/api/test-config', (req, res) => {
  const config = {
    hasApiKey: !!process.env.SENDGRID_API_KEY,
    hasFromEmail: !!process.env.SENDGRID_FROM_EMAIL,
    hasFromName: !!process.env.SENDGRID_FROM_NAME,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'No configurado',
    fromName: process.env.SENDGRID_FROM_NAME || 'No configurado'
  };
  
  res.json(config);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('🚀 AGM Trading Email Service iniciado');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🔑 SendGrid API Key: ${process.env.SENDGRID_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`📧 From Email: ${process.env.SENDGRID_FROM_EMAIL || '❌ No configurado'}`);
  console.log(`👤 From Name: ${process.env.SENDGRID_FROM_NAME || '❌ No configurado'}`);
  console.log('');
  console.log('🔗 Endpoints disponibles:');
  console.log(`   POST http://localhost:${PORT}/api/send-verification-email`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/test-config`);
});

module.exports = app; 