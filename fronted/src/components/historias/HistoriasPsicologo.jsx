import React, { useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { FiSearch, FiFileText, FiPlus, FiX, FiSave, FiDownload } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../common/Layout';

function HistoriasPsicologo() {
  const { darkMode } = useTheme();
  const [documento, setDocumento] = useState('');
  const [paciente, setPaciente] = useState(null);
  const [historias, setHistorias] = useState([]);
  const [historia, setHistoria] = useState(null);
  const [searching, setSearching] = useState(false);
  const [creando, setCreando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    motivo_consulta: '',
    diagnostico: '',
    tratamiento: '',
    antecedentes_medicos: '',
    alergias: '',
    medicamentos_actuales: '',
    observaciones: '',
  });

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSearching(true);

    if (!documento.trim()) {
      setError('Por favor ingresa un número de documento');
      setSearching(false);
      return;
    }

    try {
      const pacienteResponse = await axiosInstance.get(`/pacientes/pacientes/buscar_por_documento/`, {
        params: { documento }
      });

      const pacienteData = pacienteResponse.data;
      setPaciente(pacienteData);

      try {
        const historiaResponse = await axiosInstance.get(`/historias_clinicas/historias/por_documento/`, {
          params: { documento }
        });

        const data = historiaResponse.data;
        setHistorias(data);
        setHistoria(null);
        setSuccess(data.length > 0 ? 'Historia clínica encontrada' : 'Sin historias registradas');
      } catch {
        setHistorias([]);
        setHistoria(null);
        setFormData({
          motivo_consulta: '',
          diagnostico: '',
          tratamiento: '',
          antecedentes_medicos: '',
          alergias: '',
          medicamentos_actuales: '',
          observaciones: '',
        });
        setSuccess('Paciente encontrado - Sin historia clínica registrada');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Paciente no encontrado');
      setPaciente(null);
      setHistorias([]);
      setHistoria(null);
    } finally {
      setSearching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!paciente) {
      setError('Debe buscar un paciente primero');
      setSaving(false);
      return;
    }

    try {
      await axiosInstance.post(
        '/historias_clinicas/historias/',
        {
          paciente: paciente.id,
          ...formData
        }
      );
      setSuccess('Historia clínica creada correctamente');

      await handleBuscar({ preventDefault: () => {} });

      setCreando(false);
      setFormData({
        motivo_consulta: '',
        diagnostico: '',
        tratamiento: '',
        antecedentes_medicos: '',
        alergias: '',
        medicamentos_actuales: '',
        observaciones: '',
      });

    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar historia clínica');
    } finally {
      setSaving(false);
    }
  };

  const descargarHistoriaPDF = async (h) => {
    if (!h) {
      setError('No hay historia clínica para descargar');
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/historias_clinicas/historias/${h.id}/pdf/`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historia_${paciente.documento}_${h.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch {
      setError('Error al descargar PDF');
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
              📋 Historias Clínicas
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestiona las historias clínicas de tus pacientes
            </p>
          </div>

          {/* Búsqueda */}
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8 mb-8`}>
            <form onSubmit={handleBuscar} className="flex gap-3">
              <div className="flex-1">
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                  Número de Documento del Paciente
                </label>
                <input
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ej: 1234567890"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="self-end flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50"
              >
                <FiSearch size={18} />
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
            </form>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-semibold">❌ Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
              <p className="font-semibold">✅ {success}</p>
            </div>
          )}

          {paciente && (
            <>
              {/* Card Paciente */}
              <div className={`${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700' : 'bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary'} rounded-2xl p-6 mb-8`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                  {paciente.nombres} {paciente.apellidos}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  📄 Documento: <span className="font-semibold">{paciente.documento}</span>
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  📱 Teléfono: <span className="font-semibold">{paciente.telefono || 'No registrado'}</span>
                </p>
              </div>

              {/* Botón Nueva Historia */}
              {!creando && (
                <button
                  onClick={() => {
                    setHistoria(null);
                    setCreando(true);
                    setFormData({
                      motivo_consulta: '',
                      diagnostico: '',
                      tratamiento: '',
                      antecedentes_medicos: '',
                      alergias: '',
                      medicamentos_actuales: '',
                      observaciones: '',
                    });
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold mb-8"
                >
                  <FiPlus size={18} />
                  Nueva Historia Clínica
                </button>
              )}

              {/* Formulario */}
              {creando && (
                <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8 mb-8`}>
                  <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-dark'}`}>
                    ➕ Nueva Historia Clínica
                  </h3>
                  <form onSubmit={handleGuardar} className="space-y-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Motivo de Consulta
                      </label>
                      <textarea name="motivo_consulta" value={formData.motivo_consulta} onChange={handleChange}
                        placeholder="Describe el motivo de la consulta" rows="3"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition resize-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Diagnóstico
                      </label>
                      <textarea name="diagnostico" value={formData.diagnostico} onChange={handleChange}
                        placeholder="Describe el diagnóstico" rows="3"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition resize-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Tratamiento Recomendado
                      </label>
                      <textarea name="tratamiento" value={formData.tratamiento} onChange={handleChange}
                        placeholder="Describe el tratamiento recomendado" rows="3"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition resize-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                          Antecedentes Médicos
                        </label>
                        <textarea name="antecedentes_medicos" value={formData.antecedentes_medicos} onChange={handleChange}
                          placeholder="Antecedentes médicos relevantes" rows="3"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition resize-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                          Alergias
                        </label>
                        <textarea name="alergias" value={formData.alergias} onChange={handleChange}
                          placeholder="Describe las alergias conocidas" rows="3"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition resize-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Medicamentos Actuales
                      </label>
                      <textarea name="medicamentos_actuales" value={formData.medicamentos_actuales} onChange={handleChange}
                        placeholder="Medicamentos que está tomando actualmente" rows="3"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition resize-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Observaciones Adicionales
                      </label>
                      <textarea name="observaciones" value={formData.observaciones} onChange={handleChange}
                        placeholder="Observaciones adicionales importantes" rows="3"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition resize-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                      />
                    </div>

                    <div className={`flex gap-3 justify-end pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button type="button" onClick={() => setCreando(false)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-2 border-gray-200 text-dark hover:border-primary'}`}
                      >
                        <FiX size={16} />
                        Cancelar
                      </button>
                      <button type="submit" disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50"
                      >
                        <FiSave size={18} />
                        {saving ? 'Guardando...' : 'Guardar Historia'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lista de Historias */}
              {!creando && historias.length > 0 && (
                <div className="space-y-6">
                  {historias.map((h, index) => (
                    <div key={h.id} className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8`}>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
                          <FiFileText className="text-secondary" size={24} />
                          Historia #{historias.length - index}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {new Date(h.creada_en).toLocaleDateString('es-CO')}
                          </span>
                          <button onClick={() => descargarHistoriaPDF(h)}
                            className="flex items-center gap-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:shadow-lg transition"
                          >
                            <FiDownload size={14} />
                            Descargar PDF
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>📋 Motivo de Consulta</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{h.motivo_consulta || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>🔍 Diagnóstico</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{h.diagnostico || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>💊 Tratamiento</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{h.tratamiento || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>📜 Antecedentes</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{h.antecedentes_medicos || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>⚠️ Alergias</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{h.alergias || 'Ninguna'}</p>
                        </div>
                        <div>
                          <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>💉 Medicamentos</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{h.medicamentos_actuales || 'Ninguno'}</p>
                        </div>
                      </div>

                      {h.observaciones && (
                        <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>📝 Observaciones</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{h.observaciones}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sin historias */}
              {!creando && historias.length === 0 && paciente && (
                <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-12 text-center`}>
                  <FiFileText size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Este paciente no tiene historias clínicas registradas
                  </p>
                </div>
              )}
            </>
          )}

          {!paciente && (
            <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-12 text-center`}>
              <FiSearch size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Busca un paciente por documento para ver y crear historias clínicas
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default HistoriasPsicologo;