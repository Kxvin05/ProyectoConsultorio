import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../api/axiosConfig';
import Layout from '../common/Layout';
import { FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function CitasRecepcion() {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [citasData, setCitasData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      const citasResponse = await axiosInstance.get('/citas/citas/todas_citas/');
      setCitasData(citasResponse.data);

      const statsResponse = await axiosInstance.get('/citas/citas/resumen_estado/');
      
      const citasPorMes = procesarCitasPorMes(citasResponse.data);
      
      setStats({
        resumen: statsResponse.data,
        citasPorMes: citasPorMes,
        citasResponse: citasResponse.data
      });
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const procesarCitasPorMes = (citas) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const datos = {};

    meses.forEach(mes => {
      datos[mes] = 0;
    });

    citas.forEach(cita => {
      const fecha = new Date(cita.fecha);
      const mes = meses[fecha.getMonth()];
      datos[mes]++;
    });

    return Object.entries(datos).map(([mes, cantidad]) => ({
      name: mes,
      citas: cantidad
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando citas...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const totalCitas = citasData.length;
  const citasProximas = citasData.filter(c => new Date(c.fecha) > new Date()).length;
  const citasCompletadas = citasData.filter(c => c.estado === 'atendida').length;
  const citasPendientes = citasData.filter(c => c.estado === 'pendiente').length;

  const COLORS = ['#b388d1', '#4ecdc4', '#ff69b4', '#ffd93d'];

  const datosEstado = stats?.resumen?.map((item, index) => ({
    name: item.estado.charAt(0).toUpperCase() + item.estado.slice(1),
    value: item.cantidad,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <Layout>
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>
              Gestión de Citas
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Vista general de todas las citas del sistema
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="group relative bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm font-semibold mb-2">Total de Citas</p>
                  <p className="text-4xl font-bold text-white">{totalCitas}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-4 rounded-xl group-hover:bg-opacity-30 transition">
                  <FiCalendar size={36} className="text-white" />
                </div>
              </div>
            </div>
        
            <div className="group relative bg-gradient-to-br from-secondary to-accent rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm font-semibold mb-2">Próximas Citas</p>
                  <p className="text-4xl font-bold text-white">{citasProximas}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-4 rounded-xl group-hover:bg-opacity-30 transition">
                  <FiClock size={36} className="text-white" />
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm font-semibold mb-2">Completadas</p>
                  <p className="text-4xl font-bold text-white">{citasCompletadas}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-4 rounded-xl group-hover:bg-opacity-30 transition">
                  <FiCheckCircle size={36} className="text-white" />
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80 text-sm font-semibold mb-2">Pendientes</p>
                  <p className="text-4xl font-bold text-white">{citasPendientes}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-4 rounded-xl group-hover:bg-opacity-30 transition">
                  <FiClock size={36} className="text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Línea */}
            <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-dark'}`}>
                Citas por Mes
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.citasPorMes || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#fff',
                      border: `2px solid #b388d1`,
                      borderRadius: '8px',
                      color: darkMode ? '#fff' : '#000'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="citas" 
                    stroke="#b388d1" 
                    strokeWidth={3}
                    dot={{ fill: '#b388d1', r: 5 }}
                    name="Citas Agendadas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Pastel */}
            <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-dark'}`}>
                Estado de Citas
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#fff',
                      border: '2px solid #b388d1',
                      borderRadius: '8px',
                      color: darkMode ? '#fff' : '#000'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Todas las Citas */}
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-dark'}`}>
              Todas las Citas del Sistema
            </h3>
            
            {citasData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Paciente</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Fecha</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Hora</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Psicólogo</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Estado</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasData.map(cita => (
                      <tr key={cita.id} className={`border-b transition ${darkMode ? 'hover:bg-gray-800 border-gray-700' : 'hover:bg-gray-50 border-gray-200'}`}>
                        <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-white' : 'text-dark'}`}>
                          {cita.paciente_nombre || '-'}
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {new Date(cita.fecha).toLocaleDateString('es-CO')}
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {cita.hora}
                        </td>
                        <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-white' : 'text-dark'}`}>
                          {cita.psicologo_nombre || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                            cita.estado === 'atendida' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {cita.estado}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm truncate max-w-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {cita.motivo || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>No hay citas registradas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CitasRecepcion;