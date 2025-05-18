import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useAuth } from '../contexts/AuthContext'; // Importar el contexto de autenticación
import { getTranslator } from '../utils/i18n'; // Added

// Helper function to format the date
const formatDate = (date, locale, t) => {
  const days = [
    t('date_short_sunday'), 
    t('date_short_monday'), 
    t('date_short_tuesday'), 
    t('date_short_wednesday'), 
    t('date_short_thursday'), 
    t('date_short_friday'), 
    t('date_short_saturday')
  ];
  const months = [
    t('month_january'), 
    t('month_february'), 
    t('month_march'), 
    t('month_april'), 
    t('month_may'), 
    t('month_june'), 
    t('month_july'), 
    t('month_august'), 
    t('month_september'), 
    t('month_october'), 
    t('month_november'), 
    t('month_december')
  ];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  return `${dayName}, ${date.getDate()} ${monthName}`;
};

const TradingDashboard = ({ accountId, onBack, previousSection }) => {
  // Obtener información del usuario desde Firebase
  const { currentUser, language } = useAuth();
  const t = getTranslator(language); // Added
  const [currentDate, setCurrentDate] = useState('');
  const [drawdownType, setDrawdownType] = useState('daily'); // 'daily' or 'total'
  const [isLoading, setIsLoading] = useState(true); // Added
  const [account, setAccount] = useState(null); // Added

  useEffect(() => {
    const today = new Date();
    setCurrentDate(formatDate(today, language, t));
  }, [language, t]);

  // useEffect to fetch account data (placeholder)
  useEffect(() => {
    if (accountId) {
      setIsLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        setAccount({
          id: accountId,
          balance: 124700,
          currency: '$',
          status: 'Active',
          // Add other necessary account details here
        });
        setIsLoading(false);
      }, 1000); // Simulate network delay
    } else {
      // Handle case where accountId is not provided, if necessary
      setIsLoading(false);
      setAccount(null);
    }
  }, [accountId]);

  // Datos para el gráfico de balance
  const balanceData = [
    { name: 'Ene', value: 50000 },
    { name: 'Feb', value: 80000 },
    { name: 'Mar', value: 30000 },
    { name: 'Abr', value: 25000 },
    { name: 'May', value: 130000 },
    { name: 'Jun', value: 110000 },
    { name: 'Jul', value: 200000 },
    { name: 'Ago', value: 180000 },
    { name: 'Sep', value: 220000 },
  ];

  // Función para obtener el nombre del usuario
