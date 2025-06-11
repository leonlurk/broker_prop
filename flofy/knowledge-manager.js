// Knowledge Management System for Flofy CRM
class KnowledgeManager {
  constructor() {
    this.knowledge = {
      basePrompt: "",
      companyInfo: "",
      fragments: [],
      documents: [],
      qnaItems: [],
      settings: {
        useKnowledge: true,
        responseLimit: 200
      }
    };
    this.init();
  }

  init() {
    this.loadKnowledge();
    this.setupEventListeners();
    this.updateUI();
    this.loadDefaultPrompt();
  }

  loadDefaultPrompt() {
    const defaultBasePrompt = "Eres un asistente virtual útil y amigable llamado AGM CHAT. Responde de manera concisa y natural en español. Mantén tus respuestas dentro de 200 caracteres.";
    
    const defaultCompanyInfo = `Alpha Global Market es una empresa de trading que ofrece:

PROCESO DE EVALUACIÓN:
- Desafío estructurado en dos etapas: Evaluación y Verificación
- Mínimo 5 días de trading activo por fase
- Sin plazo máximo para completar
- Acceso a cuenta financiada tras completar con éxito

BENEFICIOS:
- Capital de trading hasta $400,000 simulado
- Sin riesgo de dinero propio
- Hasta 90% de las ganancias para el trader
- Soporte completo durante el proceso

REQUISITOS:
- Edad mínima: 18 años
- Acepta clientes de todo el mundo
- Disciplina y compromiso con el trading

OPERATIVA:
- Instrumentos: Forex, CFDs, índices, commodities, acciones, criptomonedas
- Cuenta Estándar: No permite trading durante noticias
- Cuenta Swing: Permite trading durante noticias y fines de semana
- Estrategias permitidas: Análisis técnico, EAs, trading algorítmico

TARIFAS:
- Cuota única del Challenge (se reembolsa en primer pago)
- Sin tarifas adicionales u ocultas
- Profit Split mensual sin mínimo de ganancia

RETIROS:
- División de beneficios mensual
- 80% de ganancias por defecto
- 90% con Plan de Escalado
- Responsabilidad fiscal del trader

CONTACTO:
- Sede: Dubái, Emiratos Árabes Unidos
- Disponible por formulario, email, chat en vivo, WhatsApp
- Atención personalizada`;

    if (!this.knowledge.basePrompt) {
      this.knowledge.basePrompt = defaultBasePrompt;
      if(document.getElementById('base-prompt')) {
        document.getElementById('base-prompt').value = defaultBasePrompt;
      }
    }
    
    if (!this.knowledge.companyInfo) {
      this.knowledge.companyInfo = defaultCompanyInfo;
      if(document.getElementById('company-info')) {
        document.getElementById('company-info').value = defaultCompanyInfo;
      }
    }
  }

  setupEventListeners() {
    document.getElementById('save-prompt-btn')?.addEventListener('click', () => this.savePrompt());
    document.getElementById('reset-prompt-btn')?.addEventListener('click', () => this.resetPrompt());
    document.getElementById('add-fragment-btn')?.addEventListener('click', () => this.openFragmentModal());
    document.getElementById('close-fragment-modal')?.addEventListener('click', () => this.closeFragmentModal());
    document.getElementById('cancel-fragment')?.addEventListener('click', () => this.closeFragmentModal());
    document.getElementById('save-fragment')?.addEventListener('click', () => this.saveFragment());
    document.getElementById('upload-document-btn')?.addEventListener('click', () => this.triggerFileUpload());
    document.getElementById('pdf-upload')?.addEventListener('change', (e) => this.handleFileUpload(e));
    document.getElementById('add-qna-btn')?.addEventListener('click', () => this.openQnAModal());
    document.getElementById('close-qna-modal')?.addEventListener('click', () => this.closeQnAModal());
    document.getElementById('cancel-qna')?.addEventListener('click', () => this.closeQnAModal());
    document.getElementById('save-qna')?.addEventListener('click', () => this.saveQnA());
    document.getElementById('ai-toggle')?.addEventListener('click', () => this.toggleAI());
    document.getElementById('response-limit')?.addEventListener('change', (e) => this.updateResponseLimit(e.target.value));
  }

