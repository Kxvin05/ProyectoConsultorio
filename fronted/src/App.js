import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import RecuperarPassword from './components/auth/RecuperarPassword';
import Inicio from './pages/Inicio';
import AgendarCita from './components/citas/AgendarCita';
import CitasList from './components/citas/CitasList';
import CalendarioVisual from './components/citas/CalendarioVisual';
import FacturasList from './components/facturas/FacturasList';
import HistoriaPaciente from './components/historias/HistoriaPaciente';
import MiPerfil from './pages/MiPerfil';
import PsicologosList from './components/psicologos/PsicologosList';
import InicioRecepcionista from './pages/InicioRecepcionista';
import PacientesList from './components/pacientes/PacientesList';
import CitasRecepcion from './components/citas/CitasRecepcion';
import InicioPsicologo from './pages/InicioPsicologo';
import CitasPsicologo from './components/citas/CitasPsicologo';
import HistoriasPsicologo from './components/historias/HistoriasPsicologo';
import PacientesPsicologo from './components/pacientes/PacientesPsicologo';
import ResumenPsicologos from './components/psicologos/ResumenPsicologos';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access");
  return token ? children : <Navigate to="/login" />;
}

function RutaDashboard() {
  const [rol, setRol] = React.useState(localStorage.getItem('rol'));

  React.useEffect(() => {
    const rolActual = localStorage.getItem('rol');
    setRol(rolActual);
  }, []);

  if (!rol) return null; // espera a que cargue el rol

  if (rol === 'recepcion') return <InicioRecepcionista />;
  if (rol === 'psicologo') return <InicioPsicologo />;
  return <Inicio />;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Landing - Pública */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            
            {/* Protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RutaDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/psicologos"
              element={
                <ProtectedRoute>
                  <PsicologosList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pacientes"
              element={
                <ProtectedRoute>
                  <PacientesList />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/citas/agendar"
              element={
                <ProtectedRoute>
                  <AgendarCita />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citas/recepcion"
              element={
                <ProtectedRoute>
                  <CitasRecepcion />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citas"
              element={
                <ProtectedRoute>
                  <CitasList />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/calendario"
              element={
                <ProtectedRoute>
                  <CalendarioVisual />
                </ProtectedRoute>
              }
            />

            <Route
              path="/historia"
              element={
                <ProtectedRoute>
                  <HistoriaPaciente />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/facturas"
              element={
                <ProtectedRoute>
                  <FacturasList />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <MiPerfil />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/recepcion"
              element={
                <ProtectedRoute>
                  <InicioRecepcionista />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/psicologo"
              element={
                <ProtectedRoute>
                  <InicioPsicologo />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citas/psicologo"
              element={
                <ProtectedRoute>
                  <CitasPsicologo />
                </ProtectedRoute>
              }
            />

            <Route
              path="/historias/psicologo"
              element={
                <ProtectedRoute>
                  <HistoriasPsicologo />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pacientes/psicologo"
              element={
                <ProtectedRoute>
                  <PacientesPsicologo />
                </ProtectedRoute>
              }
            />

            <Route
              path="/psicologos/recepcion"
              element={
                <ProtectedRoute>
                  <ResumenPsicologos />
                </ProtectedRoute>
              }
            />

          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;