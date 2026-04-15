import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { FiPhone, FiMail, FiMapPin, FiCalendar, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Layout from '../common/Layout';
import { useTheme } from '../../context/ThemeContext';

function PsicologosList() {
  const [psicologos, setPsicologos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('todas');
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  useEffect(() => {
    cargarPsicologos();
  }, []);

  useEffect(() => {
    filtrarPsicologos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, filtroEspecialidad, psicologos]);

  const cargarPsicologos = async () => {
    try {
      const response = await axiosInstance.get('/psicologos/psicologos/');
      setPsicologos(response.data);
    } catch (err) {
      console.error('Error al cargar psicólogos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPsicologos = () => {
    let resultado = psicologos;

    if (busqueda) {
      resultado = resultado.filter(p =>
        p.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.especialidad.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroEspecialidad !== 'todas') {
      resultado = resultado.filter(p =>
        p.especialidad.toLowerCase() === filtroEspecialidad.toLowerCase()
      );
    }

    setFiltrados(resultado);
  };

  const especialidades = [...new Set(psicologos.map(p => p.especialidad))];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando psicólogos...
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
              Nuestros Psicólogos
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Conoce a nuestro equipo de profesionales certificados
            </p>
          </div>

          {/* Buscador */}
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-md p-6 mb-8`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                  <FiSearch className="text-primary" />
                  Buscar Psicólogo
                </label>
                <input
                  type="text"
                  placeholder="Nombre o especialidad..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>

              {/* Filtro especialidad */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                  Especialidad
                </label>
                <select
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                >
                  <option value="todas">Todas las especialidades</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              {/* Resultados */}
              <div className="flex items-end">
                <div className={`w-full rounded-lg p-4 text-center ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-primary bg-opacity-10 border border-primary border-opacity-20'}`}>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Psicólogos disponibles
                  </p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-primary' : 'text-primary'}`}>
                    {filtrados.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Psicólogos */}
          {filtrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filtrados.map((psicologo, index) => (
                <div
                  key={psicologo.psicologo_id || psicologo.id || index}
                  className={`${darkMode ? 'bg-gray-900 border border-gray-700 hover:border-primary' : 'bg-white'} rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition transform hover:-translate-y-2`}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 text-center">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full mx-auto flex items-center justify-center mb-4">
                      <span className="text-4xl">👨‍⚕️</span>
                    </div>
                    <h3 className="text-xl font-bold">
                      {psicologo.nombres} {psicologo.apellidos}
                    </h3>
                    <p className="text-sm opacity-90 mt-1">{psicologo.especialidad}</p>
                  </div>

                  {/* Body */}
                  <div className={`p-6 space-y-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Email */}
                    {psicologo.email && (
                      <div className="flex items-start gap-3">
                        <FiMail className={`text-primary mt-1 flex-shrink-0`} size={18} />
                        <div>
                          <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Email
                          </p>
                          <p className={`text-sm break-all ${darkMode ? 'text-gray-300' : 'text-dark font-semibold'}`}>
                            {psicologo.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Teléfono */}
                    {psicologo.telefono && (
                      <div className="flex items-start gap-3">
                        <FiPhone className={`text-secondary mt-1 flex-shrink-0`} size={18} />
                        <div>
                          <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Teléfono
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-dark font-semibold'}`}>
                            {psicologo.telefono}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ubicación */}
                    <div className="flex items-start gap-3">
                      <FiMapPin className={`text-accent mt-1 flex-shrink-0`} size={18} />
                      <div>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Ubicación
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-dark font-semibold'}`}>
                          Consultorio Alexandra Pérez
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

                    {/* Detalles */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Cédula
                        </span>
                        <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                          {psicologo.documento || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Duración
                        </span>
                        <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                          {psicologo.duracion_cita_min} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Estado
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          psicologo.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {psicologo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>

                    {/* Botón */}
                    {psicologo.activo && (
                      <button
                        onClick={() => navigate('/citas/agendar', {
                          state: { psicologoId: psicologo.psicologo_id }
                        })}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 mt-4"
                      >
                        <FiCalendar size={18} />
                        Agendar Cita
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
              <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No se encontraron psicólogos con los filtros seleccionados
              </p>
            </div>
          )}

          {/* Info Footer */}
          <div className={`border-l-4 p-6 rounded-lg ${darkMode ? 'bg-gray-900 border-blue-500 text-gray-300' : 'bg-blue-50 border-blue-500 text-blue-900'}`}>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>
              Información importante
            </h3>
            <ul className="text-sm space-y-1">
              <li>✓ Todos nuestros psicólogos están certificados y con experiencia probada</li>
              <li>✓ Puedes agendar una cita con cualquiera de nuestros profesionales</li>
              <li>✓ Las citas se confirman automáticamente según disponibilidad</li>
              <li>✓ Tu privacidad y confidencialidad están garantizadas</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PsicologosList;
