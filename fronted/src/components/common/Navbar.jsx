import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { FiLogOut, FiMenu, FiX, FiMoon, FiSun, FiArrowLeft } from 'react-icons/fi';
import NotificacionBell from '../notificaciones/NotificacionBell';
import logoImage from '../../assets/images/logo.png';

function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Verificar si hay token aunque user aún no haya cargado
  const estaAutenticado = user || localStorage.getItem('access');

  return (
    <nav className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-r from-primary to-secondary'} text-white shadow-lg border-b`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="Alexandra Pérez" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-xl font-bold">Alexandra Pérez</h1>
        </div>

        {/* Menu Desktop */}
        {estaAutenticado && (
          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm">
              Bienvenido,{user?.username || localStorage.getItem('username') || '...'}
            </span>
            <NotificacionBell />
            <button
              onClick={toggleDarkMode}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
              title="Cambiar tema"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={() => navigate('/')}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
              title="Volver al inicio"
            >
              <FiArrowLeft size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition"
            >
              <FiLogOut size={18} />
              Salir
            </button>
          </div>
        )}

        {/* Menu Mobile */}
        {estaAutenticado && (
          <div className="md:hidden flex items-center gap-4">
            <NotificacionBell />
            <button
              onClick={toggleDarkMode}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={() => navigate('/')}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
            >
              <FiArrowLeft size={20} />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu desplegable */}
      {menuOpen && estaAutenticado && (
        <div className={`md:hidden ${darkMode ? 'bg-gray-800' : 'bg-primary'} bg-opacity-90 p-4 space-y-3`}>
          <p className="text-sm">
            Usuario: {user?.username || localStorage.getItem('username')}
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition"
          >
            <FiLogOut size={18} />
            Salir
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;