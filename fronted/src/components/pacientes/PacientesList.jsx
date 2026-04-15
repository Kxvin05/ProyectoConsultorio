import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import Layout from '../common/Layout';
import { useTheme } from '../../context/ThemeContext';
import { FiUsers } from 'react-icons/fi';

function PacientesList() {
  const { darkMode } = useTheme();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const response = await axiosInstance.get('/pacientes/pacientes/');
      console.log('🔍 Pacientes cargados:', response.data);
      setPacientes(response.data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
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
              Cargando pacientes...
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
          <h1 className={`text-4xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-dark'}`}>
            Pacientes
          </h1>

          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-lg shadow p-6`}>
            {pacientes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Nombre
                      </th>
                      <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Email
                      </th>
                      <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Teléfono
                      </th>
                      <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Documento
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.map(paciente => (
                      <tr 
                        key={paciente.id} 
                        className={`border-b transition ${darkMode ? 'hover:bg-gray-800 border-gray-700' : 'hover:bg-gray-50 border-gray-200'}`}
                      >
                        <td className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-dark'}`}>
                          {paciente.usuario_nombre || '-'}
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {paciente.usuario_email || '-'}
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {paciente.telefono || '-'}
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {paciente.documento || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUsers size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No hay pacientes registrados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PacientesList;