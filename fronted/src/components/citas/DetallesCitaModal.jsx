import React from 'react';
import { FiX, FiCalendar, FiClock, FiUser, FiFileText } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

function DetallesCitaModal({ cita, isOpen, onClose }) {
  const { darkMode } = useTheme();

  if (!isOpen || !cita) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Detalles de la Cita</h2>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
            <FiX size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* ID */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID Cita</p>
            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>#{cita.id}</p>
          </div>

          {/* Fecha */}
          <div className="flex items-start gap-3">
            <FiCalendar className="text-primary mt-1 flex-shrink-0" size={18} />
            <div>
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha</p>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                {new Date(cita.fecha).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>

          {/* Hora */}
          <div className="flex items-start gap-3">
            <FiClock className="text-secondary mt-1 flex-shrink-0" size={18} />
            <div>
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hora</p>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>{cita.hora}</p>
            </div>
          </div>

          {/* Psicólogo */}
          <div className="flex items-start gap-3">
            <FiUser className="text-accent mt-1 flex-shrink-0" size={18} />
            <div>
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Psicólogo</p>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>{cita.psicologo_nombre || cita.psicologo}</p>
            </div>
          </div>

          {/* Estado */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estado</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
              cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
              cita.estado === 'atendida' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {cita.estado}
            </span>
          </div>

          {/* Motivo */}
          {cita.motivo && (
            <div className="flex items-start gap-3">
              <FiFileText className="text-primary mt-1 flex-shrink-0" size={18} />
              <div>
                <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Motivo</p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{cita.motivo}</p>
              </div>
            </div>
          )}
        </div>

        {/* Botón Cerrar */}
        <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button onClick={onClose} className={`w-full px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-2 border-gray-200 text-dark hover:border-primary'}`}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetallesCitaModal;