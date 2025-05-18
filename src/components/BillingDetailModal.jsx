import React, { useMemo } from 'react';
import { X, RefreshCw, ArrowDownCircle, Undo2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const BillingDetailModal = ({ isOpen, onClose, billingItem }) => {
  const { language } = useAuth();
  const t = useMemo(() => getTranslator(language), [language]);

  if (!isOpen || !billingItem) {
    return null;
  }

  const getStatusBadgeStyle = (status) => {
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

  const commonLabelClass = "text-sm text-gray-400";
  const commonValueClass = "text-sm text-white";
  // const sectionSpacing = "py-3"; // Reduced from py-4 to make it more compact like screenshots

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232323] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#444]">
        <div className="flex justify-between items-center p-4 border-b border-[#444]">
          <h2 className="text-xl font-semibold text-white">{t('billing_header_factura', 'Factura Y Documentos')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 text-white space-y-4">
          {/* Top Info Section - Wrapped in a new styled container */}
          <div className="bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className={commonLabelClass}>{t('billing_modal_statusLabel', 'Estado:')}</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusBadgeStyle(billingItem.estado)}`}>
                  {t(`billing_status_${billingItem.estado.toLowerCase()}`, billingItem.estado)}
                </span>
              </div>
              <div className="text-right">
                <p className={commonLabelClass}>{t('billing_modal_orderNumberLabel', 'Número De Orden:')}</p>
                <p className={commonValueClass}>{billingItem.orden}</p>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className={commonLabelClass}>{t('billing_modal_invoiceSentLabel', 'Factura Enviada:')}</p>
                <p className={commonValueClass}>{billingItem.invoiceSentDate}</p>
              </div>
              {billingItem.dueDate && (
                <div className="text-right">
                  <p className={commonLabelClass}>{t('billing_modal_dueDateLabel', 'Fecha Vencimiento:')}</p>
                  <p className={commonValueClass}>{billingItem.dueDate}</p>
                </div>
              )}
            </div>
            {billingItem.estado === 'Pagado' && (
              <div className="flex justify-between items-start mt-3">
                <div>
                  <p className={commonLabelClass}>{t('billing_modal_paymentDateLabel', 'Factura De Pago:')}</p>
                  <p className={commonValueClass}>{billingItem.paymentDate}</p>
                </div>
                <div className="text-right">
                  <p className={commonLabelClass}>{t('billing_modal_paymentMethodLabel', 'Método De Pago:')}</p>
                  <p className={commonValueClass}>{billingItem.paymentMethod}</p>
                </div>
              </div>
            )}

            {/* Divider and Rollover/Withdrawal/Refund details START */}
            <div className="mt-4 pt-4 border-t border-[#444444]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <RefreshCw size={16} className="text-gray-400 mr-2" />
                  <span className={commonLabelClass}>{t('billing_modal_rolloverLabel', 'Rollover:')}</span>
                </div>
                <span className={commonValueClass}>{billingItem.detailsRolloverAmount}</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <ArrowDownCircle size={16} className="text-gray-400 mr-2" />
                  <span className={commonLabelClass}>{t('billing_modal_withdrawalLabel', 'Withdrawal:')}</span>
                </div>
                <span className={commonValueClass}>{billingItem.detailsWithdrawalAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Undo2 size={16} className="text-gray-400 mr-2" />
                  <span className={commonLabelClass}>{t('billing_modal_refundLabel', 'Refund:')}</span>
                </div>
                <span className={commonValueClass}>{billingItem.detailsRefundAmount}</span>
              </div>
            </div>
            {/* Divider and Rollover/Withdrawal/Refund details END */}
          </div>

          {/* Summary Section - Wrapped in a new styled container */}
          <div className="bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-lg p-4">
            {billingItem.estado === 'Upcoming' || billingItem.estado === 'Pendiente' ? (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span className={commonLabelClass}>{t('billing_modal_subtotalLabel', 'Subtotal')}</span>
                  <span className={commonValueClass}>{billingItem.summarySubtotal}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className={commonLabelClass}>{t('billing_modal_summaryRolloverLabel', 'Rollover')}</span>
                  <span className={commonValueClass}>{billingItem.summaryRolloverCharge}</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3">
                  <span className="text-base font-semibold text-white">{t('billing_modal_totalToPayLabel', 'Total A Pagar')}</span>
                  <span className="text-base font-semibold text-white">{billingItem.summaryTotalDue}</span>
                </div>
              </>
            ) : ( // Pagado
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-white">{t('billing_modal_totalLabel', 'Total')}</span>
                <span className="text-base font-semibold text-white">{billingItem.summaryTotalPaid}</span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons Section */}
        <div className="p-4 bg-[#232323] border-t border-[#444] rounded-b-xl">
          {billingItem.estado === 'Upcoming' || billingItem.estado === 'Pendiente' ? (
            <div className="flex gap-3">
              <button 
                onClick={onClose} // Or a specific cancel handler
                className="flex-1 px-6 py-3 bg-[#3a3a3a] text-gray-300 rounded-lg hover:bg-[#484848] transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {t('settings_button_cancel', 'Cancelar')}
              </button>
              <button 
                // onClick={handlePay} 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {t('billing_modal_payButton', 'Pagar')}
              </button>
            </div>
          ) : ( // Pagado
            <button 
              // onClick={handleDownloadPdf}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {t('billing_modal_downloadPdfButton', 'Descargar PDF')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingDetailModal; 