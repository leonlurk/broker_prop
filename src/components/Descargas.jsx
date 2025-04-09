import React, { useState, useEffect } from 'react';

const Descargas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Función para detectar si es dispositivo móvil
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar al cargar
    checkIfMobile();
    
    // Configurar el listener para cambios de tamaño
    window.addEventListener('resize', checkIfMobile);
    
    // Limpiar el listener al desmontar
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Datos de las plataformas
  const platforms = [
  {
    id: 'mt5',
    name: 'Metatrader 5',
    description: 'MetaTrader 5 es la plataforma de trading más popular, con una interfaz fácil de usar y altamente personalizable. Ofrece herramientas avanzadas de gráficos y gestión de órdenes para un seguimiento eficaz de las posiciones de trading, mejorando así el rendimiento del usuario.',
    image: '/mt5.png',
    downloads: [
      { 
        os: isMobile ? 'Android' : 'Windows',
        icon: isMobile ? '/Android.png' : '/windows.png',
        link: isMobile ? '#android-link' : '#windows-link'
      },
      { 
        os: isMobile ? 'iPhone' : 'Mac',
        icon: isMobile ? '/apple.png' : '/apple.png',
        link: isMobile ? '#iphone-link' : '#mac-link'
      }
    ]
  },
  // Aquí va la nueva plataforma
  {
    id: 'mt4',
    name: 'Alpha Global Market',
    description: 'Descubre el poder de AGM en tus manos. Nuestra aplicación ofrece acceso inmediato a mercados financieros globales con herramientas de análisis avanzadas y ejecución rápida. Interfaz intuitiva diseñada para traders de todos los niveles, con actualizaciones en tiempo real y alertas personalizables. Optimiza tu estrategia de trading desde cualquier lugar. Descarga ahora y lleva tu experiencia de trading al siguiente nivel.',
    image: '/logo.png',
    downloads: [
      { 
        os: isMobile ? 'Android' : 'Windows',
        icon: isMobile ? '/Android.png' : '/windows.png',
        link: isMobile ? '#android-mt4-link' : '#windows-mt4-link'
      },
      { 
        os: isMobile ? 'iPhone' : 'Mac',
        icon: isMobile ? '/apple.png' : '/apple.png',
        link: isMobile ? '#iphone-mt4-link' : '#mac-mt4-link'
      }
    ]
  },
];

  return (
    <div className="flex flex-col min-h-screen border border-[#333] rounded-3xl bg-[#232323] text-white p-4 md:p-6">
      <div className="space-y-6">
        {platforms.map((platform) => (
          <div 
            key={platform.id}
            className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333] flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold mb-2">{platform.name}</h2>
              <p className="text-sm md:text-base text-[#7a7a7a] mb-4">{platform.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {platform.downloads.map((download, index) => (
                  <a 
                    key={index}
                    href={download.link}
                    className="flex items-center text-white px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#444] rounded-full transition"
                  >
                    <img 
                      src={download.icon} 
                      alt={download.os} 
                      className="w-5 h-5 mr-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='%23555'/%3E%3C/svg%3E";
                      }}
                    />
                    <span>{download.os}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-center md:w-1/3">
              <img 
                src={platform.image} 
                alt={platform.name}
                className="max-w-full max-h-32 md:max-h-48"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='200' height='120' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='white'%3ELogo%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Descargas;