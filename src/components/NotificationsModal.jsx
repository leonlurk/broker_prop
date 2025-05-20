import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const NotificationsModal = ({ onClose }) => {
  const { language } = useAuth();
  const t = getTranslator(language);

  const notificationsData = [
    {
      id: '1',
      icon: '/trophy_competition.png',
      altIconText: 'Trophy',
      titleKey: 'notificationsModal_item1_title',
      bodyKey: 'notificationsModal_item1_body',
    },
    {
      id: '2',
      icon: '/coins.png',
      altIconText: 'Coins',
      titleKey: 'notificationsModal_item2_title',
      bodyKey: 'notificationsModal_item2_body',
    },
    {
      id: '3',
      icon: '/graph.png',
      altIconText: 'Graph',
      titleKey: 'notificationsModal_item3_title',
      bodyKey: 'notificationsModal_item3_body',
    }
  ];
  
  const showEmptyState = notificationsData.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="bg-[#232323] border border-[#333] rounded-3xl w-full max-w-xl max-h-[80vh] overflow-y-auto z-10">
        <div className="p-4 flex justify-between items-center border-b border-[#333]">
          <h2 className="text-4xl text-white font-medium">{t('notificationsModal_title')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:text-white transition-colors focus:outline-none"
          >
            <X size={30} />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {showEmptyState ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="rounded-full bg-[#2d2d2d] p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-gray-400 text-center">{t('notificationsModal_emptyState_text')}</p>
            </div>
          ) : (
            notificationsData.map(notification => (
              <div key={notification.id} className="p-4 border-b border-[#333] hover:bg-[#2a2a2a] transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="bg-[#2d2d2d] p-2 rounded-full">
                      <img 
                        src={notification.icon} 
                        alt={notification.altIconText}
                        className="w-8 h-8"
                        style={notification.altIconText === 'Trophy' ? { filter: 'grayscale(100%) brightness(170%) contrast(110%)' } : undefined}
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='%23888888' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-xl font-medium">{t(notification.titleKey, notification.params)}</h3>
                    <p className="text-gray-400">{t(notification.bodyKey, notification.params)}</p>
                  </div>
                  <div>
                    <button className="px-3 py-1 text-sm bg-[#2d2d2d] hover:bg-[#333] text-white rounded-md focus:outline-none">
                      {t('notificationsModal_item_viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;