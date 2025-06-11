// Flofy Chatbot Embed Script
(function() {
  // Configuración por defecto
  const defaultConfig = {
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    primaryColor: '#0ea5e9', // Color principal (cyan-500)
    secondaryColor: '#0f172a', // Color secundario (slate-900)
    zIndex: 9999,
    width: '384px', // 96 * 4
    height: '698px', // Altura del contenedor
    margin: '16px', // 4 * 4
    companyName: 'Flofy'
  };

  // Función para cargar estilos
  function loadStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #flofy-chatbot-widget {
        position: fixed;
        z-index: ${defaultConfig.zIndex};
        ${defaultConfig.position.includes('bottom') ? 'bottom' : 'top'}: ${defaultConfig.margin};
        ${defaultConfig.position.includes('right') ? 'right' : 'left'}: ${defaultConfig.margin};
        width: ${defaultConfig.width};
        height: ${defaultConfig.height};
        font-family: 'Inter', sans-serif;
        background: transparent;
        padding: 0;
        margin: 0;
      }

      #flofy-chatbot-widget iframe {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
      }

      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      }
    `;
    document.head.appendChild(style);
  }

  // Función para crear el widget
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'flofy-chatbot-widget';

    const iframe = document.createElement('iframe');
    iframe.src = 'https://effervescent-platypus-ef7554.netlify.app';
    iframe.title = 'Flofy Chatbot';
    iframe.allow = 'microphone';

    widget.appendChild(iframe);
    document.body.appendChild(widget);
  }

  // Inicializar
  function init(config = {}) {
    // Combinar configuración por defecto con la proporcionada
    Object.assign(defaultConfig, config);
    
    // Cargar estilos
    loadStyles();
    
    // Crear widget
    createWidget();
  }

  // Exponer la función de inicialización globalmente
  window.FlofyChatbot = {
    init: init
  };
})(); 