import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenId } from './types';

import HomeView from './views/HomeView';
import DetectionView from './views/DetectionView';
import CasesView from './views/CasesView';
import ContactView from './views/ContactView';
import LoginView from './views/LoginView';
import LegalView from './views/LegalView';
import PrivacyView from './views/PrivacyView';
import CookiesView from './views/CookiesView';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Placeholders for the private layouts and views we will build next
const EmployeeLayout = React.lazy(() => import('./components/layout/EmployeeLayout'));
const EmployeeDashboardView = React.lazy(() => import('./views/employee/EmployeeDashboardView'));
const ForcePasswordChangeView = React.lazy(() => import('./views/auth/ForcePasswordChangeView'));
const ClientLayout = React.lazy(() => import('./components/layout/ClientLayout'));
const ClientDashboardView = React.lazy(() => import('./views/client/ClientDashboardView'));
const ExecutiveDashboardView = React.lazy(() => import('./views/employee/ExecutiveDashboardView'));

const FichajeView = React.lazy(() => import('./views/employee/FichajeView'));
const PartesDiariosView = React.lazy(() => import('./views/employee/PartesDiariosView'));
const TodosPartesView = React.lazy(() => import('./views/employee/TodosPartesView'));
const AusenciasView = React.lazy(() => import('./views/employee/AusenciasView'));
const GestionAusenciasView = React.lazy(() => import('./views/employee/GestionAusenciasView'));
const HistorialView = React.lazy(() => import('./views/employee/HistorialView'));
const UsersManagementView = React.lazy(() => import('./views/employee/UsersManagementView'));
const HolidayCalendarsView = React.lazy(() => import('./views/employee/settings/HolidayCalendarsView'));
const CrmView = React.lazy(() => import('./views/employee/CrmView'));
const AlmacenView = React.lazy(() => import('./views/employee/almacen/AlmacenView'));
const AlmacenAdminView = React.lazy(() => import('./views/employee/almacen/AlmacenAdminView'));
const GlobalPlanningView = React.lazy(() => import('./views/employee/GlobalPlanningView'));
const ProjectsView = React.lazy(() => import('./views/employee/projects/ProjectsView'));
const ProjectDetailView = React.lazy(() => import('./views/employee/projects/ProjectDetailView'));
import { ReportEditorView } from './views/employee/projects/reports/ReportEditorView';
import CostesLaboralesView from './views/employee/CostesLaboralesView';
const PublicQuotationView = React.lazy(() => import('./views/public/PublicQuotationView'));
const PublicCertificationView = React.lazy(() => import('./views/public/PublicCertificationView'));
const EmployeeDocumentsView = React.lazy(() => import('./views/employee/documents/EmployeeDocumentsView'));
const AdminDocumentsView = React.lazy(() => import('./views/employee/documents/AdminDocumentsView'));

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [transitionMode, setTransitionMode] = useState<'none' | 'push'>('none');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [location.pathname]);

  // Determine current screen for Navbar based on pathname
  const getCurrentScreen = (): ScreenId => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.includes('deteccion')) return 'detection';
    if (path.includes('casos')) return 'cases';
    if (path.includes('contacto')) return 'contact';
    if (path.includes('login')) return 'login';
    if (path.includes('legal')) return 'legal';
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('cookies')) return 'cookies';
    return 'home'; // Default fallback
  };

  // Wrapper for existing onNavigate prop used by views
  const handleNav = (screen: ScreenId, mode: 'none' | 'push' = 'none') => {
    setTransitionMode(mode);
    setIsMobileMenuOpen(false);
    
    switch (screen) {
      case 'home': navigate('/'); break;
      case 'detection': navigate('/deteccion'); break;
      case 'cases': navigate('/casos'); break;
      case 'contact': navigate('/contacto'); break;
      case 'login': navigate('/login'); break;
      case 'legal': navigate('/legal'); break;
      case 'privacy': navigate('/privacy'); break;
      case 'cookies': navigate('/cookies'); break;
      default: navigate('/');
    }
  };

  const pageVariants = {
    initial: (mode: 'none' | 'push') => ({
      opacity: 0,
      x: mode === 'push' ? '100vw' : 0,
    }),
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: (mode: 'none' | 'push') => ({
      opacity: 0,
      x: mode === 'push' ? '-100vw' : 0,
    }),
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: transitionMode === 'push' ? 0.45 : 0.15,
  };

  // Check if we are in the private app area
  const isAppArea = location.pathname.startsWith('/app');

  if (isAppArea) {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold">Cargando aplicación...</div>}>
        <Routes>
          <Route path="/app/cambiar-clave" element={
            <ProtectedRoute>
              <ForcePasswordChangeView />
            </ProtectedRoute>
          } />
          
          <Route path="/app/empleado" element={
            <ProtectedRoute>
              <EmployeeLayout />
            </ProtectedRoute>
          }>
            <Route index element={<EmployeeDashboardView />} />
            <Route path="ejecutivo" element={<ExecutiveDashboardView />} />
            <Route path="fichaje" element={<FichajeView />} />
            <Route path="partes" element={<PartesDiariosView />} />
            <Route path="ausencias" element={<AusenciasView />} />
            <Route path="gestion-ausencias" element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'SUPERVISOR']}>
                <GestionAusenciasView />
              </ProtectedRoute>
            } />
            <Route path="historial" element={<HistorialView />} />
            <Route path="usuarios" element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'SUPERVISOR']}>
                <UsersManagementView />
              </ProtectedRoute>
            } />
            <Route path="calendarios-festivos" element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
                <HolidayCalendarsView />
              </ProtectedRoute>
            } />
            <Route path="todos-partes" element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'SUPERVISOR', 'EMPLEADO', 'TECNICO', 'PEON', 'CONTRATISTA', 'OBRERO', 'COMERCIAL']}>
                <TodosPartesView />
              </ProtectedRoute>
            } />
            <Route path="costes" element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'SUPERVISOR', 'RRHH']}>
                <CostesLaboralesView />
              </ProtectedRoute>
            } />
            <Route path="operaciones" element={<div className="p-8">Módulo de Operaciones en construcción...</div>} />
            <Route path="planificacion-global" element={<GlobalPlanningView />} />
            <Route path="proyectos" element={<ProjectsView />} />
            <Route path="proyectos/:id" element={<ProjectDetailView />} />
            <Route path="proyectos/:id/informes/:reportId" element={<ReportEditorView />} />
            <Route path="crm" element={<CrmView />} />
            <Route path="almacen" element={<AlmacenView />} />
            <Route path="almacen-admin" element={<AlmacenAdminView />} />
            <Route path="administracion" element={<div className="p-8">Módulo de Administración en construcción...</div>} />
            <Route path="documentos" element={<EmployeeDocumentsView />} />
            <Route path="documentos-admin" element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'SUPERVISOR', 'RRHH']} allowedPermissions={['rrhh']}>
                <AdminDocumentsView />
              </ProtectedRoute>
            } />
            <Route path="*" element={<div className="p-8 flex flex-col items-center justify-center h-full text-slate-500"><h2 className="text-2xl font-bold text-slate-800 mb-2">Módulo en construcción</h2><p>Esta sección del portal estará disponible próximamente.</p></div>} />
          </Route>

          <Route path="/app/cliente" element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <ClientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ClientDashboardView />} />
          </Route>
        </Routes>
      </React.Suspense>
    );
  }

  // Quotation Public Area
  const isQuoteArea = location.pathname.startsWith('/quote');
  if (isQuoteArea) {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-primary font-bold">Cargando documento...</div>}>
        <Routes location={location} key={location.pathname}>
          <Route path="/quote/:token" element={<PublicQuotationView />} />
        </Routes>
      </React.Suspense>
    );
  }

  // Certification Public Area
  const isCertificationArea = location.pathname.startsWith('/certificacion');
  if (isCertificationArea) {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-primary font-bold">Cargando documento...</div>}>
        <Routes location={location} key={location.pathname}>
          <Route path="/certificacion/:token" element={<PublicCertificationView />} />
        </Routes>
      </React.Suspense>
    );
  }

  // Public Site Layout
  return (
    <div className="bg-background text-on-surface font-sans antialiased min-h-screen flex flex-col justify-between">
      <Navbar 
        currentScreen={getCurrentScreen()} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        onNavigate={handleNav} 
      />

      {/* Main Content Area with Router and Motion Transitions */}
      <main className="flex-grow pt-20 overflow-x-hidden">
        <AnimatePresence mode="wait" custom={transitionMode}>
          <motion.div
            key={location.pathname}
            custom={transitionMode}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full h-full flex flex-col"
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomeView onNavigate={handleNav} />} />
              <Route path="/deteccion" element={<DetectionView onNavigate={handleNav} />} />
              <Route path="/casos" element={<CasesView onNavigate={handleNav} />} />
              <Route path="/contacto" element={<ContactView onNavigate={handleNav} />} />
              <Route path="/login" element={<LoginView onNavigate={handleNav} />} />
              <Route path="/legal" element={<LegalView onNavigate={handleNav} />} />
              <Route path="/privacy" element={<PrivacyView onNavigate={handleNav} />} />
              <Route path="/cookies" element={<CookiesView onNavigate={handleNav} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNav} />
    </div>
  );
}
