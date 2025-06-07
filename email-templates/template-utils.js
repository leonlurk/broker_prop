/**
 * Email Template Utilities for AGM PROP
 * 
 * This module provides helper functions to load and process email templates
 * with proper variable replacement and error handling.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load and process an email template
 * @param {string} templateName - Name of the template file (e.g., 'email-verification.html')
 * @param {object} variables - Object containing variables to replace in template
 * @returns {string} Processed HTML template
 */
const loadTemplate = (templateName, variables = {}) => {
  try {
    const templatePath = path.join(__dirname, templateName);
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace simple variables {{VARIABLE_NAME}}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, variables[key] || '');
    });
    
    return template;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw new Error(`Failed to load email template: ${templateName}`);
  }
};

/**
 * Send verification email
 * @param {object} params - Email parameters
 * @param {string} params.username - User's name
 * @param {string} params.verificationCode - 4-digit verification code
 * @returns {string} Processed email HTML
 */
const createVerificationEmail = ({ username, verificationCode }) => {
  return loadTemplate('email-verification.html', {
    USERNAME: username || 'Trader',
    VERIFICATION_CODE: verificationCode
  });
};

/**
 * Send welcome email
 * @param {object} params - Email parameters
 * @param {string} params.username - User's name
 * @param {string} params.loginUrl - URL to dashboard
 * @param {string} params.helpCenterUrl - URL to help center
 * @param {string} params.communityUrl - URL to community
 * @returns {string} Processed email HTML
 */
const createWelcomeEmail = ({ username, loginUrl, helpCenterUrl, communityUrl }) => {
  return loadTemplate('welcome-email.html', {
    USERNAME: username || 'Trader',
    LOGIN_URL: loginUrl || '#',
    HELP_CENTER_URL: helpCenterUrl || '#',
    COMMUNITY_URL: communityUrl || '#'
  });
};

/**
 * Send trading notification
 * @param {object} params - Email parameters
 * @param {string} params.username - User's name
 * @param {string} params.title - Notification title
 * @param {string} params.alertType - Type: 'success', 'warning', 'danger', 'info'
 * @param {string} params.icon - Emoji or icon
 * @param {string} params.mainMessage - Main message content
 * @param {string} params.explanation - Detailed explanation
 * @param {object} params.stats - Optional trading stats
 * @param {object} params.actions - Optional action buttons
 * @returns {string} Processed email HTML
 */
const createTradingNotification = ({ 
  username, 
  title, 
  alertType = 'info', 
  icon = '📊', 
  mainMessage, 
  explanation,
  stats = null,
  actions = null 
}) => {
  const variables = {
    USERNAME: username || 'Trader',
    NOTIFICATION_TITLE: title,
    ALERT_TYPE: alertType,
    ICON: icon,
    MAIN_MESSAGE: mainMessage,
    EXPLANATION_MESSAGE: explanation
  };

  // Add stats if provided
  if (stats) {
    variables.SHOW_STATS = true;
    Object.keys(stats).forEach(key => {
      variables[key.toUpperCase()] = stats[key];
    });
  }

  // Add actions if provided
  if (actions) {
    variables.SHOW_ACTIONS = true;
    Object.keys(actions).forEach(key => {
      variables[key.toUpperCase()] = actions[key];
    });
  }

  return loadTemplate('trading-notification.html', variables);
};

/**
 * Send promotional email
 * @param {object} params - Email parameters
 * @param {string} params.username - User's name
 * @param {string} params.title - Promo title
 * @param {string} params.subtitle - Promo subtitle
 * @param {string} params.mainMessage - Main message
 * @param {string} params.primaryCtaText - Primary button text
 * @param {string} params.primaryCtaUrl - Primary button URL
 * @param {object} params.offer - Optional highlight offer
 * @param {object} params.socialProof - Optional social proof stats
 * @param {string} params.unsubscribeUrl - Unsubscribe URL
 * @returns {string} Processed email HTML
 */
const createPromotionalEmail = ({ 
  username, 
  title, 
  subtitle, 
  mainMessage, 
  primaryCtaText, 
  primaryCtaUrl,
  offer = null,
  socialProof = null,
  unsubscribeUrl = '#'
}) => {
  const variables = {
    USERNAME: username || 'Trader',
    PROMO_TITLE: title,
    PROMO_SUBTITLE: subtitle,
    MAIN_MESSAGE: mainMessage,
    PRIMARY_CTA_TEXT: primaryCtaText,
    PRIMARY_CTA_URL: primaryCtaUrl,
    UNSUBSCRIBE_URL: unsubscribeUrl
  };

  // Add offer details if provided
  if (offer) {
    variables.HIGHLIGHT_OFFER = true;
    variables.OFFER_TITLE = offer.title;
    variables.OFFER_DESCRIPTION = offer.description;
    if (offer.badge) variables.OFFER_BADGE = offer.badge;
    if (offer.urgency) variables.URGENCY_MESSAGE = offer.urgency;
  }

  // Add social proof if provided
  if (socialProof) {
    variables.SOCIAL_PROOF = true;
    variables.ACTIVE_TRADERS = socialProof.activeTraders || '5,000+';
    variables.TOTAL_PAYOUTS = socialProof.totalPayouts || '$2M+';
    variables.SUCCESS_RATE = socialProof.successRate || '87%';
  }

  return loadTemplate('promotional-email.html', variables);
};

