import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useAuth } from '../contexts/AuthContext'; // Importar el contexto de autenticación
import { getTranslator } from '../utils/i18n'; // Added

const TradingDashboard = ({ accountId, onBack, previousSection }) => {
  // Obtener información del usuario desde Firebase
  const { currentUser, language } = useAuth();
  const t = getTranslator(language); // Added
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

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] text-white min-h-screen flex flex-col">
      {/* Botón de regreso */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-cyan-500 hover:text-cyan-400 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {getBackText()}
        </button>
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
            <p className="text-sm text-gray-400">Lun, 13 Enero</p>
          </div> 
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <h2 className="text-xl font-bold mb-2">{t('tradingDashboard_drawdownWidgetTitle')}</h2>
            <div className="text-2xl font-bold">25%</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <h2 className="text-xl font-bold mb-2">{t('tradingDashboard_tradingDaysWidgetTitle')}</h2>
            <div className="text-2xl font-bold">5 Días</div>
          </div>
        </div>
      </div>

      {/* Sección de métricas detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">{t('tradingDashboard_metric_profitTarget')}</p>
            <p className="text-lg font-semibold">10%</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-red-500 bg-opacity-20 text-red-400 text-sm">
            {t('tradingDashboard_metric_targetNotReached')}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">{t('tradingDashboard_metric_maxDailyLoss')}</p>
            <p className="text-lg font-semibold">5%</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-green-500 bg-opacity-20 text-green-400 text-sm">
            {t('tradingDashboard_metric_targetReached')}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">{t('tradingDashboard_metric_maxLoss')}</p>
            <p className="text-lg font-semibold">10%</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-green-500 bg-opacity-20 text-green-400 text-sm">
            {t('tradingDashboard_metric_targetReached')}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">{t('tradingDashboard_metric_minTradingDays')}</p>
            <p className="text-lg font-semibold">5</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-green-500 bg-opacity-20 text-green-400 text-sm">
            {t('tradingDashboard_metric_targetReached')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-sm mb-1">Duración promedio del trading</h3>
            <span className="text-xl md:text-2xl font-bold">02:25:36</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/clock.png" alt="Avatar" />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-sm mb-1">Factor de beneficio</h3>
            <span className="text-xl md:text-2xl font-bold">$20,61</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/coins.png" alt="Avatar" />
          </div>
        </div>
      </div>

      {/* Sección de Objetivos */}
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Objetivos</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Límite diario de pérdidas</h3>
              <span className="bg-yellow-800 bg-opacity-30 text-yellow-400 px-2 py-1 rounded text-xs">En Proceso</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Límite máximo de pérdida</span>
              <span>$245.36</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Pérdida permitida hoy</span>
              <span>$4,661.81</span>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Límite de pérdida global</h3>
              <span className="bg-red-800 bg-opacity-30 text-red-400 px-2 py-1 rounded text-xs">Perdido</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Límite máximo de pérdida</span>
              <span>$245.36</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Pérdida máxima permitida</span>
              <span>$4,661.81</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Días mínimos de negociación</h3>
              <span className="bg-green-800 bg-opacity-30 text-green-400 px-2 py-1 rounded text-xs">Superado</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Mínimo</span>
              <span>5 Días</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Resultado actual</span>
              <span>7 Días</span>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Objetivo de ganancias</h3>
              <span className="bg-yellow-800 bg-opacity-30 text-yellow-400 px-2 py-1 rounded text-xs">En Proceso</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Mínimo</span>
              <span>$8,000.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Resultado actual</span>
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