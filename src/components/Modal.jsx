import React from 'react';
import PropTypes from 'prop-types';
import { RiCloseLine } from 'react-icons/ri';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="z-50 w-full max-w-md rounded-3xl bg-gradient-to-br from-[#232323] to-[#2b2b2b] p-6 shadow-xl border border-gray-800 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-full hover:bg-gray-700"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default Modal;