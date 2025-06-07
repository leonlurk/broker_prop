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

// Función para cargar y procesar plantillas de email
const fs = require('fs');
const path = require('path');

// Función para cargar plantilla desde archivo
const loadEmailTemplate = (templateName, variables = {}) => {
  try {
    const templatePath = path.join(__dirname, 'email-templates', templateName);
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Reemplazar variables simples
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, variables[key] || '');
    });
    
    return template;
  } catch (error) {
    console.error(`Error cargando plantilla ${templateName}:`, error);
    // Fallback a la plantilla interna si hay error
    return createVerificationEmailTemplate(variables.VERIFICATION_CODE, variables.USERNAME);
  }
};

// Template de email para verificación - FALLBACK (mantener por compatibilidad)
const createVerificationEmailTemplate = (code, username) => {
  return loadEmailTemplate('email-verification.html', {
    USERNAME: username || 'Trader',
    VERIFICATION_CODE: code
  });
};

// Endpoint para enviar emails con enlaces de restablecimiento
app.post('/api/send-password-reset-link', async (req, res) => {
  try {
    const { email, resetLink, username } = req.body;
    
    // Validar datos requeridos
    if (!email || !resetLink) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email y enlace son requeridos' 
      });
    }
    
    console.log(`🔗 Enviando enlace de restablecimiento a ${email} para ${username}`);
    
    // Cargar plantilla de enlace de restablecimiento
    const html = loadEmailTemplate('password-reset-link.html', {
      USERNAME: username || 'Usuario',
      RESET_LINK: resetLink,
      EMAIL: email
    });
    
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Alpha Global Market'
      },
      subject: '🔗 Enlace para restablecer contraseña - Alpha Global Market',
      html: html
    };
    
    // Enviar email
    await sgMail.send(msg);
    
    console.log(`✅ Enlace de restablecimiento enviado exitosamente a ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Enlace de restablecimiento enviado exitosamente' 
    });
    
  } catch (error) {
    console.error('❌ Error enviando enlace de restablecimiento:', error);
    
    // Manejar errores específicos de SendGrid
    let errorMessage = 'Error al enviar enlace de restablecimiento';
    
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

// Endpoint para enviar emails de restablecimiento de contraseña (legacy)
app.post('/api/send-password-reset-email', async (req, res) => {
  try {
    const { email, code, username } = req.body;
    
    // Validar datos requeridos
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email y código son requeridos' 
      });
    }
    
    console.log(`🔐 Enviando email de restablecimiento a ${email} con código ${code}`);
    
    // Cargar plantilla de restablecimiento de contraseña
    const html = loadEmailTemplate('password-reset-email.html', {
      USERNAME: username || 'Usuario',
      RESET_CODE: code
    });
    
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Alpha Global Market'
      },
      subject: '🔐 Código para restablecer contraseña - Alpha Global Market',
      html: html
    };
    
    // Enviar email
    await sgMail.send(msg);
    
    console.log(`✅ Email de restablecimiento enviado exitosamente a ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Email de restablecimiento enviado exitosamente' 
    });
    
  } catch (error) {
    console.error('❌ Error enviando email de restablecimiento:', error);
    
    // Manejar errores específicos de SendGrid
    let errorMessage = 'Error al enviar email de restablecimiento';
    
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
        name: process.env.SENDGRID_FROM_NAME || 'Alpha Global Market'
      },
      subject: '🔐 Tu código de verificación - Alpha Global Market',
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
    service: 'Alpha Global Market Email Service',
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
  console.log('🚀 Alpha Global Market Email Service iniciado');
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