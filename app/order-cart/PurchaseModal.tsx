import React from "react";

interface ModalProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export default function Modal({ show, message, onClose }: ModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div
        className="bg-white rounded-lg shadow-lg p-8 transform transition-all duration-300 scale-100 animate-fade-in"
        style={{ animation: show ? "scale-up 0.3s ease-out" : "scale-down 0.3s ease-in" }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Success</h2>
        <p className="text-gray-600 text-center">{message}</p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-up {
          from {
            transform: scale(0.9);
          }
          to {
            transform: scale(1);
          }
        }
        @keyframes scale-down {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
