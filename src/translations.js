export const translations = {
  greeting: {
    es: "Hola",
    en: "Hello",
  },
  pageTitle: {
    es: "Impulsa tu trading con AGM Prop Firm",
    en: "Boost your trading with AGM Prop Firm",
  },
  pageSubtitle: {
    es: "Obtén hasta un 90% de profit split y gestiona cuentas de hasta $200,000",
    en: "Get up to a 90% profit split and manage accounts up to $200,000",
  },
  startButton: {
    es: "Empezar",
    en: "Get Started",
  },
  yourAccountsTitle: {
    es: "Tus Cuentas",
    en: "Your Accounts",
  },
  seeAllButton: {
    es: "Ver Todo",
    en: "View All",
  },
  // Login.jsx translations
  login_placeholder_usernameOrEmail: {
    es: "Usuario o Email",
    en: "Username or Email",
  },
  login_placeholder_password: {
    es: "Contraseña",
    en: "Password",
  },
  login_label_rememberMe: {
    es: "Recuérdame",
    en: "Remember me",
  },
  login_button_forgotPassword: {
    es: "¿Olvidaste la contraseña?",
    en: "Forgot password?",
  },
  login_button_login: {
    es: "Iniciar Sesión",
    en: "Login",
  },
  login_button_loggingIn: {
    es: "Iniciando...",
    en: "Logging in...",
  },
  login_button_verifyNow: { // This one might need context check, seems like register
    es: "Verificar Ahora",
    en: "Verify Now", 
  },
  login_text_noAccount: {
    es: "¿No tienes cuenta? ", // Note the trailing space
    en: "Don't have an account? ",
  },
  login_button_register: {
    es: "Regístrate",
    en: "Register",
  },
  login_error_loginFailed: {
    es: "Error al iniciar sesión. Por favor, verifica tus credenciales.",
    en: "Login failed. Please check your credentials.",
  },
  login_error_emailNotVerified: {
    es: "Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
    en: "Please verify your email address before logging in. Check your inbox and click the verification link.",
  },
  login_error_emailResent: {
    es: "Se ha enviado un nuevo email de verificación. Revisa tu bandeja de entrada (y spam).",
    en: "A new verification email has been sent. Check your inbox (and spam folder).",
  },
  login_error_emailResendFailed: {
    es: "Error al reenviar el email de verificación. Por favor, inténtalo más tarde.",
    en: "Error resending verification email. Please try again later.",
  },
  login_button_resendEmail: {
    es: "Reenviar Email de Verificación",
    en: "Resend Verification Email",
  },
  // Register.jsx translations
  register_error_passwordsDoNotMatch: {
    es: "Las contraseñas no coinciden",
    en: "Passwords do not match",
  },
  register_error_fillAllFields: {
    es: "Por favor, complete todos los campos obligatorios.",
    en: "Please complete all required fields.",
  },
  register_error_acceptTerms: {
    es: "Debe aceptar los términos y condiciones.",
    en: "You must accept the terms and conditions.",
  },
  register_error_registrationFailed: {
    es: "Error al registrar. Por favor, inténtelo de nuevo.",
    en: "Registration failed. Please try again.",
  },
  register_error_emailAlreadyInUse: {
    es: "Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro email.",
    en: "This email is already registered. Try logging in or use a different email.",
  },
  register_error_weakPassword: {
    es: "La contraseña es muy débil. Debe tener al menos 6 caracteres.",
    en: "Password is too weak. It must have at least 6 characters.",
  },
  register_error_invalidEmail: {
    es: "El formato del correo electrónico no es válido.",
    en: "The email format is not valid.",
  },
  register_error_operationNotAllowed: {
    es: "El registro con email está deshabilitado temporalmente.",
    en: "Email registration is temporarily disabled.",
  },
  register_message_registrationSuccess: {
    es: "¡Registro exitoso! Por favor verifica tu correo electrónico para activar tu cuenta.",
    en: "Registration successful! Please check your email to activate your account.",
  },
  register_placeholder_firstName: {
    es: "Nombre",
    en: "First Name",
  },
  register_placeholder_lastName: {
    es: "Apellido",
    en: "Last Name",
  },
  register_placeholder_username: {
    es: "Usuario",
    en: "Username",
  },
  register_placeholder_email: {
    es: "Correo Electrónico",
    en: "Email Address",
  },
  register_placeholder_country: {
    es: "País de Residencia",
    en: "Country of Residence",
  },
  register_placeholder_phoneNumber: {
    es: "Número de Teléfono",
    en: "Phone Number",
  },
  register_placeholder_password: { // Same as login, but scoped to register
    es: "Contraseña",
    en: "Password",
  },
  register_placeholder_confirmPassword: {
    es: "Confirmar Contraseña",
    en: "Confirm Password",
  },
  register_label_acceptTermsAndPrivacy: {
    es: "Acepto los Términos y Condiciones y la Política de Privacidad.",
    en: "I accept the Terms and Conditions and the Privacy Policy.",
  },
  register_button_continue: {
    es: "Continuar",
    en: "Continue",
  },
  register_button_processing: {
    es: "Procesando...",
    en: "Processing...",
  },
  register_button_loginHere: { // For the button that says "Verificar Ahora" but links to Login
    es: "Iniciar Sesión Aquí",
    en: "Login Here",
  },
  register_text_alreadyRegistered: {
    es: "¿Ya estás registrado? ", // Note the trailing space
    en: "Already registered? ",
  },
  // ForgotPassword.jsx translations
  forgotPassword_error_sendFailed: {
    es: "Error al enviar el correo de recuperación. Por favor, inténtelo de nuevo.",
    en: "Error sending recovery email. Please try again.",
  },
  forgotPassword_message_emailSent: {
    es: "Se ha enviado un correo de recuperación a tu dirección de email. Revisa tu bandeja de entrada (y spam).",
    en: "A recovery email has been sent to your email address. Check your inbox (and spam folder).",
  },
  forgotPassword_placeholder_email: {
    es: "Correo Electrónico",
    en: "Email Address",
  },
  forgotPassword_button_sending: {
    es: "Enviando...",
    en: "Sending...",
  },
  forgotPassword_button_continue: {
    es: "Continuar",
    en: "Continue",
  },
  forgotPassword_text_rememberedPassword: {
    es: "¿Recordaste tu contraseña? ", // Note the trailing space
    en: "Remembered your password? ",
  },
  // VerificationCode.jsx translations
  verificationCode_title: {
    es: "Ingresa el código de verificación",
    en: "Enter verification code",
  },
  verificationCode_text_didNotReceiveCode: {
    es: "Si no has recibido el código, ", // Note the trailing space
    en: "If you haven't received the code, ",
  },
  verificationCode_button_resend: {
    es: "reenviar",
    en: "resend",
  },
  verificationCode_button_continueSubmit: { // Differentiated from other "Continue" buttons
    es: "Continuar",
    en: "Continue",
  },
  // Descargas.jsx translations
  descargas_platform_mt5_name: {
    es: "Metatrader 5",
    en: "Metatrader 5",
  },
  descargas_platform_mt5_description: {
    es: "MetaTrader 5 es la plataforma de trading más popular, con una interfaz fácil de usar y altamente personalizable. Ofrece herramientas avanzadas de gráficos y gestión de órdenes para un seguimiento eficaz de las posiciones de trading, mejorando así el rendimiento del usuario.",
    en: "MetaTrader 5 is the most popular trading platform, with a user-friendly and highly customizable interface. It offers advanced charting and order management tools for effective tracking of trading positions, thereby improving user performance.",
  },
  descargas_platform_alphaGlobalMarket_name: {
    es: "Alpha Global Market",
    en: "Alpha Global Market",
  },
  descargas_platform_alphaGlobalMarket_description: {
    es: "Descubre el poder de AGM en tus manos. Nuestra aplicación ofrece acceso inmediato a mercados financieros globales con herramientas de análisis avanzadas y ejecución rápida. Interfaz intuitiva diseñada para traders de todos los niveles, con actualizaciones en tiempo real y alertas personalizables. Optimiza tu estrategia de trading desde cualquier lugar. Descarga ahora y lleva tu experiencia de trading al siguiente nivel.",
    en: "Discover the power of AGM in your hands. Our application offers immediate access to global financial markets with advanced analysis tools and fast execution. Intuitive interface designed for traders of all levels, with real-time updates and customizable alerts. Optimize your trading strategy from anywhere. Download now and take your trading experience to the next level.",
  },
  descargas_os_android: {
    es: "Android",
    en: "Android",
  },
  descargas_os_windows: {
    es: "Windows",
    en: "Windows",
  },
  descargas_os_iphone: {
    es: "iPhone",
    en: "iPhone",
  },
  descargas_os_mac: {
    es: "Mac",
    en: "Mac",
  },
  descargas_platform_vpn_name: {
    es: "Activa el VPN durante tus viajes",
    en: "Activate VPN during your travels",
  },
  descargas_platform_vpn_description: {
    es: "Querido usuario, si tienes un viaje programado fuera de tu país y necesitas utilizar la aplicación Pro Firm, es importante descargar y activar la conexión VPN durante todo el tiempo de uso de la aplicación. Esto garantizará su correcto funcionamiento independientemente de tu ubicación geográfica, permitiéndote acceder a la plataforma sin restricciones regionales. Si tienes alguna pregunta o quieres más información, consulta la sección de Preguntas Frecuentes (FAQs).",
    en: "Dear user, if you have a trip planned outside your country and need to use the Pro Firm application, it is important to download and activate the VPN connection during the entire time you use the application. This will ensure its correct functioning regardless of your geographical location, allowing you to access the platform without regional restrictions. If you have any questions or want more information, consult the Frequently Asked Questions (FAQs) section.",
  },
  descargas_platform_vpn_image_alt: {
    es: "Icono VPN",
    en: "VPN Icon",
  },
  // ChangePasswordModal.jsx translations
  changePasswordModal_error_noEmailFound: {
    es: "No se pudo obtener el correo electrónico actual. Por favor, asegúrate de haber iniciado sesión.",
    en: "Could not retrieve current email address. Please ensure you are logged in.",
  },
  changePasswordModal_success_emailSent: {
    es: "Se ha enviado un email a {{email}} para restablecer tu contraseña. Por favor revisa tu bandeja de entrada (y spam).",
    en: "An email has been sent to {{email}} to reset your password. Please check your inbox (and spam folder).",
  },
  changePasswordModal_error_sendResetEmailFailed: {
    es: "Ha ocurrido un error al enviar el correo de restablecimiento. Inténtalo de nuevo.",
    en: "An error occurred while sending the reset email. Please try again.",
  },
  changePasswordModal_error_generic: {
    es: "Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.",
    en: "An error occurred. Please try again later.",
  },
  changePasswordModal_title: {
    es: "Cambiar Contraseña",
    en: "Change Password",
  },
  changePasswordModal_button_close: {
    es: "Cerrar",
    en: "Close",
  },
  changePasswordModal_text_infoLine1: {
    es: "Se enviará un enlace para restablecer tu contraseña al correo electrónico asociado a tu cuenta.",
    en: "A link to reset your password will be sent to the email address associated with your account.",
  },
  changePasswordModal_text_infoBox: {
    es: "Se enviará un email a la dirección de correo registrada con un enlace para restablecer tu contraseña.", // Similar to above, translated as is.
    en: "An email will be sent to the registered email address with a link to reset your password.",
  },
  changePasswordModal_button_cancel: {
    es: "Cancelar",
    en: "Cancel",
  },
  changePasswordModal_button_sending: {
    es: "Enviando...",
    en: "Sending...",
  },
  changePasswordModal_button_sendEmail: {
    es: "Enviar Email",
    en: "Send Email",
  },
  changePasswordModal_description: {
    es: "Se enviará un enlace de restablecimiento de contraseña al correo electrónico registrado en tu cuenta.",
    en: "A password reset link will be sent to the email address registered to your account.",
  },
  changePasswordModal_currentEmail: {
    es: "Correo actual",
    en: "Current email",
  },
  changePasswordModal_button_sendReset: {
    es: "Enviar enlace de restablecimiento",
    en: "Send reset link",
  },
  changePasswordModal_error_noEmail: {
    es: "No se pudo obtener el correo electrónico de la cuenta.",
    en: "Could not retrieve account email address.",
  },
  changePasswordModal_error_userNotFound: {
    es: "No existe una cuenta con este email.",
    en: "No account found with this email.",
  },
  changePasswordModal_error_invalidEmail: {
    es: "El email ingresado no es válido.",
    en: "The entered email is not valid.",
  },
  changePasswordModal_error_tooManyRequests: {
    es: "Demasiados intentos. Intenta nuevamente más tarde.",
    en: "Too many attempts. Please try again later.",
  },
  changePasswordModal_error_sendingEmail: {
    es: "Error al enviar el email. Intenta nuevamente.",
    en: "Error sending email. Please try again.",
  },
  changePasswordModal_success_title: {
    es: "¡Email enviado!",
    en: "Email sent!",
  },
  changePasswordModal_success_message: {
    es: "Hemos enviado un enlace de restablecimiento a {{email}}",
    en: "We have sent a reset link to {{email}}",
  },
  changePasswordModal_success_stepsTitle: {
    es: "Pasos a seguir:",
    en: "Next steps:",
  },
  changePasswordModal_success_step1: {
    es: "Revisa tu email (incluyendo spam)",
    en: "Check your email (including spam)",
  },
  changePasswordModal_success_step2: {
    es: "Haz clic en el enlace recibido",
    en: "Click on the received link",
  },
  changePasswordModal_success_step3: {
    es: "Establece tu nueva contraseña",
    en: "Set your new password",
  },
  changePasswordModal_success_step4: {
    es: "¡Listo! Ya podrás iniciar sesión",
    en: "Done! You can now log in",
  },
  changePasswordModal_success_expiration: {
    es: "El enlace expirará en 1 hora",
    en: "The link will expire in 1 hour",
  },
  // UpdateEmailModal.jsx translations
  updateEmailModal_success_verificationSent: {
    es: "Se ha enviado un email de verificación a tu nueva dirección de correo. Por favor verifica tu nueva dirección de email.",
    en: "A verification email has been sent to your new email address. Please verify your new email address.",
  },
  updateEmailModal_error_generic: {
    es: "Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.",
    en: "An error occurred. Please try again later.",
  },
  updateEmailModal_error_requiresRecentLogin: {
    es: "Por seguridad, debes iniciar sesión nuevamente antes de cambiar tu correo electrónico.",
    en: "For security reasons, you must log in again before changing your email.",
  },
  updateEmailModal_error_emailInUse: {
    es: "Este correo electrónico ya está en uso por otra cuenta.",
    en: "This email address is already in use by another account.",
  },
  updateEmailModal_error_invalidEmail: {
    es: "El formato del correo electrónico no es válido.",
    en: "The email address format is not valid.",
  },
  updateEmailModal_title: {
    es: "Actualizar Correo Electrónico",
    en: "Update Email Address",
  },
  updateEmailModal_button_closeModal: {
    es: "Cerrar",
    en: "Close",
  },
  updateEmailModal_text_info: {
    es: "Ingresa tu nuevo correo electrónico. Te enviaremos un email para verificar la nueva dirección.",
    en: "Enter your new email address. We will send you an email to verify the new address.",
  },
  updateEmailModal_label_newEmail: {
    es: "Nuevo Correo Electrónico",
    en: "New Email Address",
  },
  updateEmailModal_placeholder_newEmail: {
    es: "nuevo@ejemplo.com",
    en: "new@example.com",
  },
  updateEmailModal_label_currentPassword: {
    es: "Contraseña Actual (para confirmar)",
    en: "Current Password (to confirm)",
  },
  updateEmailModal_placeholder_password: {
    es: "••••••••",
    en: "••••••••",
  },
  updateEmailModal_button_cancelUpdate: {
    es: "Cancelar",
    en: "Cancel",
  },
  updateEmailModal_button_updating: {
    es: "Actualizando...",
    en: "Updating...",
  },
  updateEmailModal_button_updateEmail: {
    es: "Actualizar Email",
    en: "Update Email",
  },
  // NotificationsModal.jsx translations
  notificationsModal_title: {
    es: "Notificaciones",
    en: "Notifications",
  },
  notificationsModal_item1_title: {
    es: "FELICITACIONES!!",
    en: "CONGRATULATIONS!!",
  },
  notificationsModal_item1_body: {
    es: "Ganaste La Competencia De Enero",
    en: "You won the January Competition",
  },
  notificationsModal_item_viewDetails: { // Common for all items
    es: "Ver Detalles",
    en: "View Details",
  },
  notificationsModal_item2_title: {
    es: "Pago Recibido",
    en: "Payment Received",
  },
  notificationsModal_item2_body: {
    es: "Has recibido un pago de $1,250.00", // For interpolation: "Has recibido un pago de {{amount}}"
    en: "You have received a payment of $1,250.00", // For interpolation: "You have received a payment of {{amount}}"
  },
  notificationsModal_item3_title: {
    es: "Objetivo Alcanzado",
    en: "Target Reached",
  },
  notificationsModal_item3_body: {
    es: "Has superado tu objetivo de profit del mes",
    en: "You have exceeded your monthly profit target",
  },
  notificationsModal_emptyState_text: {
    es: "No tienes notificaciones nuevas",
    en: "You have no new notifications",
  },
  // AfiliadosDashboard.jsx translations
  afiliadosDashboard_tier_commission_1: {
    es: "Comisión 10%",
    en: "10% Commission",
  },
  afiliadosDashboard_tier_commission_2: {
    es: "Comisión 12% + 3%",
    en: "12% Commission + 3%",
  },
  afiliadosDashboard_tier_commission_3: {
    es: "Comisión 15% + 3% + 1%",
    en: "15% Commission + 3% + 1%",
  },
  afiliadosDashboard_error_userNotAuthenticated: {
    es: "Usuario no autenticado.",
    en: "User not authenticated.",
  },
  afiliadosDashboard_error_loadingData: {
    es: "Error al cargar los datos. Intente de nuevo más tarde.",
    en: "Error loading data. Please try again later.",
  },
  afiliadosDashboard_error_loadingReferrals: {
    es: "Error al cargar la lista de referidos.",
    en: "Error loading referral list.",
  },
  afiliadosDashboard_error_invalidWallet: {
    es: "Por favor, introduzca una dirección de wallet USDT TRC20 válida.",
    en: "Please enter a valid USDT TRC20 wallet address.",
  },
  afiliadosDashboard_error_mustLoginToUpdateWallet: {
    es: "Debe iniciar sesión para actualizar la dirección.",
    en: "You must log in to update the address.",
  },
  afiliadosDashboard_success_walletUpdated: {
    es: "Dirección de wallet actualizada correctamente.",
    en: "Wallet address updated successfully.",
  },
  afiliadosDashboard_error_savingWallet: {
    es: "Error al guardar. Intente de nuevo.",
    en: "Error saving. Please try again.",
  },
  afiliadosDashboard_success_linkCopied: {
    es: "Enlace de afiliado copiado!",
    en: "Affiliate link copied!",
  },
  afiliadosDashboard_error_copyingLink: {
    es: "Error al copiar el enlace.",
    en: "Error copying link.",
  },
  afiliadosDashboard_walletNotSet: {
    es: "No establecida",
    en: "Not set",
  },
  afiliadosDashboard_panel_title: {
    es: "Panel",
    en: "Dashboard",
  },
  afiliadosDashboard_panel_performance: {
    es: "Rendimiento",
    en: "Performance",
  },
  afiliadosDashboard_panel_totalCommissions: {
    es: "Comisiones Totales",
    en: "Total Commissions",
  },
  afiliadosDashboard_panel_paidReferrals: {
    es: "Referidos Pagados",
    en: "Paid Referrals",
  },
  afiliadosDashboard_panel_conversion: {
    es: "Conversión",
    en: "Conversion",
  },
  afiliadosDashboard_panel_yourAffiliateLink: {
    es: "Tu Enlace de Afiliado",
    en: "Your Affiliate Link",
  },
  afiliadosDashboard_panel_shareLinkInstruction: {
    es: "Comparte este enlace para registrar nuevos usuarios.",
    en: "Share this link to register new users.",
  },
  afiliadosDashboard_panel_registeredReferrals: {
    es: "Referidos Registrados",
    en: "Registered Referrals",
  },
  afiliadosDashboard_panel_paymentAddress: {
    es: "Dirección de Pago (USDT TRC20)",
    en: "Payment Address (USDT TRC20)",
  },
  afiliadosDashboard_panel_walletPlaceholder: {
    es: "Tu dirección de wallet TRC20 USDT",
    en: "Your TRC20 USDT wallet address",
  },
  afiliadosDashboard_panel_savingButton: {
    es: "Guardando...",
    en: "Saving...",
  },
  afiliadosDashboard_panel_saveButton: {
    es: "Guardar",
    en: "Save",
  },
  afiliadosDashboard_panel_cancelButton: {
    es: "Cancelar",
    en: "Cancel",
  },
  afiliadosDashboard_panel_editButton: {
    es: "Editar",
    en: "Edit",
  },
  afiliadosDashboard_panel_affiliateTiers: {
    es: "Niveles de Afiliado (Tiers)",
    en: "Affiliate Tiers",
  },
  afiliadosDashboard_panel_tierLabel: {
    es: "Tier {{tierNum}}",
    en: "Tier {{tierNum}}",
  },
  afiliadosDashboard_panel_tierRequirement: {
    es: "Requiere: {{count}} referidos",
    en: "Requires: {{count}} referrals",
  },
  afiliadosDashboard_panel_tierRequirementPlus: {
    es: "Requiere: {{count}}+ referidos",
    en: "Requires: {{count}}+ referrals",
  },
  afiliadosDashboard_panel_tierRequirementRange: {
    es: "Requiere: {{min}} - {{max}} referidos",
    en: "Requires: {{min}} - {{max}} referrals",
  },
  afiliadosDashboard_panel_fundedTradersTier3: {
    es: "Traders Fondeados (Tier 3)",
    en: "Funded Traders (Tier 3)",
  },
  afiliadosDashboard_panel_fundedTradersUnlocked: {
    es: "Contenido de Traders Fondeados (desbloqueado).",
    en: "Funded Traders content (unlocked).",
  },
  afiliadosDashboard_panel_sectionLocked: {
    es: "Sección Bloqueada",
    en: "Section Locked",
  },
  afiliadosDashboard_panel_reachTierToUnlock: {
    es: "Alcanza Tier {{tierNum}} ({{count}} referidos) para desbloquear.",
    en: "Reach Tier {{tierNum}} ({{count}} referrals) to unlock.",
  },
  afiliadosDashboard_referrals_title: {
    es: "Mis Referidos",
    en: "My Referrals",
  },
  afiliadosDashboard_referrals_noReferrals: {
    es: "No tienes referidos registrados aún.",
    en: "You have no registered referrals yet.",
  },
  afiliadosDashboard_referrals_table_user: {
    es: "Usuario",
    en: "User",
  },
  afiliadosDashboard_referrals_table_email: {
    es: "Email",
    en: "Email",
  },
  afiliadosDashboard_referrals_table_name: {
    es: "Nombre",
    en: "Name",
  },
  afiliadosDashboard_referrals_table_country: {
    es: "País",
    en: "Country",
  },
  afiliadosDashboard_referrals_table_registeredDate: {
    es: "Registrado el",
    en: "Registered on",
  },
  afiliadosDashboard_table_notAvailable: {
    es: "N/A",
    en: "N/A",
  },
  afiliadosDashboard_payments_title: {
    es: "Historial de Pagos",
    en: "Payment History",
  },
  afiliadosDashboard_payments_noPayments: {
    es: "No tienes pagos registrados aún.",
    en: "You have no payments registered yet.",
  },
  afiliadosDashboard_payments_tablePlaceholder: {
    es: "Tabla de pagos...",
    en: "Payments table...",
  },
  afiliadosDashboard_mainTitle: {
    es: "Programa de Afiliados",
    en: "Affiliate Program",
  },
  afiliadosDashboard_tab_panel: {
    es: "Panel",
    en: "Dashboard",
  },
  afiliadosDashboard_tab_referrals: {
    es: "Referencias",
    en: "Referrals",
  },
  afiliadosDashboard_tab_payments: {
    es: "Pagos",
    en: "Payments",
  },
  afiliadosDashboard_tooltip_tier1: {
    es: "💰 TIER 1 - Comisión Básica\n\n📊 COMISIONES:\n• Directa: {{commission}} por cada compra\n\n📋 REQUISITOS:\n• {{requirement}}\n\n✨ BENEFICIOS:\n• Gana por cada referido que compre\n• Acceso al programa de afiliados\n• Pagos mensuales garantizados\n• Dashboard con estadísticas",
    en: "💰 TIER 1 - Basic Commission\n\n📊 COMMISSIONS:\n• Direct: {{commission}} per purchase\n\n📋 REQUIREMENTS:\n• {{requirement}}\n\n✨ BENEFITS:\n• Earn from each referred purchase\n• Access to affiliate program\n• Guaranteed monthly payments\n• Statistics dashboard",
  },
  afiliadosDashboard_tooltip_tier2: {
    es: "🚀 TIER 2 - Comisión Mejorada\n\n📊 COMISIONES:\n• Directa: {{directCommission}} por compra\n• Sub-nivel: {{subCommission}} de referidos Tier 1\n\n📋 REQUISITOS:\n• {{requirement}}\n\n✨ BENEFICIOS:\n• Mayor comisión en ventas directas\n• Ganas por ventas de tus referidos\n• Estadísticas avanzadas\n• Soporte prioritario\n• Herramientas de marketing",
    en: "🚀 TIER 2 - Enhanced Commission\n\n📊 COMMISSIONS:\n• Direct: {{directCommission}} per purchase\n• Sub-tier: {{subCommission}} from Tier 1 referrals\n\n📋 REQUIREMENTS:\n• {{requirement}}\n\n✨ BENEFITS:\n• Higher commission on direct sales\n• Earn from your referrals' sales\n• Advanced statistics\n• Priority support\n• Marketing tools",
  },
  afiliadosDashboard_tooltip_tier3: {
    es: "👑 TIER 3 - Comisión Premium\n\n📊 COMISIONES:\n• Directa: {{directCommission}} por compra\n• Sub-nivel: {{subCommission}} de referidos Tier 1\n• Pagos: {{paymentsCommission}} de traders fondeados\n\n📋 REQUISITOS:\n• {{requirement}}\n\n✨ BENEFICIOS:\n• Máxima comisión disponible\n• Ingresos de múltiples fuentes\n• Comisión por traders exitosos\n• Funciones VIP exclusivas\n• Soporte personalizado 24/7\n• Acceso a webinars premium",
    en: "👑 TIER 3 - Premium Commission\n\n📊 COMMISSIONS:\n• Direct: {{directCommission}} per purchase\n• Sub-tier: {{subCommission}} from Tier 1 referrals\n• Payouts: {{paymentsCommission}} from funded traders\n\n📋 REQUIREMENTS:\n• {{requirement}}\n\n✨ BENEFITS:\n• Maximum available commission\n• Multiple income sources\n• Commission from successful traders\n• Exclusive VIP features\n• 24/7 personalized support\n• Premium webinar access",
  },
  afiliadosDashboard_selectTabPrompt: {
    es: "Seleccione una pestaña.",
    en: "Select a tab.",
  },
  // TradingAccounts.jsx translations
  tradingAccounts_tab_phase1: {
    es: "1 Fase",
    en: "1 Phase",
  },
  tradingAccounts_tab_phase2: {
    es: "2 Fases",
    en: "2 Phases",
  },
  tradingAccounts_tab_realAccount: {
    es: "Cuenta Real",
    en: "Real Account",
  },
  tradingAccounts_loadingAccounts: {
    es: "Cargando cuentas...",
    en: "Loading accounts...",
  },
  tradingAccounts_noAccountsFound: {
    es: "No se encontraron cuentas para \"{{tabName}}\".",
    en: "No accounts found for \"{{tabName}}\".",
  },
  tradingAccounts_accountInfo: {
    es: "{{phase}} - {{amount}}",
    en: "{{phase}} - {{amount}}",
  },
  tradingAccounts_serverTypeLabel: {
    es: "Server Type:",
    en: "Server Type:",
  },
  tradingAccounts_accountNumberLabel: {
    es: "Cuenta:",
    en: "Account:",
  },
  tradingAccounts_status_active: {
    es: "Activa",
    en: "Active",
  },
  tradingAccounts_status_approved: {
    es: "Aprobada",
    en: "Approved",
  },
  tradingAccounts_status_lost: {
    es: "Perdida",
    en: "Lost",
  },
  tradingAccounts_viewDetailsButton: {
    es: "Ver Detalles",
    en: "View Details",
  },
  // TradingChallenge.jsx translations
  tradingChallenge_alert_loginToPurchase: {
    es: "Por favor, inicia sesión para comprar un desafío.",
    en: "Please log in to purchase a challenge.",
  },
  tradingChallenge_alert_purchaseSuccess: {
    es: "¡Desafío comprado con éxito! ID de cuenta: {{accountId}}",
    en: "Challenge purchased successfully! Account ID: {{accountId}}",
  },
  tradingChallenge_alert_purchaseError: {
    es: "Error al comprar el desafío. Por favor, inténtalo de nuevo.",
    en: "Error purchasing challenge. Please try again.",
  },
  tradingChallenge_label_challengeType: {
    es: "Tipo Desafío",
    en: "Challenge Type",
  },
  tradingChallenge_button_1phase: {
    es: "1 Fase",
    en: "1 Phase",
  },
  tradingChallenge_button_2phases: {
    es: "2 Fases",
    en: "2 Phases",
  },
  tradingChallenge_label_challengeAmount: {
    es: "Monto del desafío",
    en: "Challenge Amount",
  },
  tradingChallenge_label_complements: {
    es: "Complementos",
    en: "Add-ons",
  },
  tradingChallenge_label_selectComplementsByTraderType: {
    es: "Selecciona complementos por tipo de trader",
    en: "Select add-ons by trader type",
  },
  tradingChallenge_button_traderTypeNew: {
    es: "Nuevo",
    en: "New",
  },
  tradingChallenge_button_traderTypeExpert: {
    es: "Experto",
    en: "Expert",
  },
  tradingChallenge_button_traderTypeProfessional: {
    es: "Profesional",
    en: "Professional",
  },
  tradingChallenge_complement_doubleLeverage: {
    es: "Doble apalancamiento",
    en: "Double leverage",
  },
  tradingChallenge_complement_profitSplit9010: {
    es: "90/10 split de profit",
    en: "90/10 profit split",
  },
  tradingChallenge_complement_newsTrading: {
    es: "Comercio de noticias",
    en: "News trading",
  },
  tradingChallenge_label_price: {
    es: "Precio",
    en: "Price",
  },
  tradingChallenge_label_platform: {
    es: "Plataforma",
    en: "Platform",
  },
  tradingChallenge_label_platformValuePlaceholder: {
    es: "------",
    en: "------",
  },
  tradingChallenge_label_currency: {
    es: "Moneda",
    en: "Currency",
  },
  tradingChallenge_label_currencyUsd: {
    es: "USD",
    en: "USD",
  },
  tradingChallenge_label_promoCode: {
    es: "Codigo Promocional",
    en: "Promotional Code",
  },
  tradingChallenge_placeholder_enterCode: {
    es: "Ingresar Código",
    en: "Enter Code",
  },
  tradingChallenge_button_apply: {
    es: "Aplicar",
    en: "Apply",
  },
  tradingChallenge_label_paymentMethod: {
    es: "Método de pago",
    en: "Payment Method",
  },
  tradingChallenge_placeholder_select: {
    es: "Seleccionar",
    en: "Select",
  },
  tradingChallenge_button_processing: {
    es: "Procesando...",
    en: "Processing...",
  },
  tradingChallenge_button_proceedToPayment: {
    es: "Proceder al Pago",
    en: "Proceed to Payment",
  },
  tradingChallenge_disclaimer_acceptance: {
    es: "Al proceder al pago, acepto que la compra cumple con los términos de mis documentos emitidos por el gobierno.",
    en: "By proceeding to payment, I accept that the purchase complies with the terms of my government-issued documents.",
  },
  // New keys for TradingChallenge.jsx based on recent UI changes
  tradingChallenge_button_standard: {
    es: "Estándar",
    en: "Standard",
  },
  tradingChallenge_button_swim: {
    es: "Swing",
    en: "Swing",
  },
  tradingChallenge_subtitle_complements: {
    es: "Selecciona el complemento ideal para tu estilo de trading",
    en: "Select the ideal add-on for your trading style",
  },
  tradingChallenge_label_profitTargetP1: {
    es: "Profit Target Fase 1",
    en: "Profit Target Phase 1",
  },
  tradingChallenge_label_profitTargetP2: {
    es: "Profit Target Fase 2",
    en: "Profit Target Phase 2",
  },
  tradingChallenge_label_profitSplit: {
    es: "Profit Split",
    en: "Profit Split",
  },
  tradingChallenge_leverage_info: {
    es: " (Apalancamiento 1:100)",
    en: " (Leverage 1:100)"
  },
  tradingChallenge_leverage_info_swing: {
    es: " (Apalancamiento 1:30)",
    en: " (Leverage 1:30)"
  },
  // Mensajes para opciones no aplicables según tipo de desafío
  tradingChallenge_notApplicable: {
    es: "No aplicable para desafíos de 1 fase",
    en: "Not applicable for 1 phase challenges"
  },
  tradingChallenge_notApplicableP1: {
    es: "No aplicable para desafíos de 2 fases",
    en: "Not applicable for 2 phase challenges"
  },
  // Settings.jsx translations
  settings_error_loadingData: {
    es: "Error al cargar los datos. Intente de nuevo más tarde.",
    en: "Error loading data. Please try again later.",
  },
  settings_wallet_error_invalidAddress: {
    es: "Por favor, introduzca una dirección de wallet válida.",
    en: "Please enter a valid wallet address.",
  },
  settings_wallet_success_updated: {
    es: "Dirección de wallet actualizada correctamente",
    en: "Wallet address updated successfully",
  },
  settings_wallet_error_mustLogin: {
    es: "Debe iniciar sesión para actualizar la dirección de wallet.",
    en: "You must log in to update the wallet address.",
  },
  settings_wallet_error_savingChanges: {
    es: "Error al guardar los cambios. Intente de nuevo más tarde.",
    en: "Error saving changes. Please try again later.",
  },
  settings_snackbar_textCopied: {
    es: "Texto copiado al portapapeles",
    en: "Text copied to clipboard",
  },
  settings_loadingText: {
    es: "Cargando...",
    en: "Loading...",
  },
  settings_button_back: {
    es: "Volver",
    en: "Back",
  },
  settings_title: {
    es: "Ajustes",
    en: "Settings",
  },
  settings_section_accountConfiguration: {
    es: "Configuracion de Cuenta",
    en: "Account Configuration",
  },
  settings_item_kycVerification: {
    es: "Verificacion KYC",
    en: "KYC Verification",
  },
  settings_label_requiresApprovedAccount: {
    es: "Requiere cuenta aprobada",
    en: "Requires approved account",
  },
  settings_label_pendingApproval: {
    es: "Aprobación pendiente",
    en: "Pending approval",
  },
  settings_item_changePassword: {
    es: "Cambiar Contraseña",
    en: "Change Password",
  },
  settings_item_updateEmail: {
    es: "Actualizar Correo Electronico",
    en: "Update Email Address",
  },
  settings_section_notifications: {
    es: "Notificaciones",
    en: "Notifications",
  },
  settings_item_pushNotifications: {
    es: "Notificaciones Push",
    en: "Push Notifications",
  },
  settings_section_paymentMethod: {
    es: "Método de pago",
    en: "Payment Method",
  },
  settings_section_billing: {
    es: "Facturación",
    en: "Billing",
  },
  settings_label_usdtPaymentAddress: {
    es: "Direccion De Pago USDT",
    en: "USDT Payment Address",
  },
  settings_description_usdtPaymentAddress: {
    es: "Proporcionar Una Dirección USDT TRC20 Válida",
    en: "Provide a Valid USDT TRC20 Address",
  },
  settings_placeholder_enterUsdtAddress: {
    es: "Ingrese su dirección TRC20 USDT",
    en: "Enter your TRC20 USDT address",
  },
  settings_button_saving: {
    es: "Guardando...",
    en: "Saving...",
  },
  settings_button_save: {
    es: "Guardar",
    en: "Save",
  },
  settings_button_cancel: {
    es: "Cancelar",
    en: "Cancel",
  },
  settings_label_noWalletSet: {
    es: "No se ha establecido una dirección de wallet",
    en: "No wallet address has been set",
  },
  settings_button_edit: {
    es: "Editar",
    en: "Edit",
  },
  settings_button_addPaymentMethod: {
    es: "Agregar método de pago",
    en: "Add payment method",
  },
  // New Profile Picture settings translations
  settings_item_profilePicture: {
    es: "Foto de Perfil",
    en: "Profile Picture",
  },
  settings_profilePic_alt: {
    es: "Foto de perfil del usuario",
    en: "User profile picture",
  },
  settings_button_changePicture: {
    es: "Cambiar Foto",
    en: "Change Picture",
  },
  settings_button_savePicture: {
    es: "Guardar Foto",
    en: "Save Picture",
  },
  settings_profilePic_error_invalidFile: {
    es: "Archivo inválido. Por favor, selecciona una imagen.",
    en: "Invalid file. Please select an image.",
  },
  settings_profilePic_error_noFileSelected: {
    es: "No se ha seleccionado ningún archivo.",
    en: "No file has been selected.",
  },
  settings_profilePic_error_uploadFailed: {
    es: "Error al subir la imagen. Inténtalo de nuevo.",
    en: "Error uploading image. Please try again.",
  },
  settings_profilePic_success_updated: {
    es: "Foto de perfil actualizada con éxito.",
    en: "Profile picture updated successfully.",
  },
  // Sidebar.jsx translations
  sidebar_dashboard: {
    es: "Dashboard",
    en: "Dashboard",
  },
  sidebar_accounts: {
    es: "Cuentas",
    en: "Accounts",
  },
  sidebar_affiliates: {
    es: "Afiliados",
    en: "Affiliates",
  },
  sidebar_tools: {
    es: "Herramientas",
    en: "Tools",
  },
  sidebar_calculator: {
    es: "Calculadora",
    en: "Calculator",
  },
  sidebar_downloads: {
    es: "Descargas",
    en: "Downloads",
  },
  sidebar_news: {
    es: "Noticias",
    en: "News",
  },
  sidebar_certificates: {
    es: "Certificados",
    en: "Certificates",
  },
  sidebar_payments: {
    es: "Pagos",
    en: "Payments",
  },
  sidebar_alt_agmLogo: {
    es: "Logo AGM",
    en: "AGM Logo",
  },
  sidebar_platforms: { // For the commented out section
    es: "Plataformas",
    en: "Platforms",
  },
  sidebar_alt_widget: { // For the commented out section
    es: "Widget",
    en: "Widget",
  },
  sidebar_propFirm: { // For the commented out section
    es: "Prop Firm",
    en: "Prop Firm",
  },
  sidebar_broker: { // For the commented out section
    es: "Broker",
    en: "Broker",
  },
  sidebar_newChallenge: {
    es: "Nuevo desafío",
    en: "New Challenge",
  },
  sidebar_logout: {
    es: "Cerrar Sesión",
    en: "Logout",
  },
  sidebar_alt_logout: {
    es: "Cerrar Sesión", // Spanish alt text can be the same as button
    en: "Logout", // English alt text
  },

  // UserInformationContent.jsx translations
  userInfo_title: {
    es: "Información Personal",
    en: "Personal Information",
  },
  userInfo_error_loadCountries: {
    es: "Error al cargar la lista de países",
    en: "Error loading country list",
  },
  userInfo_error_loadUserData: {
    es: "Error al cargar datos del usuario",
    en: "Error loading user data",
  },
  month_january: { es: "Enero", en: "January" },
  month_february: { es: "Febrero", en: "February" },
  month_march: { es: "Marzo", en: "March" },
  month_april: { es: "Abril", en: "April" },
  month_may: { es: "Mayo", en: "May" },
  month_june: { es: "Junio", en: "June" },
  month_july: { es: "Julio", en: "July" },
  month_august: { es: "Agosto", en: "August" },
  month_september: { es: "Septiembre", en: "September" },
  month_october: { es: "Octubre", en: "October" },
  month_november: { es: "Noviembre", en: "November" },
  month_december: { es: "Diciembre", en: "December" },
  calendar_day: { es: "Día", en: "Day" },
  calendar_month: { es: "Mes", en: "Month" },
  calendar_year: { es: "Año", en: "Year" },
  calendar_select_day: { es: "Día", en: "Day" },
  calendar_select_month: { es: "Mes", en: "Month" },
  calendar_select_year: { es: "Año", en: "Year" },
  userInfo_label_firstName: { es: "Nombre", en: "First Name" },
  userInfo_label_lastName: { es: "Apellido", en: "Last Name" },
  userInfo_label_dob: { es: "Fecha de Nacimiento", en: "Date of Birth" },
  userInfo_label_gender: { es: "Género", en: "Gender" },
  userInfo_label_country: { es: "País", en: "Country" },
  userInfo_label_city: { es: "Ciudad", en: "City" },
  userInfo_label_phone: { es: "Teléfono", en: "Phone" },
  userInfo_placeholder_firstName: { es: "Ingrese su nombre", en: "Enter your first name" },
  userInfo_placeholder_lastName: { es: "Ingrese su apellido", en: "Enter your last name" },
  userInfo_placeholder_dob: { es: "DD/MM/AAAA", en: "DD/MM/YYYY" },
  userInfo_placeholder_gender: { es: "Seleccionar género", en: "Select gender" },
  userInfo_placeholder_country: { es: "Seleccionar país", en: "Select country" },
  userInfo_placeholder_city: { es: "Seleccionar ciudad", en: "Select city" },
  userInfo_loading_countries: { es: "Cargando países...", en: "Loading countries..." },
  userInfo_loading_cities: { es: "Cargando ciudades...", en: "Loading cities..." },
  userInfo_noCitiesAvailable: { es: "No hay ciudades disponibles", en: "No cities available" },
  userInfo_placeholder_phoneCode: { es: "Seleccionar código", en: "Select code" },
  userInfo_placeholder_phoneNumber: { es: "Número de teléfono", en: "Phone number" },
  gender_male: { es: "Masculino", en: "Male" },
  gender_female: { es: "Femenino", en: "Female" },
  gender_other: { es: "Otro", en: "Other" },
  gender_preferNotToSay: { es: "Prefiero no decirlo", en: "Prefer not to say" },
  common_back: { es: "Volver", en: "Back" }, // Assuming common key
  common_accept: { es: "Aceptar", en: "Accept" },
  userInfo_button_saveChanges: { es: "Guardar Cambios", en: "Save Changes" },
  userInfo_button_saving: { es: "Guardando...", en: "Saving..." },
  userInfo_error_saveFailed: { es: "Error al guardar los datos. Por favor, inténtelo de nuevo.", en: "Error saving data. Please try again." },
  userInfo_error_allFieldsRequired: { es: "Todos los campos son obligatorios.", en: "All fields are required." },
  userInfo_error_invalidDobFormat: { es: "El formato de la fecha de nacimiento no es válido (DD/MM/AAAA).", en: "Invalid date of birth format (DD/MM/YYYY)." },
  userInfo_error_ageRequirement: { es: "Debe ser mayor de 18 años.", en: "You must be over 18 years old." },
  userInfo_success_saved: {
    es: "¡Datos guardados con éxito!",
    en: "Data saved successfully!",
  },
  settings_profilePic_uploading: { es: "Subiendo...", en: "Uploading..."},

  // Date formatting keys
  date_short_sunday: { es: "Dom", en: "Sun" },
  date_short_monday: { es: "Lun", en: "Mon" },
  date_short_tuesday: { es: "Mar", en: "Tue" },
  date_short_wednesday: { es: "Mié", en: "Wed" },
  date_short_thursday: { es: "Jue", en: "Thu" },
  date_short_friday: { es: "Vie", en: "Fri" },
  date_short_saturday: { es: "Sáb", en: "Sat" },

  // PipCalculator.jsx translations
  pipCalculator_tab_pips: {
    es: "Calculadora de pips",
    en: "Pip Calculator",
  },
  pipCalculator_tab_positionSize: {
    es: "Calculadora de tamaño de posición",
    en: "Position Size Calculator",
  },
  pipCalculator_label_instrument: {
    es: "Instrumento",
    en: "Instrument",
  },
  pipCalculator_label_pipAmount: {
    es: "Cantidad de pip",
    en: "Pip Amount",
  },
  pipCalculator_label_positionSizeLots: {
    es: "Tamaño de la posición (lotes)",
    en: "Position Size (lots)",
  },
  pipCalculator_label_accountCurrency: {
    es: "Moneda de la cuenta",
    en: "Account Currency",
  },
  pipCalculator_button_calculate: {
    es: "Calcular",
    en: "Calculate",
  },
  pipCalculator_result_pipValue: {
    es: "Valor de los pips",
    en: "Pip Value",
  },
  pipCalculator_label_riskAmount: {
    es: "Monto a arriesgar",
    en: "Amount to Risk",
  },
  pipCalculator_label_riskPercentage: {
    es: "Porcentaje de riesgo (%)",
    en: "Risk Percentage (%)",
  },
  pipCalculator_label_pipTarget: {
    es: "Pip (Meta)", // Assuming this is the label for "Pip" in the position size calculator
    en: "Pip (Target)",
  },
  pipCalculator_label_accountBalance: {
    es: "Balance de la cuenta",
    en: "Account Balance",
  },
  pipCalculator_result_suggestedPositionSize: {
    es: "Tamaño de la posición sugerido",
    en: "Suggested Position Size",
  },
  pipCalculator_result_riskedAmount: {
    es: "Monto arriesgado",
    en: "Amount Risked",
  },
  
  // New keys for PipCalculator.jsx instrument search and favorites
  pipCalculator_placeholder_selectInstrument: {
    es: "Seleccionar instrumento",
    en: "Select instrument",
  },
  pipCalculator_placeholder_searchInstrument: {
    es: "Buscar instrumento...",
    en: "Search instrument...",
  },
  pipCalculator_tooltip_removeFromFavorites: {
    es: "Quitar de favoritos",
    en: "Remove from favorites",
  },
  pipCalculator_tooltip_addToFavorites: {
    es: "Añadir a favoritos",
    en: "Add to favorites",
  },
  pipCalculator_noResultsFound: {
    es: "No se encontraron instrumentos",
    en: "No instruments found",
  },
  pipCalculator_favorites_heading: {
    es: "Favoritos",
    en: "Favorites",
  },
  pipCalculator_allInstruments_heading: {
    es: "Todos los Instrumentos",
    en: "All Instruments",
  },
  
  // PipCalculator filter tabs translations
  pipCalculator_tab_forex: {
    es: "Forex",
    en: "Forex",
  },
  pipCalculator_tab_stocks: {
    es: "Acciones",
    en: "Stocks",
  },
  pipCalculator_tab_crypto: {
    es: "Criptomonedas",
    en: "Crypto",
  },
  pipCalculator_tab_metals: {
    es: "Metales",
    en: "Metals",
  },
  pipCalculator_label_pointAmount: {
    es: "Cantidad de punto",
    en: "Point Amount",
  },
  pipCalculator_label_tickAmount: {
    es: "Cantidad de tick",
    en: "Tick Amount",
  },
  
  // Modal.jsx translations
  modal_close_aria_label: {
    es: "Cerrar modal",
    en: "Close modal",
  },

  // TradingDashboard.jsx translations
  tradingDashboard_backToAccounts: { es: "Volver a cuentas", en: "Back to accounts" },
  tradingDashboard_backToHome: { es: "Volver a inicio", en: "Back to home" },
  tradingDashboard_backDefault: { es: "Volver", en: "Back" },
  tradingDashboard_greetingPrefix: { es: "Hola, ", en: "Hello, " },
  tradingDashboard_defaultUserName: { es: "Usuario", en: "User" },
  tradingDashboard_avatarAlt: { es: "Avatar", en: "Avatar" },
  tradingDashboard_currentAccountInfo: { es: "Actualmente, tienes una cuenta de {{accountSize}}", en: "You currently have a {{accountSize}} account" },
  tradingDashboard_initialBalanceLabel: { es: "Balance Inicial:", en: "Initial Balance:" },
  tradingDashboard_planTypeLabel: { es: "Tipo de plan:", en: "Plan Type:" },
  tradingDashboard_accountTypeLabel: { es: "Tipo de cuenta:", en: "Account Type:" },
  tradingDashboard_accountDetailsTitle: { es: "Detalles de cuenta", en: "Account Details" },
  tradingDashboard_statusActive: { es: "Activa", en: "Active" },
  tradingDashboard_loginLabel: { es: "Login", en: "Login" },
  tradingDashboard_investorPassLabel: { es: "Investor Pass", en: "Investor Pass" },
  tradingDashboard_setPasswordButton: { es: "Set Password", en: "Set Password" }, 
  tradingDashboard_masterPassLabel: { es: "Master pass.", en: "Master pass." },
  tradingDashboard_mt5ServerLabel: { es: "Servidor", en: "Server" },
  tradingDashboard_balanceChartTitle: { es: "Balance", en: "Balance" },
  tradingDashboard_profitLossWidgetTitle: { es: "Profit/Loss", en: "Profit/Loss" },
  tradingDashboard_drawdownWidgetTitle: { es: "Drawdown", en: "Drawdown" },
  tradingDashboard_drawdownTypeDaily: { es: "Diario", en: "Daily" },
  tradingDashboard_drawdownTypeTotal: { es: "Total", en: "Total" }, 
  tradingDashboard_tradingDaysWidgetTitle: { es: "Días de Trading", en: "Trading Days" },
  tradingDashboard_metric_profitTarget: { es: "Objetivo de ganancia", en: "Profit Target" },
  tradingDashboard_metric_targetNotReached: { es: "No alcanzado", en: "Not Reached" },
  tradingDashboard_metric_targetReached: { es: "Alcanzado", en: "Reached" },
  tradingDashboard_metric_maxDailyLoss: { es: "Pérdida máxima diaria", en: "Max Daily Loss" },
  tradingDashboard_metric_maxLoss: { es: "Pérdida máxima", en: "Max Loss" },
  tradingDashboard_metric_minTradingDays: { es: "Días mínimos de trading", en: "Min Trading Days" },
  tradingDashboard_operationsSummaryTitle: { es: "Resumen de Operaciones", en: "Operations Summary" },
  tradingDashboard_tableHeader_operationId: { es: "ID de operación", en: "Operation ID" },
  tradingDashboard_tableHeader_symbol: { es: "Símbolo", en: "Symbol" },
  tradingDashboard_tableHeader_type: { es: "Tipo", en: "Type" },
  tradingDashboard_tableHeader_volume: { es: "Volumen", en: "Volume" },
  tradingDashboard_tableHeader_price: { es: "Precio", en: "Price" },
  tradingDashboard_tableHeader_finalPrice: { es: "Precio Final", en: "Final Price" },
  tradingDashboard_tableHeader_date: { es: "Fecha", en: "Date" },
  tradingDashboard_tableHeader_time: { es: "Hora", en: "Time" },
  tradingDashboard_emptyTable_noOperations: { es: "No hay operaciones para mostrar.", en: "No operations to display." },
  tradingDashboard_operationType_buy: { es: "Comprar", en: "Buy" },
  tradingDashboard_avgTradeDuration: { es: "Duración Promedio Por Operación", en: "Average Trade Duration" },
  tradingDashboard_iconAlt_clock: { es: "Reloj", en: "Clock" },
  tradingDashboard_avgProfitPerOperation: { es: "Ganancia Promedio Por Operación", en: "Average Profit Per Operation" },
  tradingDashboard_iconAlt_coins: { es: "Monedas", en: "Coins" },
  tradingDashboard_avgLossPerOperation: { es: "Pérdida Promedio Por Operación", en: "Average Loss Per Operation" },
  tradingDashboard_iconAlt_loss: { es: "Pérdida", en: "Loss" },
  tradingDashboard_avgLotPerOperation: { es: "Lotaje Promedio Por Operación", en: "Average Lot Per Operation" },
  tradingDashboard_iconAlt_lot: { es: "Lotaje", en: "Lot" },
  tradingDashboard_riskRewardRatio: { es: "Relación Riesgo Beneficio", en: "Risk/Reward Ratio" },
  tradingDashboard_iconAlt_ratio: { es: "Ratio", en: "Ratio" },
  tradingDashboard_winRate: { es: "Ratio De Ganancia", en: "Win Rate" },
  tradingDashboard_iconAlt_winRate: { es: "Ratio Ganancia", en: "Win Rate Icon" },
  tradingDashboard_objectivesTitle: { es: "Objetivos", en: "Objectives" },
  tradingDashboard_dailyLossLimitTitle: { es: "Límite diario de pérdidas", en: "Daily Loss Limit" },
  tradingDashboard_status_inProgress: { es: "En Proceso", en: "In Progress" },
  tradingDashboard_maxLossLimitLabel: { es: "Límite máximo de pérdida", en: "Maximum loss limit" },
  tradingDashboard_allowedLossTodayLabel: { es: "Pérdida permitida hoy", en: "Allowed loss today" },
  tradingDashboard_globalLossLimitTitle: { es: "Límite de pérdida global", en: "Global Loss Limit" },
  tradingDashboard_status_lost: { es: "Perdido", en: "Lost" },
  tradingDashboard_minTradingDaysTitle: { es: "Días mínimos de negociación", en: "Minimum Trading Days" },
  tradingDashboard_status_surpassed: { es: "Superado", en: "Surpassed" },
  tradingDashboard_minimumLabel: { es: "Mínimo", en: "Minimum" },
  tradingDashboard_currentResultLabel: { es: "Resultado actual", en: "Current Result" },
  tradingDashboard_profitTargetTitle: { es: "Objetivo de ganancias", en: "Profit Target" },
  tradingDashboard_daysLabel: { es: "Días", en: "Days" },
  tradingDashboard_loadingMessage: { es: "Cargando datos de la cuenta...", en: "Loading account data..." },
  tradingDashboard_accountNotFound: { es: "No se pudieron cargar los detalles de la cuenta.", en: "Account details could not be loaded." },
  tradingDashboard_operationType_sell: { es: "Vender", en: "Sell" },
  tradingDashboard_status_unknown: { es: "Desconocido", en: "Unknown" },
  tradingDashboard_iconAlt_copy: { es: "Copiar", en: "Copy" },
  tradingDashboard_iconAlt_visibility: { es: "Visibilidad", en: "Visibility" },
  tradingDashboard_loading_charts: { es: "Cargando gráficos...", en: "Loading charts..." },
  tradingDashboard_daily: { es: "Diario", en: "Daily" },
  tradingDashboard_weekly: { es: "Semanal", en: "Weekly" },
  tradingDashboard_monthly: { es: "Mensual", en: "Monthly" },
  tradingDashboard_no_data: { es: "No hay datos disponibles", en: "No data available" },
  tradingDashboard_profit_target_explanation: { es: "Objetivo a alcanzar para aprobar la fase", en: "Target to reach to pass the phase" },
  tradingDashboard_daily_loss_explanation: { es: "Límite máximo de pérdida diaria", en: "Maximum daily loss limit" },
  tradingDashboard_global_loss_explanation: { es: "Límite máximo de pérdida total", en: "Maximum total loss limit" },
  tradingDashboard_min_days_explanation: { es: "Días mínimos de trading requeridos", en: "Minimum trading days required" },
  tradingDashboard_iconAlt_lightning: { es: "Rayo", en: "Lightning" },
  tradingDashboard_iconAlt_shield: { es: "Escudo", en: "Shield" },

  // Added missing keys for Operations Table title, button, and messages
  tradingDashboard_operationsTableTitle: { es: "Operaciones", en: "Operations" },
  tradingDashboard_downloadCsvButton: { es: "Descargar CSV", en: "Download CSV" },
  tradingDashboard_noOperationsFound: { es: "No se encontraron operaciones.", en: "No operations found." },

  // Added missing keys for Operations Table headers
  tradingDashboard_tableHeader_ticket: { es: "Ticket", en: "Ticket" },
  tradingDashboard_tableHeader_openTime: { es: "Tiempo Apertura", en: "Open Time" },
  tradingDashboard_tableHeader_openPrice: { es: "Precio Apertura", en: "Open Price" },
  tradingDashboard_tableHeader_closeTime: { es: "Tiempo Cierre", en: "Close Time" },
  tradingDashboard_tableHeader_closePrice: { es: "Precio Cierre", en: "Close Price" },
  tradingDashboard_tableHeader_profit: { es: "Ganancia/Pérdida", en: "Profit/Loss" },

  // CertificateComponent.jsx translations
  certificate_button_challengeSuccess: {
    es: "Superación de Challenge",
    en: "Challenge Completion",
  },
  certificate_button_paymentCertificate: {
    es: "Certificado de Pago",
    en: "Payment Certificate",
  },
  certificate_image_alt: {
    es: "Certificado FundedFy",
    en: "FundedFy Certificate",
  },
  certificate_image_fallbackText: {
    es: "Certificado",
    en: "Certificate",
  },

  // Billing Page Translations
  settings_section_billing: { es: "Facturación", en: "Billing" },
  billing_header_desafio: { es: "Desafío", en: "Challenge" },
  billing_header_fechas: { es: "Fechas", en: "Dates" },
  billing_header_cantidad: { es: "Cantidad A Pagar", en: "Amount To Pay" },
  billing_header_orden: { es: "Orden", en: "Order" },
  billing_header_cuenta: { es: "Cuenta", en: "Account" },
  billing_header_estado: { es: "Estado", en: "Status" },
  billing_header_factura: { es: "Factura Y Documentos", en: "Invoice & Documents" },
  billing_status_upcoming: { es: "Próximo", en: "Upcoming" },
  billing_status_pendiente: { es: "Pendiente", en: "Pending" },
  billing_status_pagado: { es: "Pagado", en: "Paid" },
  billing_action_verDetalles: { es: "Ver Detalles", en: "View Details" },
  billing_empty_noInvoices: { es: "No hay facturas para mostrar.", en: "No invoices to display." },

  // Billing Detail Modal Translations
  billing_modal_statusLabel: { es: "Estado:", en: "Status:" },
  billing_modal_orderNumberLabel: { es: "Número De Orden:", en: "Order Number:" },
  billing_modal_invoiceSentLabel: { es: "Factura Enviada:", en: "Invoice Sent:" },
  billing_modal_dueDateLabel: { es: "Fecha Vencimiento:", en: "Due Date:" },
  billing_modal_paymentDateLabel: { es: "Factura De Pago:", en: "Payment Date:" },
  billing_modal_paymentMethodLabel: { es: "Método De Pago:", en: "Payment Method:" },
  billing_modal_rolloverLabel: { es: "Rollover:", en: "Rollover:" },
  billing_modal_withdrawalLabel: { es: "Withdrawal:", en: "Withdrawal:" },
  billing_modal_refundLabel: { es: "Refund:", en: "Refund:" },
  billing_modal_subtotalLabel: { es: "Subtotal", en: "Subtotal" },
  billing_modal_summaryRolloverLabel: { es: "Rollover", en: "Rollover" }, // For the summary charge line
  billing_modal_totalToPayLabel: { es: "Total A Pagar", en: "Total To Pay" },
  billing_modal_totalLabel: { es: "Total", en: "Total" },
  billing_modal_payButton: { es: "Pagar", en: "Pay" },
  billing_modal_downloadPdfButton: { es: "Descargar PDF", en: "Download PDF" },
  // common_cancel is already available as settings_button_cancel: { es: "Cancelar", en: "Cancel" }

  // Home.jsx - Dashboard Account Card
  home_account_oneStepLabel: {
    es: "1 FASE",
    en: "ONE STEP",
  },
  home_account_twoStepLabel: {
    es: "2 FASES",
    en: "TWO STEPS",
  },
  home_account_challengeLabel: {
    es: "DESAFÍO",
    en: "CHALLENGE",
  },
  home_account_amountNotAvailable: {
    es: "Monto N/D",
    en: "Amount N/A",
  },

  // Payment Method Options for TradingChallenge.jsx
  paymentMethod_crypto: {
    es: "Criptomonedas",
    en: "Cryptocurrencies",
  },
  paymentMethod_card: {
    es: "Tarjeta de Débito/Crédito",
    en: "Debit/Credit Card",
  },

  // Added translations for profile image cropping functionality
  settings_cropImage_title: {
    es: "Recortar Imagen",
    en: "Crop Your Image",
  },
  settings_cropImage_button_crop: {
    es: "Recortar",
    en: "Crop & Save",
  },
  settings_cropImage_button_cancel: {
    es: "Cancelar",
    en: "Cancel",
  },
  settings_cropImage_button_cropping: {
    es: "Recortando...",
    en: "Cropping...",
  },

  // Added for admin contact in modals
  settings_modal_contactAdminForChange: {
    es: "Para cambiar tu {{item}}, por favor contacta a nuestro equipo de soporte en support@alphaglobalmarket.io.",
    en: "To change your {{item}}, please contact our support team at support@alphaglobalmarket.io"
  },
  settings_label_password: {
    es: "contraseña",
    en: "password"
  },
  settings_label_email: {
    es: "correo electrónico",
    en: "email"
  },

  // Country names for phone codes and general use
  country_argentina: { es: "Argentina", en: "Argentina" },
  country_uruguay: { es: "Uruguay", en: "Uruguay" },
  country_chile: { es: "Chile", en: "Chile" },
  country_brazil: { es: "Brasil", en: "Brazil" },
  country_paraguay: { es: "Paraguay", en: "Paraguay" },
  country_peru: { es: "Perú", en: "Peru" },
  country_ecuador: { es: "Ecuador", en: "Ecuador" },
  country_colombia: { es: "Colombia", en: "Colombia" },
  country_venezuela: { es: "Venezuela", en: "Venezuela" },
  country_mexico: { es: "México", en: "Mexico" },

  // Headers for Operations Summary Table in TradingDashboard.jsx - Figma design
  tradingDashboard_tableHeader_fechaApertura: { es: "Fecha De Apertura", en: "Open Date" },
  tradingDashboard_tableHeader_instrumento: { es: "Instrumento", en: "Instrument" },
  tradingDashboard_tableHeader_precioApertura: { es: "Precio De Apertura", en: "Open Price" },
  tradingDashboard_tableHeader_stopLoss: { es: "Stop Loss", en: "Stop Loss" },
  tradingDashboard_tableHeader_takeProfit: { es: "Take Profit", en: "Take Profit" },
  tradingDashboard_tableHeader_idPosicion: { es: "ID De Posición", en: "Position ID" },
  tradingDashboard_tableHeader_lotaje: { es: "Lotaje", en: "Lot Size" },
  tradingDashboard_tableHeader_fechaCierre: { es: "Fecha De Cierre", en: "Close Date" },
  tradingDashboard_tableHeader_precioCierre: { es: "Precio De Cierre", en: "Close Price" },
  tradingDashboard_tableHeader_resultado: { es: "Resultado", en: "Result" },

  // News component translations
  news_marketClosed: {
    es: "Mercado cerrado",
    en: "Market closed"
  },
  news_showingLastFridayData: {
    es: "Mostrando datos del último viernes",
    en: "Showing last Friday's data"
  },
  news_weekday_monday: {
    es: "Lunes",
    en: "Monday"
  },
  news_weekday_tuesday: {
    es: "Martes",
    en: "Tuesday"
  },
  news_weekday_wednesday: {
    es: "Miercoles",
    en: "Wednesday"
  },
  news_weekday_thursday: {
    es: "Jueves",
    en: "Thursday"
  },
  news_weekday_friday: {
    es: "Viernes",
    en: "Friday"
  },
  news_filter_impact: {
    es: "Filtrar por impacto",
    en: "Filter by impact"
  },
  news_filter_visibility: {
    es: "Filtrar por visibilidad",
    en: "Filter by visibility"
  },
  news_impact_holidays: {
    es: "Feriados",
    en: "Holidays"
  },
  news_impact_low: {
    es: "Bajo",
    en: "Low"
  },
  news_impact_medium: {
    es: "Medio",
    en: "Medium"
  },
  news_impact_high: {
    es: "Alto",
    en: "High"
  },
  news_filter_hidePastNews: {
    es: "Ocultar noticias pasadas",
    en: "Hide past news"
  },
  news_filter_showRestrictedOnly: {
    es: "Mostrar solo eventos restringidos",
    en: "Show restricted events only"
  },
  news_restricted_event: {
    es: "Evento Restringido",
    en: "Restricted Event"
  },
  news_expired: {
    es: "Expirado",
    en: "Expired"
  },
  news_actual: {
    es: "Actual",
    en: "Actual"
  },
  news_forecast: {
    es: "Pronostico",
    en: "Forecast"
  },
  news_previous: {
    es: "Previo",
    en: "Previous"
  },
  news_no_events: {
    es: "No hay eventos económicos para los filtros seleccionados",
    en: "No economic events for the selected filters"
  },
  news_loading: {
    es: "Cargando...",
    en: "Loading..."
  },
  news_error_loading: {
    es: "Error al cargar las noticias",
    en: "Error loading news"
  },

  // Nuevas traducciones para la integración con MT5_Manager API
  tradingChallenge_processing_init: {
    es: "Iniciando compra...",
    en: "Starting purchase...",
  },
  tradingChallenge_processing_payment: {
    es: "Procesando pago...",
    en: "Processing payment...",
  },
  tradingChallenge_processing_creatingAccount: {
    es: "Creando cuenta en MT5...",
    en: "Creating MT5 account...",
  },
  tradingChallenge_processing_savingData: {
    es: "Guardando datos...",
    en: "Saving data...",
  },
  tradingChallenge_processing_complete: {
    es: "¡Compra completada!",
    en: "Purchase completed!",
  },
  tradingChallenge_alert_purchaseSuccessWithMT5: {
    es: "Compra exitosa! Tu cuenta de desafío ha sido creada con ID: {accountId}. Tu cuenta MT5 ha sido creada con login: {login} y contraseña: {password}. Guarda estos datos en un lugar seguro.",
    en: "Purchase successful! Your challenge account has been created with ID: {accountId}. Your MT5 account has been created with login: {login} and password: {password}. Save these details in a secure place.",
  },
  tradingChallenge_api_error: {
    es: "Error al conectar con el servidor MT5. Tu compra ha sido registrada, pero la cuenta MT5 será creada manualmente. Nuestro equipo se pondrá en contacto contigo.",
    en: "Error connecting to MT5 server. Your purchase has been recorded, but the MT5 account will be created manually. Our team will contact you.",
  },

  // Traducciones para pago con criptomonedas
  tradingChallenge_paymentMethod_crypto: {
    es: "Criptomoneda (USDT)",
    en: "Cryptocurrency (USDT)",
  },
  tradingChallenge_whatsapp_text: {
    es: "Para pagos con <span class=\"font-semibold\">tarjeta de crédito o débito</span> comunicarse al siguiente WhatsApp:",
    en: "For payments with <span class=\"font-semibold\">credit or debit card</span> contact the following WhatsApp:",
  },
  tradingChallenge_whatsapp_button: {
    es: "Comunicarse ahora",
    en: "Contact now",
  },
  tradingChallenge_price_base: {
    es: "Precio base",
    en: "Base price",
  },
  tradingChallenge_price_adjust_f1: {
    es: "Ajuste Profit Target F1",
    en: "Profit Target F1 Adjustment",
  },
  tradingChallenge_price_adjust_f2: {
    es: "Ajuste Profit Target F2",
    en: "Profit Target F2 Adjustment",
  },
  tradingChallenge_price_adjust_split: {
    es: "Ajuste Profit Split",
    en: "Profit Split Adjustment",
  },
  tradingChallenge_price_discount: {
    es: "Descuento AGM20 (20%)",
    en: "AGM20 Discount (20%)",
  },
  tradingChallenge_price_total: {
    es: "Total",
    en: "Total",
  },
  tradingChallenge_coupon_applied: {
    es: "Cupón AGM20 aplicado: 20% OFF",
    en: "AGM20 coupon applied: 20% OFF",
  },
  tradingChallenge_coupon_invalid: {
    es: "Cupón inválido",
    en: "Invalid coupon",
  },
  tradingChallenge_processing_waitingPayment: {
    es: "Esperando confirmación de pago...",
    en: "Waiting for payment confirmation...",
  },
  tradingChallenge_processing_waitingPaymentTime: {
    es: "Esperando confirmación de pago (tiempo restante: {{minutes}} minutos)...",
    en: "Waiting for payment confirmation (remaining time: {{minutes}} minutes)...",
  },
  tradingChallenge_alert_paymentError: {
    es: "Error en el pago: {{error}}",
    en: "Payment error: {{error}}",
  },

  // Traducciones para la página de estado de pago
  paymentStatus_completed: {
    es: "¡Pago completado con éxito!",
    en: "Payment completed successfully!",
  },
  paymentStatus_pending: {
    es: "Pago en proceso",
    en: "Payment in progress",
  },
  paymentStatus_expired: {
    es: "Pago expirado",
    en: "Payment expired",
  },
  paymentStatus_error: {
    es: "Error en el pago",
    en: "Payment error",
  },
  paymentStatus_loading: {
    es: "Cargando...",
    en: "Loading...",
  },
  paymentStatus_checking: {
    es: "Verificando el estado del pago",
    en: "Checking payment status",
  },
  paymentStatus_error_title: {
    es: "Error",
    en: "Error",
  },
  paymentStatus_amount: {
    es: "Monto",
    en: "Amount",
  },
  paymentStatus_received: {
    es: "Recibido",
    en: "Received",
  },
  paymentStatus_network: {
    es: "Red",
    en: "Network",
  },
  paymentStatus_transaction: {
    es: "Transacción",
    en: "Transaction",
  },
  paymentStatus_button_continue: {
    es: "Continuar",
    en: "Continue",
  },

  // Nuevas claves para PaymentStatusPage.jsx
  paymentStatus_error_generic: {
    es: "Error al verificar el estado del pago",
    en: "Error verifying payment status"
  },
  paymentStatus_error_payment_not_found: {
    es: "No se pudo encontrar la información del desafío",
    en: "Could not find challenge information"
  },
  paymentStatus_error_account_creation: {
    es: "Error al crear cuenta: {{errorMessage}}",
    en: "Error creating account: {{errorMessage}}"
  },
  paymentStatus_account_created: {
    es: "Cuenta creada con éxito",
    en: "Account created successfully"
  },
  paymentStatus_creating_account: {
    es: "Creando cuenta...",
    en: "Creating account..."
  },
  paymentStatus_underpaid: {
    es: "Pago insuficiente",
    en: "Underpaid"
  },
  paymentStatus_overpaid: {
    es: "Pago excedente",
    en: "Overpaid"
  },
  paymentStatus_account_created_desc: {
    es: "Tu cuenta ha sido creada exitosamente y está lista para usar.",
    en: "Your account has been successfully created and is ready to use."
  },
  paymentStatus_creating_account_desc: {
    es: "Estamos creando tu cuenta. Por favor espera un momento...",
    en: "We are creating your account. Please wait a moment..."
  },
  paymentStatus_completed_desc: {
    es: "Tu pago ha sido procesado correctamente. ¡Gracias por tu compra!",
    en: "Your payment has been processed successfully. Thank you for your purchase!"
  },
  paymentStatus_pending_desc: {
    es: "Estamos esperando la confirmación de tu pago. Esto puede tomar unos minutos.",
    en: "We are waiting for your payment confirmation. This may take a few minutes."
  },
  paymentStatus_expired_desc: {
    es: "El tiempo para realizar el pago ha expirado. Por favor, inicia un nuevo proceso de compra.",
    en: "The time to make the payment has expired. Please start a new purchase process."
  },
  paymentStatus_error_desc: {
    es: "Ha ocurrido un error durante el proceso de pago. Por favor, contacta a soporte.",
    en: "An error occurred during the payment process. Please contact support."
  },
  paymentStatus_button_view_account: {
    es: "Ver mi cuenta",
    en: "View my account"
  },
  paymentStatus_button_try_again: {
    es: "Intentar de nuevo",
    en: "Try again"
  },
  paymentStatus_mt5_account_info: {
    es: "Información de cuenta MT5",
    en: "MT5 Account Information"
  },
  paymentStatus_mt5_login: {
    es: "Login",
    en: "Login"
  },
  paymentStatus_mt5_password: {
    es: "Contraseña",
    en: "Password"
  },
  paymentStatus_mt5_investor: {
    es: "Contraseña de Inversionista",
    en: "Investor Password"
  },
  paymentStatus_mt5_save_credentials: {
    es: "Guarda estas credenciales. No las compartiremos de nuevo.",
    en: "Save these credentials. We won't share them again."
  },
  paymentStatus_mt5_manual_creation: {
    es: "Tu cuenta será creada manualmente por nuestro equipo. Recibirás las credenciales por correo electrónico.",
    en: "Your account will be created manually by our team. You will receive the credentials by email."
  },
  paymentStatus_pendingInfo: {
    es: "Puedes esperar en esta página o volver más tarde. El estado se actualizará automáticamente.",
    en: "You can wait on this page or come back later. The status will update automatically."
  },
  paymentStatus_underpaidInfo: {
    es: "Se ha recibido menos de lo esperado. Contacta a soporte para más información.",
    en: "Less than expected has been received. Contact support for more information."
  },
  paymentStatus_completedInfo: {
    es: "Pago confirmado. Procesando tu cuenta...",
    en: "Payment confirmed. Processing your account..."
  },
  paymentStatus_button_return_to_payment: {
    es: "Volver a la página de pago",
    en: "Return to payment page"
  },
  paymentStatus_underpaid_desc: {
    es: "El monto recibido es menor al esperado. Por favor, contacta a soporte para resolver esta situación.",
    en: "The received amount is less than expected. Please contact support to resolve this situation."
  },
  paymentStatus_overpaid_desc: {
    es: "El monto recibido es mayor al esperado. El excedente será procesado según nuestras políticas.",
    en: "The received amount is greater than expected. The excess will be processed according to our policies."
  },

  // Nuevas claves para VerificationCode.jsx
  verificationCode_title_success: {
    es: "¡Verificación exitosa!",
    en: "Verification successful!"
  },
  verificationCode_text_checkEmail: {
    es: "Hemos enviado un código de verificación a tu correo electrónico",
    en: "We have sent a verification code to your email"
  },
  verificationCode_text_checkPhone: {
    es: "Hemos enviado un código de verificación a tu teléfono",
    en: "We have sent a verification code to your phone"
  },
  verificationCode_text_enterCode: {
    es: "Ingresa el código de verificación para continuar",
    en: "Enter the verification code to continue"
  },
  verificationCode_error_invalid: {
    es: "Código de verificación inválido",
    en: "Invalid verification code"
  },
  verificationCode_error_verification: {
    es: "Error al verificar el código",
    en: "Error verifying code"
  },
  verificationCode_error_incomplete: {
    es: "Por favor ingresa los 4 dígitos del código",
    en: "Please enter all 4 digits of the code"
  },
  verificationCode_error_resend: {
    es: "Error al reenviar el código",
    en: "Error resending code"
  },
  verificationCode_button_verifying: {
    es: "Verificando...",
    en: "Verifying..."
  },
  verificationCode_button_resending: {
    es: "Reenviando...",
    en: "Resending..."
  },
  verificationCode_button_continue: {
    es: "Continuar",
    en: "Continue"
  },
  
  // PaymentPage.jsx translations
  paymentPage_loading: {
    es: "Cargando información del pago...",
    en: "Loading payment information..."
  },
  paymentPage_error_title: {
    es: "Error de Pago",
    en: "Payment Error"
  },
  paymentPage_not_found: {
    es: "Información de pago no encontrada",
    en: "Payment information not found"
  },
  paymentPage_button_dashboard: {
    es: "Volver al Dashboard",
    en: "Back to Dashboard"
  },
  paymentPage_title: {
    es: "Pago con Criptomoneda",
    en: "Cryptocurrency Payment"
  },
  paymentPage_subtitle: {
    es: "Completa el pago para continuar con tu compra",
    en: "Complete the payment to proceed with your purchase"
  },
  paymentPage_amount: {
    es: "Monto a Pagar",
    en: "Amount to Pay"
  },
  paymentPage_network: {
    es: "Red",
    en: "Network"
  },
  paymentPage_scan_qr: {
    es: "Escanea el código QR con tu wallet o aplicación de pagos",
    en: "Scan the QR code with your wallet or payment app"
  },
  paymentPage_wallet_address: {
    es: "Dirección de la Wallet",
    en: "Wallet Address"
  },
  paymentPage_copied: {
    es: "¡Copiado!",
    en: "Copied!"
  },
  paymentPage_instructions_title: {
    es: "Instrucciones de Pago",
    en: "Payment Instructions"
  },
  paymentPage_instruction_1: {
    es: "Escanea el código QR o copia la dirección de la wallet",
    en: "Scan the QR code or copy the wallet address"
  },
  paymentPage_instruction_2: {
    es: "Envía exactamente {{amount}} {{currency}} a la dirección mostrada",
    en: "Send exactly {{amount}} {{currency}} to the displayed address"
  },
  paymentPage_instruction_3: {
    es: "El sistema detectará automáticamente tu pago una vez confirmado en la blockchain",
    en: "The system will automatically detect your payment once confirmed on the blockchain"
  },
  paymentPage_instruction_4: {
    es: "Una vez completado, serás redirigido a la página de confirmación",
    en: "Once completed, you will be redirected to the confirmation page"
  },
  paymentPage_button_check_status: {
    es: "Verificar Estado del Pago",
    en: "Check Payment Status"
  },
  paymentPage_button_cancel: {
    es: "Cancelar y Volver",
    en: "Cancel and Go Back"
  },
  paymentPage_time_remaining: {
    es: "Tiempo restante",
    en: "Time remaining"
  },

  // RegistrationSuccess.jsx translations
  registrationSuccess_verifying: {
    es: "Verificando tu correo electrónico...",
    en: "Verifying your email..."
  },
  registrationSuccess_title: {
    es: "¡Registro Exitoso!",
    en: "Registration Successful!"
  },
  registrationSuccess_message: {
    es: "Tu correo electrónico ha sido verificado correctamente. Ya puedes acceder a tu cuenta.",
    en: "Your email has been verified successfully. You can now access your account."
  },
  registrationSuccess_button_dashboard: {
    es: "Ingresar al Dashboard",
    en: "Go to Dashboard"
  },
  registrationSuccess_error_title: {
    es: "Error de Verificación",
    en: "Verification Error"
  },
  registrationSuccess_button_login: {
    es: "Ir al Login",
    en: "Go to Login"
  },
  tradingDashboard_showPasswordButton: { es: "Mostrar", en: "Show" },
  tradingDashboard_hidePassword: { es: "Ocultar", en: "Hide" },
  tradingDashboard_noPasswordSet: { es: "No establecida", en: "Not set" },
  tradingDashboard_refreshButton: {
    en: 'Refresh Data',
    es: 'Actualizar Datos'
  },
  tradingDashboard_error_connection: {
    en: "Unable to connect to the server. Please check your internet connection and try again.",
    es: "No se puede conectar al servidor. Por favor, verifica tu conexión a internet e inténtalo de nuevo."
  },
  tradingDashboard_error_cors: {
    en: "Connection blocked by security policy. Please contact support.",
    es: "Conexión bloqueada por política de seguridad. Por favor, contacta con soporte."
  },

  // OperationsHistory / Payments component translations
  operations_withdrawable_earnings: {
    es: "Ganancia Retirable",
    en: "Withdrawable Earnings",
  },
  operations_withdraw_earnings: {
    es: "Retirar Ganancia",
    en: "Withdraw Earnings",
  },
  operations_withdrawal_wallet: {
    es: "Billetera de retiros",
    en: "Withdrawal Wallet",
  },
  operations_operations_history: {
    es: "Historial de Operaciones",
    en: "Operations History",
  },
  operations_order_number: {
    es: "Numero de orden",
    en: "Order Number",
  },
  operations_date: {
    es: "Fecha",
    en: "Date",
  },
  operations_from: {
    es: "De",
    en: "From",
  },
  operations_to: {
    es: "A",
    en: "To",
  },
  operations_status: {
    es: "Estado",
    en: "Status",
  },
  operations_all: {
    es: "Todo",
    en: "All",
  },
  operations_payment_type: {
    es: "Tipo de pago",
    en: "Payment Type",
  },
  operations_loading: {
    es: "Cargando...",
    en: "Loading...",
  },
  operations_updated: {
    es: "Actualizado:",
    en: "Updated:",
  },
  operations_minimum_withdrawal: {
    es: "Mínimo de retiro:",
    en: "Minimum withdrawal:",
  },
  operations_available_to_withdraw: {
    es: "Disponible para retirar",
    en: "Available to withdraw",
  },
  operations_no_earnings_available: {
    es: "No hay ganancias disponibles para retirar",
    en: "No earnings available for withdrawal",
  },
  operations_processing: {
    es: "Procesando...",
    en: "Processing...",
  },
  operations_withdrawal_success: {
    es: "Solicitud de retiro enviada con éxito. El proceso puede tardar hasta 24 horas.",
    en: "Withdrawal request sent successfully. The process may take up to 24 hours.",
  },
  operations_no_earnings_error: {
    es: "No hay ganancias disponibles para retirar",
    en: "No earnings available for withdrawal",
  },
  operations_wallet_required_error: {
    es: "Debe configurar una dirección de wallet antes de retirar",
    en: "You must set up a wallet address before withdrawing",
  },
  operations_blockchain_error: {
    es: "Error en la red de la blockchain. Intente nuevamente.",
    en: "Blockchain network error. Please try again.",
  },
  operations_processing_error: {
    es: "Error al procesar el retiro. Intente más tarde.",
    en: "Error processing withdrawal. Please try again later.",
  },
  operations_tether_usdt_network: {
    es: "Tether USDT (Tron TRC20 Network)",
    en: "Tether USDT (Tron TRC20 Network)",
  },
  operations_no_wallet_set: {
    es: "No se ha establecido una dirección de wallet",
    en: "No wallet address has been set",
  },
  operations_change_wallet: {
    es: "Cambiar Billetera",
    en: "Change Wallet",
  },
  operations_save_wallet: {
    es: "Guardar",
    en: "Save",
  },
  operations_cancel: {
    es: "Cancelar",
    en: "Cancel",
  },
  operations_saving: {
    es: "Guardando...",
    en: "Saving...",
  },
  operations_wallet_placeholder: {
    es: "Ingrese la dirección de su wallet",
    en: "Enter your wallet address",
  },
  operations_wallet_success: {
    es: "Dirección de wallet guardada correctamente",
    en: "Wallet address saved successfully",
  },
  operations_wallet_error: {
    es: "Error al guardar la dirección de wallet",
    en: "Error saving wallet address",
  },
  operations_wallet_invalid: {
    es: "La dirección de wallet no es válida",
    en: "The wallet address is not valid",
  },
  operations_table_status: {
    es: "Estado",
    en: "Status",
  },
  operations_table_request_date: {
    es: "Fecha De Solicitud",
    en: "Request Date",
  },
  operations_table_payment_time: {
    es: "Tiempo De Pago",
    en: "Payment Time",
  },
  operations_table_hash: {
    es: "Hash",
    en: "Hash",
  },
  operations_table_account: {
    es: "Cuenta",
    en: "Account",
  },
  operations_table_product_type: {
    es: "Tipo De Producto",
    en: "Product Type",
  },
  operations_table_amount: {
    es: "Cantidad",
    en: "Amount",
  },
  operations_table_total_withdrawals: {
    es: "Retiros Totales",
    en: "Total Withdrawals",
  },
  operations_no_results: {
    es: "No se encontraron operaciones con los filtros aplicados",
    en: "No operations found with the applied filters",
  },
  operations_withdrawal_wallet_suffix: {
    es: "Retiro Wallet",
    en: "Wallet Withdrawal",
  },
  operations_status_terminado: {
    es: "Terminado",
    en: "Completed",
  },
  operations_status_pendiente: {
    es: "Pendiente",
    en: "Pending",
  },
  operations_status_vencido: {
    es: "Vencido",
    en: "Expired",
  },
  operations_mobile_status: {
    es: "Estado:",
    en: "Status:",
  },
  operations_mobile_request_date: {
    es: "Fecha De Solicitud:",
    en: "Request Date:",
  },
  operations_mobile_payment_time: {
    es: "Tiempo De Pago:",
    en: "Payment Time:",
  },
  operations_mobile_hash: {
    es: "Hash:",
    en: "Hash:",
  },
  operations_mobile_account: {
    es: "Cuenta:",
    en: "Account:",
  },
  operations_mobile_product_type: {
    es: "Tipo De Producto:",
    en: "Product Type:",
  },
  operations_copied_to_clipboard: {
    es: "Texto copiado al portapapeles",
    en: "Text copied to clipboard",
  },
  operations_payment_method_crypto: {
    es: "Criptomoneda",
    en: "Cryptocurrency",
  },
  operations_payment_method_card: {
    es: "Tarjeta",
    en: "Card",
  },

  // Days of the week translations
  day_domingo: {
    es: "Domingo",
    en: "Sunday",
  },
  day_lunes: {
    es: "Lunes", 
    en: "Monday",
  },
  day_martes: {
    es: "Martes",
    en: "Tuesday", 
  },
  day_miercoles: {
    es: "Miércoles",
    en: "Wednesday",
  },
  day_jueves: {
    es: "Jueves",
    en: "Thursday",
  },
  day_viernes: {
    es: "Viernes",
    en: "Friday",
  },
  day_sabado: {
    es: "Sábado",
    en: "Saturday",
  },

  // Months translations
  month_enero: {
    es: "enero",
    en: "January",
  },
  month_febrero: {
    es: "febrero",
    en: "February", 
  },
  month_marzo: {
    es: "marzo",
    en: "March",
  },
  month_abril: {
    es: "abril",
    en: "April",
  },
  month_mayo: {
    es: "mayo",
    en: "May",
  },
  month_junio: {
    es: "junio",
    en: "June",
  },
  month_julio: {
    es: "julio",
    en: "July",
  },
  month_agosto: {
    es: "agosto",
    en: "August",
  },
  month_septiembre: {
    es: "septiembre",
    en: "September",
  },
  month_octubre: {
    es: "octubre",
    en: "October",
  },
  month_noviembre: {
    es: "noviembre",
    en: "November",
  },
  month_diciembre: {
    es: "diciembre",
    en: "December",
  },

  // Date formatting words
  date_de: {
    es: "de",
    en: "",
  },
}; 