  savePrompt() {
    this.knowledge.basePrompt = document.getElementById('base-prompt').value;
    this.knowledge.companyInfo = document.getElementById('company-info').value;
    this.saveKnowledge();
    this.updateChatbotPrompt();
    this.showNotification('Prompt guardado exitosamente', 'success');
  }

  resetPrompt() {
    if (confirm('¿Estás seguro de que quieres restablecer el prompt a los valores por defecto?')) {
      this.knowledge.basePrompt = "";
      this.knowledge.companyInfo = "";
      this.loadDefaultPrompt();
      this.saveKnowledge();
      this.showNotification('Prompt restablecido', 'info');
    }
  }

  openFragmentModal() {
    document.getElementById('fragment-modal').classList.remove('hidden');
    document.getElementById('fragment-title').value = '';
    document.getElementById('fragment-content').value = '';
  }

  closeFragmentModal() {
    document.getElementById('fragment-modal').classList.add('hidden');
  }

  saveFragment() {
    const title = document.getElementById('fragment-title').value.trim();
    const content = document.getElementById('fragment-content').value.trim();

    if (!title || !content) {
      this.showNotification('Por favor completa todos los campos', 'error');
      return;
    }

    const fragment = {
      id: Date.now(),
      title: title,
      content: content,
      type: 'text',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.knowledge.fragments.push(fragment);
    this.saveKnowledge();
    this.updateUI();
    this.closeFragmentModal();
    this.showNotification('Fragmento agregado exitosamente', 'success');
  }

  deleteFragment(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este fragmento?')) {
      this.knowledge.fragments = this.knowledge.fragments.filter(f => f.id !== id);
      this.saveKnowledge();
      this.updateUI();
      this.showNotification('Fragmento eliminado', 'info');
    }
  }

  triggerFileUpload() {
    document.getElementById('pdf-upload').click();
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.showNotification('Solo se permiten archivos PDF', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.showNotification('El archivo es demasiado grande (máximo 10MB)', 'error');
      return;
    }

    this.showNotification('Procesando PDF...', 'info');

    try {
      const text = await this.extractTextFromPDF(file);
      
      const document = {
        id: Date.now(),
        name: file.name,
        content: text,
        type: 'pdf',
        size: file.size,
        createdAt: new Date().toISOString()
      };

      this.knowledge.documents.push(document);
      this.saveKnowledge();
      this.updateUI();
      this.showNotification('PDF procesado exitosamente', 'success');
    } catch (error) {
      console.error('Error processing PDF:', error);
      this.showNotification('Error al procesar el PDF', 'error');
    }

    event.target.value = '';
  }

