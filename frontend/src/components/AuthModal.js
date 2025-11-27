import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ children, title }) {
  const navigate = useNavigate();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      navigate('/');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/40">
        {/* Modal Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
