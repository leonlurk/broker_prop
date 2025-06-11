// CRM State Management
let conversations = [];
let activeConversationId = null;
let isHumanControlActive = false;

// DOM Elements
const conversationsList = document.getElementById("conversations-list");
const messagesContainer = document.getElementById("messages-container");
const noConversationDiv = document.getElementById("no-conversation");
const chatTitle = document.getElementById("chat-title");
const controlBtn = document.getElementById("control-btn");
const controlText = document.getElementById("control-text");
const inputArea = document.getElementById("input-area");
const messageInput = document.getElementById("crm-message-input");
const sendButton = document.getElementById("crm-send-button");

// Initialize CRM
document.addEventListener("DOMContentLoaded", function () {
  loadConversations();
  setupEventListeners();
  startPollingForNewMessages();
});

// Setup Event Listeners
function setupEventListeners() {
  controlBtn.addEventListener("click", toggleControl);
  sendButton.addEventListener("click", function () {
    if (!isHumanControlActive) {
      alert("Toma el control para responder");
      return;
    }
    sendMessage();
  });
  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      if (!isHumanControlActive) {
        alert("Toma el control para responder");
        return;
      }
      sendMessage();
    }
  });
}

// Load conversations from localStorage or create sample data
function loadConversations() {
  // Use storage adapter for enhanced functionality
  if (window.storageAdapter) {
    window.storageAdapter
      .loadCRMConversations()
      .then((stored) => {
        if (stored) {
          conversations = stored;
        } else {
          // Create sample conversations for demo
          conversations = [
            {
              id: "conv_1",
              lastMessage:
                "Necesito información de la empresa y precios de los servicios",
              timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              isActive: true,
              isHumanControlled: false,
              messages: [
                {
                  id: "msg_1",
                  text: "¿Cómo podemos ayudarte?",
                  sender: "flofy",
                  timestamp: new Date(Date.now() - 7200000).toISOString(),
                  isFromBot: true,
                },
                {
                  id: "msg_2",
                  text: "Necesito información de la empresa y precios de los servicios",
                  sender: "user",
                  timestamp: new Date(Date.now() - 3600000).toISOString(),
                  isFromBot: false,
                },
              ],
            },
            {
              id: "conv_2",
              lastMessage: "Consulta de datos y servicios...",
              timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
              isActive: false,
              isHumanControlled: false,
              messages: [
                {
                  id: "msg_3",
                  text: "¿Cómo podemos ayudarte?",
                  sender: "flofy",
                  timestamp: new Date(Date.now() - 9000000).toISOString(),
                  isFromBot: true,
                },
                {
                  id: "msg_4",
                  text: "Consulta de datos y servicios...",
                  sender: "user",
                  timestamp: new Date(Date.now() - 7200000).toISOString(),
                  isFromBot: false,
                },
              ],
            },
          ];
          saveConversations();
        }
        renderConversations();
      })
      .catch((error) => {
        console.log("Storage adapter failed, using localStorage:", error);
        // Fallback to current localStorage method
        const stored = localStorage.getItem("crm_conversations");
        if (stored) {
          conversations = JSON.parse(stored);
        } else {
          // Create sample conversations for demo
          conversations = [
            {
              id: "conv_1",
              lastMessage:
                "Necesito información de la empresa y precios de los servicios",
              timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              isActive: true,
              isHumanControlled: false,
              messages: [
                {
                  id: "msg_1",
                  text: "¿Cómo podemos ayudarte?",
                  sender: "flofy",
                  timestamp: new Date(Date.now() - 7200000).toISOString(),
                  isFromBot: true,
                },
                {
                  id: "msg_2",
                  text: "Necesito información de la empresa y precios de los servicios",
                  sender: "user",
                  timestamp: new Date(Date.now() - 3600000).toISOString(),
                  isFromBot: false,
                },
              ],
            },
            {
              id: "conv_2",
              lastMessage: "Consulta de datos y servicios...",
              timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
              isActive: false,
              isHumanControlled: false,
              messages: [
                {
                  id: "msg_3",
                  text: "¿Cómo podemos ayudarte?",
                  sender: "flofy",
                  timestamp: new Date(Date.now() - 9000000).toISOString(),
                  isFromBot: true,
                },
                {
                  id: "msg_4",
                  text: "Consulta de datos y servicios...",
                  sender: "user",
                  timestamp: new Date(Date.now() - 7200000).toISOString(),
                  isFromBot: false,
                },
              ],
            },
          ];
          saveConversations();
        }
        renderConversations();
      });
  } else {
    // Fallback to current localStorage method
    const stored = localStorage.getItem("crm_conversations");
    if (stored) {
      conversations = JSON.parse(stored);
    } else {
      // Create sample conversations for demo
      conversations = [
        {
          id: "conv_1",
          lastMessage:
            "Necesito información de la empresa y precios de los servicios",
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          isActive: true,
          isHumanControlled: false,
          messages: [
            {
              id: "msg_1",
              text: "¿Cómo podemos ayudarte?",
              sender: "flofy",
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              isFromBot: true,
            },
            {
              id: "msg_2",
              text: "Necesito información de la empresa y precios de los servicios",
              sender: "user",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              isFromBot: false,
            },
          ],
        },
        {
          id: "conv_2",
          lastMessage: "Consulta de datos y servicios...",
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          isActive: false,
          isHumanControlled: false,
          messages: [
            {
              id: "msg_3",
              text: "¿Cómo podemos ayudarte?",
              sender: "flofy",
              timestamp: new Date(Date.now() - 9000000).toISOString(),
              isFromBot: true,
            },
            {
              id: "msg_4",
              text: "Consulta de datos y servicios...",
              sender: "user",
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              isFromBot: false,
            },
          ],
        },
      ];
      saveConversations();
    }
    renderConversations();
  }
}

