import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true 
}) => {
  
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className=\"modal-overlay\" onClick={handleOverlayClick}>
      <div className={`modal-container modal-${size}`}>
        <div className=\"modal-header\">
          <h2 className=\"modal-title\">{title}</h2>
          {showCloseButton && (
            <button 
              className=\"modal-close-btn\"
              onClick={onClose}
              aria-label=\"Close modal\"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <div className=\"modal-content\">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;