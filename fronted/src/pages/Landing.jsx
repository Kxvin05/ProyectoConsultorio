import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiAward, FiHeart, FiShield } from 'react-icons/fi';
import logoImage from '../assets/images/logo.png';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Landing */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🧠</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Alexandra Pérez
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition"
            >
              Inicia Sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-lg transition"
            >
              Registrarse
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Tu Salud Mental Es Nuestra Prioridad
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Consultorio psicológico profesional con atención personalizada, segura y confidencial.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 bg-white text-primary px-8 py-4 font-bold rounded-lg hover:shadow-lg transition"
              >
                Comenzar Ahora
                <FiArrowRight size={20} />
              </button>
              <button
                onClick={() => document.getElementById('servicios').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary transition"
              >
                Conocer Más
              </button>
            </div>
          </div>
          <div className="text-center">
            <div className="w-64 h-64 bg-white bg-opacity-10 rounded-full mx-auto flex items-center justify-center">
              <span className="text-9xl">🧠</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="servicios" className="py-20 bg-light">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-dark mb-4">Nuestros Servicios</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Ofrecemos servicios psicológicos profesionales adaptados a tus necesidades
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition hover:-translate-y-2">
              <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <FiHeart size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">Consulta Psicológica</h3>
              <p className="text-gray-600 mb-4">
                Atención profesional para diferentes tipos de consultas psicológicas con enfoque personalizado.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <FiCheck className="text-primary" /> Evaluación integral
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FiCheck className="text-primary" /> Plan de tratamiento
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FiCheck className="text-primary" /> Seguimiento continuo
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition hover:-translate-y-2">
              <div className="bg-secondary bg-opacity-10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <FiShield size={32} className="text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">100% Confidencial</h3>
              <p className="text-gray-600 mb-4">
                Tu privacidad es sagrada. Todos tus datos están protegidos con máximos estándares de seguridad.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <FiCheck className="text-secondary" /> Datos encriptados
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FiCheck className="text-secondary" /> Privacidad garantizada
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FiCheck className="text-secondary" /> Cumplimiento legal
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition hover:-translate-y-2">
              <div className="bg-accent bg-opacity-10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <FiAward size={32} className="text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">Profesionales Certificados</h3>
              <p className="text-gray-600 mb-4">
                Equipo de psicólogos con amplia experiencia y certificaciones profesionales.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <FiCheck className="text-accent" /> Psicólogos certificados
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FiCheck className="text-accent" /> Experiencia probada
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <FiCheck className="text-accent" /> Actualizados constantemente
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Por Qué Elegirnos?</h2>
          <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">
            Somos más que un consultorio, somos tu aliado en el camino hacia el bienestar mental
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur">
              <h3 className="text-3xl font-bold mb-2">50+</h3>
              <p>Pacientes Atendidos</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur">
              <h3 className="text-3xl font-bold mb-2">10+</h3>
              <p>Años de Experiencia</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur">
              <h3 className="text-3xl font-bold mb-2">95%</h3>
              <p>Satisfacción</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur">
              <h3 className="text-3xl font-bold mb-2">24/7</h3>
              <p>Soporte disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-light">
        <div className="max-w-4xl mx-auto px-4 text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-4xl font-bold text-dark mb-6">
            ¿Listo para tu transformación?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a cientos de pacientes que ya están mejorando su salud mental con nosotros
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 font-bold text-lg rounded-lg hover:shadow-lg transition flex items-center gap-3 mx-auto"
          >
            Crear Cuenta Gratis
            <FiArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src={logoImage} alt="Alexandra Pérez" className="w-20 h-20 rounded-full object-cover" />
            <h1 className="text-2xl font-bold">Alexandra Pérez</h1>
          </div>
          <p className="text-gray-400 mb-6">
            Consultorio Psicológico Profesional
          </p>
          <p className="text-gray-500 text-sm">
            © 2026 Alexandra Pérez. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;