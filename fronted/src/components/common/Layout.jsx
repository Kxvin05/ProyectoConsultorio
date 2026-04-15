import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ children }) {
  const { darkMode } = useTheme();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      className={darkMode ? 'bg-gray-900' : 'bg-white'}
    >
      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: '256px', flexShrink: 0, overflowY: 'auto', height: '100%' }}
          className={`hidden md:block border-r shadow-lg ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}
        >
          <Sidebar />
        </aside>
        <main style={{ flex: 1, overflowY: 'auto' }}
          className={darkMode ? 'bg-gray-800 text-white' : 'bg-light'}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;