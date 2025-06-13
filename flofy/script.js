import { CONFIG } from './config.js';

// Chatbot Configuration
let conversationHistory = [];
let conversationSummary = "";

// DOM Elements
const chatToggle = document.getElementById("chat-toggle");
const chatContainer = document.getElementById("chat-container");
const closeChat = document.getElementById("close-chat");
const messagesContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

// Navigation elements
const navInicio = document.getElementById("nav-inicio");
const navMessages = document.getElementById("nav-messages");
const navAyuda = document.getElementById("nav-ayuda");
const inicioSection = document.getElementById("inicio-section");
const messagesSection = document.getElementById("messages-section");
const ayudaSection = document.getElementById("ayuda-section");
const headerTitle = document.getElementById("header-title");
const sendMessageCard = document.getElementById("send-message-card");
const helpCard = document.getElementById("help-card");

// Current section state
let currentSection = "inicio";

// User management
function generateUserId() {
  return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

function loadConversationHistory() {
  const userId = localStorage.getItem("userId");

  // Use storage adapter for enhanced functionality
  if (window.storageAdapter) {
    window.storageAdapter
      .loadChatHistory(userId)
      .then((history) => {
        if (history) {
          conversationHistory = history;
          restorePreviousMessages();
        }
        // Also check if there are CRM messages for this session
        loadFromCRMSync();
      })
      .catch((error) => {
        console.log("Storage adapter failed, using localStorage:", error);
        // Fallback to current localStorage method
        const history = localStorage.getItem(`chatHistory_${userId}`);
        if (history) {
          conversationHistory = JSON.parse(history);
          restorePreviousMessages();
        }
        loadFromCRMSync();
      });
  } else {
    // Fallback to current localStorage method
    const history = localStorage.getItem(`chatHistory_${userId}`);
    if (history) {
      conversationHistory = JSON.parse(history);
      restorePreviousMessages();
    }
    loadFromCRMSync();
  }
}

function loadConversationSummary() {
  const userId = localStorage.getItem("userId");

  // Use storage adapter for enhanced functionality
  if (window.storageAdapter) {
    window.storageAdapter
      .loadChatSummary(userId)
      .then((summary) => {
        if (summary) {
          conversationSummary = summary;
        }
      })
      .catch((error) => {
        console.log("Storage adapter failed, using localStorage:", error);
        // Fallback to current localStorage method
        const summary = localStorage.getItem(`chatSummary_${userId}`);
        if (summary) {
          conversationSummary = summary;
        }
      });
  } else {
    // Fallback to current localStorage method
    const summary = localStorage.getItem(`chatSummary_${userId}`);
    if (summary) {
      conversationSummary = summary;
    }
  }
}

function saveConversationHistory() {
  const userId = localStorage.getItem("userId");

  // Ensure all messages have IDs and timestamps
  conversationHistory = conversationHistory.map((entry, index) => ({
    ...entry,
    id: entry.id || `msg_${Date.now()}_${index}`,
    timestamp: entry.timestamp || new Date().toISOString(),
  }));

  // Use storage adapter for enhanced functionality
  if (window.storageAdapter) {
    window.storageAdapter
      .saveChatHistory(userId, conversationHistory)
      .then(() => {
        // Sync with CRM
        syncWithCRM();
      })
      .catch((error) => {
        console.log("Storage adapter failed, using localStorage:", error);
        // Fallback to current localStorage method
        localStorage.setItem(
          `chatHistory_${userId}`,
          JSON.stringify(conversationHistory)
        );
        syncWithCRM();
      });
  } else {
    // Fallback to current localStorage method
    localStorage.setItem(
      `chatHistory_${userId}`,
      JSON.stringify(conversationHistory)
    );
    syncWithCRM();
  }
}

function saveConversationSummary() {
  const userId = localStorage.getItem("userId");

  // Use storage adapter for enhanced functionality
  if (window.storageAdapter) {
    window.storageAdapter
      .saveChatSummary(userId, conversationSummary)
      .catch((error) => {
        console.log("Storage adapter failed, using localStorage:", error);
        // Fallback to current localStorage method
        localStorage.setItem(`chatSummary_${userId}`, conversationSummary);
      });
  } else {
    // Fallback to current localStorage method
    localStorage.setItem(`chatSummary_${userId}`, conversationSummary);
  }
}

function restorePreviousMessages() {
  conversationHistory.forEach((entry) => {
    // Check if it's a system message
    if (entry.isSystem || entry.sender === "system") {
      displayMessage(entry.message, entry.sender, true);
    } else {
      // For non-system messages, determine the correct sender
      let displaySender = entry.sender;

      // If the message came from CRM as "asesor", make sure it displays correctly
      if (entry.sender === "asesor" || entry.sender === "advisor") {
        displaySender = "asesor";
      }

      displayMessage(entry.message, displaySender);
    }
  });
}

// Navigation Functions
function showSection(section) {
  // Hide all sections
  inicioSection.classList.add("hidden");
  messagesSection.classList.add("hidden");
  ayudaSection.classList.add("hidden");

  // Reset navigation colors
  navInicio.querySelector("svg").classList.remove("text-cyan-400");
  navInicio.querySelector("svg").classList.add("text-white");
  navMessages.querySelector("svg").classList.remove("text-cyan-400");
  navMessages.querySelector("svg").classList.add("text-white");
  navAyuda.querySelector("svg").classList.remove("text-cyan-400");
  navAyuda.querySelector("svg").classList.add("text-white");

  // Show selected section and update navigation
  switch (section) {
    case "inicio":
      inicioSection.classList.remove("hidden");
      navInicio.querySelector("svg").classList.remove("text-white");
      navInicio.querySelector("svg").classList.add("text-cyan-400");
      headerTitle.textContent = "AGM CHAT";
      break;
    case "messages":
      messagesSection.classList.remove("hidden");
      navMessages.querySelector("svg").classList.remove("text-white");
      navMessages.querySelector("svg").classList.add("text-cyan-400");
      headerTitle.textContent = "Mensajes";
      break;
    case "ayuda":
      ayudaSection.classList.remove("hidden");
      navAyuda.querySelector("svg").classList.remove("text-white");
      navAyuda.querySelector("svg").classList.add("text-cyan-400");
      headerTitle.textContent = "Ayuda";
      break;
  }

  currentSection = section;
}

// Message handling
async function sendMessage() {
  const message = messageInput.value.trim();
  if (message === "") return;

  console.log("User message:", message);

  // Add user message to conversation history and display with unique ID
  const userMessage = {
    message,
    sender: "user",
    id: `msg_${Date.now()}_user`,
    timestamp: new Date().toISOString(),
  };

  conversationHistory.push(userMessage);
  displayMessage(message, "user");
  messageInput.value = "";

  // Force check for latest control state
  console.log("Checking control state before responding...");
  const isHumanControlled = checkHumanControlStatus();

  console.log(`Human control status: ${isHumanControlled}`);

  if (isHumanControlled) {
    // Human advisor is in control - don't generate AI response
    console.log("Human advisor in control - AI response disabled");

    // Still update conversation summary for context (but don't save yet)
    updateConversationSummary(message, "");
    saveConversationHistory();
    saveConversationSummary();

    // Show indicator that human is responding
    showHumanControlIndicator();
    return;
  }

  console.log("AI is in control - generating response");

  // Show typing indicator (only if AI is in control)
  showTyping();

  try {
    // Get response from Gemini
    const response = await getGeminiResponse(message);
    console.log("Bot response:", response);

    // Remove typing indicator and add bot message
    removeTyping();

    const botMessage = {
      message: response,
      sender: "bot",
      id: `msg_${Date.now()}_bot`,
      timestamp: new Date().toISOString(),
    };

    conversationHistory.push(botMessage);
    displayMessage(response, "bot");

    // Update conversation summary and save data
    updateConversationSummary(message, response);
    saveConversationHistory();
    saveConversationSummary();
  } catch (error) {
    console.error("Error getting response:", error);
    removeTyping();
    displayMessage(
      "Lo siento, hubo un error. Por favor, inténtalo de nuevo.",
      "bot"
    );
  }
}

// Check if human advisor is currently in control
function checkHumanControlStatus() {
  const userId = localStorage.getItem("userId");
  const crmData = localStorage.getItem("flofy_conversations");

  console.log("Checking human control status for user:", userId);

  if (crmData) {
    const data = JSON.parse(crmData);
    console.log("CRM data found:", data);

    if (data[userId] && data[userId].isHumanControlled !== undefined) {
      console.log("Human control status:", data[userId].isHumanControlled);
      return data[userId].isHumanControlled;
    }
  }

  // Also check CRM conversations for the session
  const crmConversations = localStorage.getItem("crm_conversations");
  if (crmConversations) {
    const conversations = JSON.parse(crmConversations);
    console.log("CRM conversations found:", conversations);

    // Find conversation that matches this user session
    const userConversation = conversations.find(
      (conv) => conv.id === `chatbot_${userId}` || conv.id.includes(userId)
    );

    if (userConversation && userConversation.isHumanControlled !== undefined) {
      console.log(
        "Found user conversation control status:",
        userConversation.isHumanControlled
      );
      return userConversation.isHumanControlled;
    }
  }

  console.log("No control status found - defaulting to AI control");
  return false;
}

// Show indicator that human advisor is responding
function showHumanControlIndicator() {
  // Remove any existing indicators
  removeHumanControlIndicator();
  removeTyping();

  const indicatorDiv = document.createElement("div");
  indicatorDiv.id = "human-control-indicator";
  indicatorDiv.className =
    "w-72 p-4 mb-4 bg-gradient-to-br from-green-700 to-green-500 rounded-2xl flex flex-col justify-center items-start gap-2.5 overflow-hidden";

  indicatorDiv.innerHTML = `
    <div class="flex justify-start items-start gap-2">
      <div class="w-4 h-4 flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 9.5V12.5L21 13V11L21 9H15ZM7 18C7 16.9 7.9 16 9 16S11 16.9 11 18 10.1 20 9 20 7 19.1 7 18ZM6 6.5C6.6 6.5 7 6.9 7 7.5S6.6 8.5 6 8.5 5 8.1 5 7.5 5.4 6.5 6 6.5Z"/>
        </svg>
      </div>
      <div class="justify-center text-white text-sm font-medium font-['Inter'] tracking-tight">Asesor</div>
    </div>
    <div class="justify-center text-white text-base font-normal font-['Inter'] tracking-tight">
      Un asesor está revisando tu mensaje...
    </div>
  `;

  messagesContainer.appendChild(indicatorDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove human control indicator
function removeHumanControlIndicator() {
  const indicatorDiv = document.getElementById("human-control-indicator");
  if (indicatorDiv) {
    indicatorDiv.remove();
  }
}

function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.id = "typing-indicator";
  typingDiv.className =
    "w-72 p-4 mb-4 bg-gradient-to-br from-sky-900 to-cyan-400 rounded-2xl flex flex-col justify-center items-start gap-2.5 overflow-hidden";

  typingDiv.innerHTML = `
    <div class="flex justify-start items-start gap-2">
      <div class="w-4 h-4 flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full typing-dots"></div>
      </div>
      <div class="justify-center text-white text-sm font-medium font-['Inter'] tracking-tight">AGM CHAT</div>
    </div>
    <div class="justify-center text-white text-base font-normal font-['Inter'] tracking-tight">
      Escribiendo...
    </div>
  `;

  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTyping() {
  const typingDiv = document.getElementById("typing-indicator");
  if (typingDiv) {
    typingDiv.remove();
  }
}

async function getGeminiResponse(userMessage) {
  const prompt = buildPrompt(userMessage);
  console.log("Full prompt sent to Gemini:", prompt);

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: window.RESPONSE_LIMIT || 200,
    },
  };

  console.log("Request body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", response.status, errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  const data = await response.json();
  console.log("Gemini API response:", data);

  if (
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts[0]
  ) {
    return data.candidates[0].content.parts[0].text;
  } else {
    console.error("Unexpected response format:", data);
    throw new Error("Unexpected response format from Gemini API");
  }
}

function buildPrompt(userMessage) {
  // Check if there's a custom prompt from knowledge manager
  const customPromptData = localStorage.getItem('flofy_custom_prompt');
  
  if (customPromptData) {
    try {
      const promptData = JSON.parse(customPromptData);
      if (promptData.useKnowledge && promptData.prompt) {
        let prompt = promptData.prompt;
        
        // Add conversation summary for context if available
        if (conversationSummary) {
          prompt += `\n\nContexto de conversaciones anteriores: ${conversationSummary}\n\n`;
        }

        prompt += `Pregunta del usuario: ${userMessage}`;
        
        // Update response limit from knowledge manager settings
        if (promptData.responseLimit) {
          window.RESPONSE_LIMIT = promptData.responseLimit;
        }
        
        return prompt;
      }
    } catch (error) {
      console.error('Error parsing custom prompt:', error);
    }
  }
  
  // Fallback to default prompt
  let prompt = `PROMPT MAESTRO PARA AGENTE VIRTUAL "ALPHA" – ALPHA GLOBAL MARKET (AGM)

ROL DEL AGENTE

Sos Alpha, un agente de inteligencia artificial de Alpha Global Market (AGM), empresa de fondeo para traders. Tu objetivo es brindar asistencia precisa, ordenada y útil sobre el funcionamiento de AGM y resolver las dudas más frecuentes de los traders.

IMPORTANTE: Si no sabés responder EXACTAMENTE lo que el usuario está preguntando, o si solicita hablar con una persona, debés responder lo siguiente:

"Lamentablemente no puedo responder lo que estás preguntando. Un agente humano se pondrá en contacto contigo a la brevedad para ayudarte de mejor forma."

No intentes adivinar, especular ni rellenar con suposiciones. No respondas temas fiscales, legales, ni cuestiones administrativas sensibles.

IDENTIDAD DE LA EMPRESA

AGM es una empresa con sede en Dubái, que ofrece cuentas de evaluación y fondeo para traders. Opera con licencia oficial de MetaTrader 5 y proporciona capital simulado hasta $200.000. El trader opera en cuentas demo hasta demostrar 3 meses de rentabilidad consistente para pasar a fondos reales.

FUNCIONES DEL AGENTE "ALPHA"

● Explicar el proceso de evaluación y fondeo
● Detallar reglas operativas y de consistencia
● Guiar sobre retiros, fases y progresión
● Asistir con el acceso a MetaTrader 5 y plataforma
● Derivar a soporte humano si la consulta está fuera de alcance

TONO Y ESTILO

● Profesional, cercano y claro
● No usás jerga técnica innecesaria
● En español neutro o europeo

BASE DE CONOCIMIENTO Y RESPUESTAS PREESTABLECIDAS

1. ¿Cómo empiezo? Podés iniciar comprando un Desafío en nuestra web. Tras el pago, recibirás tus credenciales de acceso y podés comenzar con la Fase 1 (Evaluación).
2. ¿Cuántas fases tiene el proceso? Tres:
● Fase 1: Evaluación (objetivo 10%)
● Fase 2: Verificación (objetivo 5%)
● Fase 3: AGM Trader (cuenta financiada, retiro del 90%)
3. ¿Cuánto tiempo tengo para completar cada fase? No hay límite de tiempo. Pero debés operar al menos 5 días activos por fase.
4. ¿Qué reglas debo cumplir?
● No superar el 5% de pérdida diaria
● No superar el 10% de pérdida total
● Alcanzar el objetivo de beneficio (10% en F1, 5% en F2)
● Operar al menos 5 días activos por fase
● Cumplir con las reglas de consistencia
5. ¿Cuáles son las reglas de consistencia?
● Una sola operación no puede representar más del 10% del retiro
● Mismo límite de ganancia diaria
● El tamaño de lote no puede variar más del 100%
● No puede haber un trade o día que represente más del 30% del beneficio mensual
6. ¿Qué tipo de cuenta tengo? Si no elegiste la Swing, tenés una cuenta Estándar. Esta prohíbe operar durante noticias o fines de semana. La Swing lo permite.
7. ¿Puedo dejar operaciones abiertas?
● Nocturnas: Sí
● Fin de semana: Solo con cuenta Swing
8. ¿Puedo operar durante noticias? Solo con cuenta Swing. La cuenta Estándar lo prohíbe 3 minutos antes y después del evento.
9. ¿Con qué capital opero? Con el mismo importe que elegiste al comprar el Desafío ($10.000 a $200.000).
10. ¿Cuántas cuentas puedo tener? Durante Fase 1 y 2: ilimitadas. Como AGM Trader: máximo $200.000 por persona o estrategia.
11. ¿Cuándo puedo retirar ganancias? Cada 14 días. Siempre que cumplas las reglas operativas.
12. ¿Cuánto puedo retirar? Hasta el 90% de las ganancias netas. El 10% restante es para AGM.
13. ¿Cómo se hace el retiro? Desde tu Área de Cliente > Sección "Retiros". Por transferencia bancaria o USDT (TRON).
14. ¿Cuánto tarda en llegar el retiro? Entre 1 y 4 días hábiles.
15. ¿Debo pagar impuestos? AGM no brinda asesoramiento fiscal. Cada trader debe cumplir con las leyes de su país de residencia.
16. ¿Puedo usar Expert Advisors? Sí, siempre que:
● No sean clónicos con otros usuarios
● No violen las reglas de consistencia o riesgo
17. ¿Qué estrategias están prohibidas? Copytrading, hedging, arbitraje de latencia, grid trading, gestión de cuentas por terceros.
18. ¿Qué instrumentos puedo operar? Forex, índices, commodities, acciones (CFDs), criptomonedas, otros derivados habilitados.
19. ¿Cómo ingreso a MetaTrader 5? Con las credenciales que se te envían por correo tras pagar el Desafío. Si no las recibiste, revisá spam o consultá con soporte.
20. ¿Puedo escalar capital? Sí. Tras demostrar rentabilidad por 3 meses como AGM Trader, podés acceder al programa "AGM Capital" con cuentas reales y sin límites.
21. ¿Dónde está ubicada AGM? En Dubái, Emiratos Árabes Unidos: Business Center 1, M Floor, The Meydan Hotel, Nad Al Sheba.
22. ¿Cómo contacto al soporte? Desde la web oficial en la sección "Contacto", por correo, WhatsApp o chat en vivo.
23. ¿Cuándo recibiré mis credenciales? Tras el pago del Desafío, usualmente en menos de 24 horas. Llegan por email y aparecen en tu dashboard.
24. ¿La tarifa del Desafío es única? Sí. No hay cargos ocultos ni recurrentes. Se reembolsa con el primer reparto de ganancias.
25. ¿Puedo cambiar el tipo o tamaño de mi cuenta luego de iniciar? No. Para operar otro tipo o capital, debés adquirir un nuevo Desafío.

`;

  // Add conversation summary for context if available
  if (conversationSummary) {
    prompt += `\n\nContexto de conversaciones anteriores: ${conversationSummary}\n\n`;
  }

  prompt += `Pregunta del usuario: ${userMessage}`;

  return prompt;
}

function updateConversationSummary(userMessage, botResponse = "") {
  console.log("Updating conversation summary...");
  console.log("Current summary:", conversationSummary);

  // Extract keywords from user message
  const userKeywords = extractKeywords(userMessage);
  let allKeywords = [...userKeywords];

  // If there's a bot response, extract keywords from it too
  if (botResponse) {
    const botKeywords = extractKeywords(botResponse);
    allKeywords = [...userKeywords, ...botKeywords];
  }

  console.log("Extracted keywords:", allKeywords);

  // Create new interaction summary
  const newInteraction = botResponse
    ? `Usuario preguntó sobre: ${allKeywords.slice(0, 8).join(", ")}. `
    : `Usuario mencionó: ${allKeywords.slice(0, 6).join(", ")}. `;

  console.log("New interaction summary:", newInteraction);

  // Update summary
  if (!conversationSummary) {
    conversationSummary = newInteraction;
  } else {
    // Check if summary is getting too long
    if (conversationSummary.length > 800) {
      console.log("Summary too long, removing old interactions...");

      // Split by sentences and remove the first few complete interactions
      const sentences = conversationSummary.split(". ");
      if (sentences.length > 3) {
        // Remove first 2 complete interactions (assuming each interaction is ~2 sentences)
        const reducedSentences = sentences.slice(4);
        conversationSummary = reducedSentences.join(". ");
        console.log("Reduced summary:", conversationSummary);
      }
    }

    conversationSummary += newInteraction;
  }

  // Limit total summary length
  if (conversationSummary.length > 1000) {
    conversationSummary = conversationSummary.substring(
      conversationSummary.length - 800
    );
    // Find the start of a complete sentence
    const firstDotIndex = conversationSummary.indexOf(". ");
    if (firstDotIndex !== -1) {
      conversationSummary = conversationSummary.substring(firstDotIndex + 2);
    }
  }

  console.log("Final updated summary:", conversationSummary);
}

function extractKeywords(message) {
  // Enhanced stopwords list in Spanish
  const stopwords = new Set([
    "el",
    "la",
    "de",
    "que",
    "y",
    "a",
    "en",
    "un",
    "es",
    "se",
    "no",
    "te",
    "lo",
    "le",
    "da",
    "su",
    "por",
    "son",
    "con",
    "para",
    "al",
    "una",
    "me",
    "ni",
    "si",
    "ya",
    "o",
    "del",
    "las",
    "los",
    "como",
    "pero",
    "sus",
    "le",
    "está",
    "era",
    "estoy",
    "eres",
    "está",
    "estamos",
    "están",
    "ser",
    "estar",
    "tener",
    "hacer",
    "puede",
    "todo",
    "también",
    "fue",
    "era",
    "han",
    "hay",
    "muy",
    "más",
    "puede",
    "sobre",
    "este",
    "esta",
    "estos",
    "estas",
    "ese",
    "esa",
    "esos",
    "esas",
    "aquel",
    "aquella",
    "aquellos",
    "aquellas",
    "mi",
    "tu",
    "su",
    "nuestro",
    "vuestro",
    "hola",
    "gracias",
    "por",
    "favor",
    "bueno",
    "bien",
    "mal",
    "sí",
    "no",
    "qué",
    "cómo",
    "cuándo",
    "dónde",
    "quién",
    "cuál",
    "cuáles",
    "cuánto",
    "cuánta",
    "cuántos",
    "cuántas",
  ]);

  // Important technical terms to always keep
  const technicalTerms = new Set([
    "crm",
    "kanban",
    "etiquetas",
    "ia",
    "gemini",
    "api",
    "dashboard",
    "analytics",
    "reportes",
    "integracion",
    "integración",
    "automatizacion",
    "automatización",
    "workflow",
    "pipeline",
    "leads",
    "ventas",
    "marketing",
    "clientes",
    "usuarios",
    "datos",
    "base",
    "sistema",
  ]);

  return message
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, " ")
    .split(/\s+/)
    .filter((word) => {
      // Keep if it's a technical term
      if (technicalTerms.has(word)) return true;
      // Keep if it's not a stopword and is at least 3 characters
      return word.length >= 3 && !stopwords.has(word);
    })
    .slice(0, 12); // Limit to 12 keywords
}

function displayMessage(message, sender, isSystemMessage = false) {
  const messageDiv = document.createElement("div");

  if (isSystemMessage) {
    // System message - compact style like in CRM
    messageDiv.className =
      "text-center text-cyan-400 text-sm py-2 mb-3 bg-neutral-800 bg-opacity-50 rounded-lg mx-auto max-w-xs";
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return;
  }

  if (sender === "user") {
    // User message bubble - right aligned, dark gradient
    messageDiv.className =
      "w-80 p-4 ml-auto mb-4 bg-gradient-to-br from-zinc-800 to-neutral-700 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br flex flex-col justify-center items-start gap-2.5 overflow-hidden";

    const textDiv = document.createElement("div");
    textDiv.className =
      "self-stretch justify-center text-white text-base font-normal font-['Inter'] tracking-tight";
    textDiv.textContent = message;
    messageDiv.appendChild(textDiv);
  } else {
    // Bot/Advisor message bubble - left aligned, sky to cyan gradient
    messageDiv.className =
      "w-72 p-4 mb-4 bg-gradient-to-br from-sky-900 to-cyan-400 rounded-2xl flex flex-col justify-center items-start gap-2.5 overflow-hidden";

    // Determine sender name - check if message comes from advisor
    let senderName = "Flofy";
    if (sender === "asesor" || sender === "advisor") {
      senderName = "Asesor";
    } else {
      // Check if this message came from CRM advisor by looking at recent CRM data
      const userId = localStorage.getItem("userId");
      const crmData = localStorage.getItem("flofy_conversations");
      if (crmData) {
        const data = JSON.parse(crmData);
        if (data[userId] && data[userId].messages) {
          // Find this message in CRM data to check its sender
          const crmMessage = data[userId].messages.find(
            (msg) =>
              msg.text === message &&
              Math.abs(new Date(msg.timestamp) - new Date()) < 10000 // Within last 10 seconds
          );
          if (crmMessage && crmMessage.sender === "asesor") {
            senderName = "Asesor";
          }
        }
      }
    }

    // Bot header with icon and name
    const headerDiv = document.createElement("div");
    headerDiv.className = "flex justify-start items-start gap-2";

    const iconDiv = document.createElement("div");
    iconDiv.className = "w-4 h-4 flex items-center justify-center";

    if (senderName === "Asesor") {
      // Human advisor icon
      iconDiv.innerHTML = `
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 9.5V12.5L21 13V11L21 9H15ZM7 18C7 16.9 7.9 16 9 16S11 16.9 11 18 10.1 20 9 20 7 19.1 7 18ZM6 6.5C6.6 6.5 7 6.9 7 7.5S6.6 8.5 6 8.5 5 8.1 5 7.5 5.4 6.5 6 6.5Z"/>
        </svg>
      `;
    } else {
      // AI bot icon
      iconDiv.innerHTML = `
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1_2510)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.000166207 15.9932L8.66401 15.9988L8.6818 13.4706L4.33383 13.4442C4.42708 12.9574 6.31552 8.38081 6.50732 8.1375L7.6229 10.0498C8.0198 10.7545 8.33625 11.3841 8.72086 12.0426C9.11144 12.7113 9.45399 13.3826 9.81649 14.0294C10.186 14.6885 10.5388 15.4328 10.9233 15.9959L13.9949 16C13.9015 15.7263 6.76843 3.36348 6.3441 2.81165C6.12986 3.00478 5.64454 4.14245 5.51772 4.41267L1.56533 12.6566C1.29874 13.2204 0.0759564 15.6253 0 15.9934L0.000166207 15.9932Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2236 12.2915L13.2021 13.9992L15.8383 10.7757C16.0354 10.5485 15.7411 10.7468 16.0587 10.5797C16.2521 11.0495 16.0996 15.0607 16.12 15.9652L17.9967 15.9574L17.9996 5.07278C17.739 5.23373 14.142 9.80834 13.6291 10.4463C13.2862 10.8726 12.4068 11.8816 12.2236 12.2917V12.2915Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.786 5.11125L10.8158 6.80818L13.7646 6.78722C13.5956 7.27418 12.8787 7.83311 12.306 8.08204C11.3924 8.4792 10.8196 8.34202 9.84863 8.13156C10.0384 8.69561 10.6955 9.63651 10.9865 10.1953C13.862 10.2281 16.1796 7.93463 16.1394 5.05414L10.7859 5.11142L10.786 5.11125Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.72632 4.62512C7.81125 4.5274 7.77369 4.58715 7.84499 4.44503C8.12521 3.88676 8.33912 2.49735 10.1134 1.99455C11.8118 1.51336 12.9768 2.34186 13.6918 3.20617L15.7471 3.2202C15.6002 2.3067 14.3945 1.14542 13.7259 0.744298C11.5506 -0.560754 8.70428 -0.104993 7.17169 1.76196C6.69733 2.33987 6.47478 2.41663 6.90326 3.14344C7.15972 3.57824 7.57374 4.17117 7.72632 4.62512Z" fill="white"/>
          </g>
          <defs>
            <clipPath id="clip0_1_2510">
              <rect width="18" height="16" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      `;
    }

    const nameDiv = document.createElement("div");
    nameDiv.className =
      "justify-center text-white text-sm font-medium font-['Inter'] tracking-tight";
    nameDiv.textContent = senderName;

    headerDiv.appendChild(iconDiv);
    headerDiv.appendChild(nameDiv);

    // Bot message text
    const textDiv = document.createElement("div");
    textDiv.className =
      "justify-center text-white text-base font-normal font-['Inter'] tracking-tight";
    textDiv.textContent = message;

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(textDiv);
  }

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Main initialization
function initializeChatbot() {
  // Generate unique user ID if not exists
  if (!localStorage.getItem("userId")) {
    const userId = generateUserId();
    localStorage.setItem("userId", userId);
  }

  // Load conversation history and summary
  loadConversationHistory();
  loadConversationSummary();

  // Initialize to show Inicio section
  showSection("inicio");

  console.log("Chatbot initialized for user:", localStorage.getItem("userId"));
  console.log("Loaded conversation history:", conversationHistory);
  console.log("Loaded conversation summary:", conversationSummary);
}

// Event Listeners
chatToggle.addEventListener("click", () => {
  chatContainer.classList.toggle("hidden");
  // Hide the toggle button when chat is open
  if (!chatContainer.classList.contains("hidden")) {
    chatToggle.classList.add("hidden");
  }
});

closeChat.addEventListener("click", () => {
  chatContainer.classList.add("hidden");
  // Show the toggle button when chat is closed
  chatToggle.classList.remove("hidden");
});

// Navigation event listeners
navInicio.addEventListener("click", () => {
  showSection("inicio");
});

navMessages.addEventListener("click", () => {
  showSection("messages");
});

navAyuda.addEventListener("click", () => {
  showSection("ayuda");
});

// Inicio section event listeners
sendMessageCard.addEventListener("click", () => {
  showSection("messages");
});

helpCard.addEventListener("click", () => {
  showSection("ayuda");
});

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Add CSS for typing animation
const style = document.createElement("style");
style.textContent = `
    .typing-dots {
        animation: typing 1.5s infinite;
    }
    
    @keyframes typing {
        0%, 20% { opacity: 0; }
        50% { opacity: 1; }
        80%, 100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the chatbot
initializeChatbot();

// Start polling for CRM messages with shorter interval for better responsiveness
setInterval(() => {
  loadFromCRMSync();
}, 1000); // Check every 1 second for better responsiveness

// Add CRM synchronization function
function syncWithCRM() {
  const userId = localStorage.getItem("userId");
  const sessionId = userId;

  // Get existing CRM conversations
  const existingCrmData = localStorage.getItem("flofy_conversations");
  let crmData = {};

  if (existingCrmData) {
    crmData = JSON.parse(existingCrmData);
  }

  // Create current chatbot messages
  const chatbotMessages = conversationHistory.map((entry, index) => ({
    id: entry.id || `msg_${Date.now()}_${index}`,
    text: entry.message,
    sender: entry.sender === "user" ? "user" : "flofy",
    timestamp: entry.timestamp || new Date().toISOString(),
    isFromBot: entry.sender === "bot",
  }));

  // If conversation exists in CRM, merge messages intelligently
  if (crmData[sessionId] && crmData[sessionId].messages) {
    const existingMessages = crmData[sessionId].messages;
    const mergedMessages = mergeMessages(existingMessages, chatbotMessages);

    crmData[sessionId] = {
      messages: mergedMessages,
      summary: conversationSummary,
      lastActivity: new Date().toISOString(),
    };
  } else {
    // Create new conversation
    crmData[sessionId] = {
      messages: chatbotMessages,
      summary: conversationSummary,
      lastActivity: new Date().toISOString(),
    };
  }

  // Save to localStorage for CRM to read
  localStorage.setItem("flofy_conversations", JSON.stringify(crmData));

  console.log("Conversation synced with CRM (merged):", crmData[sessionId]);
}

// Intelligent message merging function
function mergeMessages(existingMessages, newMessages) {
  const merged = [...existingMessages];

  newMessages.forEach((newMsg) => {
    // Check if message already exists (by ID or content + timestamp)
    const exists = merged.some(
      (existingMsg) =>
        existingMsg.id === newMsg.id ||
        (existingMsg.text === newMsg.text &&
          existingMsg.sender === newMsg.sender &&
          Math.abs(
            new Date(existingMsg.timestamp) - new Date(newMsg.timestamp)
          ) < 5000)
    );

    if (!exists) {
      merged.push(newMsg);
    }
  });

  // Sort by timestamp to maintain order
  return merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Load messages from CRM if they exist
function loadFromCRMSync() {
  const userId = localStorage.getItem("userId");
  const crmData = localStorage.getItem("flofy_conversations");

  if (crmData) {
    const data = JSON.parse(crmData);
    if (data[userId] && data[userId].messages) {
      // Check control state
      const wasHumanControlled = checkHumanControlStatus();
      const isCurrentlyHumanControlled =
        data[userId].isHumanControlled || false;

      // Check if we should remove indicators (advisor responded)
      if (data[userId].removeIndicators) {
        removeHumanControlIndicator();
        // Clear the flag
        data[userId].removeIndicators = false;
        localStorage.setItem("flofy_conversations", JSON.stringify(data));
        console.log("Advisor responded - indicators removed");
      }

      // If control state changed from human to AI, remove indicators
      if (wasHumanControlled && !isCurrentlyHumanControlled) {
        removeHumanControlIndicator();
        console.log("Control returned to AI - indicators removed");
      }

      // Convert CRM messages back to chatbot format and merge
      const crmMessages = data[userId].messages.map((msg) => ({
        message: msg.text,
        sender: msg.sender === "user" ? "user" : msg.sender, // Keep original sender (asesor, flofy, system)
        timestamp: msg.timestamp,
        id: msg.id,
        isSystem: msg.isSystem || msg.sender === "system",
      }));

      // Merge with existing conversation history
      const mergedHistory = mergeConversationHistory(
        conversationHistory,
        crmMessages
      );
      if (mergedHistory.length > conversationHistory.length) {
        conversationHistory = mergedHistory;
        // Clear and restore messages
        messagesContainer.innerHTML = "";
        restorePreviousMessages();
        saveConversationHistory();

        // If human is in control and there are new messages, show appropriate indicator
        if (isCurrentlyHumanControlled && mergedHistory.length > 0) {
          const lastMessage = mergedHistory[mergedHistory.length - 1];
          // Only show indicator if the last message is from user and no response from advisor yet
          if (lastMessage.sender === "user") {
            setTimeout(() => showHumanControlIndicator(), 500);
          }
        }
      }
    }
  }
}

// Merge conversation histories
function mergeConversationHistory(existing, crmMessages) {
  const merged = [...existing];

  crmMessages.forEach((crmMsg) => {
    const exists = merged.some(
      (existingMsg) =>
        existingMsg.id === crmMsg.id ||
        (existingMsg.message === crmMsg.message &&
          existingMsg.sender === crmMsg.sender &&
          Math.abs(
            new Date(existingMsg.timestamp || 0) - new Date(crmMsg.timestamp)
          ) < 5000)
    );

    if (!exists) {
      merged.push(crmMsg);
    }
  });

  return merged.sort(
    (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
  );
}
