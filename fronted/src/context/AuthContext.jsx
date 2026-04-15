import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access');
    
    if (token) {
      axiosInstance
        .get('/usuarios/mi_perfil/')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('rol', res.data.rol);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/usuarios/login/', {
        username,
        password,
      });

      const { access, refresh, rol, user_id, username: uname } = response.data;

      if (!access) return false;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('rol', rol);
      localStorage.setItem('userId', user_id);
      localStorage.setItem('username', uname);

      const userRes = await axiosInstance.get('/usuarios/mi_perfil/');
      setUser(userRes.data);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error('Error en login:', error.response?.data || error.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/usuarios/registro_paciente/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
