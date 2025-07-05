import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';

import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEsc = true,
}) => {
  const modalRef = useRef(null);

  // Handle Escape key press to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Get size class
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'max-w-sm';
      case 'large':
        return 'max-w-3xl';
      case 'full':
        return 'max-w-full mx-4';
      case 'medium':
      default:
        return 'max-w-lg';
    }
  };

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 transition-opacity"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`${getSizeClasses()} w-full bg-dark-800 border border-dark-700 rounded-lg shadow-xl overflow-hidden transform transition-all`}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-gray-300">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="p-4 border-t border-dark-700 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
  closeOnOverlayClick: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
};

// Predefined modal with confirmation buttons
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  size = 'small'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>{cancelText}</Button>
          <Button variant={confirmVariant} onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmVariant: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
};

export default Modal;