// Save conversations to localStorage
function saveConversations() {
  // Use storage adapter for enhanced functionality
  if (window.storageAdapter) {
    window.storageAdapter.saveCRMConversations(conversations).catch((error) => {
      console.log("Storage adapter failed, using localStorage:", error);
      // Fallback to current localStorage method
      localStorage.setItem("crm_conversations", JSON.stringify(conversations));
    });
  } else {
    // Fallback to current localStorage method
    localStorage.setItem("crm_conversations", JSON.stringify(conversations));
  }
}

// Render conversations list
function renderConversations() {
  conversationsList.innerHTML = "";

  conversations.forEach((conv, index) => {
    const convElement = createConversationElement(conv, index === 0);
    conversationsList.appendChild(convElement);
  });
}

// Create conversation element
function createConversationElement(conversation, isSelected = false) {
  const div = document.createElement("div");
  div.className = `flex flex-row items-start p-3 lg:p-4 gap-2 w-full h-14 lg:h-16 bg-[#2D2D2D] rounded-lg cursor-pointer hover:bg-[#3D3D3D] ${
    isSelected ? "border border-[#18ADDC]" : ""
  }`;
  div.onclick = () => selectConversation(conversation.id);

  // Avatar
  const avatar = document.createElement("div");
  avatar.className =
    "w-5 h-5 lg:w-6 lg:h-6 bg-[#338AF3] rounded-full flex items-center justify-center flex-shrink-0";
  avatar.innerHTML =
    '<span class="text-white text-xs lg:text-sm font-medium">U</span>';

  // Content
  const content = document.createElement("div");
  content.className = "flex flex-col flex-1 min-w-0";

  const header = document.createElement("div");
  header.className = "flex justify-between items-center w-full";

  const title = document.createElement("span");
  title.className = "text-white text-xs lg:text-sm font-medium truncate";
  title.textContent = `Usuario ${conversation.id.split("_")[1]}`;

  const time = document.createElement("span");
  time.className = "text-[#666666] text-xs lg:text-sm";
  time.textContent = formatTime(conversation.timestamp);

  const message = document.createElement("div");
  message.className = "text-[#B0B0B0] text-xs lg:text-sm truncate";
  message.textContent = conversation.lastMessage;

  header.appendChild(title);
  header.appendChild(time);
  content.appendChild(header);
  content.appendChild(message);

  div.appendChild(avatar);
  div.appendChild(content);

  return div;
}

// Format timestamp
function formatTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffHours < 1) return "Ahora";
  if (diffHours === 1) return "1h";
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

