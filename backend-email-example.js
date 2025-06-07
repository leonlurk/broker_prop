// EJEMPLO DE BACKEND PARA ENVÍO DE EMAILS
// Este archivo es solo de referencia - no se ejecuta en el frontend

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de Nodemailer (usando Gmail como ejemplo)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // tu-email@gmail.com
    pass: process.env.EMAIL_PASS  // tu-app-password (no la contraseña normal)
  }
});

// Endpoint para enviar emails de verificación
app.post('/api/send-verification-email', async (req, res) => {
  try {
    const { email, code, username } = req.body;
    
    const mailOptions = {
      from: {
        name: 'AGM Trading',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Código de verificación - AGM Trading',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f8f9fa; }
            .code { font-size: 36px; font-weight: bold; color: #06b6d4; text-align: center; letter-spacing: 8px; margin: 20px 0; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AGM Trading</h1>
              <h2>Código de Verificación</h2>
            </div>
            <div class="content">
              <p>Hola <strong>${username}</strong>,</p>
              <p>Para completar tu registro en AGM Trading, ingresa el siguiente código de verificación:</p>
              <div class="code">${code}</div>
              <p><strong>Este código expirará en 10 minutos.</strong></p>
              <p>Si no solicitaste este código, puedes ignorar este email de forma segura.</p>
              <p>Saludos,<br>Equipo AGM Trading</p>
            </div>
            <div class="footer">
              <p>© 2024 AGM Trading. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Email enviado exitosamente' });
    
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ success: false, error: 'Error al enviar email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en puerto ${PORT}`);
});

/*
INSTRUCCIONES PARA CONFIGURAR EL ENVÍO REAL DE EMAILS:

1. OPCIÓN 1 - BACKEND PROPIO:
   - Instalar dependencias: npm install express nodemailer cors
   - Configurar variables de entorno:
     EMAIL_USER=tu-email@gmail.com
     EMAIL_PASS=tu-app-password-de-gmail
   - Ejecutar este archivo: node backend-email-example.js

2. OPCIÓN 2 - SERVICIO EXTERNO (SendGrid):
   - Registrarse en SendGrid (gratis hasta 100 emails/día)
   - Obtener API Key
   - Usar su API REST

3. OPCIÓN 3 - AWS SES:
   - Configurar AWS SES
   - Usar SDK de AWS

4. PARA GMAIL APP PASSWORDS:
   - Ir a Google Account settings
   - Security > 2-Step Verification
   - App passwords > Generate password
   - Usar esa contraseña (no la de tu cuenta)

5. VARIABLES DE ENTORNO (.env):
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu-app-password
   PORT=3001
*/ 