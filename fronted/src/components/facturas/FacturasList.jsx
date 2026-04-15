import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { FiDownload, FiFileText, FiSearch, FiPlus, FiX, FiSave } from 'react-icons/fi';
import Layout from '../common/Layout';
import { useTheme } from '../../context/ThemeContext';

function FacturasList() {
  const { darkMode } = useTheme();
  const rol = localStorage.getItem('rol');

  return (
    <Layout>
      {rol === 'recepcion' ? (
        <FacturasRecepcion darkMode={darkMode} />
      ) : (
        <FacturasPaciente darkMode={darkMode} />
      )}
    </Layout>
  );
}

// =============================================
// VISTA PACIENTE
// =============================================
function FacturasPaciente({ darkMode }) {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      const response = await axiosInstance.get('/facturacion/facturas/');
      setFacturas(response.data);
    } catch (err) {
      setError('Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = async (facturaId) => {
    try {
      const response = await axiosInstance.get(`/facturacion/facturas/${facturaId}/pdf/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura_${facturaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al descargar la factura');
    }
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'pagada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPendiente = facturas.filter(f => f.estado === 'pendiente').reduce((sum, f) => sum + parseFloat(f.total || 0), 0);
  const totalPagado = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + parseFloat(f.total || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando facturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>💰 Mis Facturas</h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aquí puedes ver y descargar tus facturas</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {facturas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Total Facturas</p>
              <p className="text-4xl font-bold">{facturas.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Pendiente</p>
              <p className="text-3xl font-bold">${totalPendiente.toLocaleString('es-CO')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
              <p className="opacity-80 text-sm font-semibold mb-2">Pagado</p>
              <p className="text-3xl font-bold">${totalPagado.toLocaleString('es-CO')}</p>
            </div>
          </div>
        )}

        {facturas.length > 0 ? (
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}># Factura</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Fecha</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Descripción</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Total</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Estado</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((factura, index) => (
                    <tr key={factura.id || factura.factura_id || index} className={`border-b transition ${darkMode ? 'hover:bg-gray-800 border-gray-700' : 'hover:bg-gray-50 border-gray-200'}`}>
                      <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>#{factura.factura_id || factura.id}</td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {factura.creada_en ? new Date(factura.creada_en).toLocaleDateString('es-CO') : '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{factura.descripcion || '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">
                        ${parseFloat(factura.total || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getEstadoStyle(factura.estado)}`}>{factura.estado}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => descargarPDF(factura.factura_id || factura.id)}
                          className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold text-xs"
                        >
                          <FiDownload size={14} />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-12 text-center`}>
            <FiFileText size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No tienes facturas registradas aún</p>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// VISTA RECEPCIÓN
// =============================================
function FacturasRecepcion({ darkMode }) {
  const [documento, setDocumento] = useState('');
  const [paciente, setPaciente] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creando, setCreando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    descripcion: '',
    total: '',
    estado_pago: 'pendiente',
    forma_pago: 'efectivo',
  });

  const formasPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta de Credito' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
  ];

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'pagada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSearching(true);

    if (!documento.trim()) {
      setError('Por favor ingresa un número de documento');
      setSearching(false);
      return;
    }

    try {
      const pacienteResponse = await axiosInstance.get(`/pacientes/pacientes/buscar_por_documento/`, {
        params: { documento }
      });
      const pacienteData = pacienteResponse.data;
      setPaciente(pacienteData);

      try {
        const facturasResponse = await axiosInstance.get(`/facturacion/facturas/por_paciente/`, {
          params: { paciente_id: pacienteData.id }
        });
        setFacturas(facturasResponse.data);
      } catch {
        setFacturas([]);
      }

      setCreando(false);
      setFormData({ descripcion: '', total: '', estado_pago: 'pendiente', forma_pago: 'efectivo' });
    } catch (err) {
      setError(err.response?.data?.error || 'Paciente no encontrado');
      setPaciente(null);
      setFacturas([]);
    } finally {
      setSearching(false);
    }
  };

  const recargarFacturas = async () => {
    if (!paciente) return;
    try {
      const response = await axiosInstance.get(`/facturacion/facturas/por_paciente/`, {
        params: { paciente_id: paciente.id }
      });
      setFacturas(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCrearFactura = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!formData.descripcion.trim() || !formData.total) {
      setError('Descripción y total son requeridos');
      setSaving(false);
      return;
    }

    try {
      // ✅ Convertir directamente a número sin dividir
      const valorNumerico = parseFloat(formData.total);
      console.log('Valor a enviar:', valorNumerico, typeof valorNumerico);

      await axiosInstance.post('/facturacion/facturas/', {
        paciente: paciente.id,
        valor: valorNumerico,
        descuento: 0,
        descripcion: formData.descripcion,
        estado: formData.estado_pago,
        metodo_pago: formData.forma_pago,
      });
      setSuccess('Factura creada correctamente');
      setCreando(false);
      setFormData({ descripcion: '', total: '', estado_pago: 'pendiente', forma_pago: 'efectivo' });
      setTimeout(recargarFacturas, 500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear factura');
    } finally {
      setSaving(false);
    }
  };

  const descargarPDF = async (facturaId) => {
    try {
      const response = await axiosInstance.get(`/facturacion/facturas/${facturaId}/pdf/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura_${facturaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al descargar la factura');
    }
  };

  const totalPendiente = facturas.filter(f => f.estado === 'pendiente').reduce((sum, f) => sum + parseFloat(f.total || 0), 0);
  const totalPagado = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + parseFloat(f.total || 0), 0);

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-light'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>💰 Facturas</h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gestiona y crea facturas para los pacientes</p>
        </div>

        {/* Búsqueda */}
        <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8 mb-8`}>
          <form onSubmit={handleBuscar} className="flex gap-3">
            <div className="flex-1">
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                Número de Documento del Paciente
              </label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ej: 1234567890"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="self-end flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50"
            >
              <FiSearch size={18} />
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
            <p className="font-semibold">{success}</p>
          </div>
        )}

        {paciente && (
          <>
            <div className={`${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700' : 'bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary'} rounded-2xl p-6 mb-8`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                {paciente.nombres} {paciente.apellidos}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Documento: <span className="font-semibold">{paciente.documento}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg p-6 text-white">
                <p className="opacity-80 text-sm font-semibold mb-2">Total Facturas</p>
                <p className="text-4xl font-bold">{facturas.length}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
                <p className="opacity-80 text-sm font-semibold mb-2">Pendiente</p>
                <p className="text-3xl font-bold">${totalPendiente.toLocaleString('es-CO')}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
                <p className="opacity-80 text-sm font-semibold mb-2">Pagado</p>
                <p className="text-3xl font-bold">${totalPagado.toLocaleString('es-CO')}</p>
              </div>
            </div>

            {!creando && (
              <button
                onClick={() => setCreando(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold mb-8"
              >
                <FiPlus size={18} />
                Crear Nueva Factura
              </button>
            )}

            {creando && (
              <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8 mb-8`}>
                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-dark'}`}>Nueva Factura</h3>
                <form onSubmit={handleCrearFactura} className="space-y-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Ej: Sesión psicológica - Terapia individual"
                      rows="3"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition resize-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>
                        Total ($) — Ingresa el valor exacto ej: 100000
                      </label>
                      <input
                        type="number"
                        name="total"
                        value={formData.total}
                        onChange={handleChange}
                        placeholder="100000"
                        step="1"
                        min="0"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Forma de Pago</label>
                      <select
                        name="forma_pago"
                        value={formData.forma_pago}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                      >
                        {formasPago.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Estado</label>
                    <select
                      name="estado_pago"
                      value={formData.estado_pago}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagada">Pagada</option>
                    </select>
                  </div>
                  <div className={`flex gap-3 justify-end pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      type="button"
                      onClick={() => { setCreando(false); setFormData({ descripcion: '', total: '', estado_pago: 'pendiente', forma_pago: 'efectivo' }); }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-2 border-gray-200 text-dark hover:border-primary'}`}
                    >
                      <FiX size={16} />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50"
                    >
                      <FiSave size={18} />
                      {saving ? 'Creando...' : 'Crear Factura'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {facturas.length > 0 ? (
              <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`border-b-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}># Factura</th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Fecha</th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Descripción</th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Total</th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>Estado</th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>PDF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturas.map((factura, index) => (
                        <tr key={factura.id || factura.factura_id || index} className={`border-b transition ${darkMode ? 'hover:bg-gray-800 border-gray-700' : 'hover:bg-gray-50 border-gray-200'}`}>
                          <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-dark'}`}>#{factura.factura_id || factura.id}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {factura.creada_en ? new Date(factura.creada_en).toLocaleDateString('es-CO') : '-'}
                          </td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{factura.descripcion || '-'}</td>
                          <td className="px-6 py-4 text-sm font-bold text-primary">
                            ${parseFloat(factura.total || 0).toLocaleString('es-CO')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getEstadoStyle(factura.estado)}`}>{factura.estado}</span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => descargarPDF(factura.factura_id || factura.id)}
                              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold text-xs"
                            >
                              <FiDownload size={14} />
                              PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No hay facturas para este paciente</p>
              </div>
            )}
          </>
        )}

        {!paciente && (
          <div className={`${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-12 text-center`}>
            <FiSearch size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Ingresa el documento del paciente para ver y crear facturas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacturasList;
