import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { FiCalendar, FiUser, FiFileText, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import Layout from '../common/Layout';
import { useTheme } from '../../context/ThemeContext';
import DetallesCitaModal from './DetallesCitaModal';

function CitasList() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const { darkMode } = useTheme();
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      const response = await axiosInstance.get('/citas/citas/mis_citas/');
      console.log('Primera cita:', response.data[0]);
      setCitas(response.data);
    } catch (err) {
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelarCita = async (citaId) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas cancelar esta cita?');
    if (!confirmar) return;

    try {
      await axiosInstance.post(`/citas/citas/${citaId}/cancelar/`);
      await cargarCitas();
    } catch (err) {
      console.error('Error al cancelar:', err.response?.data);
      alert(err.response?.data?.error || 'Error al cancelar la cita');
    }
  };

  const citasFiltradas = citas.filter(cita => {
    if (filtro === 'todas') return true;
    return cita.estado === filtro;
  });

  const getEstadoGradient = (estado) => {
    switch(estado) {
      case 'pendiente': return 'from-yellow-400 to-orange-500';
      case 'confirmada': return 'from-blue-400 to-blue-500';
      case 'atendida': return 'from-green-400 to-emerald-500';
      case 'cancelada': return 'from-red-400 to-red-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando citas...
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
              Mis Citas
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestiona y visualiza todas tus citas programadas
            </p>
          </div>

          {/* Stats — grid de 3 sin "Confirmadas" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="group bg-gradient-to-br from-primary to-secondary rounded-xl shadow-md p-4 hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer">
              <p className="text-white opacity-80 text-xs font-semibold mb-1">Total</p>
              <p className="text-3xl font-bold text-white">{citas.length}</p>
            </div>
            <div className="group bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-md p-4 hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer">
              <p className="text-white opacity-80 text-xs font-semibold mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-white">{citas.filter(c => c.estado === 'pendiente').length}</p>
            </div>
            <div className="group bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-md p-4 hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer">
              <p className="text-white opacity-80 text-xs font-semibold mb-1">Completadas</p>
              <p className="text-3xl font-bold text-white">{citas.filter(c => c.estado === 'atendida').length}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {['todas', 'pendiente', 'atendida', 'cancelada'].map((estado) => (
              <button
                key={`filter-${estado}`}
                onClick={() => setFiltro(estado)}
                className={`px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105 capitalize ${
                  filtro === estado
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                    : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-dark border-2 border-gray-200 hover:border-primary'}`
                }`}
              >
                {estado}
              </button>
            ))}
          </div>

          {/* Citas Grid */}
          {citasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {citasFiltradas.map((cita) => (
                <div
                  key={`cita-${cita.id}`}
                  className={`group rounded-2xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-2 overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}
                >
                  {/* Header con estado */}
                  <div className={`bg-gradient-to-r ${getEstadoGradient(cita.estado)} text-white p-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <FiCheck size={20} />
                      <span className="font-bold capitalize">{cita.estado}</span>
                    </div>
                    <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full font-semibold">
                      #{cita.cita_id}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="p-5 space-y-4">
                    {/* Fecha y Hora */}
                    <div className="flex items-center gap-3 pb-4 border-b" style={{borderColor: darkMode ? '#374151' : '#e5e7eb'}}>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-primary bg-opacity-10'}`}>
                        <FiCalendar className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Fecha y Hora
                        </p>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                          {new Date(cita.fecha).toLocaleDateString('es-CO')} · {cita.hora}
                        </p>
                      </div>
                    </div>

                    {/* Psicólogo */}
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-secondary bg-opacity-10'}`}>
                        <FiUser className="text-secondary" size={20} />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Psicólogo
                        </p>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                          {cita.psicologo_nombre || cita.psicologo}
                        </p>
                      </div>
                    </div>

                    {/* Motivo */}
                    {cita.motivo && (
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg flex-shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-accent bg-opacity-10'}`}>
                          <FiFileText className="text-accent" size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Motivo
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} break-words`}>
                            {cita.motivo}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className={`px-5 py-4 flex gap-2 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <button
                      onClick={() => {
                        console.log("Cita:", cita);
                        console.log("Propiedades:", Object.keys(cita));
                        console.log("cita.id:", cita.id);
                        console.log("cita.cita_id:", cita.cita_id);
                        console.log("cita.fecha:", cita.fecha);
                        setCitaSeleccionada(cita);
                        setMostrarModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg hover:shadow-lg transition font-semibold text-sm"
                    >
                      <FiEdit2 size={16} />
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => cancelarCita(cita.id)}
                      disabled={cita.estado === 'cancelada' || cita.estado === 'atendida'}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:shadow-lg transition font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 size={16} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-16 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
              <FiCalendar size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No hay citas {filtro !== 'todas' ? `con estado "${filtro}"` : ''}
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Agenda una nueva cita para comenzar
              </p>
            </div>
          )}
        </div>
      </div>
      <DetallesCitaModal
        cita={citaSeleccionada}
        isOpen={mostrarModal}
        onClose={() => {
          setMostrarModal(false);
          setCitaSeleccionada(null);
        }}
        onActualizar={cargarCitas}
      />
    </Layout>
  );
}

export default CitasList;