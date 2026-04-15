import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import Layout from '../common/Layout';
import { useTheme } from '../../context/ThemeContext';
import { FiFileText, FiActivity, FiUser, FiHeart, FiAlertCircle, FiClipboard, FiDownload } from 'react-icons/fi';

function HistoriaPaciente() {
  const { darkMode } = useTheme();
  const [historias, setHistorias] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarHistoria();
  }, []);

  const cargarHistoria = async () => {
    try {
      const [historiasRes, perfilRes] = await Promise.all([
        axiosInstance.get('/historias_clinicas/historias/'),
        axiosInstance.get('/usuarios/mi_perfil/'),
      ]);

      setHistorias(historiasRes.data || []);

      const perfil = perfilRes.data;
      setPaciente({
        nombres: perfil.nombres,
        apellidos: perfil.apellidos,
        documento: perfil.documento,
        telefono: perfil.telefono,
      });

    } catch (err) {
      setError('Error al cargar la historia clínica');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO');
  };

  const descargarPDF = async (historia, index) => {
    try {
      const response = await axiosInstance.get(
        `/historias_clinicas/historias/${historia.id}/pdf/`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `historia_clinica_${index + 1}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      setError('Error al descargar el PDF');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando historia clínica...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
              📋 Mi Historia Clínica
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tu historial médico registrado por el consultorio
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Card Paciente */}
          {paciente && (
            <div className={`${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700' : 'bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary'} rounded-2xl p-6 mb-8`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-primary bg-opacity-20'}`}>
                  <FiUser className="text-primary" size={28} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                    {paciente.nombres} {paciente.apellidos}
                  </h2>
                  {paciente.documento && (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Documento: <span className="font-semibold">{paciente.documento}</span>
                    </p>
                  )}
                  {paciente.telefono && (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Teléfono: <span className="font-semibold">{paciente.telefono}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Historias */}
          {historias.length > 0 ? (
            <div className="space-y-6">
              {historias.map((historia, index) => (
                <div
                  key={historia.id}
                  className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-md p-6`}
                >
                  {/* Header de la historia */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <FiFileText className="text-primary" size={22} />
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                        Historia #{index + 1}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatearFecha(historia.fecha_creacion || historia.created_at)}
                      </span>
                      <button
                        onClick={() => descargarPDF(historia, index)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold text-sm"
                      >
                        <FiDownload size={15} />
                        Descargar PDF
                      </button>
                    </div>
                  </div>

                  {/* Campos en grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FiClipboard size={13} /> Motivo de Consulta
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {historia.motivo_consulta || 'No registrado'}
                      </p>
                    </div>

                    <div>
                      <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FiActivity size={13} /> Diagnóstico
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {historia.diagnostico || 'No registrado'}
                      </p>
                    </div>

                    <div>
                      <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FiHeart size={13} /> Tratamiento
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {historia.tratamiento || 'No registrado'}
                      </p>
                    </div>

                    <div>
                      <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📜 Antecedentes
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {historia.antecedentes_medicos || 'No registrado'}
                      </p>
                    </div>

                    <div>
                      <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FiAlertCircle size={13} /> Alergias
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {historia.alergias || 'Ninguna registrada'}
                      </p>
                    </div>

                    <div>
                      <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        💊 Medicamentos
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {historia.medicamentos_actuales || 'Ninguno registrado'}
                      </p>
                    </div>
                  </div>

                  {/* Observaciones */}
                  {historia.observaciones && (
                    <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <p className={`text-xs font-bold uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📝 Observaciones
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {historia.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-md p-16 text-center`}>
              <FiFileText size={56} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sin historia clínica
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Tu historia clínica será creada por el médico en tu próxima consulta
              </p>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

export default HistoriaPaciente;