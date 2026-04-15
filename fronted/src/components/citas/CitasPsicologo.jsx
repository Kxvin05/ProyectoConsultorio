import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../common/Layout';

function CitasPsicologo() {
  const { darkMode } = useTheme();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/citas/citas/mis_citas_psicologo/');
      setCitas(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error cargando citas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const marcarAtendida = async (citaId) => {
    try {
      await axiosInstance.post(`/citas/citas/${citaId}/atender/`);
      await cargarCitas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al marcar como atendida');
    }
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'atendida': return 'bg-blue-100 text-blue-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const citasFiltradas = filtro === 'todas'
    ? citas
    : citas.filter(c => c.estado === filtro);

  const estadisticas = {
    total: citas.length,
    pendientes: citas.filter(c => c.estado === 'pendiente').length,
    atendidas: citas.filter(c => c.estado === 'atendida').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cargando citas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
            📅 Mis Citas
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona y visualiza todas tus citas agendadas
          </p>
        </div>

        {/* Stats — grid de 3 columnas sin "Confirmadas" */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg p-6 text-white">
            <p className="opacity-80 text-sm font-semibold mb-2">Total Citas</p>
            <p className="text-4xl font-bold">{estadisticas.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
            <p className="opacity-80 text-sm font-semibold mb-2">Pendientes</p>
            <p className="text-4xl font-bold">{estadisticas.pendientes}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <p className="opacity-80 text-sm font-semibold mb-2">Atendidas</p>
            <p className="text-4xl font-bold">{estadisticas.atendidas}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-semibold">❌ Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {['todas', 'pendiente', 'atendida', 'cancelada'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filtro === f
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : darkMode
                  ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                  : 'bg-white text-dark hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tabla Citas */}
        {citasFiltradas.length > 0 ? (
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Paciente</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Documento</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Fecha</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Hora</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Motivo</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Estado</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.map((cita, index) => (
                    <tr key={index} className={`border-b transition ${darkMode ? 'hover:bg-gray-800 border-gray-700' : 'hover:bg-gray-50 border-gray-200'}`}>
                      <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        {cita.paciente_nombre || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {cita.paciente_documento || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {cita.fecha ? new Date(cita.fecha).toLocaleDateString('es-CO') : '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {cita.hora || '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {cita.motivo || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getEstadoStyle(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {cita.estado !== 'atendida' && cita.estado !== 'cancelada' ? (
                          <button
                            onClick={() => marcarAtendida(cita.id)}
                            className="flex items-center gap-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:shadow-lg transition"
                          >
                            <FiCheckCircle size={14} />
                            Atendida
                          </button>
                        ) : (
                          <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
            <FiCalendar size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No hay citas {filtro !== 'todas' ? `con estado "${filtro}"` : 'registradas'}
            </p>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}

export default CitasPsicologo;