// Select conversation
function selectConversation(conversationId) {
  activeConversationId = conversationId;
  const conversation = conversations.find((c) => c.id === conversationId);

  if (conversation) {
    isHumanControlActive = conversation.isHumanControlled;
    updateControlButton();
    renderMessages(conversation);
    showChatInterface();
    updateConversationSelection();

    // Immediately sync control state to chatbot
    syncControlStateToChatbot(conversation);

    console.log(
      `Selected conversation ${conversationId}, human control: ${isHumanControlActive}`
    );
  }
}

// Update conversation selection visual
function updateConversationSelection() {
  const convElements = conversationsList.children;
  for (let i = 0; i < convElements.length; i++) {
    const conv = conversations[i];
    if (conv && conv.id === activeConversationId) {
      convElements[i].className =
        convElements[i].className.replace("border border-[#18ADDC]", "") +
        " border border-[#18ADDC]";
    } else {
      convElements[i].className = convElements[i].className.replace(
        " border border-[#18ADDC]",
        ""
      );
    }
  }
}

// Show chat interface
function showChatInterface() {
  noConversationDiv.classList.add("hidden");
  controlBtn.classList.remove("hidden");
  inputArea.classList.remove("hidden");
  chatTitle.textContent = `Usuario ${activeConversationId.split("_")[1]}`;
  updateInputAreaState();
}

// Update input area state
function updateInputAreaState() {
  if (isHumanControlActive) {
    messageInput.disabled = false;
    sendButton.disabled = false;
    inputArea.classList.remove("opacity-50", "pointer-events-none");
    messageInput.placeholder = "Responder";
  } else {
    messageInput.disabled = true;
    sendButton.disabled = true;
    inputArea.classList.add("opacity-50", "pointer-events-none");
    messageInput.placeholder = "Toma el control para responder";
  }
}

