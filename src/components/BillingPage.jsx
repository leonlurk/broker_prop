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
        return 'bg-gradient-to-br from-amber-400 to-[#2b2b2b]';
      case 'Pendiente':
        return 'bg-gradient-to-br from-red-500/40 to-[#2b2b2b]';
      case 'Pagado':
        return 'bg-gradient-to-br from-[#3a5311] to-[#2b2b2b]';
      default:
        return 'bg-gray-800'; // Fallback, similar to TradingAccounts
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#262626] text-white flex flex-col min-h-screen">
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="text-white bg-[#2c2c2c] rounded-full p-2 hover:bg-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
            aria-label={t('common_back', 'Volver')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main Container for Billing Content */}
      <div className="border border-[#333] rounded-xl bg-gradient-to-br from-[#232323] to-[#2d2d2d] p-4 md:p-6 flex-grow">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8 text-white">{t('settings_section_billing', 'Facturación')}</h1>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-sm font-semibold text-gray-300">{t('billing_header_desafio', 'Desafío')}</th>
                <th className="p-3 text-sm font-semibold text-gray-300">{t('billing_header_fechas', 'Fechas')}</th>
                <th className="p-3 text-sm font-semibold text-gray-300">{t('billing_header_cantidad', 'Cantidad A Pagar')}</th>
                <th className="p-3 text-sm font-semibold text-gray-300">{t('billing_header_orden', 'Orden')}</th>
                <th className="p-3 text-sm font-semibold text-gray-300">{t('billing_header_cuenta', 'Cuenta')}</th>
                <th className="p-3 text-sm font-semibold text-gray-300">{t('billing_header_estado', 'Estado')}</th>
                <th className="p-3 text-sm font-semibold text-gray-300">{t('billing_header_factura', 'Factura Y Documentos')}</th>
              </tr>
            </thead>
            <tbody>
              {billingData.length > 0 ? (
                billingData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/10 transition-colors">
                    <td className="p-3 text-sm text-white">{item.desafio}</td>
                    <td className="p-3 text-sm text-gray-300">{item.fechas}</td>
                    <td className="p-3 text-sm text-white">{item.cantidadAPagar}</td>
                    <td className="p-3 text-sm text-gray-300">{item.orden}</td>
                    <td className="p-3 text-sm text-white">{item.cuenta}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusClass(item.estado)}`}>
                        {t(`billing_status_${item.estado.toLowerCase()}`, item.estado)}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <a 
                        href={item.facturaLink} 
                        className="text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
                        onClick={(e) => { 
                          e.preventDefault(); // Prevent navigation for placeholder link
                          handleOpenDetailModal(item); // Open modal instead of console.log
                          // console.log('Ver Detalles clicked for:', item.orden);
                        }}
                      >
                        {t('billing_action_verDetalles', '(Ver Detalles)')}
                        <ChevronRight size={16} className="ml-1" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    {t('billing_empty_noInvoices', 'No hay facturas para mostrar.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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