import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { useReclamacionesAdmin } from '../hooks/useReclamacionesAdmin';
import { HiOutlineBookOpen, HiOutlineCheck, HiOutlineClock } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

const TIPO_MAP = {
  reclamo: 'Reclamo',
  queja: 'Queja',
};

const ESTADO_COLORS = {
  pendiente: { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', text: 'Pendiente' },
  respondido: { badge: 'bg-green-500/10 text-green-400 border-green-500/20', text: 'Respondido' },
};

function ReclamacionCard({ r, onResponder }) {
  const [showResponder, setShowResponder] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResponder = async (enviarWhatsApp) => {
    if (!respuesta.trim()) return;
    setLoading(true);
    const result = await onResponder(r.id, respuesta);
    setLoading(false);
    if (result.success) {
      setShowResponder(false);
      setRespuesta('');
      if (enviarWhatsApp && r.telefono) {
        const tipo = r.tipo_reclamo === 'reclamo' ? 'reclamo' : 'queja';
        const mensajeBase = `KLYN ORIGINALES - Respuesta a su ${tipo.toUpperCase()}

Estimado/a ${r.nombres},

Hemos recibido su ${tipo} y queremos responder a su consulta:

"${r.detalle}"

RESPUESTA:
${respuesta}

Si tiene alguna otra consulta, estamos a su disposición. ¡Gracias por confiar en KLYN ORIGINALES!`;

        const telefono = r.telefono.replace(/\s+/g, '').replace(/^0+/, '');
        window.open(
          `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeBase)}`,
          '_blank'
        );
      }
    }
  };

  const handleOpenWhatsApp = () => {
    if (!r.telefono) return;
    const tipo = r.tipo_reclamo === 'reclamo' ? 'reclamo' : 'queja';
    const mensajeBase = `KLYN ORIGINALES - Respuesta a su ${tipo.toUpperCase()}

Estimado/a ${r.nombres},

Hemos recibido su ${tipo} y queremos responder a su consulta:

"${r.detalle}"

RESPUESTA:
${r.respuesta_admin || respuesta}

Si tiene alguna otra consulta, estamos a su disposición. ¡Gracias por confiar en KLYN ORIGINALES!`;

    const telefono = r.telefono.replace(/\s+/g, '').replace(/^0+/, '');
    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeBase)}`,
      '_blank'
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const estadoStyle = ESTADO_COLORS[r.estado] || ESTADO_COLORS.pendiente;

  return (
    <div className="bg-surface border border-bdr rounded-2xl p-6 hover:border-accent/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface2 rounded-xl flex items-center justify-center">
            <HiOutlineBookOpen className="text-accent text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-textMain">{r.nombres}</h3>
            <p className="text-xs text-textMuted">{r.email}</p>
          </div>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${estadoStyle.badge}`}>
          {estadoStyle.text}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider bg-surface2 px-3 py-1.5 rounded-xl border border-bdr">
          {TIPO_MAP[r.tipo_reclamo] || r.tipo_reclamo}
        </span>
        {r.telefono && (
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider bg-surface2 px-3 py-1.5 rounded-xl border border-bdr">
            {r.telefono}
          </span>
        )}
        <span className="text-[10px] font-mono text-textMuted uppercase tracking-wider bg-surface2 px-3 py-1.5 rounded-xl border border-bdr">
          {formatDate(r.created_at)}
        </span>
      </div>

      <div className="bg-surface2 border border-bdr rounded-xl p-4 mb-4">
        <p className="text-sm text-textMain leading-relaxed whitespace-pre-wrap">{r.detalle}</p>
      </div>

      {r.respuesta_admin && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mb-4">
          <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <HiOutlineCheck size={12} /> Respuesta enviada
          </div>
          <p className="text-sm text-green-300 leading-relaxed whitespace-pre-wrap">{r.respuesta_admin}</p>
        </div>
      )}

      {r.estado === 'pendiente' && !showResponder && (
        <button
          onClick={() => setShowResponder(true)}
          className="w-full btn btn-primary py-3 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-accent/10"
        >
          <HiOutlineCheck className="text-lg" />
          Responder
        </button>
      )}

      {(r.estado === 'respondido' || r.respuesta_admin) && r.telefono && (
        <button
          onClick={handleOpenWhatsApp}
          className="w-full btn bg-green-500 text-black hover:bg-green-400 py-3 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-green-500/10 flex items-center justify-center gap-2"
        >
          <FaWhatsapp size={16} />
          Mandar WhatsApp
        </button>
      )}

      {showResponder && (
        <div className="space-y-4 mt-2">
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            rows={4}
            placeholder="Escribe tu respuesta al cliente..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-textMain placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent/50 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleResponder(false)}
              disabled={loading || !respuesta.trim()}
              className="flex-1 btn btn-secondary py-3 rounded-xl font-bold uppercase text-xs tracking-widest disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <HiOutlineCheck size={14} />
              )}
              Solo Guardar
            </button>
            {r.telefono && (
              <button
                onClick={() => handleResponder(true)}
                disabled={loading || !respuesta.trim()}
                className="flex-1 btn bg-green-500 text-black hover:bg-green-400 py-3 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-green-500/10 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <FaWhatsapp size={14} />
                )}
                Guardar y WhatsApp
              </button>
            )}
          </div>
          <button
            onClick={() => { setShowResponder(false); setRespuesta(''); }}
            className="w-full btn btn-secondary py-3 rounded-xl text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

