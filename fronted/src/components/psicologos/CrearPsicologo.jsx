import React, { useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { FiX, FiSave } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

function CrearPsicologo({ isOpen, onClose, onCreado }) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nombres: '',
    apellidos: '',
    especialidad: '',
    documento: '',
    telefono: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
  const { name, value } = e.target;
  if (name === 'documento' || name === 'telefono') {
    const soloNumeros = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [name]: soloNumeros }));
    return;
  }
  setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosInstance.post('/usuarios/crear_psicologo/', formData);
      alert('¡Psicólogo creado exitosamente!');
      setFormData({
        username: '',
        email: '',
        nombres: '',
        apellidos: '',
        especialidad: '',
        documento: '',
        telefono: '',
        password: '',
      });
      if (onCreado) onCreado();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Error al crear psicólogo'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto`}>
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Crear Psicólogo</h2>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Usuario */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="usuario_psicologo"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="psicologo@email.com"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                required
              />
            </div>

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-2 block">Nombres</label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Nombres"
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Apellidos</label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Apellidos"
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                  required
                />
              </div>
            </div>

            {/* Especialidad */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Especialidad</label>
              <input
                type="text"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                placeholder="Ej: Psicología Clínica"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
              />
            </div>

            {/* Documento y Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-2 block">Documento</label>
                <input
                  type="text"
                  name="documento"
                  inputMode="numeric"
                  value={formData.documento}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  inputMode="numeric"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="3101234567"
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña segura"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                required
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-2 border-gray-200 text-dark hover:border-primary'}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiSave size={16} />
                {loading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CrearPsicologo;
