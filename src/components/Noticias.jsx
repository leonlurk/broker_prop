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

  // Estado para controlar la zona horaria
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [showTimeZoneMenu, setShowTimeZoneMenu] = useState(false);

  // Lista de zonas horarias comunes
  const timeZones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Mexico_City',
    'Europe/London',
    'Europe/Madrid',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney'
  ];

  const formatTimeForZone = (zone) => {
    try {
      return new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: zone
      });
    } catch (error) {
      console.error(`Error formateando hora para zona ${zone}:`, error);
      return "--:--";
    }
  };

  // Reloj en tiempo real
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone }));

  // Obtener noticias financieras desde API
  useEffect(() => {
    const fetchFinancialNews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Formatear fechas para la API
        const fromDate = new Date(currentYear, currentMonth - 1, startDate);
        const toDate = new Date(currentYear, currentMonth - 1, endDate);
        
        const from = fromDate.toISOString().split('T')[0];
        const to = toDate.toISOString().split('T')[0];
        
        // Usando la API gratuita de Finnhub para noticias financieras
        const apiKey = 'cvlqld9r01qj3umf2uggcvlqld9r01qj3umf2uh0'; // API key gratuita
        
        // Determinar el día actual seleccionado para filtrar noticias
        const dayIndex = days.indexOf(activeDay);
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayIndex);
        const dateStr = targetDate.toISOString().split('T')[0];
        
        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&from=${dateStr}&to=${dateStr}&token=${apiKey}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener noticias financieras');
        }
        
        const data = await response.json();

        // Transformar datos de noticias a formato de eventos económicos
        if (data && data.length > 0) {
          const transformedEvents = data.map(news => {
            // Determinar impacto basado en factores como la categoría
            let impact = 'low';
            let color = 'red';
            
            // Determinar impacto basado en la categoría y el título
            const keyword = news.headline.toLowerCase();
            if (keyword.includes('crisis') || 
                keyword.includes('crash') || 
                keyword.includes('surge') ||
                keyword.includes('collapse')) {
              impact = 'high';
              color = 'cyan';
            } else if (keyword.includes('increase') || 
                       keyword.includes('decrease') || 
                       keyword.includes('announce') || 
                       keyword.includes('report')) {
              impact = 'medium';
              color = 'green';
            }
            
            // Determinar instrumento financiero basado en el contenido
            let instrument = 'Global';
            if (news.related) {
              const symbols = news.related.split(',');
              if (symbols.length > 0) {
                instrument = symbols[0];
              }
            }
            
            // Formatear fecha y hora para mostrar
            const publishDate = new Date(news.datetime * 1000); // Convertir timestamp a fecha
            const displayDate = `${publishDate.getDate()} ${getMonthName(publishDate.getMonth()).substring(0, 3)}`;
            const displayTime = `${publishDate.getHours().toString().padStart(2, '0')}:${publishDate.getMinutes().toString().padStart(2, '0')}`;
            
            // Determinar si un evento ya ha pasado
            const isPast = publishDate < new Date();
            
            // Determinar si el evento es destacado
            const isHighlighted = news.category === 'economy' || news.category === 'general';
            
            return {
              description: news.headline || 'Noticia financiera',
              instrument: instrument,
              time: displayTime,
              date: displayDate,
              timestamp: `${publishDate.getHours().toString().padStart(2, '0')}:${publishDate.getMinutes().toString().padStart(2, '0')}:${publishDate.getSeconds().toString().padStart(2, '0')}`,
              actual: isPast ? news.summary.substring(0, 20) + '...' : '-',
              forecast: news.category || '-',
              previous: '-',
              impact: impact,
              color: color,
              highlighted: isHighlighted,
              isPast: isPast,
              url: news.url,
              raw: news // Mantener datos originales
            };
          });
          
          setEvents(transformedEvents);
        } else {
          // Si no hay datos, cargar datos de respaldo
          loadFallbackData();
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
      const dayIndex = days.indexOf(activeDay);
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayIndex);
      
      setEvents([
        {
          description: 'FED Interest Rate Decision',
          instrument: 'USD',
          time: '12:00',
          date: `${targetDate.getDate()} ${getMonthName(targetDate.getMonth()).substring(0, 3)}`,
          timestamp: '00:30:23',
          actual: '-',
          forecast: '0,6%',
          previous: '0,2%',
          impact: 'high',
          color: 'cyan',
          highlighted: true,
          isPast: false
        },
        {
          description: 'ECB Monetary Policy Statement',
          instrument: 'EUR',
          time: '14:30',
          date: `${targetDate.getDate()} ${getMonthName(targetDate.getMonth()).substring(0, 3)}`,
          timestamp: '14:30:00',
          actual: '-',
          forecast: '0,3%',
          previous: '0,1%',
          impact: 'medium',
          color: 'green',
          highlighted: false,
          isPast: targetDate.getDate() === today.getDate() && 14 < today.getHours()
        },
        // Otros eventos de ejemplo...
      ]);
    };

    // Cargar datos al montar el componente o cambiar de día
    fetchFinancialNews();
    
    // Intervalo para actualizar cada 5 minutos
    const intervalId = setInterval(fetchFinancialNews, 300000);
    
    return () => clearInterval(intervalId);
  }, [startDate, endDate, currentMonth, currentYear, activeDay]);

  // Efecto para actualizar el rango de fechas cuando se cambia el día activo
  useEffect(() => {
    const dayIndex = days.indexOf(activeDay);
    if (dayIndex !== -1) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayIndex);
      
      setStartDate(targetDate.getDate());
      setEndDate(targetDate.getDate());
      setCurrentMonth(targetDate.getMonth() + 1);
      setCurrentYear(targetDate.getFullYear());
    }
  }, [activeDay]);

