import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Config from './components/Config';
import Reclamaciones from './components/Reclamaciones';
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowRight } from 'react-icons/hi';

function LoginPage() {
  const { login } = useApp();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(user, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Luces de fondo */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-accent rounded-[20px] flex items-center justify-center text-black text-2xl font-black mb-6 shadow-2xl shadow-accent/20">
            K
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2">KLYN <span className="text-accent">SERVER</span></h1>
          <p className="text-textMuted text-sm font-medium">Panel de Control de Inventario</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 md:p-10 rounded-[40px] border border-white/10 space-y-6 shadow-2xl relative z-10">
          <div>
            <label className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em] mb-3 block ml-1">Usuario</label>
            <div className="relative group">
              <HiOutlineUser className="absolute left-5 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="admin"
                className="pl-12 bg-white/5 border-white/10 focus:bg-white/[0.08]" 
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em] mb-3 block ml-1">Contraseña</label>
            <div className="relative group">
              <HiOutlineLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-accent transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 bg-white/5 border-white/10 focus:bg-white/[0.08]" 
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-xs py-3 px-4 rounded-xl font-bold animate-pulse text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/10 flex items-center justify-center gap-3 mt-4"
          >
            {loading ? 'Verificando...' : (
              <>
                Ingresar al Sistema
                <HiOutlineArrowRight className="text-xl" />
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-textMuted font-bold uppercase tracking-widest pt-4 opacity-40">
            Klyn Original © 2026
          </p>
        </form>
      </div>
    </div>
  );
}

function MainContent({ onMenuClick }) {
  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#050505] relative">
      <Header onMenuClick={onMenuClick} />
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar scroll-smooth relative z-10">
        <div className="max-w-[1400px] mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/reclamaciones" element={<Reclamaciones />} />
            <Route path="/configuracion" element={<Config />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      
      {/* Decoración de fondo Premium */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none z-0" />
    </main>
  );
}

function AppContent() {
  const { isAuthenticated, isAuthLoading } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <div className="layout-grid">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <MainContent onMenuClick={() => setIsSidebarOpen(true)} />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