const getUserName = () => {
  if (currentUser && currentUser.displayName) {
    return currentUser.displayName.split(' ')[0]; // Obtener solo el primer nombre
  } else if (currentUser && currentUser.email) {
    // Si no hay displayName, usar la primera parte del email
    return currentUser.email.split('@')[0];
  }
  return t('tradingDashboard_defaultUserName'); // Changed
};

  const getBackText = () => {
    if (previousSection === "Cuentas") {
      return t('tradingDashboard_backToAccounts'); // Changed
    } else if (previousSection === "Dashboard") {
      return t('tradingDashboard_backToHome'); // Changed
    } else {
      return t('tradingDashboard_backDefault'); // Changed
    }
  };

  // Datos para la tabla de operaciones
  const operaciones = Array(9).fill().map(() => ({
    id: `41528296`,
    simbolo: 'USD',
    tipo: 'Comprar',
    volumen: 1,
    precio: '245,58',
    precioFinal: '285,58',
    fecha: '20 Feb',
    hora: '00:30:23'
  }));

  const handleBackClick = () => {
    if (onBack) {
      onBack(); 
    } else {
      // Fallback or default behavior if onBack is not provided
      // This might involve navigating to a default route, e.g., using useNavigate if in a React Router context
      // For now, just log or do nothing if a more specific app-wide navigation isn't set up here
      console.log("Back action, but no onBack prop defined");
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Cargando datos de la cuenta...</div>;
  }

  if (!account) {
    return <div className="p-4 text-center">No se pudieron cargar los detalles de la cuenta.</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] text-white min-h-screen flex flex-col">
      {/* Botón de regreso */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBackClick}
            className="text-white bg-[#2c2c2c] hover:bg-[#252525] rounded-full p-2 border border-cyan-500 focus:outline-none transition-colors"
            aria-label={t('common_back', 'Volver')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
{/* Header con saludo y detalles */}
<div className="p-4 md:p-6 rounded-2xl relative bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] mb-4 md:mb-6">
  <div className="flex flex-col md:flex-row justify-between w-full">
    <div className="flex items-start mb-4 md:mb-0 md:w-1/2">
      <div className="w-16 h-16 bg-[#333] rounded-full flex items-center justify-center text-2xl mr-4">
        <img src="/IconoPerfil.png" alt={t('tradingDashboard_avatarAlt')} />
      </div>
      <div className="w-full">
        <h1 className="text-xl md:text-2xl font-semibold">{t('tradingDashboard_greetingPrefix')}{getUserName()}</h1>
        <p className="text-sm md:text-base text-gray-400">
          {t('tradingDashboard_currentAccountInfo', { accountSize: '100k' })}
        </p>
        
        <div className="space-y-2 mt-4">
          <div className="flex items-center">
            <div className="mr-3">
              <img src="/lightning_ring.png" alt="Lightning" className="w-6 h-6" onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L9 13H12V18L15 11H12V6Z' fill='white'/%3E%3C/svg%3E";
              }} />
            </div>
            <span className="text-gray-400 mr-2">{t('tradingDashboard_initialBalanceLabel')}</span>
            <span className="font-medium">$100.000</span>
          </div>
          
          <div className="flex items-center">
            <div className="mr-3">
              <img src="/lightning_ring.png" alt="Lightning" className="w-6 h-6" onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L9 13H12V18L15 11H12V6Z' fill='white'/%3E%3C/svg%3E";
              }} />
            </div>
            <span className="text-gray-400 mr-2">{t('tradingDashboard_planTypeLabel')}</span>
            <span className="font-medium">100k Challenge</span>
          </div>
          
          <div className="flex items-center">
            <div className="mr-3">
              <img src="/lightning_ring.png" alt="Lightning" className="w-6 h-6" onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L9 13H12V18L15 11H12V6Z' fill='white'/%3E%3C/svg%3E";
              }} />
            </div>
            <span className="text-gray-400 mr-2">{t('tradingDashboard_accountTypeLabel')}</span>
            <span className="font-medium">Swipe</span>
          </div>
        </div>
      </div>
    </div>
    
    <div className="flex flex-col md:w-1/2 md:border-l md:border-gray-700 md:pl-6">
      <div className="flex items-center mb-4">
        <div className="mr-3">
          <img src="/Chield_check.png" alt="Shield" className="w-6 h-6" onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
          }} />
        </div>
        <h3 className="text-xl font-medium mr-3">{t('tradingDashboard_accountDetailsTitle')}</h3>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-800/30 ml-auto rounded-full py-2 px-6 text-sm text-white">
          {t('tradingDashboard_statusActive')}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="border border-gray-700 rounded p-2">
          <div className="flex items-center justify-between">
            <span className="text-s text-gray-400">{t('tradingDashboard_loginLabel')}</span>
            <div className="flex items-center">
              <span className="text-s mr-2">462777</span>
              <img src="/Copy.png" alt="Copy" className="w-4 h-4" onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
          }} />
            </div>
          </div>
        </div>
        
        <div className="border border-gray-700 rounded p-2">
          <div className="flex items-center justify-between">
            <span className="text-s text-gray-400">{t('tradingDashboard_investorPassLabel')}</span>
            <span className="text-s text-gray-300 underline">{t('tradingDashboard_setPasswordButton')}</span>
          </div>
        </div>
        
        <div className="border border-gray-700 rounded p-2">
          <div className="flex items-center justify-between">
            <span className="text-s text-gray-400">{t('tradingDashboard_masterPassLabel')}</span>
            <div className="flex items-center">
              <span className="text-s mr-2">********</span>
              <img src="/Visibilidad.png" alt="Visibility" className="w-4 h-4" onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
          }} />
            </div>
          </div>
        </div>
        
        <div className="border border-gray-700 rounded p-2">
          <div className="flex items-center justify-between">
            <span className="text-s text-gray-400">{t('tradingDashboard_mt5ServerLabel')}</span>
            <span className="text-s">APE server</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Sección de balance y métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#434242] border border-[#333] rounded-xl">
          <h2 className="text-xl md:text-3xl font-bold mb-4">{t('tradingDashboard_balanceChartTitle')}</h2>
          <div className="flex items-center mb-6">
            <span className="text-2xl md:text-4xl font-bold mr-3">$124.700,00</span>
            <span className="bg-green-800 bg-opacity-30 text-green-400 px-2 py-1 rounded text-sm">+24.7%</span>
          </div>
          
          <div className="w-full aspect-square max-h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={balanceData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0a84ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  domain={['0', 'dataMax + 50000']}
                  ticks={[0, 50000, 100000, 150000, 200000, 250000]} 
                  tickFormatter={(value) => value === 0 ? '0k' : `${value/1000}k`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  width={40}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <h2 className="text-xl font-bold mb-2">{t('tradingDashboard_profitLossWidgetTitle')}</h2>
            <div className="flex items-center mb-1">
              <span className="text-2xl font-bold mr-3">$24.700,00</span>
              <span className="bg-green-800 bg-opacity-30 text-green-400 px-2 py-1 rounded text-sm">+24.7%</span>
            </div>
            <p className="text-sm text-gray-400">{currentDate}</p>
          </div> 
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{t('tradingDashboard_drawdownWidgetTitle')}</h2>
              <div className="flex text-sm">
                <button 
                  onClick={() => setDrawdownType('total')} 
                  className={`px-3 py-1 rounded-md transition-colors
                    ${drawdownType === 'total' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-transparent text-gray-400 hover:text-gray-200'}
                  `}
                >
                  {t('tradingDashboard_drawdownTypeTotal', 'Total')}
                </button>
                <div className="border-r border-gray-600 mx-1 h-4 self-center"></div>
                <button 
                  onClick={() => setDrawdownType('daily')} 
                  className={`px-3 py-1 rounded-md transition-colors
                    ${drawdownType === 'daily' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-transparent text-gray-400 hover:text-gray-200'}
                  `}
                >
                  {t('tradingDashboard_drawdownTypeDaily', 'Diario')}
                </button>
              </div>
            </div>
            <div className="flex items-center mb-1">
              <span className="text-2xl font-bold mr-3">
                {/* Placeholder: Value would change based on drawdownType */}
                {drawdownType === 'daily' ? '$200,00' : '$1,200.00'} 
              </span>
              <span className="bg-green-800 bg-opacity-30 text-green-400 px-2 py-1 rounded text-sm">
                {/* Placeholder: Percentage would change based on drawdownType */}
                {drawdownType === 'daily' ? '+25.0%' : '+15.0%'} 
              </span>
            </div>
            {/* The sub-text <p> might be removed or changed depending on design with tabs */}
            {/* <p className="text-sm text-gray-400">{t('tradingDashboard_drawdownTypeDaily')}</p> */}
          </div>

          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <h2 className="text-xl font-bold mb-2">{t('tradingDashboard_tradingDaysWidgetTitle')}</h2>
            <div className="text-2xl font-bold">5 Días</div>
          </div>
        </div>
      </div>

      {/* Sección de métricas detalladas (Pérdida Promedio, Ganancia Promedio, etc.) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Pérdida Promedio Por Operación */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_avgLossPerOperation')}</h3>
            <div className="flex items-baseline">
              <span className="text-xl md:text-2xl font-bold mr-2">$77.61</span>
              <span className="bg-red-800 bg-opacity-30 text-red-400 px-2 py-1 rounded text-xs">-25.0%</span>
            </div>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/loss.png" alt={t('tradingDashboard_iconAlt_loss')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M7 17L17 7M17 7H11M17 7V13' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Ganancia Promedio Por Operación */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_avgProfitPerOperation')}</h3>
            <div className="flex items-baseline">
              <span className="text-xl md:text-2xl font-bold mr-2">$20.61</span>
              <span className="text-green-400 text-xs bg-green-800 bg-opacity-30 px-2 py-1 rounded">+25.0%</span>
            </div>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/gain.png" alt={t('tradingDashboard_iconAlt_coins')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L12 18M9 10L15 10M9 14L15 14' stroke='white' stroke-width='2'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Lotaje Promedio Por Operación */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_avgLotPerOperation')}</h3>
            <span className="text-xl md:text-2xl font-bold">3.26</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/graph.png" alt={t('tradingDashboard_iconAlt_lot')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M4 12L12 4L20 12L12 20L4 12Z' stroke='white' stroke-width='2'/%3E%3Cpath d='M8 12L12 8L16 12L12 16L8 12Z' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E"; }} />
          </div>
        </div>
        
        {/* Duración Promedio Por Operación */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_avgTradeDuration')}</h3>
            <span className="text-xl md:text-2xl font-bold">02:25:36</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/clock.png" alt={t('tradingDashboard_iconAlt_clock')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6v6l4 2' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Relación Riesgo Beneficio */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_riskRewardRatio')}</h3>
            <span className="text-xl md:text-2xl font-bold">1:3</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/victory.png" alt={t('tradingDashboard_iconAlt_ratio')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z' fill='white'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Ratio De Ganancia */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_winRate')}</h3>
            <span className="text-xl md:text-2xl font-bold">20%</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/coins.png" alt={t('tradingDashboard_iconAlt_winRate')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4V12H20A8 8 0 0 1 12 20V12H4A8 8 0 0 1 12 4Z' fill='white'/%3E%3C/svg%3E"; }} />
          </div>
        </div>
      </div>

      {/* Sección de Objetivos */}
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">{t('tradingDashboard_objectivesTitle')}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t('tradingDashboard_dailyLossLimitTitle')}</h3>
              <span className="bg-yellow-800 bg-opacity-30 text-yellow-400 px-2 py-1 rounded text-xs">{t('tradingDashboard_status_inProgress')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">{t('tradingDashboard_maxLossLimitLabel')}</span>
              <span>$245.36</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t('tradingDashboard_allowedLossTodayLabel')}</span>
              <span>$4,661.81</span>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t('tradingDashboard_globalLossLimitTitle')}</h3>
              <span className="bg-red-800 bg-opacity-30 text-red-400 px-2 py-1 rounded text-xs">{t('tradingDashboard_status_lost')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">{t('tradingDashboard_maxLossLimitLabel')}</span>
              <span>$245.36</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t('tradingDashboard_allowedLossTodayLabel')}</span> {/* Figma usa "Pérdida máxima permitida" aquí, considerar si se necesita una key diferente o si esta es aceptable */} 
              <span>$4,661.81</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t('tradingDashboard_minTradingDaysTitle')}</h3>
              <span className="bg-green-800 bg-opacity-30 text-green-400 px-2 py-1 rounded text-xs">{t('tradingDashboard_status_surpassed')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">{t('tradingDashboard_minimumLabel')}</span>
              <span>5 Días</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t('tradingDashboard_currentResultLabel')}</span>
              <span>7 Días</span>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t('tradingDashboard_profitTargetTitle')}</h3>
              <span className="bg-yellow-800 bg-opacity-30 text-yellow-400 px-2 py-1 rounded text-xs">{t('tradingDashboard_status_inProgress')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">{t('tradingDashboard_minimumLabel')}</span>
              <span>$8,000.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t('tradingDashboard_currentResultLabel')}</span>
              <span>$843.10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de operaciones */}
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex-1 flex flex-col">
        <h2 className="text-xl md:text-2xl font-bold mb-6">{t('tradingDashboard_operationsSummaryTitle')}</h2>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2 text-gray-400 font-normal">{t('tradingDashboard_tableHeader_operationId')}</th>
                <th className="p-2 text-gray-400 font-normal">{t('tradingDashboard_tableHeader_symbol')}</th>
                <th className="p-2 text-gray-400 font-normal">{t('tradingDashboard_tableHeader_type')}</th>
                <th className="p-2 text-gray-400 font-normal">{t('tradingDashboard_tableHeader_volume')}</th>
                <th className="p-2 text-gray-400 font-normal">{t('tradingDashboard_tableHeader_price')}</th>
                <th className="p-2 text-gray-400 font-normal">{t('tradingDashboard_tableHeader_finalPrice')}</th>
                <th className="p-2 text-gray-400 font-normal">{t('tradingDashboard_tableHeader_date')}</th>
                <th className="p-2 text-gray-400 font-normal">{t('tradingDashboard_tableHeader_time')}</th>
              </tr>
            </thead>
            <tbody>
              {operaciones.length > 0 ? (
                operaciones.map((op, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                    <td className="p-2">{op.id}</td>
                    <td className="p-2">{op.simbolo}</td>
                    <td className="p-2">{op.tipo === 'Comprar' ? t('tradingDashboard_operationType_buy') : op.tipo}</td>
                    <td className="p-2">{op.volumen}</td>
                    <td className="p-2">{op.precio}</td>
                    <td className="p-2">{op.precioFinal}</td>
                    <td className="p-2">{op.fecha}</td>
                    <td className="p-2">{op.hora}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    {t('tradingDashboard_emptyTable_noOperations')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;