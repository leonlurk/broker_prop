import { useEffect, useState, useRef } from 'react';

const FlofyChatbot = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('inicio');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const messagesEndRef = useRef(null);

  // Configuración
  const CONFIG = {
    GEMINI_API_KEY: "AIzaSyAR8-do--xXdS225R3zCJ2MIb-N1ijdMDc",
    GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    MAX_RESPONSE_LENGTH: 200,
    COMPANY_NAME: "AGM"
  };

  // Detectar mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Scroll automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, isTyping]);

  // Cargar historial desde localStorage
  useEffect(() => {
    const userId = localStorage.getItem("agm_chat_userId") || generateUserId();
    localStorage.setItem("agm_chat_userId", userId);

    const history = localStorage.getItem(`agm_chatHistory_${userId}`);
    if (history) {
      setConversationHistory(JSON.parse(history));
    }
  }, []);

  const generateUserId = () => {
    return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  };

  const saveConversationHistory = (newHistory) => {
    const userId = localStorage.getItem("agm_chat_userId");
    localStorage.setItem(`agm_chatHistory_${userId}`, JSON.stringify(newHistory));
    setConversationHistory(newHistory);
  };

  const getGeminiResponse = async (userMessage) => {
    try {
      const prompt = buildPrompt(userMessage);
      
      const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        let botResponse = data.candidates[0].content.parts[0].text.trim();
        
        // Limitar longitud de respuesta
        if (botResponse.length > CONFIG.MAX_RESPONSE_LENGTH) {
          botResponse = botResponse.substring(0, CONFIG.MAX_RESPONSE_LENGTH - 3) + "...";
        }
        
        return botResponse;
      } else {
        throw new Error('No valid response from Gemini API');
      }
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      return "Disculpa, estoy experimentando dificultades técnicas. ¿Podrías intentar reformular tu pregunta?";
    }
  };

  const buildPrompt = (userMessage) => {
    return `Eres un asistente de AGM (Alpha Global Market), una empresa de prop trading y financiamiento de traders. Tu función es ayudar a los usuarios con información sobre:

- Proceso de evaluación y verificación de AGM
- Tipos de cuentas (Estándar y Swing)
- Reglas de trading y gestión de riesgo
- Retiro de ganancias y profit split
- Instrumentos financieros disponibles
- Requisitos y restricciones

INSTRUCCIONES IMPORTANTES:
- Mantén respuestas concisas (máximo 200 caracteres)
- Sé profesional pero amigable
- Usa información específica de AGM cuando sea relevante
- Si no tienes información específica, sugiere contactar soporte

Pregunta del usuario: "${userMessage}"

Respuesta:`;
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    const newUserMessage = {
      id: `msg_${Date.now()}_user`,
      message: messageInput.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const newHistory = [...conversationHistory, newUserMessage];
    saveConversationHistory(newHistory);
    setMessageInput('');
    setIsTyping(true);

    try {
      const botResponse = await getGeminiResponse(messageInput.trim());
      
      const newBotMessage = {
        id: `msg_${Date.now()}_bot`,
        message: botResponse,
        sender: 'agm',
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...newHistory, newBotMessage];
      saveConversationHistory(finalHistory);
    } catch (error) {
      const errorMessage = {
        id: `msg_${Date.now()}_error`,
        message: "Lo siento, hubo un problema. Por favor intenta de nuevo o contacta a nuestro equipo de soporte.",
        sender: 'agm',
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...newHistory, errorMessage];
      saveConversationHistory(finalHistory);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      title: "Guía de Inicio y Proceso de Evaluación",
      content: (
        <div>
          <p className="mb-4">Antes de comenzar con el Desafío de Evaluación de Alpha Global Market, es fundamental que comprenda claramente en qué consiste el proceso y qué se espera de usted como trader.</p>
          <p className="mb-4">Una vez que se sienta confiado en sus habilidades y resultados, podrá configurar su cuenta para iniciar el desafío oficial de Alpha Global Market.</p>
          <p>Nuestro Proceso de Evaluación ha sido cuidadosamente estructurado para ofrecer una valoración objetiva y precisa de su capacidad como trader, y es únicamente a través de este proceso que podrá calificar para operar con capital proporcionado por Alpha Global Market.</p>
        </div>
      )
    },
    {
      title: "¿Qué es Alpha Global Market?",
      content: (
        <div>
          <p className="mb-4">En Alpha Global Market, buscamos colaborar con traders que posean experiencia, disciplina y un enfoque profesional hacia los mercados financieros. Para identificar a los candidatos ideales, hemos desarrollado un Proceso de Evaluación estructurado en dos etapas, compuesto por la fase de Evaluación y la fase de Verificación.</p>
          <p className="mb-4">Este proceso no solo nos permite evaluar sus habilidades con objetividad, sino que también ofrece al trader la oportunidad de demostrar su capacidad para operar bajo parámetros definidos de gestión de riesgo y rentabilidad.</p>
          <p>Una vez completado con éxito este Proceso de Evaluación, el trader obtiene acceso a una Cuenta de Financiamiento de Alpha Global Market, desde la cual podrá operar con capital proporcionado por nosotros y recibir hasta el 90% de las ganancias generadas.</p>
        </div>
      )
    },
    {
      title: "Beneficios y Ventajas",
      content: (
        <div>
          <p className="mb-4">En Alpha Global Market comprendemos profundamente los desafíos a los que se enfrentan los traders cada día. Sabemos que no es fácil enfrentarse a situaciones como:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Operar con cuentas de capital limitado</li>
            <li>El miedo constante a perder dinero propio</li>
            <li>Presión psicológica y emocional</li>
            <li>Falta de disciplina y estructura operativa</li>
            <li>Escasas oportunidades reales de crecimiento</li>
            <li>Poco o nulo apoyo por parte del entorno</li>
          </ul>
          <p>Por eso, en Alpha Global Market ofrecemos la oportunidad de operar con una Cuenta de Financiamiento de hasta $400,000 en capital simulado, sin poner en riesgo su dinero.</p>
        </div>
      )
    },
    {
      title: "Capital y Operativa",
      content: (
        <div>
          <p className="mb-4">Usted operará con el mismo balance de cuenta que utilizó durante su Desafío de Evaluación y Verificación de Alpha Global Market. Por ejemplo, si operó con $200,000 en esa etapa, también gestionará $200,000 en su Cuenta de Financiamiento de Alpha Global Market.</p>
          <p className="mb-4">Para evitar malentendidos, es importante señalar que todas las cuentas que proporcionamos a nuestros traders son cuentas demo con fondos virtuales (Hasta que pueda demostrar una rentabilidad de 3 meses consecutivos para acceder a mercado real).</p>
          <p>Una vez que se convierta en trader financiado, recibirá las credenciales de acceso a una cuenta demo, y tendrá derecho a recibir hasta el 90% de las ganancias generadas en esa cuenta.</p>
        </div>
      )
    },
    {
      title: "Tiempo y Proceso de Evaluación",
      content: (
        <div>
          <p className="mb-4">Para superar con éxito el Desafío de Evaluación de Alpha Global Market, se requiere un mínimo de 5 días de trading activos, que no necesariamente deben ser consecutivos. Este mismo requisito se aplica a ambas fases.</p>
          <p className="mb-4">No establecemos un plazo máximo para completar nuestro Proceso de Evaluación o Verificación, lo que significa que puede avanzar a su propio ritmo y tomarse el tiempo que considere necesario.</p>
          <p>En el mejor de los casos, es posible acceder a una Cuenta de Financiamiento de Alpha Global Market tras solo 10 días de trading activo.</p>
        </div>
      )
    },
    {
      title: "Operativa con Noticias",
      content: (
        <div>
          <p className="mb-4">En Alpha Global Market, operar durante noticias no está permitido en la cuenta Estándar, sin importar la fase en la que te encuentres. Esta regla aplica tanto para:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Fase de Evaluación</li>
            <li>Fase de Verificación</li>
            <li>Etapa AGM Trader (cuenta financiada)</li>
          </ul>
          <p className="mb-4">En la cuenta Estándar, no se permite abrir ni cerrar operaciones (incluyendo ejecuciones a mercado, órdenes pendientes, stop loss y take profit) dentro de los 3 minutos antes y 3 minutos después de un evento económico relevante.</p>
          <p>¿Querés operar noticias libremente? Podés hacerlo eligiendo una cuenta Swing, la cual sí permite operar durante comunicados económicos, incluso en la etapa financiada.</p>
        </div>
      )
    },
    {
      title: "Operativa Nocturna y Fin de Semana",
      content: (
        <div>
          <p className="mb-4">Durante la noche:</p>
          <p className="mb-4">No es necesario cerrar operaciones. Tanto en la cuenta Estándar como en la cuenta Swing, podés mantener tus posiciones abiertas durante la noche sin ningún inconveniente.</p>
          <p className="mb-4">Durante el fin de semana:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>En la cuenta Estándar, deberás cerrar todas tus operaciones antes del cierre del mercado el viernes.</li>
            <li>En la cuenta Swing, sí podés dejar operaciones abiertas durante el fin de semana, incluso en la etapa de cuenta financiada.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Instrumentos y Estrategias Permitidas",
      content: (
        <div>
          <p className="mb-4">Instrumentos disponibles:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Forex (pares de divisas)</li>
            <li>CFDs sobre índices bursátiles</li>
            <li>CFDs sobre commodities (oro, petróleo, plata, etc.)</li>
            <li>CFDs sobre acciones</li>
            <li>Criptomonedas</li>
            <li>Otros derivados disponibles en la plataforma</li>
          </ul>
          <p className="mb-4">Estrategias permitidas:</p>
          <ul className="list-disc pl-5">
            <li>Soporte y resistencia</li>
            <li>Patrones de velas japonesas</li>
            <li>Oferta y demanda</li>
            <li>Smart Money Concepts (SMC)</li>
            <li>TIC (Técnicas de inversión y control)</li>
            <li>Expert Advisors (EAs)</li>
            <li>Trading algorítmico y discrecional</li>
          </ul>
        </div>
      )
    },
    {
      title: "Retiro de Ganancias y Fiscalización",
      content: (
        <div>
          <p className="mb-4">Por defecto, la división de beneficios (Profit Split) se realiza mensualmente. No es necesario alcanzar una ganancia mínima para solicitar un pago, simplemente se debe cubrir el costo de las comisiones de transacción.</p>
          <p className="mb-4">Cualquiera sea el monto de la ganancia, tenés derecho a retirar el 80% de la misma. Y si cumplís con los requisitos del Plan de Escalado, también podrás acceder a un Profit Split del 90%.</p>
          <p className="mb-4">Si preferís dejar tus ganancias en la cuenta para aumentar tu balance y tu colchón de pérdida (drawdown), también podés hacerlo.</p>
          <p>Por favor, tenga en cuenta que usted es el único responsable de cumplir con el pago de cualquier impuesto, tasa o gravamen que le corresponda en relación con el Contrato de Cuenta de Alpha Global Market, conforme a las leyes y regulaciones fiscales que le sean aplicables.</p>
        </div>
      )
    },
    {
      title: "Tarifas y Costos",
      content: (
        <div>
          <p className="mb-4">No, no cobramos ninguna tarifa adicional ni oculta. La cuota única del Challenge de Alpha Global Market cubre todos los costos, incluida la etapa de verificación. No existen cargos recurrentes con nosotros.</p>
          <p>Además, esa cuota inicial le será reembolsada en su primer reparto de ganancias dentro de la Cuenta Alpha Global.</p>
        </div>
      )
    },
    {
      title: "Requisitos y Elegibilidad",
      content: (
        <div>
          <p className="mb-4">En Alpha Global Market, creemos firmemente que el talento en el trading no tiene fronteras. Por eso, aceptamos clientes de todo el mundo, sin importar su nacionalidad o ubicación geográfica.</p>
          <p className="mb-4">Lo único indispensable es que el cliente tenga al menos 18 años al momento del registro, ya que valoramos la responsabilidad y la capacidad de tomar decisiones informadas en un entorno de inversión real.</p>
          <p>Si tiene el compromiso y la disciplina necesarios para mejorar y crecer, entonces usted es exactamente el perfil que estamos buscando.</p>
        </div>
      )
    },
    {
      title: "Gestión de Múltiples Cuentas",
      content: (
        <div>
          <p className="mb-4">No imponemos ningún límite en cuanto al número de cuentas de trading que podés tener durante la Evaluación y la Verification de Alpha Global Market.</p>
          <p className="mb-4">Sin embargo, una vez que te convertís en Trader de Alpha Global Market, aplicamos un límite de asignación máxima de capital de $400,000 (antes de aplicar el Plan de Escalado), ya sea por trader individual o por estrategia, en cualquier momento.</p>
          <p>Por favor, tenga en cuenta que no está permitido crear múltiples cuentas a través de diferentes registros. Si detectamos que se están utilizando estrategias idénticas en varias cuentas activas, y el capital total asignado supera los $400,000 en Cuentas Alpha Global Market, nos reservamos el derecho de suspender dichas cuentas, conforme a lo estipulado en el contrato.</p>
        </div>
      )
    }
  ];

  // Estilos responsivos
  const containerStyles = isMobile 
    ? "fixed inset-4 z-[9999] bg-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col font-inter" 
    : "fixed bottom-6 right-6 z-[9999] w-96 h-[698px] bg-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col font-inter";

  const toggleButtonStyles = isMobile
    ? "fixed bottom-4 right-4 z-[9999] w-16 h-16 bg-gradient-to-br from-slate-700/90 to-cyan-400/90 rounded-full border border-slate-600/30 cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm"
    : "fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-gradient-to-br from-slate-700/80 to-cyan-400/80 rounded-full border border-slate-600/30 cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm";

  if (!isVisible) {
    return (
      <div 
        className={toggleButtonStyles}
        onClick={() => setIsVisible(true)}
      >
        <svg className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} text-white`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={containerStyles}>
      {/* Header */}
      <div className={`w-full ${isMobile ? 'h-20 px-4' : 'h-16 px-6'} py-2.5 border-b border-slate-700 flex justify-between items-center flex-shrink-0`}>
        <div className="flex items-center gap-2.5">
          <div className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} flex items-center justify-center`}>
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_1_2509)">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.000166207 15.9932L8.66401 15.9988L8.6818 13.4706L4.33383 13.4442C4.42708 12.9574 6.31552 8.38081 6.50732 8.1375L7.6229 10.0498C8.0198 10.7545 8.33625 11.3841 8.72086 12.0426C9.11144 12.7113 9.45399 13.3826 9.81649 14.0294C10.186 14.6885 10.5388 15.4328 10.9233 15.9959L13.9949 16C13.9015 15.7263 6.76843 3.36348 6.3441 2.81165C6.12986 3.00478 5.64454 4.14245 5.51772 4.41267L1.56533 12.6566C1.29874 13.2204 0.0759564 15.6253 0 15.9934L0.000166207 15.9932Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M12.2236 12.2915L13.2021 13.9992L15.8383 10.7757C16.0354 10.5485 15.7411 10.7468 16.0587 10.5797C16.2521 11.0495 16.0996 15.0607 16.12 15.9652L17.9967 15.9574L17.9996 5.07278C17.739 5.23373 14.142 9.80834 13.6291 10.4463C13.2862 10.8726 12.4068 11.8816 12.2236 12.2917V12.2915Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M10.786 5.11125L10.8158 6.80818L13.7646 6.78722C13.5956 7.27418 12.8787 7.83311 12.306 8.08204C11.3924 8.4792 10.8196 8.34202 9.84863 8.13156C10.0384 8.69561 10.6955 9.63651 10.9865 10.1953C13.862 10.2281 16.1796 7.93463 16.1394 5.05414L10.7859 5.11142L10.786 5.11125Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M7.72632 4.62512C7.81125 4.5274 7.77369 4.58715 7.84499 4.44503C8.12521 3.88676 8.33912 2.49735 10.1134 1.99455C11.8118 1.51336 12.9768 2.34186 13.6918 3.20617L15.7471 3.2202C15.6002 2.3067 14.3945 1.14542 13.7259 0.744298C11.5506 -0.560754 8.70428 -0.104993 7.17169 1.76196C6.69733 2.33987 6.47478 2.41663 6.90326 3.14344C7.15972 3.57824 7.57374 4.17117 7.72632 4.62512Z" fill="white"/>
              </g>
            </svg>
          </div>
          <div className={`text-white ${isMobile ? 'text-lg' : 'text-base'} font-medium tracking-tight`}>
            {currentSection === 'inicio' ? 'AGM CHAT' : 
             currentSection === 'messages' ? 'Mensajes' : 'Ayuda'}
          </div>
        </div>
        <div 
          className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} cursor-pointer text-white hover:text-gray-300 transition-colors`}
          onClick={() => setIsVisible(false)}
        >
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/>
          </svg>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Inicio Section */}
        {currentSection === 'inicio' && (
          <div className="h-full flex items-center justify-center overflow-y-auto">
            <div className={`${isMobile ? 'w-full px-6' : 'w-80'} flex flex-col justify-center items-start gap-6 py-6`}>
              <div className={`self-stretch text-white ${isMobile ? 'text-3xl' : 'text-2xl'} font-semibold tracking-tight`}>
                ¡Hola! 👋<br />¿Cómo podemos ayudarte?
              </div>
              <div className="self-stretch flex flex-col gap-4">
                <div 
                  className={`self-stretch ${isMobile ? 'p-6' : 'p-4'} bg-slate-800 rounded-2xl border border-slate-600 flex justify-start items-center gap-5 overflow-hidden cursor-pointer hover:bg-slate-700 transition-colors`}
                  onClick={() => setCurrentSection('messages')}
                >
                  <div className="flex-1 flex flex-col gap-2">
                    <div className={`text-white ${isMobile ? 'text-lg' : 'text-base'} font-medium tracking-tight`}>
                      Envíanos un mensaje
                    </div>
                    <div className={`text-slate-400 ${isMobile ? 'text-sm' : 'text-xs'} font-normal tracking-tight`}>
                      Solemos responder en menos de un minuto
                    </div>
                  </div>
                </div>
                <div 
                  className={`self-stretch ${isMobile ? 'p-6' : 'p-4'} bg-slate-800 rounded-2xl border border-slate-600 flex flex-col gap-4 overflow-hidden cursor-pointer hover:bg-slate-700 transition-colors`}
                  onClick={() => setCurrentSection('ayuda')}
                >
                  <div className={`self-stretch ${isMobile ? 'h-12 px-4 py-4' : 'h-10 px-2 py-3'} bg-zinc-800 rounded-lg border border-slate-600 flex justify-between items-center overflow-hidden`}>
                    <div className={`text-slate-500 ${isMobile ? 'text-lg' : 'text-base'} font-normal tracking-tight`}>
                      Buscar Ayuda
                    </div>
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'}`}>
                      <svg className="w-full h-full text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                    </div>
                  </div>
                  {faqItems.slice(0, 2).map((item, index) => (
                    <div 
                      key={index} 
                      className="self-stretch flex justify-between items-center cursor-pointer hover:bg-slate-600/20 p-2 rounded-lg transition-colors"
                      onClick={() => {
                        setCurrentSection('ayuda');
                        setExpandedFaq(index);
                      }}
                    >
                      <div className={`flex-1 pr-4 text-white ${isMobile ? 'text-lg' : 'text-base'} font-normal tracking-tight`}>
                        {item.title}
                      </div>
                      <div className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`}>
                        <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="9,18 15,12 9,6"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Section */}
        {currentSection === 'messages' && (
          <div className="h-full flex flex-col">
            <div className={`flex-1 ${isMobile ? 'p-4' : 'p-6'} overflow-y-auto`}>
              {/* Welcome Message */}
              <div className={`${isMobile ? 'w-full' : 'w-72'} p-4 mb-4 bg-gradient-to-br from-sky-900 to-cyan-400 rounded-2xl flex flex-col gap-2.5 overflow-hidden`}>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1_2511)">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.000166207 15.9932L8.66401 15.9988L8.6818 13.4706L4.33383 13.4442C4.42708 12.9574 6.31552 8.38081 6.50732 8.1375L7.6229 10.0498C8.0198 10.7545 8.33625 11.3841 8.72086 12.0426C9.11144 12.7113 9.45399 13.3826 9.81649 14.0294C10.186 14.6885 10.5388 15.4328 10.9233 15.9959L13.9949 16C13.9015 15.7263 6.76843 3.36348 6.3441 2.81165C6.12986 3.00478 5.64454 4.14245 5.51772 4.41267L1.56533 12.6566C1.29874 13.2204 0.0759564 15.6253 0 15.9934L0.000166207 15.9932Z" fill="white"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.2236 12.2915L13.2021 13.9992L15.8383 10.7757C16.0354 10.5485 15.7411 10.7468 16.0587 10.5797C16.2521 11.0495 16.0996 15.0607 16.12 15.9652L17.9967 15.9574L17.9996 5.07278C17.739 5.23373 14.142 9.80834 13.6291 10.4463C13.2862 10.8726 12.4068 11.8816 12.2236 12.2917V12.2915Z" fill="white"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.786 5.11125L10.8158 6.80818L13.7646 6.78722C13.5956 7.27418 12.8787 7.83311 12.306 8.08204C11.3924 8.4792 10.8196 8.34202 9.84863 8.13156C10.0384 8.69561 10.6955 9.63651 10.9865 10.1953C13.862 10.2281 16.1796 7.93463 16.1394 5.05414L10.7859 5.11142L10.786 5.11125Z" fill="white"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.72632 4.62512C7.81125 4.5274 7.77369 4.58715 7.84499 4.44503C8.12521 3.88676 8.33912 2.49735 10.1134 1.99455C11.8118 1.51336 12.9768 2.34186 13.6918 3.20617L15.7471 3.2202C15.6002 2.3067 14.3945 1.14542 13.7259 0.744298C11.5506 -0.560754 8.70428 -0.104993 7.17169 1.76196C6.69733 2.33987 6.47478 2.41663 6.90326 3.14344C7.15972 3.57824 7.57374 4.17117 7.72632 4.62512Z" fill="white"/>
                      </g>
                    </svg>
                  </div>
                  <div className={`text-white ${isMobile ? 'text-base' : 'text-sm'} font-medium tracking-tight`}>
                    AGM CHAT
                  </div>
                </div>
                <div className={`text-white ${isMobile ? 'text-lg' : 'text-base'} font-normal tracking-tight`}>
                  ¿Cómo podemos ayudarte?
                </div>
              </div>

              {/* Conversation History */}
              {conversationHistory.map((entry) => (
                <div key={entry.id} className={`mb-4 flex ${entry.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${isMobile ? 'max-w-[85%]' : 'max-w-xs'} ${isMobile ? 'p-4' : 'p-3'} rounded-2xl ${
                    entry.sender === 'user' 
                      ? 'bg-cyan-500 text-white ml-auto' 
                      : 'bg-slate-700 text-white'
                  }`}>
                    <div className={`${isMobile ? 'text-base' : 'text-sm'}`}>
                      {entry.message}
                    </div>
                    <div className={`${isMobile ? 'text-sm' : 'text-xs'} opacity-70 mt-1`}>
                      {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="mb-4 flex justify-start">
                  <div className={`bg-slate-700 text-white ${isMobile ? 'max-w-[85%] p-4' : 'max-w-xs p-3'} rounded-2xl`}>
                    <div className="flex space-x-1">
                      <div className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2'} bg-white rounded-full animate-pulse`}></div>
                      <div className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2'} bg-white rounded-full animate-pulse`} style={{animationDelay: '0.2s'}}></div>
                      <div className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2'} bg-white rounded-full animate-pulse`} style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`${isMobile ? 'mx-4 mb-4 h-14 px-6' : 'w-80 h-12 px-5 mx-6 mb-4'} py-2 rounded-[36px] border border-white flex justify-between items-center overflow-hidden flex-shrink-0`}>
              <input
                type="text"
                placeholder="Mensaje..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 bg-transparent text-white placeholder-slate-500 ${isMobile ? 'text-lg' : 'text-base'} font-normal tracking-tight outline-none`}
              />
              <button
                onClick={sendMessage}
                className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} cursor-pointer text-white hover:text-gray-300`}
              >
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Ayuda Section */}
        {currentSection === 'ayuda' && (
          <div className={`h-full ${isMobile ? 'p-4' : 'p-6'} overflow-y-auto`}>
            <div className={`${isMobile ? 'w-full h-12 px-4 py-4' : 'w-80 h-10 px-2 py-3'} mb-6 bg-zinc-800 rounded-lg border border-slate-600 flex justify-between items-center overflow-hidden sticky top-0 z-10`}>
              <div className={`text-slate-500 ${isMobile ? 'text-lg' : 'text-base'} font-normal tracking-tight`}>
                Buscar Ayuda
              </div>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'}`}>
                <svg className="w-full h-full text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </div>

            <div className="mb-4">
              <div className={`text-zinc-500 ${isMobile ? 'text-base' : 'text-sm'} font-normal leading-none tracking-tight mb-4`}>
                {faqItems.length} colecciones
              </div>
            </div>

            <div className={`${isMobile ? 'w-full' : 'w-80'} flex flex-col gap-4 pb-4`}>
              {faqItems.map((item, index) => (
                <div key={index} className="w-full">
                  <div 
                    className={`self-stretch ${isMobile ? 'pb-6' : 'pb-4'} border-b border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-700/20 ${isMobile ? 'p-3' : 'p-2'} rounded-lg transition-colors`}
                    onClick={() => toggleFaq(index)}
                  >
                    <div className={`flex-1 pr-4 text-white ${isMobile ? 'text-lg' : 'text-base'} font-normal tracking-tight`}>
                      {item.title}
                    </div>
                    <div className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'} transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : 'rotate-0'}`}>
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="6,9 12,15 18,9"/>
                      </svg>
                    </div>
                  </div>
                  {expandedFaq === index && (
                    <div className={`mt-4 text-white ${isMobile ? 'text-base' : 'text-sm'} leading-relaxed ${isMobile ? 'px-3' : 'px-2'} animate-fadeIn`}>
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className={`w-full ${isMobile ? 'h-20 px-16' : 'h-16 px-14'} py-2.5 bg-slate-800 border-t border-slate-700 flex justify-between items-center overflow-hidden flex-shrink-0`}>
        <div 
          className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} cursor-pointer`}
          onClick={() => setCurrentSection('inicio')}
        >
          <svg 
            className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} ${currentSection === 'inicio' ? 'text-cyan-400' : 'text-white'}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
        <div 
          className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} cursor-pointer`}
          onClick={() => setCurrentSection('messages')}
        >
          <svg 
            className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} ${currentSection === 'messages' ? 'text-cyan-400' : 'text-white'}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <div 
          className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} cursor-pointer`}
          onClick={() => setCurrentSection('ayuda')}
        >
          <svg 
            className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} ${currentSection === 'ayuda' ? 'text-cyan-400' : 'text-white'}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FlofyChatbot; 