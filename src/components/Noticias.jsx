import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Clock, AlertTriangle, Loader } from 'lucide-react';

const Noticias = () => {
  const [activeDay, setActiveDay] = useState('Lunes');
  const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
  
  // Fecha actual y rango
  const today = new Date();
  const [startDate, setStartDate] = useState(today.getDate());
  const [endDate, setEndDate] = useState(new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).getDate());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // Mes en número (1-12)
  
  // Estado para eventos económicos
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [impactFilters, setImpactFilters] = useState({
    feriados: false,
    bajo: true,
    medio: true,
    alto: true
  });

  const [visibilityFilters, setVisibilityFilters] = useState({
    ocultarNoticias: false,
    mostrarRestringidos: false
  });

  // Obtener noticias financieras desde MarketAux API
  useEffect(() => {
    const fetchFinancialNews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // API key para MarketAux (gratuita, registrate en marketaux.com)
        const apiKey = 'iVVKq8pAjZTiCVM4gAHMyUi51exl7PpdmisyKDus'; // Registrate en MarketAux para obtener una clave gratuita
        
        // Formatear fechas para la API
        const fromDate = new Date(currentYear, currentMonth - 1, startDate);
        const toDate = new Date(currentYear, currentMonth - 1, endDate);
        
        const from = fromDate.toISOString().split('T')[0];
        const to = toDate.toISOString().split('T')[0];
        
        // Usando la API de MarketAux para noticias financieras
        const response = await fetch(`https://api.marketaux.com/v1/news/all?language=en&countries=us,ca,mx,es,ar,br&filter_entities=true&limit=10&published_after=${from}&api_token=${apiKey}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener noticias financieras');
        }
        
        const data = await response.json();
        
        // Transformar datos de noticias a formato de eventos económicos
        if (data && data.data) {
          const transformedEvents = data.data.map(news => {
            // Determinar impacto basado en sentimiento
            let impact = 'low';
            let color = 'red';
            
            if (news.entities && news.entities.length > 0) {
              const sentimentSum = news.entities.reduce((acc, entity) => acc + (entity.sentiment_score || 0), 0);
              const avgSentiment = sentimentSum / news.entities.length;
              
              if (Math.abs(avgSentiment) > 0.5) {
                impact = 'high';
                color = 'cyan';
              } else if (Math.abs(avgSentiment) > 0.2) {
                impact = 'medium';
                color = 'green';
              }
            }
            
            // Determinar instrumento financiero (símbolo de acciones)
            let instrument = 'Global';
            if (news.entities && news.entities.length > 0) {
              const stockEntity = news.entities.find(e => e.symbol);
              if (stockEntity) instrument = stockEntity.symbol;
            }
            
            // Formatear fecha y hora para mostrar
            const publishDate = new Date(news.published_at);
            const displayDate = `${publishDate.getDate()} ${getMonthName(publishDate.getMonth()).substring(0, 3)}`;
            const displayTime = `${publishDate.getHours().toString().padStart(2, '0')}:${publishDate.getMinutes().toString().padStart(2, '0')}`;
            
            // Determinar si un evento ya ha pasado
            const isPast = publishDate < new Date();
            
            // Determinar si el evento es destacado (basado en importancia)
            const isHighlighted = news.entities && news.entities.some(e => Math.abs(e.sentiment_score || 0) > 0.7);
            
            return {
              description: news.title || 'Noticia financiera',
              instrument: instrument,
              time: displayTime,
              date: displayDate,
              timestamp: `${publishDate.getHours().toString().padStart(2, '0')}:${publishDate.getMinutes().toString().padStart(2, '0')}:${publishDate.getSeconds().toString().padStart(2, '0')}`,
              actual: isPast ? news.description.substring(0, 20) + '...' : '-',
              forecast: '-',
              previous: '-',
              impact: impact,
              color: color,
              highlighted: isHighlighted,
              isPast: isPast,
              raw: news // Mantener datos originales
            };
          });
          
          setEvents(transformedEvents);
        }
      } catch (err) {
        console.error('Error en la API de noticias financieras:', err);
        setError('No se pudieron cargar las noticias financieras');
        
        // Cargar datos de ejemplo si falla la API
        loadFallbackData();
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadFallbackData = () => {
      // Datos de ejemplo para mostrar si falla la API
      setEvents([
        {
          description: 'FED Interest Rate Decision',
          instrument: 'USD',
          time: '12:00',
          date: `${today.getDate()} ${getMonthName(today.getMonth()).substring(0, 3)}`,
          timestamp: '00:30:23',
          actual: '-',
          forecast: '0,6%',
          previous: '0,2%',
          impact: 'high',
          color: 'cyan'
        },
        {
          description: 'ECB Monetary Policy Statement',
          instrument: 'EUR',
          time: '14:30',
          date: `${today.getDate()} ${getMonthName(today.getMonth()).substring(0, 3)}`,
          timestamp: '14:30:00',
          actual: '-',
          forecast: '0,3%',
          previous: '0,1%',
          impact: 'medium',
          color: 'green'
        },
        {
          description: 'US Non-Farm Payroll',
          instrument: 'USD',
          time: '10:00',
          date: `${today.getDate() + 1} ${getMonthName(today.getMonth()).substring(0, 3)}`,
          timestamp: '10:00:00',
          actual: '-',
          forecast: '0,8%',
          previous: '0,7%',
          impact: 'low',
          color: 'red'
        },
        {
          description: 'FOMC Meeting Minutes',
          instrument: 'USD',
          time: '20:00',
          date: `${today.getDate() + 2} ${getMonthName(today.getMonth()).substring(0, 3)}`,
          timestamp: '20:00:00',
          actual: '-',
          forecast: '-',
          previous: '-',
          impact: 'high',
          color: 'cyan',
          highlighted: true
        }
      ]);
    };
    
    // Cargar datos al montar el componente
    fetchFinancialNews();
    
    // También podemos configurar un intervalo para actualizar cada cierto tiempo
    const intervalId = setInterval(fetchFinancialNews, 60000 * 30); // Actualizar cada 30 minutos
    
    return () => clearInterval(intervalId);
  }, [startDate, endDate, currentMonth, currentYear]);

  // Función para obtener el nombre del mes
  const getMonthName = (monthIndex) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthIndex];
  };

  // Filtrar eventos según criterios
  const filteredEvents = events.filter(event => {
    // Filtrar por impacto
    if (impactFilters.alto && event.impact === 'high') return true;
    if (impactFilters.medio && event.impact === 'medium') return true;
    if (impactFilters.bajo && event.impact === 'low') return true;
    if (impactFilters.feriados && event.impact === 'holiday') return true;
    
    // Si ningún filtro está activo, mostrar todos
    if (!impactFilters.alto && !impactFilters.medio && !impactFilters.bajo && !impactFilters.feriados) {
      return true;
    }
    
    // Ocultar eventos pasados si el filtro está activo
    if (visibilityFilters.ocultarNoticias && event.isPast) {
      return false;
    }
    
    // Mostrar solo eventos restringidos si el filtro está activo
    if (visibilityFilters.mostrarRestringidos && !event.highlighted) {
      return false;
    }
    
    return false;
  });

  const toggleImpactFilter = (filter) => {
    setImpactFilters({
      ...impactFilters,
      [filter]: !impactFilters[filter]
    });
  };

  const toggleVisibilityFilter = (filter) => {
    setVisibilityFilters({
      ...visibilityFilters,
      [filter]: !visibilityFilters[filter]
    });
  };

  const getImpactColor = (color) => {
    switch (color) {
      case 'cyan':
        return 'bg-cyan-500';
      case 'green':
        return 'bg-green-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Función para obtener la bandera del país
  const getCountryFlag = (countryCode) => {
    if (!countryCode) return '/globe.png';
    
    // Convertir códigos de país de dos letras a minúsculas para las imágenes de banderas
    const code = countryCode.toLowerCase();
    return `/flags/${code}.png`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#232323] text-white p-2 sm:p-4">
      {/* Days of the week tabs - Scrollable on mobile */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
        {days.map((day) => (
          <button
            key={day}
            className={`px-4 sm:px-8 md:px-12 py-2 sm:py-3 rounded-full whitespace-nowrap focus:outline-none ${
              activeDay === day 
                ? 'bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-cyan-500 text-white' 
                : 'bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] text-gray-300 hover:bg-[#2a2a2a]'
            }`}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Date selector - Stack on mobile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-2 sm:gap-0">
        <div className="p-2 sm:p-3 text-base sm:text-xl bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-full border border-[#333] text-white mr-0 sm:mr-4">
          El día de hoy
        </div>
        <div className="p-2 sm:p-3 text-base sm:text-xl bg-transparent text-white mr-0 sm:mr-auto">
          {getMonthName(currentMonth - 1)} <span className="text-[#a0a0a0]">{startDate}</span> - {getMonthName(currentMonth - 1)} <span className="text-[#a0a0a0]">{endDate}</span>, {currentYear}
        </div>
        <div className="flex items-center p-2 sm:p-3 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-full border border-[#333] text-white w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center">
            <img 
              src="/pin.png" 
              alt="Location Pin" 
              className="w-6 h-6 sm:w-8 sm:h-8 mr-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E";
              }}
            />
            <span className="mr-2 text-sm sm:text-xl truncate">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Filters - Stack on mobile */}
      <div className="flex flex-col mb-6 gap-4">
        {/* Impact filter */}
        <div>
          <h3 className="text-gray-400 mb-2 text-xl">Filtrar por impacto</h3>
          <div className="grid grid-cols-2 sm:flex sm:space-x-3 gap-2 sm:gap-0">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-cyan-500 rounded bg-[#333] border-[#444]"
                checked={impactFilters.feriados}
                onChange={() => toggleImpactFilter('feriados')}
              />
              <span>Feriados</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-cyan-500 rounded bg-[#333] border-[#444]"
                checked={impactFilters.bajo}
                onChange={() => toggleImpactFilter('bajo')}
              />
              <span>Bajo</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-cyan-500 rounded bg-[#333] border-[#444]"
                checked={impactFilters.medio}
                onChange={() => toggleImpactFilter('medio')}
              />
              <span>Medio</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-cyan-500 rounded bg-[#333] border-[#444]"
                checked={impactFilters.alto}
                onChange={() => toggleImpactFilter('alto')}
              />
              <span>Alto</span>
            </label>
          </div>
        </div>

        {/* Visibility filter */}
        <div>
          <h3 className="text-gray-400 mb-2">Filtrar por visibilidad</h3>
          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-cyan-500 rounded bg-[#333] border-[#444]"
                checked={visibilityFilters.ocultarNoticias}
                onChange={() => toggleVisibilityFilter('ocultarNoticias')}
              />
              <span>Ocultar noticias pasadas</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-cyan-500 rounded bg-[#333] border-[#444]"
                checked={visibilityFilters.mostrarRestringidos}
                onChange={() => toggleVisibilityFilter('mostrarRestringidos')}
              />
              <span>Mostrar solo eventos restringidos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Events table - Card view on mobile, table on desktop */}
      <div className="p-2 sm:p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size={40} className="animate-spin text-cyan-500" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-400 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              {error}
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">
              No hay eventos económicos para los filtros seleccionados
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="py-4 px-3 font-medium">Descripcion</th>
                    <th className="py-4 px-3 font-medium">Instrumento</th>
                    <th className="py-4 px-3 font-medium">Fecha</th>
                    <th className="py-4 px-3 font-medium">Actual</th>
                    <th className="py-4 px-3 font-medium">Pronostico</th>
                    <th className="py-4 px-3 font-medium">Previo</th>
                    <th className="py-4 px-3 font-medium">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event, index) => (
                    <tr 
                      key={index}
                      className={`border-b border-gray-800 ${event.highlighted ? 'bg-[#3d2c2e]' : ''}`}
                    >
                      <td className="py-4 px-3">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${getImpactColor(event.color)}`}></div>
                            <span className="line-clamp-2">{event.description}</span>
                          </div>
                          {event.highlighted && (
                            <div className="flex items-center text-red-500 text-xs mt-1 ml-6">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Evento Restringido
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 mr-2 flex items-center justify-center">
                            <img 
                              src={getCountryFlag(event.instrument)} 
                              alt={event.instrument} 
                              className="max-w-full max-h-full rounded" 
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 16'%3E%3Crect width='24' height='16' fill='%233C3B6E'/%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <span>{event.instrument}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div>
                          <div>{event.time} {event.date}</div>
                          {!event.isPast && (
                            <div className="text-xs text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.timestamp}
                            </div>
                          )}
                          {event.isPast && (
                            <div className="text-xs text-cyan-500 mt-1">Expirado</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3">{event.actual}</td>
                      <td className="py-4 px-3">{event.forecast}</td>
                      <td className="py-4 px-3">{event.previous}</td>
                      <td className="py-4 px-3">
                        <button className="p-2 bg-transparent">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (hidden on desktop) */}
            <div className="md:hidden space-y-4">
              {filteredEvents.map((event, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border border-gray-800 ${event.highlighted ? 'bg-[#3d2c2e]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getImpactColor(event.color)}`}></div>
                      <span className="font-medium line-clamp-2">{event.description}</span>
                    </div>
                    <button className="p-1 bg-transparent">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  {event.highlighted && (
                    <div className="flex items-center text-red-500 text-xs mb-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Evento Restringido
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-y-2">
                    <div>
                      <div className="text-xs text-gray-400">Instrumento</div>
                      <div className="flex items-center">
                        <div className="w-5 h-3 mr-1 flex items-center justify-center">
                          <img 
                            src={getCountryFlag(event.instrument)} 
                            alt={event.instrument} 
                            className="max-w-full max-h-full rounded" 
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 16'%3E%3Crect width='24' height='16' fill='%233C3B6E'/%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <span>{event.instrument}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">Fecha</div>
                      <div>
                        <div>{event.time} {event.date}</div>
                        {!event.isPast && (
                          <div className="text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.timestamp}
                          </div>
                        )}
                        {event.isPast && (
                          <div className="text-xs text-cyan-500">Expirado</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">Actual</div>
                      <div>{event.actual}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">Pronostico</div>
                      <div>{event.forecast}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">Previo</div>
                      <div>{event.previous}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Noticias;