import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import Layout from '../components/common/Layout';
import { useTheme } from '../context/ThemeContext';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

function InicioPsicologo() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [citasConMigo, setCitasConMigo] = useState([]);
  const [pacientesConMigo, setPacientesConMigo] = useState([]);
  const [activo, setActivo] = useState(null);
  const [psicologoId, setPsicologoId] = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const citasResponse = await axiosInstance.get('/citas/citas/mis_citas_psicologo/');
      setCitasConMigo(citasResponse.data);

      const pacientesUnicos = [...new Set(citasResponse.data.map(c => c.paciente))];
      setPacientesConMigo(pacientesUnicos);

      // Cargar estado activo del psicólogo
      const perfilResponse = await axiosInstance.get('/psicologos/psicologos/mi_estado/');
      setActivo(perfilResponse.data.activo);
      setPsicologoId(perfilResponse.data.id);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado activo/inactivo
  const toggleEstado = async () => {
    setCambiandoEstado(true);
    try {
      const response = await axiosInstance.post('/psicologos/psicologos/toggle_estado/');
      setActivo(response.data.activo);
    } catch (err) {
      console.error('Error cambiando estado:', err);
    } finally {
      setCambiandoEstado(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando datos...
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
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
                📋 Panel Psicólogo
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Gestiona tus citas, pacientes e historias clínicas
              </p>
            </div>

            {/*Botón Activo/Inactivo */}
            {activo !== null && (
              <button
                onClick={toggleEstado}
                disabled={cambiandoEstado}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 ${
                  activo
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
              >
                {cambiandoEstado ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : activo ? (
                  <FiCheckCircle size={20} />
                ) : (
                  <FiXCircle size={20} />
                )}
                {cambiandoEstado ? 'Cambiando...' : activo ? 'Activo' : 'Inactivo'}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Mis Citas</p>
              <p className="text-4xl font-bold">{citasConMigo.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Mis Pacientes</p>
              <p className="text-4xl font-bold">{pacientesConMigo.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Citas Pendientes</p>
              <p className="text-4xl font-bold">{citasConMigo.filter(c => c.estado === 'pendiente').length}</p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default InicioPsicologo;