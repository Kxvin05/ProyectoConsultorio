import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import logoImage from '../../assets/images/logo.png';
import { FiUser, FiMail, FiLock, FiPhone, FiFileText, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    nombres: '',
    apellidos: '',
    tipo_documento: '',  
    documento: '',
    telefono: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'documento' || name === 'telefono') {
      const soloNumeros = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: soloNumeros }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.tipo_documento) { 
      setError('Selecciona un tipo de documento');
      return;
    }

    if (!/^\d+$/.test(formData.documento)) {
      setError('El documento solo debe contener números');
      return;
    }

    if (formData.telefono && !/^\d+$/.test(formData.telefono)) {
      setError('El teléfono solo debe contener números');
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/usuarios/registro_paciente/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        rol: 'paciente',
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        tipo_documento: formData.tipo_documento,  
        documento: formData.documento,
        telefono: formData.telefono,
      });
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Error al registrarse'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4 relative overflow-hidden">
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 bg-white text-primary font-bold px-6 py-2 rounded-lg hover:shadow-lg transition z-50 hover:scale-105"
      >
        ← Volver
      </button>

      <div className="absolute top-10 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 text-center">
            <img src={logoImage} alt="Alexandra Pérez" className="w-20 h-20 rounded-full object-cover" />
            <h1 className="text-3xl font-bold mb-2">Alexandra Pérez</h1>
            <p className="text-sm opacity-90">Crea tu cuenta como Paciente</p>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-dark mb-2">Únete a nosotros</h2>
            <p className="text-gray-600 text-sm mb-6">Completa el formulario para crear tu cuenta</p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                <p className="font-semibold text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                    <FiUser size={16} className="text-primary" />
                    Nombres
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                    <FiUser size={16} className="text-primary" />
                    Apellidos
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    placeholder="Tus apellidos"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
                    required
                  />
                </div>

                {/*campo Tipo de Documento */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                    <FiFileText size={16} className="text-primary" />
                    Tipo de Documento
                  </label>
                  <select
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Cedula de extranjeria">Cédula de extranjería</option>
                    <option value="Cedula de ciudadania">Cédula de ciudadanía</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                    <FiFileText size={16} className="text-primary" />
                    Documento
                  </label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    placeholder="1234567890"
                    inputMode="numeric"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Solo números</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                    <FiPhone size={16} className="text-primary" />
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="3101234567"
                    inputMode="numeric"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Solo números</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                  <FiUser size={16} className="text-primary" />
                  Usuario
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="tu_usuario"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                  <FiMail size={16} className="text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                    <FiLock size={16} className="text-primary" />
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-primary"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                    <FiLock size={16} className="text-primary" />
                    Confirmar
                  </label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg transition hover:scale-105 disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    Crear Cuenta
                    <FiArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-600 border-t">
            <p>Al registrarte aceptas nuestros términos y condiciones</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;