export default function Reclamaciones() {
  const { isAuthenticated } = useApp();
  const { reclamaciones, loading, error, responderReclamacion } = useReclamacionesAdmin();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-textMuted font-mono animate-pulse">CARGANDO...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-textMuted font-mono animate-pulse">CARGANDO RECLAMACIONES...</div>
      </div>
    );
  }

  const pendientes = reclamaciones.filter(r => r.estado === 'pendiente');
  const respondidas = reclamaciones.filter(r => r.estado === 'respondido');

  return (
    <div className="slide-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
          <HiOutlineBookOpen className="text-accent text-xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-mono">Reclamaciones</h1>
          <p className="text-textMuted text-sm font-mono">Gestiona las reclamaciones de clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-surface border border-bdr rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="font-mono text-[10px] text-textMuted tracking-widest mb-2 uppercase">Pendientes</div>
            <div className="text-5xl font-bold text-yellow-400">{pendientes.length}</div>
          </div>
        </div>
        <div className="bg-surface border border-bdr rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="font-mono text-[10px] text-textMuted tracking-widest mb-2 uppercase">Respondidas</div>
            <div className="text-5xl font-bold text-green-400">{respondidas.length}</div>
          </div>
        </div>
        <div className="bg-surface border border-bdr rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="font-mono text-[10px] text-textMuted tracking-widest mb-2 uppercase">Total</div>
            <div className="text-5xl font-bold">{reclamaciones.length}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm py-4 px-6 rounded-2xl font-bold mb-6">
          Error: {error}
        </div>
      )}

      {reclamaciones.length === 0 ? (
        <div className="bg-surface border border-bdr rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-lg text-textMuted">No hay reclamaciones aún</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendientes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineClock className="text-yellow-400" size={18} />
                <h2 className="font-bold text-xl">Pendientes ({pendientes.length})</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {pendientes.map(r => (
                  <ReclamacionCard
                    key={r.id}
                    r={r}
                    onResponder={responderReclamacion}
                  />
                ))}
              </div>
            </div>
          )}

          {respondidas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineCheck className="text-green-400" size={18} />
                <h2 className="font-bold text-xl">Respondidas ({respondidas.length})</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {respondidas.map(r => (
                  <ReclamacionCard
                    key={r.id}
                    r={r}
                    onResponder={responderReclamacion}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}