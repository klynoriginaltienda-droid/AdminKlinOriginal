import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, loginError, logout, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  if (user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] border border-bdr rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-xl font-mono text-white mb-2">Sesión activa</h2>
          <p className="text-textMuted text-sm mb-6">{user.email}</p>
          <button
            onClick={logout}
            className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-mono text-sm hover:bg-red-500/20 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="bg-[#0a0a0a] border border-bdr rounded-2xl p-8 max-w-sm w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👟</span>
          </div>
          <h1 className="text-2xl font-mono text-white tracking-tight">KLYN ADMIN</h1>
          <p className="text-textMuted text-sm mt-1 font-mono tracking-wider">PANEL DE CONTROL</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-textMuted tracking-widest uppercase mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#050505] border border-bdr rounded-xl text-white placeholder-textMuted/50 focus:border-accent focus:outline-none transition-colors font-mono text-sm"
              placeholder="admin@klyn.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-mono text-textMuted tracking-widest uppercase mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#050505] border border-bdr rounded-xl text-white placeholder-textMuted/50 focus:border-accent focus:outline-none transition-colors font-mono text-sm"
              placeholder="••••••••"
            />
          </div>

          {loginError && (
            <div className="py-2 px-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm font-mono">{loginError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent hover:bg-accent/90 text-black font-mono font-bold rounded-xl transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>

        <p className="text-textMuted/50 text-xs font-mono text-center mt-6 tracking-wider">
          ACCESO RESTRINGIDO
        </p>
      </div>
    </div>
  );
}