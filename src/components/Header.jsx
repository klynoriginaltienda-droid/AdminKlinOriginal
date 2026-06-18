import { HiMenuAlt2, HiOutlineBell, HiOutlineSearch, HiOutlineLogout, HiOutlineExclamation } from 'react-icons/hi';
import { useApp } from '../hooks/useApp';
import { useState } from 'react';

export default function Header({ onMenuClick }) {
  const { logout, isAuthenticated } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    setShowConfirm(false);
    await logout();
  };

  return (
    <>
      <header className="h-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <HiMenuAlt2 className="text-2xl text-accent" />
          </button>

          <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl w-[300px] focus-within:border-accent/50 transition-all">
            <HiOutlineSearch className="text-textMuted" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full placeholder:text-textMuted"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors relative group">
            <HiOutlineBell className="text-xl text-textMuted group-hover:text-white" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-[#050505]" />
          </button>

          <button
            onClick={handleLogoutClick}
            className="p-2.5 hover:bg-red-500/10 rounded-xl transition-colors group"
            title="Cerrar sesión"
          >
            <HiOutlineLogout className="text-xl text-textMuted group-hover:text-red-400" />
          </button>

          <div className="h-10 w-[1px] bg-white/10 mx-1 hidden sm:block" />

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">Panel Admin</p>
              <p className="text-[10px] text-accent uppercase tracking-widest font-mono">Conectado</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-green-600 p-[1px]">
              <div className="w-full h-full rounded-[11px] bg-[#050505] flex items-center justify-center font-bold text-accent">
                K
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Confirmación de Logout (Header) */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-up">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] max-w-sm w-full p-8 shadow-2xl relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-6 text-3xl">
                <HiOutlineExclamation />
              </div>

              <h3 className="text-xl font-bold mb-2">¿Finalizar sesión?</h3>
              <p className="text-textMuted text-sm mb-8 leading-relaxed">
                Estás a punto de salir del panel de administración.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={confirmLogout}
                  className="btn bg-danger text-white hover:bg-danger/80 w-full py-4 rounded-2xl font-bold"
                >
                  Confirmar Salida
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn btn-secondary w-full py-4 rounded-2xl text-sm opacity-60 hover:opacity-100 transition-opacity"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
