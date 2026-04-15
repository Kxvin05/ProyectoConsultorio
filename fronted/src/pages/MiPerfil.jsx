import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { FiMail, FiUser, FiEdit2, FiSave, FiX, FiLock } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import { useTheme } from '../context/ThemeContext';

function MiPerfil() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [editingPassword, setEditingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [perfil, setPerfil] = useState(null);

  const [formPassword, setFormPassword] = useState({
    contraseña_actual: '',
    contraseña_nueva: '',
    confirmar_contraseña: '',
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const response = await axiosInstance.get('/usuarios/mi_perfil/');
      setPerfil(response.data);
    } catch (err) {
      setError('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    setFormPassword(prev => ({ ...prev, [name]: value }));
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formPassword.contraseña_nueva !== formPassword.confirmar_contraseña) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formPassword.contraseña_nueva.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres');
      return;
    }

    setSaving(true);

    try {
      await axiosInstance.post('/usuarios/cambiar-contrasena/', {
        contraseña_actual: formPassword.contraseña_actual,
        contraseña_nueva: formPassword.contraseña_nueva,
      });
      setSuccess('Contraseña cambiada correctamente');
      setEditingPassword(false);
      setFormPassword({
        contraseña_actual: '',
        contraseña_nueva: '',
        confirmar_contraseña: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando perfil...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
              Mi Perfil
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Información de tu cuenta
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
              <p className="font-semibold">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 h-fit`}>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="text-5xl">👤</span>
                </div>
                <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>
                  {perfil?.nombres ? `${perfil.nombres} ${perfil.apellidos}` : perfil?.username}
                </h2>
                <p className={`text-sm font-semibold capitalize mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {perfil?.rol}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-dark'}`}>
                  Información de Cuenta
                </h3>

                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <FiUser size={14} /> Usuario
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                      {perfil?.username}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <FiMail size={14} /> Email
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                      {perfil?.email}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <FiUser size={14} /> Rol
                    </p>
                    <p className={`text-lg font-bold capitalize ${darkMode ? 'text-white' : 'text-dark'}`}>
                      {perfil?.rol}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
                    <FiLock size={20} className="text-primary" />
                    Seguridad
                  </h3>
                  {!editingPassword && (
                    <button
                      onClick={() => setEditingPassword(true)}
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold"
                    >
                      <FiEdit2 size={16} />
                      Cambiar Contraseña
                    </button>
                  )}
                </div>

                {editingPassword ? (
                  <form onSubmit={handleCambiarPassword} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        name="contraseña_actual"
                        value={formPassword.contraseña_actual}
                        onChange={handleChangePassword}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        name="contraseña_nueva"
                        value={formPassword.contraseña_nueva}
                        onChange={handleChangePassword}
                        placeholder="Mínimo 8 caracteres"
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        name="confirmar_contraseña"
                        value={formPassword.confirmar_contraseña}
                        onChange={handleChangePassword}
                        placeholder="Repite tu contraseña"
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        required
                      />
                    </div>

                    <div className={`flex gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPassword(false);
                          setFormPassword({
                            contraseña_actual: '',
                            contraseña_nueva: '',
                            confirmar_contraseña: '',
                          });
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-2 border-gray-200 text-dark hover:border-primary'}`}
                      >
                        <FiX size={16} />
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50"
                      >
                        <FiSave size={16} />
                        {saving ? 'Guardando...' : 'Cambiar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      ✓ Tu contraseña está protegida
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default MiPerfil;