  async extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function(e) {
        try {
          const arrayBuffer = e.target.result;
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  deleteDocument(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      this.knowledge.documents = this.knowledge.documents.filter(d => d.id !== id);
      this.saveKnowledge();
      this.updateUI();
      this.showNotification('Documento eliminado', 'info');
    }
  }

  openQnAModal() {
    document.getElementById('qna-modal').classList.remove('hidden');
    document.getElementById('qna-question').value = '';
    document.getElementById('qna-answer').value = '';
  }

  closeQnAModal() {
    document.getElementById('qna-modal').classList.add('hidden');
  }

  saveQnA() {
    const question = document.getElementById('qna-question').value.trim();
    const answer = document.getElementById('qna-answer').value.trim();

    if (!question || !answer) {
      this.showNotification('Por favor completa todos los campos', 'error');
      return;
    }

    const qna = {
      id: Date.now(),
      question: question,
      answer: answer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.knowledge.qnaItems.push(qna);
    this.saveKnowledge();
    this.updateUI();
    this.closeQnAModal();
    this.showNotification('Q&A agregado exitosamente', 'success');
  }

  deleteQnA(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta y respuesta?')) {
      this.knowledge.qnaItems = this.knowledge.qnaItems.filter(q => q.id !== id);
      this.saveKnowledge();
      this.updateUI();
      this.showNotification('Q&A eliminado', 'info');
    }
  }

  toggleAI() {
    const toggle = document.getElementById('ai-toggle');
    const circle = toggle.querySelector('.toggle-circle');
    
    this.knowledge.settings.useKnowledge = !this.knowledge.settings.useKnowledge;
    
    if (this.knowledge.settings.useKnowledge) {
      toggle.classList.add('active');
      toggle.classList.remove('inactive');
      circle.classList.add('active');
      circle.classList.remove('inactive');
      toggle.style.backgroundColor = '#479CDD';
    } else {
      toggle.classList.add('inactive');
      toggle.classList.remove('active');
      circle.classList.add('inactive');
      circle.classList.remove('active');
      toggle.style.backgroundColor = '#666666';
    }

    this.saveKnowledge();
    this.updateChatbotPrompt();
    this.showNotification(
      `Conocimientos ${this.knowledge.settings.useKnowledge ? 'activados' : 'desactivados'}`, 
      'info'
    );
  }

  updateResponseLimit(limit) {
    this.knowledge.settings.responseLimit = parseInt(limit);
    this.saveKnowledge();
    this.updateChatbotPrompt();
    this.showNotification(`Límite de respuesta actualizado a ${limit} caracteres`, 'info');
  }

  updateUI() {
    this.updateCounts();
    this.renderKnowledgeItems();
    
    if(document.getElementById('base-prompt')) {
      document.getElementById('base-prompt').value = this.knowledge.basePrompt;
    }
    if(document.getElementById('company-info')) {
      document.getElementById('company-info').value = this.knowledge.companyInfo;
    }
    if(document.getElementById('response-limit')) {
      document.getElementById('response-limit').value = this.knowledge.settings.responseLimit;
    }
  }

  updateCounts() {
    const fragmentsCount = document.getElementById('fragments-count');
    const documentsCount = document.getElementById('documents-count');
    const qnaCount = document.getElementById('qna-count');
    
    if(fragmentsCount) {
      fragmentsCount.textContent = `${this.knowledge.fragments.length} fragmento${this.knowledge.fragments.length !== 1 ? 's' : ''}`;
    }
    
    if(documentsCount) {
      documentsCount.textContent = `${this.knowledge.documents.length} documento${this.knowledge.documents.length !== 1 ? 's' : ''}`;
    }
    
    if(qnaCount) {
      qnaCount.textContent = `${this.knowledge.qnaItems.length} respuesta${this.knowledge.qnaItems.length !== 1 ? 's' : ''}`;
    }
  }

  renderKnowledgeItems() {
    const container = document.getElementById('knowledge-items');
    if(!container) return;
    
    container.innerHTML = '';

    if (this.knowledge.fragments.length > 0) {
      const fragmentsSection = this.createKnowledgeSection('Fragmentos de Texto', this.knowledge.fragments, 'fragment');
      container.appendChild(fragmentsSection);
    }

    if (this.knowledge.documents.length > 0) {
      const documentsSection = this.createKnowledgeSection('Documentos PDF', this.knowledge.documents, 'document');
      container.appendChild(documentsSection);
    }

    if (this.knowledge.qnaItems.length > 0) {
      const qnaSection = this.createKnowledgeSection('Preguntas y Respuestas', this.knowledge.qnaItems, 'qna');
      container.appendChild(qnaSection);
    }
  }

  createKnowledgeSection(title, items, type) {
    const section = document.createElement('div');
    section.className = 'flex flex-col p-4 lg:p-6 gap-4 w-full bg-gradient-to-br from-[rgba(34,34,34,0.5)] to-[rgba(53,53,53,0.5)] border border-[#3C3C3C] rounded-2xl';
    
    section.innerHTML = `
      <h3 class="text-white text-lg font-semibold tracking-[0.1px]">${title}</h3>
      <div class="space-y-3">
        ${items.map(item => this.createKnowledgeItem(item, type)).join('')}
      </div>
    `;

    return section;
  }

  createKnowledgeItem(item, type) {
    const date = new Date(item.createdAt).toLocaleDateString('es-ES');
    
    let content = '';
    if (type === 'fragment') {
      content = `
        <div class="flex flex-col gap-2">
          <h4 class="text-white font-medium">${item.title}</h4>
          <p class="text-gray-300 text-sm">${item.content.substring(0, 150)}${item.content.length > 150 ? '...' : ''}</p>
        </div>
      `;
    } else if (type === 'document') {
      const sizeMB = (item.size / (1024 * 1024)).toFixed(2);
      content = `
        <div class="flex flex-col gap-2">
          <h4 class="text-white font-medium">${item.name}</h4>
          <p class="text-gray-300 text-sm">Tamaño: ${sizeMB} MB • ${item.content.length} caracteres extraídos</p>
        </div>
      `;
    } else if (type === 'qna') {
      content = `
        <div class="flex flex-col gap-2">
          <h4 class="text-white font-medium">P: ${item.question}</h4>
          <p class="text-gray-300 text-sm">R: ${item.answer.substring(0, 100)}${item.answer.length > 100 ? '...' : ''}</p>
        </div>
      `;
    }

    return `
      <div class="flex justify-between items-start p-3 bg-[rgba(26,26,26,0.5)] border border-[#3C3C3C] rounded-lg">
        <div class="flex-1">
          ${content}
          <p class="text-gray-500 text-xs mt-2">Creado: ${date}</p>
        </div>
        <button 
          onclick="knowledgeManager.delete${type.charAt(0).toUpperCase() + type.slice(1)}(${item.id})"
          class="text-red-400 hover:text-red-300 ml-3"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    `;
  }

  saveKnowledge() {
    localStorage.setItem('flofy_knowledge', JSON.stringify(this.knowledge));
  }

  loadKnowledge() {
    const stored = localStorage.getItem('flofy_knowledge');
    if (stored) {
      this.knowledge = { ...this.knowledge, ...JSON.parse(stored) };
    }
  }

  updateChatbotPrompt() {
    const combinedPrompt = this.buildCombinedPrompt();
    
    localStorage.setItem('flofy_custom_prompt', JSON.stringify({
      prompt: combinedPrompt,
      useKnowledge: this.knowledge.settings.useKnowledge,
      responseLimit: this.knowledge.settings.responseLimit,
      lastUpdated: new Date().toISOString()
    }));

    console.log('Prompt actualizado para el chatbot:', combinedPrompt);
  }

  buildCombinedPrompt() {
    if (!this.knowledge.settings.useKnowledge) {
      return this.knowledge.basePrompt || "Eres un asistente virtual útil y amigable llamado AGM CHAT.";
    }

    let prompt = this.knowledge.basePrompt + "\n\n";
    
    if (this.knowledge.companyInfo) {
      prompt += "INFORMACIÓN DE LA EMPRESA:\n" + this.knowledge.companyInfo + "\n\n";
    }

    if (this.knowledge.fragments.length > 0) {
      prompt += "INFORMACIÓN ADICIONAL:\n";
      this.knowledge.fragments.forEach(fragment => {
        prompt += `${fragment.title}: ${fragment.content}\n\n`;
      });
    }

    if (this.knowledge.qnaItems.length > 0) {
      prompt += "PREGUNTAS FRECUENTES:\n";
      this.knowledge.qnaItems.forEach(qna => {
        prompt += `P: ${qna.question}\nR: ${qna.answer}\n\n`;
      });
    }

    if (this.knowledge.documents.length > 0) {
      prompt += "INFORMACIÓN DE DOCUMENTOS:\n";
      this.knowledge.documents.forEach(doc => {
        const content = doc.content.substring(0, 1000);
        prompt += `${doc.name}: ${content}${doc.content.length > 1000 ? '...' : ''}\n\n`;
      });
    }

    prompt += `\nIMPORTANTE: Mantén tus respuestas dentro de ${this.knowledge.settings.responseLimit} caracteres. Usa la información proporcionada para dar respuestas precisas sobre Alpha Global Market.`;

    return prompt;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-600' : 
      type === 'error' ? 'bg-red-600' : 
      type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  getKnowledgeData() {
    return this.knowledge;
  }

  getCurrentPrompt() {
    return this.buildCombinedPrompt();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.knowledgeManager = new KnowledgeManager();
});

export default KnowledgeManager;
