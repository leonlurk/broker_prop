import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import BillingDetailModal from './BillingDetailModal';

const BillingPage = ({ onBack }) => {
  const { language } = useAuth();
  const t = useMemo(() => getTranslator(language), [language]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBillingItem, setSelectedBillingItem] = useState(null);

  const handleOpenDetailModal = (item) => {
    setSelectedBillingItem(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBillingItem(null);
  };

  // Placeholder data for the table with new fields for the modal
  const billingData = [
    {
      desafio: 'Challenge 100k',
      fechas: '14/05/2025 - 05/06/2025',
      cantidadAPagar: '$198,00',
      orden: '#236544',
      cuenta: 'Cuenta 2 (12345)',
      estado: 'Upcoming',
      facturaLink: '#',
      // Modal specific data
      invoiceSentDate: '15/03/2023',
      dueDate: null, // No due date for upcoming in screenshot
      paymentDate: null,
      paymentMethod: null,
      detailsRolloverAmount: '$8,70',
      detailsWithdrawalAmount: '$0,00',
      detailsRefundAmount: '$0,00',
      summarySubtotal: '$198,00',
      summaryRolloverCharge: '$15,00',
      summaryTotalDue: '$213,00',
      summaryTotalPaid: null,
    },
    {
      desafio: 'Challenge 100k',
      fechas: '01/04/2025 - 30/04/2025',
      cantidadAPagar: '$155,00',
      orden: '#234987',
      cuenta: 'Cuenta 1 (12345)',
      estado: 'Pendiente',
      facturaLink: '#',
      // Modal specific data
      invoiceSentDate: '01/04/2023',
      dueDate: '30/04/2023',
      paymentDate: null,
      paymentMethod: null,
      detailsRolloverAmount: '$0,00',
      detailsWithdrawalAmount: '$0,00',
      detailsRefundAmount: '$0,00',
      summarySubtotal: '$155,00',
      summaryRolloverCharge: '$10,00',
      summaryTotalDue: '$165,00',
      summaryTotalPaid: null,
    },
    {
      desafio: 'Challenge 100k',
      fechas: '10/05/2025 - 08/06/2025',
      cantidadAPagar: '$324,00',
      orden: '#235123',
      cuenta: 'Cuenta 1 (12345)',
      estado: 'Pagado',
      facturaLink: '#',
      // Modal specific data
      invoiceSentDate: '10/05/2023',
      dueDate: '18/06/2023',
      paymentDate: '25/05/2023',
      paymentMethod: 'Transferencia',
      detailsRolloverAmount: '$0,00',
      detailsWithdrawalAmount: '$0,00',
      detailsRefundAmount: '$0,00',
      summarySubtotal: null,
      summaryRolloverCharge: null,
      summaryTotalDue: null,
      summaryTotalPaid: '$324,00',
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-gradient-to-br from-amber-400 to-amber-600';
      case 'Pendiente':
        return 'bg-gradient-to-br from-red-500 to-red-700';
      case 'Pagado':
        return 'bg-gradient-to-br from-green-500 to-green-700';
      default:
        return 'bg-gray-700';
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#262626] text-white flex flex-col">
      {/* Header with back button */}
      <div className="mt-16 sm:mt-0 mb-4 sm:mb-6 flex-shrink-0">
        <div className="flex items-center mb-2 sm:mb-4">
          <button
            onClick={onBack}
            className="text-white bg-[#2c2c2c] rounded-full p-2 hover:bg-[#252525] focus:outline-none border border-cyan-500 mr-4 transition-colors"
            aria-label={t('common_back', 'Volver')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main Container for Billing Content - this part will scroll if content overflows its own height IF it grows beyond viewport */}
      <div className="border border-[#333] rounded-xl bg-gradient-to-br from-[#232323] to-[#2d2d2d] p-3 sm:p-4 md:p-6 flex flex-col">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-6 md:mb-8 text-white flex-shrink-0">{t('settings_section_billing', 'Facturación')}</h1>
        
        {/* Wrapper for table/cards - content height will determine if page scrolls */}
        <div> 
          {/* Desktop Table View - Hidden on mobile (sm and up) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">{t('billing_header_desafio', 'Desafío')}</th>
                  <th className="p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">{t('billing_header_fechas', 'Fechas')}</th>
                  <th className="p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">{t('billing_header_cantidad', 'Cantidad A Pagar')}</th>
                  <th className="p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">{t('billing_header_orden', 'Orden')}</th>
                  <th className="p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">{t('billing_header_cuenta', 'Cuenta')}</th>
                  <th className="p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">{t('billing_header_estado', 'Estado')}</th>
                  <th className="p-2 md:p-3 text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">{t('billing_header_factura', 'Factura Y Documentos')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {billingData.length > 0 ? (
                  billingData.map((item, index) => (
                    <tr key={`desktop-${index}`} className="hover:bg-gray-700/10 transition-colors">
                      <td className="p-2 md:p-3 text-xs md:text-sm text-white whitespace-nowrap">{item.desafio}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm text-gray-300 whitespace-nowrap">{item.fechas}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm text-white whitespace-nowrap">{item.cantidadAPagar}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm text-gray-300 whitespace-nowrap">{item.orden}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm text-white whitespace-nowrap">{item.cuenta}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-2xs md:text-xs font-medium text-white whitespace-nowrap ${getStatusClass(item.estado)}`}>
                          {t(`billing_status_${item.estado.toLowerCase()}`, item.estado)}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-xs md:text-sm text-right whitespace-nowrap">
                        <a 
                          href={item.facturaLink} 
                          className="text-cyan-400 hover:text-cyan-300 inline-flex items-center transition-colors"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            handleOpenDetailModal(item); 
                          }}
                        >
                          {t('billing_action_verDetalles', '(Ver Detalles)')}
                          <ChevronRight size={16} className="ml-1 w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500 text-sm md:text-base">
                      {t('billing_empty_noInvoices', 'No hay facturas para mostrar.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Visible only on small screens (block sm:hidden) */}
          <div className="sm:hidden space-y-4">
            {billingData.length > 0 ? (
              billingData.map((item, index) => (
                <div key={`mobile-${index}`} className="bg-[#2d2d2d] border border-[#383838] rounded-lg p-4 shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">{item.desafio}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-2xs font-medium text-white whitespace-nowrap ${getStatusClass(item.estado)}`}>
                      {t(`billing_status_${item.estado.toLowerCase()}`, item.estado)}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-300 mb-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-400">{t('billing_header_cantidad', 'Cantidad')}:</span>
                      <span className="text-white font-medium">{item.cantidadAPagar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-400">{t('billing_header_fechas', 'Fechas')}:</span>
                      <span>{item.fechas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-400">{t('billing_header_orden', 'Orden')}:</span>
                      <span>{item.orden}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-400">{t('billing_header_cuenta', 'Cuenta')}:</span>
                      <span>{item.cuenta}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleOpenDetailModal(item)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
                  >
                    {t('billing_action_verDetalles', 'Ver Detalles')}
                    <ChevronRight size={18} className="ml-2 w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                {t('billing_empty_noInvoices', 'No hay facturas para mostrar.')}
              </div>
            )}
          </div>
        </div>
      </div>
      <BillingDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={handleCloseDetailModal} 
        billingItem={selectedBillingItem} 
      />
    </div>
  );
};

export default BillingPage; 