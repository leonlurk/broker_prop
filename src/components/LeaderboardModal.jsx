import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const LeaderboardModal = () => {
  const [activeTab, setActiveTab] = useState('Todo');
  
  // Datos para el gráfico de rendimiento
  const rendimientoData = [
    { name: 'Jan', value: 25000 },
    { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 30000 },
    { name: 'Apr', value: 22000 },
    { name: 'May', value: 45000 },
    { name: 'Jun', value: 52000 },
    { name: 'Jul', value: 70000 },
    { name: 'Aug', value: 34000 },
    { name: 'Sep', value: 62000 },
    { name: 'Oct', value: 90000 },
    { name: 'Nov', value: 75000 },
    { name: 'Dec', value: 110000 }
  ];

  // Datos para la tabla y destacados
  const topTraders = [
    { id: 1, nombre: 'Dylan A.', ganancia: '$25,000', porcentaje: '+24.7%', pais: 'US', medalla: '🥇', flag: '🇺🇸' },
    { id: 2, nombre: 'Santi E.', ganancia: '$24,000', porcentaje: '+23.7%', pais: 'ES', medalla: '🥈', flag: '🇪🇸' },
    { id: 3, nombre: 'Sofia B.', ganancia: '$22,000', porcentaje: '+20.7%', pais: 'AR', medalla: '🥉', flag: '🇦🇷' }
  ];

  const tableData = [
    { id: 4, nombre: 'User145', ganancia: '19.850', pais: '🇳🇱' },
    { id: 5, nombre: 'User145', ganancia: '19.850', pais: '🇳🇱' },
    { id: 6, nombre: 'User145', ganancia: '19.850', pais: '🇳🇱' },
    { id: 7, nombre: 'User145', ganancia: '19.850', pais: '🇳🇱' },
    { id: 8, nombre: 'User145', ganancia: '19.850', pais: '🇳🇱' },
    { id: 9, nombre: 'User145', ganancia: '19.850', pais: '🇳🇱' },
    { id: 10, nombre: 'User145', ganancia: '19.850', pais: '🇳🇱' }
  ];
  
  // Función para cambiar entre pestañas de monto
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#232323] text-white rounded-3xl border border-[#333]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">AGM Funded Leaderboard</h1>
      </div>

      {/* Main Content - Full Height */}
      <div className="flex-1 px-4 pb-6 min-h-0">
        <div className="h-full bg-[#232323] rounded-3xl border border-[#333] overflow-hidden flex flex-col">
          <div className="p-4 md:p-6 flex flex-col h-full min-h-0">
            {/* Pestañas de filtrado por monto */}
            <div className="flex flex-wrap gap-2 md:gap-4 mb-6 overflow-x-auto pb-2">
              {['Todo', '25k', '50k', '100k', '150k', '200k'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`focus:outline-none px-4 md:px-6 py-2 rounded-full text-md md:text-base ${
                    activeTab === tab
                      ? 'bg-[#232323] border border-cyan-500 text-white'
                      : 'bg-[#232323] border border-[#333] text-gray-300 hover:border-cyan-500'
                  } transition-colors`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Contenido principal (dos columnas en desktop, apiladas en móvil) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0">
              {/* Columna izquierda - Clasificación */}
              <div className="bg-[#232323] border border-[#333] rounded-3xl p-4 flex flex-col h-full min-h-0">
                <h2 className="text-xl font-bold mb-4 text-white">Clasificación</h2>
                
                {/* Top 3 traders cards */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {topTraders.map((trader) => (
                    <div key={trader.id} className="bg-[#1e3a4c] rounded-lg p-3 relative overflow-hidden">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-lg">{trader.medalla}</span>
                        <span className="text-sm text-gray-300">{trader.nombre}</span>
                      </div>
                      <div className="text-gray-400 text-xs mb-1">Ganancia</div>
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-white">{trader.ganancia.replace('$', '')}</div>
                        <div className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">
                          {trader.porcentaje}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Tabla de clasificación */}
                <div className="overflow-auto flex-1 min-h-0">
                  <table className="w-full text-white">
                    <thead className="sticky top-0 bg-[#232323] z-10">
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="py-2 px-2 font-medium">#</th>
                        <th className="py-2 font-medium">Nombre</th>
                        <th className="py-2 font-medium text-right">Ganancia</th>
                        <th className="py-2 font-medium text-center">País</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row) => (
                        <tr key={row.id} className="border-b border-gray-800 text-sm">
                          <td className="py-3 px-2">{row.id}</td>
                          <td className="py-3">{row.nombre}</td>
                          <td className="py-3 text-right">{row.ganancia}</td>
                          <td className="py-3 text-center">{row.pais}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Columna derecha - Gráfico de rendimiento */}
              <div className="bg-[#232323] border border-[#333] rounded-3xl p-4 flex flex-col h-full min-h-0">
                <h2 className="text-xl font-bold mb-4 text-white">Rendimiento</h2>
                
                {/* Gráfico de área */}
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={rendimientoData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorRendimiento" x1="0" y1="0" x2="0" y2="1">
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
                        domain={['0', '200000']}
                        ticks={[0, 25000, 50000, 100000, 150000, 200000]} 
                        tickFormatter={(value) => value === 0 ? '0k' : `${value/1000}k`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        width={40}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0a84ff"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRendimiento)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;