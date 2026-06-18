import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { HiOutlineViewGrid, HiOutlineShoppingBag, HiOutlineLogout, HiX, HiOutlineExclamation, HiOutlineCog, HiOutlineBookOpen } from 'react-icons/hi';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { to: '/', label: 'Dashboard', icon: <HiOutlineViewGrid className="text-xl" /> },
    { to: '/productos', label: 'Productos', icon: <HiOutlineShoppingBag className="text-xl" /> },
    { to: '/reclamaciones', label: 'Reclamaciones', icon: <HiOutlineBookOpen className="text-xl" /> },
    { to: '/configuracion', label: 'Catálogo', icon: <HiOutlineCog className="text-xl" /> },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const isCollapsed = !isHovered;

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed lg:static inset-y-0 left-0 z-[101] 
          ${isHovered ? 'lg:w-[260px]' : 'lg:w-[85px]'} 
          w-[260px] bg-[#0a0a0a] border-r border-white/5 
          transform transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full p-4 lg:p-6">
          <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : 'justify-between'} mb-10 px-2 transition-all duration-300`}>
            <div className="flex items-center gap-3">
              <div className="min-w-[35px] w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-black font-bold shrink-0 shadow-lg shadow-accent/10">K</div>
              <h1 className={`text-xl font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:pointer-events-none' : 'opacity-100'}`}>
                KLY<span className="text-accent">Original</span>
              </h1>
            </div>
            {!isCollapsed && (
              <button className="lg:hidden text-white" onClick={() => setIsOpen(false)}>
                <HiX className="text-2xl" />
              </button>
            )}
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={({ isActive }) => `
                  w-full flex items-center ${isCollapsed ? 'lg:justify-center' : 'gap-4 px-4'} py-4 rounded-2xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-accent text-black font-bold shadow-lg shadow-accent/10' 
                    : 'text-textMuted hover:bg-white/5 hover:text-white'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`transition-transform duration-300 ${isActive ? 'text-black scale-110' : 'text-accent group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className={`text-sm tracking-wide whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:pointer-events-none' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/5">
            <button 
              onClick={handleLogoutClick}
              className={`
                w-full flex items-center ${isCollapsed ? 'lg:justify-center' : 'gap-4 px-4'} py-4 rounded-2xl text-danger hover:bg-danger/10 transition-all duration-200
              `}
            >
              <HiOutlineLogout className="text-xl" />
              <span className={`text-sm font-medium transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:pointer-events-none' : 'opacity-100'}`}>
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal de Confirmación de Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-up">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] max-w-sm w-full p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-6 text-3xl">
                <HiOutlineExclamation />
              </div>
              
              <h3 className="text-xl font-bold mb-2">¿Cerrar Sesión?</h3>
              <p className="text-textMuted text-sm mb-8 leading-relaxed">
                Tu sesión actual terminará y tendrás que volver a ingresar para gestionar el inventario.
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={confirmLogout}
                  className="btn bg-danger text-white hover:bg-danger/80 w-full py-4 rounded-2xl font-bold"
                >
                  Sí, Salir ahora
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="btn btn-secondary w-full py-4 rounded-2xl text-sm opacity-60 hover:opacity-100 transition-opacity"
                >
                  No, mantener sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