// Render messages
function renderMessages(conversation) {
  messagesContainer.innerHTML = "";

  // Welcome message from bot
  const welcomeMessage = document.createElement("div");
  welcomeMessage.className =
    "w-full max-w-72 lg:max-w-80 p-3 lg:p-4 mb-3 lg:mb-4 bg-gradient-to-br from-sky-900 to-cyan-400 rounded-2xl flex flex-col gap-2.5";
  welcomeMessage.innerHTML = `
        <div class="flex items-start gap-2">
            <div class="w-3 h-3 lg:w-4 lg:h-4 flex items-center justify-center">
                <svg class="w-full h-full" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.000166207 15.9932L8.66401 15.9988L8.6818 13.4706L4.33383 13.4442C4.42708 12.9574 6.31552 8.38081 6.50732 8.1375L7.6229 10.0498C8.0198 10.7545 8.33625 11.3841 8.72086 12.0426C9.11144 12.7113 9.45399 13.3826 9.81649 14.0294C10.186 14.6885 10.5388 15.4328 10.9233 15.9959L13.9949 16C13.9015 15.7263 6.76843 3.36348 6.3441 2.81165C6.12986 3.00478 5.64454 4.14245 5.51772 4.41267L1.56533 12.6566C1.29874 13.2204 0.0759564 15.6253 0 15.9934L0.000166207 15.9932Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2236 12.2915L13.2021 13.9992L15.8383 10.7757C16.0354 10.5485 15.7411 10.7468 16.0587 10.5797C16.2521 11.0495 16.0996 15.0607 16.12 15.9652L17.9967 15.9574L17.9996 5.07278C17.739 5.23373 14.142 9.80834 13.6291 10.4463C13.2862 10.8726 12.4068 11.8816 12.2236 12.2917V12.2915Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.786 5.11125L10.8158 6.80818L13.7646 6.78722C13.5956 7.27418 12.8787 7.83311 12.306 8.08204C11.3924 8.4792 10.8196 8.34202 9.84863 8.13156C10.0384 8.69561 10.6955 9.63651 10.9865 10.1953C13.862 10.2281 16.1796 7.93463 16.1394 5.05414L10.7859 5.11142L10.786 5.11125Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.72632 4.62512C7.81125 4.5274 7.77369 4.58715 7.84499 4.44503C8.12521 3.88676 8.33912 2.49735 10.1134 1.99455C11.8118 1.51336 12.9768 2.34186 13.6918 3.20617L15.7471 3.2202C15.6002 2.3067 14.3945 1.14542 13.7259 0.744298C11.5506 -0.560754 8.70428 -0.104993 7.17169 1.76196C6.69733 2.33987 6.47478 2.41663 6.90326 3.14344C7.15972 3.57824 7.57374 4.17117 7.72632 4.62512Z" fill="white"/>
                </svg>
            </div>
            <span class="text-white text-xs lg:text-sm font-medium">Intersasc</span>
        </div>
        <div class="text-white text-sm lg:text-base">¿Cómo podemos ayudarte?</div>
    `;
  messagesContainer.appendChild(welcomeMessage);

  // Render conversation messages
  conversation.messages.forEach((message) => {
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
  });

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Create message element
function createMessageElement(message) {
  const div = document.createElement("div");

  if (!message.isFromBot) {
    // User message (left)
    div.className =
      "max-w-72 lg:max-w-80 p-3 lg:p-4 mb-3 lg:mb-4 bg-gradient-to-br from-[#292929] to-[#404040] rounded-[24px_24px_24px_4px]";
    div.innerHTML = `<div class="text-white text-sm lg:text-base break-words">${message.text}</div>`;
  } else {
    // Advisor/bot message (right)
    div.className =
      "max-w-72 lg:max-w-80 p-3 lg:p-4 mb-3 lg:mb-4 ml-auto bg-gradient-to-br from-sky-900 to-cyan-400 rounded-[24px_24px_4px_24px] flex flex-col gap-2.5";
    div.innerHTML = `
            <div class="flex items-start gap-2 justify-end">
                <div class="w-3 h-3 lg:w-4 lg:h-4 flex items-center justify-center">
                    <svg class="w-full h-full" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.000166207 15.9932L8.66401 15.9988L8.6818 13.4706L4.33383 13.4442C4.42708 12.9574 6.31552 8.38081 6.50732 8.1375L7.6229 10.0498C8.0198 10.7545 8.33625 11.3841 8.72086 12.0426C9.11144 12.7113 9.45399 13.3826 9.81649 14.0294C10.186 14.6885 10.5388 15.4328 10.9233 15.9959L13.9949 16C13.9015 15.7263 6.76843 3.36348 6.3441 2.81165C6.12986 3.00478 5.64454 4.14245 5.51772 4.41267L1.56533 12.6566C1.29874 13.2204 0.0759564 15.6253 0 15.9934L0.000166207 15.9932Z" fill="white"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2236 12.2915L13.2021 13.9992L15.8383 10.7757C16.0354 10.5485 15.7411 10.7468 16.0587 10.5797C16.2521 11.0495 16.0996 15.0607 16.12 15.9652L17.9967 15.9574L17.9996 5.07278C17.739 5.23373 14.142 9.80834 13.6291 10.4463C13.2862 10.8726 12.4068 11.8816 12.2236 12.2917V12.2915Z" fill="white"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.786 5.11125L10.8158 6.80818L13.7646 6.78722C13.5956 7.27418 12.8787 7.83311 12.306 8.08204C11.3924 8.4792 10.8196 8.34202 9.84863 8.13156C10.0384 8.69561 10.6955 9.63651 10.9865 10.1953C13.862 10.2281 16.1796 7.93463 16.1394 5.05414L10.7859 5.11142L10.786 5.11125Z" fill="white"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.72632 4.62512C7.81125 4.5274 7.77369 4.58715 7.84499 4.44503C8.12521 3.88676 8.33912 2.49735 10.1134 1.99455C11.8118 1.51336 12.9768 2.34186 13.6918 3.20617L15.7471 3.2202C15.6002 2.3067 14.3945 1.14542 13.7259 0.744298C11.5506 -0.560754 8.70428 -0.104993 7.17169 1.76196C6.69733 2.33987 6.47478 2.41663 6.90326 3.14344C7.15972 3.57824 7.57374 4.17117 7.72632 4.62512Z" fill="white"/>
                    </svg>
                </div>
                <span class="text-white text-xs lg:text-sm font-medium">${message.sender}</span>
            </div>
            <div class="text-white text-sm lg:text-base break-words">${message.text}</div>
        `;
  }

  return div;
}

// Toggle control between AI and human
function toggleControl() {
  isHumanControlActive = !isHumanControlActive;
  const conversation = conversations.find((c) => c.id === activeConversationId);
  if (conversation) {
    conversation.isHumanControlled = isHumanControlActive;
    saveConversations();
    syncControlStateToChatbot(conversation);
  }
  updateControlButton();
  updateInputAreaState();
  if (!isHumanControlActive) {
    addSystemMessage("La IA ha retomado la conversación");
  } else {
    addSystemMessage("Un asesor se ha unido a la conversación");
  }
}

// Sync control state to chatbot
function syncControlStateToChatbot(conversation) {
  if (conversation.id.startsWith("chatbot_")) {
    const sessionId = conversation.id.replace("chatbot_", "");

    // Sync to flofy_conversations (main sync location)
    const chatbotData = localStorage.getItem("flofy_conversations");
    if (chatbotData) {
      const data = JSON.parse(chatbotData);

      if (data[sessionId]) {
        data[sessionId].isHumanControlled = isHumanControlActive;
        data[sessionId].lastControlChange = new Date().toISOString();
        localStorage.setItem("flofy_conversations", JSON.stringify(data));
      } else {
        // Create entry if it doesn't exist
        data[sessionId] = {
          messages: [],
          isHumanControlled: isHumanControlActive,
          lastControlChange: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };
        localStorage.setItem("flofy_conversations", JSON.stringify(data));
      }
    } else {
      // Create flofy_conversations if it doesn't exist
      const newData = {
        [sessionId]: {
          messages: [],
          isHumanControlled: isHumanControlActive,
          lastControlChange: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        },
      };
      localStorage.setItem("flofy_conversations", JSON.stringify(newData));
    }

    // Also sync to crm_conversations for backup
    const crmData = localStorage.getItem("crm_conversations");
    if (crmData) {
      const conversations = JSON.parse(crmData);
      const conv = conversations.find((c) => c.id === conversation.id);
      if (conv) {
        conv.isHumanControlled = isHumanControlActive;
        conv.lastControlChange = new Date().toISOString();
        localStorage.setItem(
          "crm_conversations",
          JSON.stringify(conversations)
        );
      }
    }

    console.log(
      `Control state synced to chatbot: ${
        isHumanControlActive ? "Human" : "AI"
      } for session ${sessionId}`
    );
  }
}

// Update control button
function updateControlButton() {
  if (isHumanControlActive) {
    controlText.textContent = "Entregar a IA";
    controlBtn.className = controlBtn.className.replace(
      "bg-cyan-500 hover:bg-cyan-600",
      "bg-red-500 hover:bg-red-600"
    );
  } else {
    controlText.textContent = "Tomar Control";
    controlBtn.className = controlBtn.className.replace(
      "bg-red-500 hover:bg-red-600",
      "bg-cyan-500 hover:bg-cyan-600"
    );
  }
}

// Add system message with improved visibility
function addSystemMessage(text) {
  const conversation = conversations.find((c) => c.id === activeConversationId);
  if (conversation) {
    const message = {
      id: `msg_${Date.now()}`,
      text: text,
      sender: "system",
      timestamp: new Date().toISOString(),
      isFromBot: false,
      isSystem: true,
    };

    conversation.messages.push(message);
    saveConversations();

    // Add visual system message with better styling
    const systemDiv = document.createElement("div");
    systemDiv.className =
      "text-center text-cyan-400 text-sm py-3 mb-4 bg-neutral-800 rounded-lg mx-auto max-w-xs";
    systemDiv.textContent = text;
    messagesContainer.appendChild(systemDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Sync to chatbot if needed (including system flag)
    if (conversation.id.startsWith("chatbot_")) {
      syncMessageToChatbot(conversation, message);
    }
  }
}

// Send message
async function sendMessage() {
  if (!isHumanControlActive) return;
  const text = messageInput.value.trim();
  if (!text || !activeConversationId) return;

  const conversation = conversations.find((c) => c.id === activeConversationId);
  if (!conversation) return;

  // Clear input
  messageInput.value = "";

  // Add message from advisor or AI
  const newMessage = {
    id: `msg_${Date.now()}`,
    text: text,
    sender: isHumanControlActive ? "asesor" : "flofy",
    timestamp: new Date().toISOString(),
    isFromBot: true,
  };

  conversation.messages.push(newMessage);
  conversation.lastMessage = text;
  conversation.timestamp = new Date().toISOString();

  // Update UI
  const messageElement = createMessageElement(newMessage);
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Update conversations list
  renderConversations();
  updateConversationSelection();

  saveConversations();

  // Sync back to chatbot if this is a chatbot conversation
  if (conversation.id.startsWith("chatbot_")) {
    syncMessageToChatbot(conversation, newMessage);
  }

  // If AI is in control, get AI response
  if (!isHumanControlActive) {
    await getAIResponse(conversation, text);
  }
}

// Enhanced sync message to chatbot
function syncMessageToChatbot(conversation, message) {
  const sessionId = conversation.id.replace("chatbot_", "");
  const chatbotData = localStorage.getItem("flofy_conversations");

  if (chatbotData) {
    const data = JSON.parse(chatbotData);

    if (data[sessionId]) {
      // Check if message already exists to avoid duplicates
      const messageExists = data[sessionId].messages.some(
        (msg) =>
          msg.id === message.id ||
          (msg.text === message.text &&
            msg.sender === message.sender &&
            Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) <
              5000)
      );

      if (!messageExists) {
        // Add the new message to the chatbot conversation
        data[sessionId].messages.push({
          id: message.id,
          text: message.text,
          sender: message.sender,
          timestamp: message.timestamp,
          isFromBot: message.isFromBot,
          isSystem: message.isSystem || false,
        });

        // Sort messages by timestamp
        data[sessionId].messages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Update last activity
        data[sessionId].lastActivity = new Date().toISOString();

        // Add flag to indicate chatbot should remove indicators
        if (message.sender === "asesor") {
          data[sessionId].removeIndicators = true;
        }

        // Save back to localStorage
        localStorage.setItem("flofy_conversations", JSON.stringify(data));

        console.log("Message synced back to chatbot:", message);
      } else {
        console.log("Message already exists in chatbot, skipping sync");
      }
    }
  }
}

// Get AI response using Gemini
async function getAIResponse(conversation, userMessage) {
  try {
    // Create context from conversation history
    const context = createContextFromConversation(conversation);

    const prompt = `${context}\n\nUsuario: ${userMessage}\n\nFlofy:`;

    const response = await fetch(CONFIG.GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": CONFIG.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Truncate response if needed
    const truncatedResponse =
      aiResponse.length > CONFIG.MAX_RESPONSE_LENGTH
        ? aiResponse.substring(0, CONFIG.MAX_RESPONSE_LENGTH - 3) + "..."
        : aiResponse;

    // Add AI response
    const aiMessage = {
      id: `msg_${Date.now()}_ai`,
      text: truncatedResponse,
      sender: "flofy",
      timestamp: new Date().toISOString(),
      isFromBot: true,
    };

    conversation.messages.push(aiMessage);
    conversation.lastMessage = truncatedResponse;
    conversation.timestamp = new Date().toISOString();

    // Update UI
    const messageElement = createMessageElement(aiMessage);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Update conversations list
    renderConversations();
    updateConversationSelection();

    saveConversations();

    // Sync back to chatbot if this is a chatbot conversation
    if (conversation.id.startsWith("chatbot_")) {
      syncMessageToChatbot(conversation, aiMessage);
    }
  } catch (error) {
    console.error("Error getting AI response:", error);

    // Add error message
    const errorMessage = {
      id: `msg_${Date.now()}_error`,
      text: "Lo siento, no pude procesar tu mensaje en este momento.",
      sender: "flofy",
      timestamp: new Date().toISOString(),
      isFromBot: true,
    };

    conversation.messages.push(errorMessage);
    saveConversations();

    // Sync back to chatbot if this is a chatbot conversation
    if (conversation.id.startsWith("chatbot_")) {
      syncMessageToChatbot(conversation, errorMessage);
    }

    const messageElement = createMessageElement(errorMessage);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Create context from conversation
function createContextFromConversation(conversation) {
  let context = `Eres Flofy, un asistente virtual de Intersasc. Debes responder de manera muy concisa y útil. Límite de respuesta: ${CONFIG.MAX_RESPONSE_LENGTH} caracteres.\n\nHistorial de conversación:\n`;

  conversation.messages.forEach((msg) => {
    if (!msg.isSystem) {
      const sender = msg.isFromBot ? msg.sender : "Usuario";
      context += `${sender}: ${msg.text}\n`;
    }
  });

  return context;
}

// Poll for new messages from chatbot
function startPollingForNewMessages() {
  // Check localStorage for new messages from the chatbot
  setInterval(() => {
    checkForNewChatbotMessages();
  }, 2000); // Check every 2 seconds
}

// Check for new chatbot messages
function checkForNewChatbotMessages() {
  const chatbotConversations = localStorage.getItem("flofy_conversations");
  if (!chatbotConversations) return;

  const chatbotData = JSON.parse(chatbotConversations);

  // Look for conversations that aren't in our CRM yet
  Object.keys(chatbotData).forEach((sessionId) => {
    const chatbotConv = chatbotData[sessionId];
    const existingConv = conversations.find(
      (c) => c.id === `chatbot_${sessionId}`
    );

    if (
      !existingConv &&
      chatbotConv.messages &&
      chatbotConv.messages.length > 0
    ) {
      // Create new conversation from chatbot
      const newConversation = {
        id: `chatbot_${sessionId}`,
        lastMessage: chatbotConv.messages[chatbotConv.messages.length - 1].text,
        timestamp: new Date().toISOString(),
        isActive: true,
        isHumanControlled: false,
        messages: chatbotConv.messages.map((msg) => ({
          id: msg.id || `msg_${Date.now()}_${Math.random()}`,
          text: msg.text,
          sender: msg.sender === "user" ? "user" : msg.sender,
          timestamp: msg.timestamp || new Date().toISOString(),
          isFromBot: msg.isFromBot,
        })),
      };

      conversations.unshift(newConversation); // Add to beginning
      saveConversations();
      renderConversations();
      console.log(
        "New conversation detected from chatbot:",
        newConversation.id
      );
    } else if (existingConv && chatbotConv.messages) {
      // Check if there are actually new messages before updating
      const lastCrmMessageTime =
        existingConv.messages.length > 0
          ? new Date(
              existingConv.messages[existingConv.messages.length - 1].timestamp
            )
          : new Date(0);

      const lastChatbotMessageTime =
        chatbotConv.messages.length > 0
          ? new Date(
              chatbotConv.messages[chatbotConv.messages.length - 1].timestamp
            )
          : new Date(0);

      // Only update if chatbot has newer messages
      if (
        chatbotConv.messages.length > existingConv.messages.length ||
        lastChatbotMessageTime > lastCrmMessageTime
      ) {
        // Merge messages instead of replacing
        const mergedMessages = mergeConversationMessages(
          existingConv.messages,
          chatbotConv.messages
        );

        if (mergedMessages.length > existingConv.messages.length) {
          existingConv.messages = mergedMessages;
          existingConv.lastMessage =
            chatbotConv.messages[chatbotConv.messages.length - 1].text;
          existingConv.timestamp = new Date().toISOString();

          saveConversations();
          renderConversations();

          // If this conversation is currently active, refresh the messages
          if (activeConversationId === existingConv.id) {
            renderMessages(existingConv);
          }

          console.log("Conversation updated from chatbot:", existingConv.id);
        }
      }
    }
  });
}

// Helper function to merge messages intelligently
function mergeConversationMessages(crmMessages, chatbotMessages) {
  const merged = [...crmMessages];

  chatbotMessages.forEach((chatbotMsg) => {
    const exists = merged.some(
      (crmMsg) =>
        crmMsg.id === chatbotMsg.id ||
        (crmMsg.text === chatbotMsg.text &&
          crmMsg.sender ===
            (chatbotMsg.sender === "user" ? "user" : chatbotMsg.sender) &&
          Math.abs(
            new Date(crmMsg.timestamp) - new Date(chatbotMsg.timestamp)
          ) < 5000)
    );

    if (!exists) {
      merged.push({
        id: chatbotMsg.id || `msg_${Date.now()}_${Math.random()}`,
        text: chatbotMsg.text,
        sender: chatbotMsg.sender === "user" ? "user" : chatbotMsg.sender,
        timestamp: chatbotMsg.timestamp || new Date().toISOString(),
        isFromBot: chatbotMsg.isFromBot,
      });
    }
  });

  // Sort by timestamp
  return merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}
