import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import { FiCalendar, FiClock, FiUser, FiFileText, FiArrowRight, FiCheck } from 'react-icons/fi';
import Layout from '../common/Layout';
import { useTheme } from '../../context/ThemeContext';

function AgendarCita() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [horasOcupadas, setHorasOcupadas] = useState([]); 
  const [horasDisponibles, setHorasDisponibles] = useState([]); 

  const [formData, setFormData] = useState({
    psicologo: '',
    fecha: '',
    hora: '',
    motivo: '',
  });

  useEffect(() => {
    cargarPsicologos();
  }, []);

  useEffect(() => {
    cargarHorasOcupadas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.psicologo, formData.fecha]);

  const cargarPsicologos = async () => {
    try {
      const response = await axiosInstance.get('/psicologos/psicologos/');
      setPsicologos(response.data);
    } catch (err) {
      setError('Error al cargar psicólogos');
    } finally {
      setLoading(false);
    }
  };

  const cargarHorasOcupadas = async () => {
    if (!formData.psicologo || !formData.fecha) {
      setHorasOcupadas([]);
      setHorasDisponibles([]);
      return;
    }

    try {
      // Obtener horas disponibles del endpoint
      const response = await axiosInstance.get('/citas/citas/horas_disponibles/', {
        params: {
          psicologo: formData.psicologo,
          fecha: formData.fecha
        }
      });

      setHorasDisponibles(response.data);
      
      // Obtener todas las citas del psicólogo ese día
      const citasResponse = await axiosInstance.get('/citas/citas/agenda/', {
        params: {
          psicologo: formData.psicologo,
          fecha: formData.fecha
        }
      });

      const ocupadas = citasResponse.data.map(cita => cita.hora);
      setHorasOcupadas(ocupadas);
    } catch (err) {
      console.error('Error cargando horas:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('🔍 DEBUG - formData:', formData);
    console.log('🔍 DEBUG - psicologo valor:', formData.psicologo);
    console.log('🔍 DEBUG - psicologo convertido:', Number(formData.psicologo));

    // Si psicologo es 0 o NaN, detén aquí
    if (!formData.psicologo || Number(formData.psicologo) === 0 || isNaN(Number(formData.psicologo))) {
      setError("Por favor selecciona un psicólogo válido");
      setSubmitting(false);
      return;
    }

    // validar que la fecha sea futura
    const fechaSeleccionada = new Date(formData.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      setError("No puedes agendar citas en fechas pasadas");
      return;
    }

    // validar que el motivo tenga minimo 10 caracteres
    if (formData.motivo.trim().length < 10) {
      setError("El motivo debe tener mínimo 10 caracteres");
      return;
    }

    // Verificar si hay cita pendiente
    try {
      const citasActuales = await axiosInstance.get('/citas/citas/mis_citas/');
      const citasPendientes = citasActuales.data.filter(
        c => c.estado === 'pendiente' || c.estado === 'confirmada'
      );

      if (citasPendientes.length > 0) {
        setError('⚠️ Ya tienes una cita pendiente o confirmada. Complétala o cancélala antes de agendar otra.');
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('Error verificando citas:', err);
      setError('Error al verificar tus citas');
      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    try {
      await axiosInstance.post('/citas/citas/', {
        psicologo: Number(formData.psicologo),
        fecha: formData.fecha,
        hora: formData.hora,
        motivo: formData.motivo.trim(),
      });

      setSuccess("¡Cita agendada exitosamente!");
      setTimeout(() => {
        navigate('/citas');
      }, 2000);
    } catch (err) {
      console.error('❌ Error detallado:', JSON.stringify(err.response?.data));
      
      const errorMsg = err.response?.data?.detail ||
                       err.response?.data?.non_field_errors?.[0] ||
                       err.response?.data?.psicologo?.[0] ||
                       err.response?.data?.fecha?.[0] ||
                       err.response?.data?.hora?.[0] ||
                       err.response?.data?.motivo?.[0] ||
                       JSON.stringify(err.response?.data) ||
                       "Error al agendar cita";
      
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
              Agendar una Cita
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Selecciona un psicólogo y elige tu fecha y hora disponible
            </p>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-slideInLeft">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 animate-slideInLeft flex items-center gap-2">
              <FiCheck size={20} />
              <p className="font-semibold">{success}</p>
            </div>
          )}

          {/* Card Principal */}
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleccionar Psicólogo */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-primary bg-opacity-10'}`}>
                    <FiUser className="text-primary" size={18} />
                  </div>
                  Psicólogo
                </label>
                <select
                  name="psicologo"
                  value={formData.psicologo}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}`}
                  required
                >
                  <option key="empty" value="">-- Selecciona un psicólogo --</option>
                  {psicologos.map(psi => {
                    return (
                      <option key={`psi-${psi.id}`} value={psi.id}>
                        {psi.nombres} {psi.apellidos} - {psi.especialidad}
                      </option>
                    );
                  })}
                </select>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Selecciona el psicólogo con el que deseas agendar tu cita
                </p>
              </div>

              {/* Grid Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-secondary bg-opacity-10'}`}>
                      <FiCalendar className="text-secondary" size={18} />
                    </div>
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}`}
                    required
                  />
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Selecciona la fecha deseada
                  </p>
                </div>

                {/* Hora */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-accent bg-opacity-10'}`}>
                      <FiClock className="text-accent" size={18} />
                    </div>
                    Hora
                  </label>
                  
                  {/* Mostrar horas disponibles */}
                  {formData.psicologo && formData.fecha && (
                    <div className={`mb-3 p-3 rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-200'}`}>
                      <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-blue-900'}`}>
                        📅 Horas disponibles:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {horasDisponibles.length > 0 ? (
                          horasDisponibles.map(hora => (
                            <button
                              key={hora}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, hora }))}
                              className={`px-2 py-2 rounded text-xs font-semibold transition ${
                                formData.hora === hora
                                  ? 'bg-green-500 text-white'
                                  : horasOcupadas.includes(hora)
                                  ? 'bg-red-200 text-red-800 cursor-not-allowed'
                                  : `${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white border border-blue-300 hover:bg-blue-100'}`
                              }`}
                              disabled={horasOcupadas.includes(hora)}
                            >
                              {hora}
                            </button>
                          ))
                        ) : (
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No hay horas disponibles
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-20 transition ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}`}
                    required
                  />
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    🔴 Rojo = Ocupado | 🟢 Verde = Tu selección | ⚪ Blanco = Disponible
                  </p>
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-primary bg-opacity-10'}`}>
                    <FiFileText className="text-primary" size={18} />
                  </div>
                  Motivo de la Consulta
                </label>
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  rows="4"
                  className={`w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition resize-none ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}`}
                  required
                />
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Máximo 500 caracteres
                </p>
              </div>

              {/* Resumen */}
              {formData.psicologo && formData.fecha && formData.hora && (
                <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20'}`}>
                  <p className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    📋 Resumen de tu cita:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className={darkMode ? 'text-gray-300' : 'text-dark'}>
                      <span className="font-semibold">Psicólogo:</span> {psicologos.find(p => p.psicologo_id === parseInt(formData.psicologo))?.nombres} {psicologos.find(p => p.psicologo_id === parseInt(formData.psicologo))?.apellidos}
                    </p>
                    <p className={darkMode ? 'text-gray-300' : 'text-dark'}>
                      <span className="font-semibold">Fecha:</span> {new Date(formData.fecha).toLocaleDateString('es-CO')}
                    </p>
                    <p className={darkMode ? 'text-gray-300' : 'text-dark'}>
                      <span className="font-semibold">Hora:</span> {formData.hora}
                    </p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4 pt-6 border-t" style={{borderColor: darkMode ? '#374151' : '#e5e7eb'}}>
                <button
                  type="button"
                  onClick={() => navigate('/psicologos')}
                  className={`flex-1 px-6 py-4 border-2 font-bold rounded-xl transition transform hover:scale-105 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-dark hover:bg-gray-50'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold px-6 py-4 rounded-xl hover:shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Agendando...
                    </>
                  ) : (
                    <>
                      Agendar Cita
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className={`mt-8 p-6 rounded-lg border-l-4 border-blue-500 ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-blue-50 text-blue-900'}`}>
            <h3 className="font-bold mb-2">💡 Importante</h3>
            <ul className="text-sm space-y-1">
              <li>✓ Asegúrate de seleccionar una fecha y hora disponible</li>
              <li>✓ Recibirás una confirmación por correo electrónico</li>
              <li>✓ Puedes cambiar o cancelar tu cita 24 horas antes</li>
              <li>✓ Se recomienda llegar 10 minutos antes de la cita</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AgendarCita;