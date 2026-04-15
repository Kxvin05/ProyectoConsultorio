import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { FiUsers, FiSearch } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../common/Layout';

function PacientesPsicologo() {
  const { darkMode } = useTheme();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pacientes/pacientes/mis_pacientes/');
      setPacientes(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error cargando pacientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pacientesFiltrados = pacientes.filter(p =>
    p.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.documento.includes(busqueda)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cargando pacientes...
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
            👥 Mis Pacientes
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Visualiza todos tus pacientes con citas agendadas
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg p-6 text-white">
            <p className="opacity-80 text-sm font-semibold mb-2">Total Pacientes</p>
            <p className="text-4xl font-bold">{pacientes.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <p className="opacity-80 text-sm font-semibold mb-2">Pacientes Encontrados</p>
            <p className="text-4xl font-bold">{pacientesFiltrados.length}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-semibold">❌ Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Búsqueda */}
        <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-8`}>
          <div className="flex items-center gap-3">
            <FiSearch size={20} className="text-primary" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
            />
          </div>
        </div>

        {/* Tabla Pacientes */}
        {pacientesFiltrados.length > 0 ? (
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Nombre</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Documento</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Email</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map((paciente, index) => (
                    <tr key={index} className={`border-b transition ${darkMode ? 'hover:bg-gray-800 border-gray-700' : 'hover:bg-gray-50 border-gray-200'}`}>
                      <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        {paciente.nombres} {paciente.apellidos}
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {paciente.documento}
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {paciente.usuario_email || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {paciente.telefono || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
            <FiUsers size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {busqueda ? 'No se encontraron pacientes' : 'No tienes pacientes registrados'}
            </p>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}

export default PacientesPsicologo;