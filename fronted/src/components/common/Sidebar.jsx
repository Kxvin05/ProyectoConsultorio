import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiHome, FiUsers, FiCalendar, FiFileText, FiDollarSign, FiUser, FiMenu, FiX } from 'react-icons/fi';

function Sidebar() {
  const location = useLocation();
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(false);

  const rol = localStorage.getItem('rol');

  const menuPaciente = [
    { icon: FiHome, label: 'Inicio', path: '/dashboard' },
    { icon: FiUsers, label: 'Psicólogos', path: '/psicologos' },
    { icon: FiCalendar, label: 'Agendar Cita', path: '/citas/agendar' },
    { icon: FiCalendar, label: 'Mis Citas', path: '/citas' },
    { icon: FiCalendar, label: 'Calendario', path: '/calendario' },
    { icon: FiDollarSign, label: 'Facturas', path: '/facturas' },
    { icon: FiFileText, label: 'Historias', path: '/historia' }, 
    { icon: FiUser, label: 'Mi Perfil', path: '/perfil' },
  ];

  const menuRecepcion = [
    { icon: FiHome, label: 'Inicio', path: '/dashboard' },
    { icon: FiCalendar, label: 'Resumen Citas', path: '/citas/recepcion' },
    { icon: FiUsers, label: 'Resumen Psicólogos', path: '/psicologos/recepcion' },
    { icon: FiDollarSign, label: 'Facturas', path: '/facturas' },
    { icon: FiUsers, label: 'Pacientes', path: '/pacientes' },
  ];

  const menuPsicologo = [
    { icon: FiHome, label: 'Inicio', path: '/dashboard' },
    { icon: FiCalendar, label: 'Resumen Citas', path: '/citas/psicologo' },
    { icon: FiFileText, label: 'Historias', path: '/historias/psicologo' },
    { icon: FiUsers, label: 'Pacientes', path: '/pacientes/psicologo' },
  ];

  const menuItems = rol === 'recepcion' ? menuRecepcion : rol === 'psicologo' ? menuPsicologo : menuPaciente;

  return (
    <>
      {/* Nav Desktop — dentro del aside de Layout */}
      <nav className="p-4 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-dark hover:bg-gray-100'}`
              }`}
            >
              <Icon size={20} />
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botón Mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setOpen(!open)}
          className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition"
        >
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Nav Mobile desplegable */}
      {open && (
        <aside className={`md:hidden fixed left-0 top-0 w-64 h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg z-30 overflow-y-auto`}>
          <nav className="p-4 space-y-2 mt-16">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : `${darkMode ? 'text-gray-300' : 'text-dark'}`
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}
    </>
  );
}

export default Sidebar;
