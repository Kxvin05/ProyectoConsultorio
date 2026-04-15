import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../common/Layout';
import { FiUsers, FiCalendar, FiMail, FiPhone, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ResumenPsicologos() {
  const { darkMode } = useTheme();
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/psicologos/psicologos/resumen_recepcion/');
      setPsicologos(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar el resumen de psicólogos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoPsicologo = async (psicologoId) => {
    setCambiandoEstado(psicologoId);
    try {
      const response = await axiosInstance.post(
        `/psicologos/psicologos/${psicologoId}/toggle_estado_recepcion/`
      );
      setPsicologos(prev => prev.map(p =>
        p.id === psicologoId ? { ...p, activo: response.data.activo } : p
      ));
    } catch (err) {
      console.error('Error cambiando estado:', err);
    } finally {
      setCambiandoEstado(null);
    }
  };

  // Citas atendidas y pendientes agrupadas por especialidad
  const datosEspecialidades = Object.entries(
    psicologos.reduce((acc, p) => {
      if (!acc[p.especialidad]) {
        acc[p.especialidad] = { atendidas: 0, pendientes: 0 };
      }
      acc[p.especialidad].atendidas += p.citas_atendidas_mes;
      acc[p.especialidad].pendientes += p.citas_pendientes_mes;
      return acc;
    }, {})
  ).map(([especialidad, datos]) => ({
    especialidad,
    atendidas: datos.atendidas,
    pendientes: datos.pendientes,
  }));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando resumen...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
              👨‍⚕️ Resumen Psicólogos
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Estadísticas y información de cada psicólogo del consultorio
            </p>
          </div>

          {/* Stats generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Total Psicólogos</p>
              <p className="text-4xl font-bold">{psicologos.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Activos</p>
              <p className="text-4xl font-bold">{psicologos.filter(p => p.activo).length}</p>
            </div>
            <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Inactivos</p>
              <p className="text-4xl font-bold">{psicologos.filter(p => !p.activo).length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Citas Atendidas este Mes</p>
              <p className="text-4xl font-bold">
                {psicologos.reduce((acc, p) => acc + p.citas_atendidas_mes, 0)}
              </p>
            </div>
          </div>

          {/* Gráfica de barras por especialidad */}
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-8`}>
            <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-dark'}`}>
              📊 Citas por Especialidad
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosEspecialidades} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis
                  dataKey="especialidad"
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 12 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#fff',
                    border: '2px solid #6B46C1',
                    borderRadius: '8px',
                    color: darkMode ? '#fff' : '#000'
                  }}
                />
                <Bar dataKey="atendidas" name="Atendidas" radius={[6, 6, 0, 0]} fill="#6B46C1" />
                <Bar dataKey="pendientes" name="Pendientes" radius={[6, 6, 0, 0]} fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
            {/* Leyenda */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6B46C1' }}></div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Atendidas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pendientes</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-semibold">❌ {error}</p>
            </div>
          )}

          {/* Cards de psicólogos */}
          {psicologos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {psicologos.map(psicologo => (
                <div
                  key={psicologo.id}
                  className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}
                >
                  {/* Header card */}
                  <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">
                          {psicologo.nombres} {psicologo.apellidos}
                        </h2>
                        <p className="text-sm opacity-80">{psicologo.especialidad}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {psicologo.activo ? (
                          <span className="flex items-center gap-1 bg-green-500 px-3 py-1 rounded-full text-xs font-bold">
                            <FiCheckCircle size={12} /> Activo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-red-500 px-3 py-1 rounded-full text-xs font-bold">
                            <FiXCircle size={12} /> Inactivo
                          </span>
                        )}
                        <button
                          onClick={() => toggleEstadoPsicologo(psicologo.id)}
                          disabled={cambiandoEstado === psicologo.id}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
                            psicologo.activo
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          } disabled:opacity-50`}
                        >
                          {cambiandoEstado === psicologo.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : psicologo.activo ? (
                            <FiXCircle size={12} />
                          ) : (
                            <FiCheckCircle size={12} />
                          )}
                          {cambiandoEstado === psicologo.id ? '...' : psicologo.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className={`${darkMode ? 'bg-gray-800' : 'bg-primary/10'} rounded-xl p-4 text-center`}>
                        <FiCalendar className="text-primary mx-auto mb-2" size={24} />
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                          {psicologo.citas_atendidas_mes}
                        </p>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Citas atendidas este mes
                        </p>
                      </div>
                      <div className={`${darkMode ? 'bg-gray-800' : 'bg-secondary/10'} rounded-xl p-4 text-center`}>
                        <FiUsers className="text-secondary mx-auto mb-2" size={24} />
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                          {psicologo.total_pacientes}
                        </p>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Total pacientes
                        </p>
                      </div>
                      <div className={`${darkMode ? 'bg-gray-800' : 'bg-yellow-50'} rounded-xl p-4 text-center`}>
                        <FiCalendar className="text-yellow-500 mx-auto mb-2" size={24} />
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                          {psicologo.citas_pendientes_mes}
                        </p>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Citas pendientes este mes
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FiMail className="text-primary flex-shrink-0" size={16} />
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {psicologo.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiPhone className="text-primary flex-shrink-0" size={16} />
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {psicologo.telefono || 'No registrado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
              <FiUsers size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No hay psicólogos registrados
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ResumenPsicologos;