// Efecto para actualizar el reloj en tiempo real
useEffect(() => {
  const updateClock = () => {
    setCurrentTime(formatTimeForZone(timeZone));
  };
  
  // Actualizar inmediatamente y luego cada segundo
  updateClock();
  const intervalId = setInterval(updateClock, 1000);
  
  return () => clearInterval(intervalId);
}, [timeZone]);

  // Función para obtener el nombre del mes
  const getMonthName = (monthIndex) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthIndex];
  };

  // Filtrar eventos según criterios
  const filteredEvents = events.filter(event => {
    // Filtrar por impacto
    const impactMatches = 
      (impactFilters.alto && event.impact === 'high') ||
      (impactFilters.medio && event.impact === 'medium') ||
      (impactFilters.bajo && event.impact === 'low') ||
      (impactFilters.feriados && event.impact === 'holiday');
    
    // Si ningún filtro de impacto está activo, mostrar todos
    const showAllImpacts = !impactFilters.alto && !impactFilters.medio && !impactFilters.bajo && !impactFilters.feriados;
    
    // Filtro de noticias pasadas
    const pastFilter = !visibilityFilters.ocultarNoticias || !event.isPast;
    
    // Filtro de eventos restringidos
    const restrictedFilter = !visibilityFilters.mostrarRestringidos || event.highlighted;
    
    return (impactMatches || showAllImpacts) && pastFilter && restrictedFilter;
  });

  // Funciones de utilidad para manejo de filtros y UI
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
  const getCountryFlag = (instrument) => {
    // Mapeo de instrumentos a códigos de país
    const countryMap = {
      'USD': 'us',
      'EUR': 'eu',
      'GBP': 'gb',
      'JPY': 'jp',
      'AUD': 'au',
      'CAD': 'ca',
      'CHF': 'ch',
      'NZD': 'nz',
      'CNY': 'cn',
      'MXN': 'mx',
      'BRL': 'br',
      'INR': 'in',
      'RUB': 'ru',
      'KRW': 'kr',
      'TRY': 'tr',
      'ZAR': 'za',
      'SGD': 'sg',
      'HKD': 'hk',
      'Global': 'global'
    };
    
    const code = countryMap[instrument] || 'global';
    return `/flags/${code}.png`;
  };

  // Función para añadir un evento al calendario
  const addEventToCalendar = (event) => {
    try {
      const eventDate = new Date(`${event.date} ${event.time}`);
      const endTime = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hora más
      
      const calendarEvent = {
        title: event.description,
        start: eventDate.toISOString(),
        end: endTime.toISOString(),
        description: `Impacto: ${event.impact}, Pronóstico: ${event.forecast}, Previo: ${event.previous}`
      };
      
      // Abrir Google Calendar con los datos del evento
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${calendarEvent.start.replace(/[-:]/g, '').replace('.000', '')}/${calendarEvent.end.replace(/[-:]/g, '').replace('.000', '')}&details=${encodeURIComponent(calendarEvent.description)}`;
      
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al añadir evento al calendario:', error);
    }
  };

  // Función para cambiar la zona horaria
  const changeTimeZone = (newTimeZone) => {
    setTimeZone(newTimeZone);
    setCurrentTime(formatTimeForZone(newTimeZone)); // Actualizar inmediatamente la hora mostrada
    setShowTimeZoneMenu(false);
  };

  return (
    <div className="flex flex-col border border-[#333] rounded-3xl min-h-screen bg-[#232323] text-white p-2 sm:p-4">
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
          {activeDay === 'Lunes' ? 'El día de hoy' : activeDay}
        </div>
        <div className="p-2 sm:p-3 text-base sm:text-xl bg-transparent text-white mr-0 sm:mr-auto">
          {getMonthName(currentMonth - 1)} <span className="text-[#a0a0a0]">{startDate}</span> 
          {startDate !== endDate && (
            <> - {getMonthName(currentMonth - 1)} <span className="text-[#a0a0a0]">{endDate}</span></>
          )}
          , {currentYear}
        </div>

        <div className="relative">
          <div 
            className="flex items-center p-2 sm:p-3 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-full border border-[#333] text-white w-full sm:w-auto justify-between sm:justify-start cursor-pointer"
            onClick={() => setShowTimeZoneMenu(!showTimeZoneMenu)}
          >
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
                {currentTime} {timeZone.split('/').pop().replace('_', ' ')}
              </span>
            </div>
            <ChevronDown size={16} className={showTimeZoneMenu ? 'transform rotate-180' : ''} />
          </div>
          
            {/* Menú de zonas horarias */}
            {showTimeZoneMenu && (
              <div className="absolute top-full left-0 mt-1 z-10 bg-[#2d2d2d] border border-[#444] rounded-lg shadow-lg w-full sm:w-64 max-h-60 overflow-y-auto">
                {timeZones.map((zone) => (
                  <div 
                    key={zone} 
                    className="p-2 hover:bg-[#3a3a3a] cursor-pointer text-sm flex justify-between items-center"
                    onClick={() => changeTimeZone(zone)}
                  >
                    <span>{zone.split('/').pop().replace('_', ' ')}</span>
                    <span className="text-gray-400">{formatTimeForZone(zone)}</span>
                  </div>
                ))}
              </div>
            )}
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
                        <button 
                          className="p-2 bg-transparent hover:bg-[#333] rounded-full transition-colors"
                          onClick={() => addEventToCalendar(event)}
                          title="Añadir al calendario"
                        >
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
                    <button 
                      className="p-1 bg-transparent hover:bg-[#333] rounded-full transition-colors"
                      onClick={() => addEventToCalendar(event)}
                      title="Añadir al calendario"
                    >
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