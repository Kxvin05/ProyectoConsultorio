import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import axios from 'axios';
import { FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';

function RecuperarPassword() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    codigo: '',
    password_nueva: '',
    password_confirmar: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const solicitarCodigo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {

      // 👇 USAMOS AXIOS NORMAL PARA QUE NO ENVÍE TOKEN
      await axios.post('http://localhost:8000/api/usuarios/recuperar_password/', {
        email: formData.email
      });

      setSuccess('Código enviado a tu email');
      setPaso(2);

    } catch (err) {

      setError(err.response?.data?.error || 'Error al enviar código');

    } finally {
      setLoading(false);
    }
  };

const verificarCodigo = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (formData.password_nueva !== formData.password_confirmar) {
    setError('Las contraseñas no coinciden');
    return;
  }

  setLoading(true);

  try {
    // ✅ axios normal (sin token) y endpoint correcto
    await axios.post('http://localhost:8000/api/usuarios/restablecer_password/', {
      email: formData.email,
      codigo: formData.codigo,
      password_nueva: formData.password_nueva   // ← debe ser password_nueva
});
    setSuccess('Contraseña cambiada correctamente');
    setTimeout(() => navigate('/login'), 2000);

  } catch (err) {
    setError(err.response?.data?.error || 'Error al cambiar contraseña');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Alexandra Pérez</h1>
          <p className="text-gray-600">Psicóloga Clínica</p>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-primary hover:text-secondary mb-6 font-semibold transition"
        >
          <FiArrowLeft size={18} />
          Volver al login
        </button>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        {paso === 1 && (
          <div>

            <h2 className="text-2xl font-bold text-center text-dark mb-6">
              Recuperar Contraseña
            </h2>

            <form onSubmit={solicitarCodigo} className="space-y-4">

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                  <FiMail className="text-primary" />
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="tu@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  required
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
              </button>

            </form>

            <p className="text-center text-gray-600 text-sm mt-4">
              Ingresa tu email y recibirás un código de 6 dígitos
            </p>

          </div>
        )}

        {paso === 2 && (
          <div>

            <h2 className="text-2xl font-bold text-center text-dark mb-6">
              Verificar Código
            </h2>

            <form onSubmit={verificarCodigo} className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100"
                />

              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Código de 6 dígitos
                </label>

                <input
                  type="text"
                  name="codigo"
                  placeholder="123456"
                  value={formData.codigo}
                  onChange={handleChange}
                  maxLength="6"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary text-center text-2xl tracking-widest"
                  required
                />

              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                  <FiLock className="text-primary" />
                  Nueva Contraseña
                </label>

                <input
                  type="password"
                  name="password_nueva"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password_nueva}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  required
                />

              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                  <FiLock className="text-primary" />
                  Confirmar Contraseña
                </label>

                <input
                  type="password"
                  name="password_confirmar"
                  placeholder="Confirma tu contraseña"
                  value={formData.password_confirmar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  required
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>

            </form>

          </div>
        )}
      </div>
    </div>
  );
}

export default RecuperarPassword;