/**
 * Send password reset email
 * @param {object} params - Email parameters
 * @param {string} params.resetLink - Password reset link
 * @returns {string} Processed email HTML
 */
const createPasswordResetEmail = ({ resetLink }) => {
  return loadTemplate('reset_password_email.html', {}).replace('%LINK%', resetLink);
};

/**
 * Helper function to create SendGrid message object
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} from - From email (optional)
 * @param {string} fromName - From name (optional)
 * @returns {object} SendGrid message object
 */
const createSendGridMessage = (to, subject, html, from = null, fromName = null) => {
  return {
    to: to,
    from: {
      email: from || process.env.SENDGRID_FROM_EMAIL || 'team@alphaglobalmarket.io',
      name: fromName || process.env.SENDGRID_FROM_NAME || 'AGM PROP'
    },
    subject: subject,
    html: html
  };
};

/**
 * Complete email sending function using SendGrid
 * @param {object} sgMail - SendGrid mail instance
 * @param {string} templateName - Template name
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {object} variables - Template variables
 * @returns {Promise} SendGrid response
 */
const sendTemplatedEmail = async (sgMail, templateName, to, subject, variables) => {
  try {
    let html;
    
    // Use specific template functions based on template name
    switch (templateName) {
      case 'email-verification.html':
        html = createVerificationEmail(variables);
        break;
      case 'welcome-email.html':
        html = createWelcomeEmail(variables);
        break;
      case 'trading-notification.html':
        html = createTradingNotification(variables);
        break;
      case 'promotional-email.html':
        html = createPromotionalEmail(variables);
        break;
      case 'reset_password_email.html':
        html = createPasswordResetEmail(variables);
        break;
      default:
        html = loadTemplate(templateName, variables);
    }
    
    const message = createSendGridMessage(to, subject, html);
    const response = await sgMail.send(message);
    
    console.log(`✅ Email sent successfully to ${to} using template ${templateName}`);
    return response;
    
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
    throw error;
  }
};

// Export all functions
module.exports = {
  loadTemplate,
  createVerificationEmail,
  createWelcomeEmail,
  createTradingNotification,
  createPromotionalEmail,
  createPasswordResetEmail,
  createSendGridMessage,
  sendTemplatedEmail
};

/**
 * USAGE EXAMPLES:
 * 
 * const emailUtils = require('./email-templates/template-utils');
 * const sgMail = require('@sendgrid/mail');
 * 
 * // 1. Send verification email
 * await emailUtils.sendTemplatedEmail(
 *   sgMail,
 *   'email-verification.html',
 *   'user@example.com',
 *   '🔐 Verifica tu cuenta - AGM PROP',
 *   { username: 'Juan Pérez', verificationCode: '1234' }
 * );
 * 
 * // 2. Send welcome email
 * await emailUtils.sendTemplatedEmail(
 *   sgMail,
 *   'welcome-email.html',
 *   'user@example.com',
 *   '🎉 ¡Bienvenido a AGM PROP!',
 *   { 
 *     username: 'María García',
 *     loginUrl: 'https://agmprop.com/dashboard',
 *     helpCenterUrl: 'https://agmprop.com/help',
 *     communityUrl: 'https://agmprop.com/community'
 *   }
 * );
 * 
 * // 3. Send trading notification
 * await emailUtils.sendTemplatedEmail(
 *   sgMail,
 *   'trading-notification.html',
 *   'user@example.com',
 *   '⚠️ Alerta de Trading - AGM PROP',
 *   {
 *     username: 'Carlos Rodríguez',
 *     title: 'Límite de Drawdown Alcanzado',
 *     alertType: 'warning',
 *     icon: '⚠️',
 *     mainMessage: 'Tu cuenta ha alcanzado el 80% del límite de drawdown.',
 *     explanation: 'Te recomendamos revisar tu estrategia...',
 *     stats: {
 *       accountBalance: '$8,500',
 *       dailyPnl: '-$450',
 *       tradesCount: '12',
 *       maxDrawdown: '8.2%'
 *     }
 *   }
 * );
 * 
 * // 4. Send promotional email
 * await emailUtils.sendTemplatedEmail(
 *   sgMail,
 *   'promotional-email.html',
 *   'user@example.com',
 *   '🚀 Oferta Especial - 50% de Descuento',
 *   {
 *     username: 'Ana López',
 *     title: '¡Oferta Exclusiva por Tiempo Limitado!',
 *     subtitle: 'Aprovecha nuestro descuento especial',
 *     mainMessage: 'Por ser un trader valioso...',
 *     primaryCtaText: 'Aprovechar Oferta',
 *     primaryCtaUrl: 'https://agmprop.com/promo',
 *     offer: {
 *       title: '50% de Descuento',
 *       description: 'En todos nuestros planes de prop trading',
 *       badge: 'Oferta Limitada',
 *       urgency: 'Solo quedan 24 horas'
 *     },
 *     socialProof: {
 *       activeTraders: '8,500+',
 *       totalPayouts: '$3.2M+',
 *       successRate: '91%'
 *     },
 *     unsubscribeUrl: 'https://agmprop.com/unsubscribe'
 *   }
 * );
 */ 