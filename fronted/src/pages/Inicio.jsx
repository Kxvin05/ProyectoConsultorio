import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../api/axiosConfig';
import Layout from '../components/common/Layout';
import { FiCalendar } from 'react-icons/fi';
 
function Dashboard() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [citasData, setCitasData] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  const cargarDatos = async () => {
    try {
      const citasResponse = await axiosInstance.get('/citas/citas/mis_citas/');
      setCitasData(citasResponse.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };
 
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando Inicio...
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
              Bienvenido{user?.nombres} {user?.apellidos}!
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Aquí puedes ver tus citas y actividad
            </p>
          </div>
 
          {/* Mis Citas */}
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-md p-6`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
              <FiCalendar className="text-primary" size={22} />
              Mis Citas
            </h3>
 
            {citasData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Fecha</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Hora</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Psicólogo</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Estado</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasData.slice(0, 5).map(cita => (
                      <tr key={cita.id} className={`border-b transition ${darkMode ? 'hover:bg-gray-800 border-gray-700' : 'hover:bg-gray-50 border-gray-200'}`}>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {new Date(cita.fecha).toLocaleDateString('es-CO')}
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {cita.hora}
                        </td>
                        <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-white' : 'text-dark'}`}>
                          {cita.psicologo_nombre || cita.psicologo}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                            cita.estado === 'atendida' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {cita.estado}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm truncate max-w-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {cita.motivo || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>No hay citas registradas aún</p>
              </div>
            )}
          </div>
 
        </div>
      </div>
    </Layout>
  );
}
 
export default Dashboard;