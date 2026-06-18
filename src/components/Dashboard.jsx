import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';

export default function Dashboard() {
  const { products, loading, marcas } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-textMuted font-mono animate-pulse">CARGANDO SISTEMA...</div>
      </div>
    );
  }

  const getProductThumbnail = (product) => {
    if (product.variantes?.[0]?.imagenes?.[0]) {
      return product.variantes[0].imagenes[0].url_thumbnail || product.variantes[0].imagenes[0].url;
    }
    return null;
  };

  const avgPrice = products.length > 0 
    ? Math.round(products.reduce((sum, p) => sum + (p.precio_base || 0), 0) / products.length) 
    : 0;

  const brands = [...new Set(products.map(p => p.id_marca).filter(Boolean))];

  const recentProducts = products.slice(0, 6);

  const getMarcaNombre = (id) => {
    const m = marcas.find(m => m.id === id);
    return m?.nombre || 'Sin marca';
  };

  return (
    <div className="slide-in">
      <h1 className="text-3xl font-bold mb-8 font-mono">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface border border-bdr rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="font-mono text-xs text-textMuted tracking-widest mb-2">TOTAL PRODUCTOS</div>
            <div className="text-5xl font-bold text-accent">{products.length}</div>
            <div className="text-xs text-textMuted mt-2">zapatillas en catálogo</div>
          </div>
        </div>
        
        <div className="bg-surface border border-bdr rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="font-mono text-xs text-textMuted tracking-widest mb-2">MARCAS ACTIVAS</div>
            <div className="text-5xl font-bold">{brands.length}</div>
            <div className="text-xs text-textMuted mt-2">marcas disponibles</div>
          </div>
        </div>
        
        <div className="bg-surface border border-bdr rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="font-mono text-xs text-textMuted tracking-widest mb-2">PRECIO PROMEDIO</div>
            <div className="text-5xl font-bold">S/. {avgPrice}</div>
            <div className="text-xs text-textMuted mt-2">precio promedio</div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-bdr rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-xl">Últimos productos agregados</h2>
        </div>
        
        {!recentProducts.length ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👟</div>
            <p className="text-lg text-textMuted">No hay productos aún</p>
            <p className="text-sm text-textMuted mt-2">Agrega tu primer producto desde la sección Productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProducts.map(product => {
              const thumbnail = getProductThumbnail(product);
              return (
                <div key={product.id} className="bg-surface2 border border-bdr rounded-xl p-5 hover:border-accent/30 transition-all hover:scale-[1.02] cursor-default">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-bdr">
                      {thumbnail ? (
                        <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl opacity-20">👟</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate text-lg">{product.modelo}</div>
                      <div className="text-xs text-textMuted uppercase tracking-wider">{getMarcaNombre(product.id_marca)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-bdr pt-4">
                    <span className="font-mono text-accent text-xl font-bold">S/. {product.precio_base}</span>
                    {product.precio_oferta && (
                      <span className="text-xs text-textMuted line-through">S/. {product.precio_oferta}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}