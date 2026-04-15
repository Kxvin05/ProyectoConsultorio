import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axiosInstance from '../../api/axiosConfig';
import { FiChevronLeft, FiChevronRight, FiClock, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../common/Layout';
import 'react-calendar/dist/Calendar.css';
import './CalendarioVisual.css';

function CalendarioVisual() {
  const [date, setDate] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [citasSeleccionadas, setCitasSeleccionadas] = useState([]);
  const { darkMode } = useTheme();

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      const response = await axiosInstance.get('/citas/citas/mis_citas/');
      setCitas(response.data);
    } catch (err) {
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  };

  const obtenerCitasPorFecha = (fecha) => {
    const fechaString = fecha.toISOString().split('T')[0];
    return citas.filter(cita => cita.fecha === fechaString);
  };

  const handleDateChange = (valor) => {
    setDate(valor);
    const citasDelDia = obtenerCitasPorFecha(valor);
    setCitasSeleccionadas(citasDelDia);
  };

  const tileContent = ({ date }) => {
    const citasDelDia = obtenerCitasPorFecha(date);
    if (citasDelDia.length > 0) {
      return (
        <div className="flex gap-1 justify-center mt-1">
          {citasDelDia.slice(0, 3).map((_, index) => (
            <div key={index} className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          ))}
        </div>
      );
    }
    return null;
  };

  const tileClassName = ({ date }) => {
    const citasDelDia = obtenerCitasPorFecha(date);
    if (citasDelDia.length > 0) {
      return 'tiene-cita';
    }
    return null;
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente':
        return 'from-yellow-400 to-yellow-500';
      case 'confirmada':
        return 'from-blue-400 to-blue-500';
      case 'atendida':
        return 'from-green-400 to-green-500';
      case 'cancelada':
        return 'from-red-400 to-red-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getEstadoBg = (estado) => {
    switch(estado) {
      case 'pendiente':
        return 'bg-yellow-50 border-yellow-200';
      case 'confirmada':
        return 'bg-blue-50 border-blue-200';
      case 'atendida':
        return 'bg-green-50 border-green-200';
      case 'cancelada':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando calendario...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
              Mi Calendario de Citas
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Visualiza y gestiona todas tus citas de forma fácil
            </p>
          </div>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendario */}
            <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 overflow-hidden`}>
              <div className="mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                  Calendario
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Los puntos indican días con citas programadas
                </p>
              </div>

              <div className="calendario-container">
                <Calendar
                  value={date}
                  onChange={handleDateChange}
                  tileContent={tileContent}
                  tileClassName={tileClassName}
                  minDate={new Date()}
                  prev2Label={null}
                  next2Label={null}
                  prevLabel={<FiChevronLeft size={20} />}
                  nextLabel={<FiChevronRight size={20} />}
                  className={darkMode ? 'dark-calendar' : ''}
                />
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t" style={{borderColor: darkMode ? '#374151' : '#e5e7eb'}}>
                <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-yellow-50 to-orange-50'}`}>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pendientes
                  </p>
                  <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {citas.filter(c => c.estado === 'pendiente').length}
                  </p>
                </div>
                <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Confirmadas
                  </p>
                  <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {citas.filter(c => c.estado === 'confirmada').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles del Día */}
            <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 h-fit sticky top-20`}>
              <div className="mb-6">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                  {date.toLocaleDateString('es-CO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {citasSeleccionadas.length} cita(s) programada(s)
                </p>
              </div>

              {citasSeleccionadas.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {citasSeleccionadas.map(cita => (
                    <div
                      key={cita.cita_id}
                      className={`p-4 rounded-xl border-2 transition hover:shadow-lg ${getEstadoBg(cita.estado)} ${darkMode ? 'border-opacity-50' : ''}`}
                    >
                      {/* Hora y Estado */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-primary" size={18} />
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                            {cita.hora}
                          </span>
                        </div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize bg-gradient-to-r ${getEstadoColor(cita.estado)} text-white`}>
                          {cita.estado}
                        </span>
                      </div>

                      {/* Psicólogo */}
                      <div className="flex items-start gap-2 mb-3 pb-3 border-b" style={{borderColor: darkMode ? '#374151' : '#e5e7eb'}}>
                        <FiUser className="text-secondary mt-0.5 flex-shrink-0" size={16} />
                        <div>
                          <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Psicólogo
                          </p>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-dark'}`}>
                            {cita.psicologo}
                          </p>
                        </div>
                      </div>

                      {/* Motivo */}
                      {cita.motivo && (
                        <div className="flex items-start gap-2 mb-3">
                          <FiMessageSquare className="text-accent mt-0.5 flex-shrink-0" size={16} />
                          <div>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Motivo
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {cita.motivo}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Botón Detalles */}
                      <button className={`w-full mt-3 px-4 py-2 rounded-lg font-semibold transition hover:shadow-md bg-gradient-to-r from-primary to-secondary text-white`}>
                        Ver Detalles
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <FiClock size={32} className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No hay citas programadas para este día
                  </p>
                </div>
              )}

              {/* Próxima Cita */}
              {citas.length > 0 && (
                <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Próxima cita
                  </p>
                  {citas[0] && (
                    <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-lg">
                      <p className="text-sm opacity-90">{citas[0].psicologo}</p>
                      <p className="font-bold text-lg">{citas[0].hora}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(citas[0].fecha).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CalendarioVisual;