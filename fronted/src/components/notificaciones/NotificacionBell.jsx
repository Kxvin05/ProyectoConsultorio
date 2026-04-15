import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { FiBell, FiX, FiTrash2 } from 'react-icons/fi';
 
function NotificacionBell() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
 
  useEffect(() => {
    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 10000);
    return () => clearInterval(intervalo);
  }, []);
 
  const cargarNotificaciones = async () => {
    try {
      const response = await axiosInstance.get('/notificaciones/notificaciones/');
      setNotificaciones(response.data);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  };
 
  const eliminarNotificacion = async (notifId) => {
    try {
      await axiosInstance.delete(`/notificaciones/notificaciones/${notifId}/`);
      setNotificaciones(notificaciones.filter(n => (n.notificacion_id || n.id) !== notifId));
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };
 
  const marcarComoLeida = async (notifId) => {
    try {
      await axiosInstance.patch(`/notificaciones/notificaciones/${notifId}/`, {
        leida: true
      });
      cargarNotificaciones();
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };
 
  const noLeidas = notificaciones.filter(n => !n.leida).length;
 
  return (
    <div className="relative">
      {/* Botón Campana */}
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className="relative hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
        title="Notificaciones"
      >
        <FiBell size={20} className="text-white" />
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>
 
      {/* Panel de Notificaciones */}
      {mostrarPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
            <h3 className="font-bold text-lg">Notificaciones</h3>
            <button
              onClick={() => setMostrarPanel(false)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
            >
              <FiX size={20} />
            </button>
          </div>
 
          {/* Contenido */}
          <div className="flex-1 overflow-y-auto">
            {notificaciones.length > 0 ? (
              <div className="divide-y">
                {notificaciones.map((notif, index) => (
                  <div
                    key={notif.notificacion_id || notif.id || index}
                    onClick={() => marcarComoLeida(notif.notificacion_id || notif.id)}
                    className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                      !notif.leida ? 'bg-blue-50 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-dark text-sm">{notif.titulo}</h4>
                        <p className="text-gray-600 text-xs mt-1">{notif.mensaje}</p>
                        <p className="text-gray-400 text-xs mt-2">
                          {new Date(notif.fecha_creacion).toLocaleDateString('es-CO')}{' '}
                          {new Date(notif.fecha_creacion).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarNotificacion(notif.notificacion_id || notif.id);
                        }}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                        title="Eliminar"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FiBell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No hay notificaciones</p>
              </div>
            )}
          </div>
 
          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="p-3 border-t bg-gray-50 text-center">
              <p className="text-xs text-gray-600">
                {noLeidas} sin leer de {notificaciones.length} total
              </p>
            </div>
          )}
        </div>
      )}
 
      {/* Overlay para cerrar al hacer click fuera */}
      {mostrarPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMostrarPanel(false)}
        />
      )}
    </div>
  );
}
 
export default NotificacionBell;