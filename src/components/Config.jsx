import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineCollection, HiOutlineTag } from 'react-icons/hi';
import { supabase } from '../lib/supabase';

export default function Config() {
  const { marcas, categorias, loadData } = useApp();
  const [activeTab, setActiveTab] = useState('marcas');
  const [loading, setLoading] = useState(false);
  const [itemName, setItemName] = useState('');

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    setLoading(true);

    try {
      const slug = itemName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const table = activeTab; // 'marcas' o 'categorias'
      
      const { error } = await supabase
        .from(table)
        .insert([{ 
          nombre: itemName, 
          slug: table === 'marcas' || table === 'categorias' ? slug : undefined 
        }]);

      if (error) throw error;
      
      setItemName('');
      await loadData(); // Recargar datos globales
      alert('Agregado correctamente');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, table) => {
    if (!confirm('¿Estás seguro? Esto podría afectar a los productos asociados.')) return;
    
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Configuración del <span className="text-accent">Catálogo</span></h1>
        <p className="text-textMuted text-sm">Gestiona las marcas y categorías disponibles en el sistema.</p>
      </div>

      <div className="flex gap-4 mb-10 p-1.5 bg-white/5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('marcas')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'marcas' ? 'bg-accent text-black' : 'text-textMuted hover:text-white'}`}
        >
          <HiOutlineTag />
          Marcas
        </button>
        <button 
          onClick={() => setActiveTab('categorias')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'categorias' ? 'bg-accent text-black' : 'text-textMuted hover:text-white'}`}
        >
          <HiOutlineCollection />
          Categorías
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <form onSubmit={handleAddItem} className="glass p-8 rounded-[40px] border border-white/10 sticky top-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <HiOutlinePlus className="text-accent" />
              Nueva {activeTab === 'marcas' ? 'Marca' : 'Categoría'}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-3 block ml-1">Nombre</label>
                <input 
                  type="text" 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={`Ej: ${activeTab === 'marcas' ? 'Nike' : 'Zapatillas'}`}
                  className="py-4 px-5 rounded-xl"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary w-full py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-accent/10"
              >
                {loading ? 'Guardando...' : 'Agregar Item'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="glass rounded-[40px] border border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-textMuted uppercase tracking-widest">Nombre</th>
                  <th className="px-8 py-5 text-[10px] font-black text-textMuted uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(activeTab === 'marcas' ? marcas : categorias).map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5 font-bold">{item.nombre}</td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(item.id, activeTab)}
                        className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all ml-auto"
                      >
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {(activeTab === 'marcas' ? marcas : categorias).length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-8 py-10 text-center text-textMuted italic">
                      No hay {activeTab === 'marcas' ? 'marcas' : 'categorías'} registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
