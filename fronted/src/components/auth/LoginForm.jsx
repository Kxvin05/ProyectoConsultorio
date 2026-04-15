import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import logoImage from '../../assets/images/logo.png';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
 
function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rol: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
 
    if (!formData.rol) {
      setError('Por favor selecciona tu rol antes de continuar');
      return;
    }
 
    setLoading(true);
 
    try {
      const response = await axiosInstance.post('/usuarios/usuarios/login/', {
        username: formData.username,
        password: formData.password,
      });
 
      const rolReal = response.data.rol;
 
      // ✅ Verificar que el rol seleccionado coincida con el rol real
      if (formData.rol !== rolReal) {
        const nombreRol = {
          paciente: 'Paciente',
          psicologo: 'Psicólogo',
          recepcion: 'Recepcionista',
          admin: 'Administrador',
        };
        setError(
          `Tu cuenta no tiene el rol de ${nombreRol[formData.rol] || formData.rol}. ` +
          `Tu rol asignado es: ${nombreRol[rolReal] || rolReal}.`
        );
        setLoading(false);
        return;
      }
 
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('userId', response.data.user_id);
      localStorage.setItem('rol', response.data.rol);
 
      setTimeout(() => {
        if (response.data.rol === 'recepcion') {
          navigate('/dashboard/recepcion');
        } else {
          navigate('/dashboard');
        }
      }, 100);
 
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };
 
  const roles = [
    { value: 'paciente', label: '👤 Paciente', color: 'from-blue-400 to-blue-500' },
    { value: 'psicologo', label: '👨‍⚕️ Psicólogo', color: 'from-green-400 to-green-500' },
    { value: 'recepcion', label: '📞 Recepcionista', color: 'from-purple-400 to-purple-500' },
  ];
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Botón Volver */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 bg-white text-primary font-bold px-6 py-2 rounded-lg hover:shadow-lg transition z-50 hover:scale-105"
      >
        ← Volver
      </button>
 
      {/* Elementos decorativos */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
 
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 text-center">
            <img src={logoImage} alt="Alexandra Pérez" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
            <h1 className="text-3xl font-bold mb-2">Alexandra Pérez</h1>
            <p className="text-sm opacity-90">Psicóloga Clínica</p>
          </div>
 
          <div className="p-8">
            <h2 className="text-2xl font-bold text-dark mb-2 text-center">Bienvenido</h2>
            <p className="text-center text-gray-600 text-sm mb-6">
              Selecciona tu rol e inicia sesión
            </p>
 
            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 animate-slideInLeft">
                <p className="font-semibold text-sm">{error}</p>
              </div>
            )}
 
            <form onSubmit={handleSubmit} className="space-y-4">
 
              {/* Selector de Rol */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-3">
                  <FiUser className="text-primary" size={18} />
                  ¿Con qué rol ingresas?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map(rol => (
                    <button
                      key={rol.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rol: rol.value }))}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition transform hover:scale-105 border-2 ${
                        formData.rol === rol.value
                          ? `bg-gradient-to-r ${rol.color} text-white border-transparent shadow-lg`
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                      }`}
                    >
                      {rol.label}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                  <FiMail className="text-primary" size={18} />
                  Usuario
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition bg-gray-50 hover:bg-white"
                  required
                />
              </div>
 
              {/* Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                  <FiLock className="text-primary" size={18} />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition bg-gray-50 hover:bg-white pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-primary transition"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
 
              {/* Botón Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>
 
            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-500 text-xs">O</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
 
            {/* Enlaces */}
            <div className="space-y-3 text-center text-sm">
              <p className="text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline">
                  Regístrate aquí
                </Link>
              </p>
              <Link to="/recuperar-password" className="text-secondary font-bold hover:underline block">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
 
          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-600 border-t">
            <p>Tu privacidad y seguridad son nuestra prioridad</p>
          </div>
        </div>
 
        {/* Info cards */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg p-4 text-center hover:bg-opacity-30 transition">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs font-semibold">Seguro</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg p-4 text-center hover:bg-opacity-30 transition">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-xs font-semibold">Rápido</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg p-4 text-center hover:bg-opacity-30 transition">
            <div className="text-2xl mb-2">🔐</div>
            <p className="text-xs font-semibold">Privado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default LoginForm;