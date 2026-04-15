import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import Layout from '../components/common/Layout';
import { useTheme } from '../context/ThemeContext';
import { FiUsers, FiCalendar, FiDollarSign, FiPlus } from 'react-icons/fi';
import CrearPsicologo from '../components/psicologos/CrearPsicologo';

function InicioRecepcionista() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [modalCrearPsi, setModalCrearPsi] = useState(false);
  const [stats, setStats] = useState({
    pacientes: 0,
    citasHoy: 0,
    ingresosHoy: 0,
    psicologos: 0,
  });

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];

      // Pacientes
      const pacientesRes = await axiosInstance.get('/pacientes/pacientes/pacientes/');
      const totalPacientes = pacientesRes.data.length;

      // Citas de hoy usando todas_citas
      const citasRes = await axiosInstance.get('/citas/citas/todas_citas/');
      const citasHoy = citasRes.data.filter(c => c.fecha === hoy).length;

      // Psicólogos
      const psicologosRes = await axiosInstance.get('/psicologos/psicologos/');
      const totalPsicologos = psicologosRes.data.length;

      // Ingresos de hoy usando creada_en
      const facturasRes = await axiosInstance.get('/facturacion/facturas/');
      const ingresosHoy = facturasRes.data
        .filter(f => f.creada_en?.split('T')[0] === hoy && f.estado === 'pagada')
        .reduce((sum, f) => sum + parseFloat(f.total || 0), 0);

      setStats({
        pacientes: totalPacientes,
        citasHoy,
        ingresosHoy,
        psicologos: totalPsicologos,
      });
    } catch (err) {
      console.error('Error cargando stats:', err);
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
              Panel de Recepción
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestiona citas, psicólogos y facturación
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl p-6 shadow-md">
              <FiUsers size={24} className="mb-2" />
              <p className="text-sm opacity-80">Pacientes</p>
              <p className="text-3xl font-bold">{stats.pacientes}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 text-white rounded-xl p-6 shadow-md">
              <FiCalendar size={24} className="mb-2" />
              <p className="text-sm opacity-80">Citas Hoy</p>
              <p className="text-3xl font-bold">{stats.citasHoy}</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-xl p-6 shadow-md">
              <FiDollarSign size={24} className="mb-2" />
              <p className="text-sm opacity-80">Ingresos Hoy</p>
              <p className="text-3xl font-bold">${stats.ingresosHoy.toLocaleString('es-CO')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-xl p-6 shadow-md">
              <FiUsers size={24} className="mb-2" />
              <p className="text-sm opacity-80">Psicólogos</p>
              <p className="text-3xl font-bold">{stats.psicologos}</p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crear Psicólogo */}
            <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl p-6 shadow-md`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-dark'}`}>
                Crear Psicólogo
              </h2>
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Registra un nuevo psicólogo en el sistema
              </p>
              <button
                onClick={() => setModalCrearPsi(true)}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold"
              >
                <FiPlus size={20} />
                Crear Psicólogo
              </button>
            </div>

            {/* Ver Citas */}
            <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl p-6 shadow-md`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-dark'}`}>
                Gestionar Citas
              </h2>
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Ver y administrar todas las citas
              </p>
              <button
                onClick={() => navigate('/citas/recepcion')}
                className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold"
              >
                <FiCalendar size={20} />
                Ver Citas
              </button>
            </div>
          </div>

          {/* Modal */}
          <CrearPsicologo
            isOpen={modalCrearPsi}
            onClose={() => setModalCrearPsi(false)}
            onCreado={cargarStats}
          />
        </div>
      </div>
    </Layout>
  );
}

export default InicioRecepcionista;
