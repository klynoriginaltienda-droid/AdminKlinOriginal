import { useState, useRef, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlinePlus, HiOutlineSearch, HiStar, HiOutlinePhotograph, HiOutlineCloudUpload } from 'react-icons/hi';

const STEPS = [
  { id: 1, label: 'Datos', icon: '📝' },
  { id: 2, label: 'Colores', icon: '🎨' },
  { id: 3, label: 'Imágenes', icon: '📷' },
  { id: 4, label: 'Img Principal', icon: '⭐' },
  { id: 5, label: 'Stock', icon: '📦' }
];

export default function Products() {
  const { products, loading, marcas, categorias, generos, tallas, colores, addProduct, updateProduct, deleteProduct, getVariantes, addVariante, deleteVariante, getImagenes, addImagen, deleteImagen, setImagenPrincipal, getStock, updateStock, publicarProducto } = useApp();
  
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [variantes, setVariantes] = useState([]);
  const [selectedVariante, setSelectedVariante] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalVariantes, setModalVariantes] = useState([]);
  const [modalImagenes, setModalImagenes] = useState([]);
  const [modalStock, setModalStock] = useState({});
  const [addingColor, setAddingColor] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getMarcaNombre = (id) => {
    const m = marcas.find(m => m.id === id);
    return m?.nombre || 'Sin marca';
  };

  const getGeneroNombre = (id) => {
    const g = generos.find(g => g.id === id);
    return g?.nombre || 'Unisex';
  };

  const filteredProducts = products.filter(p => {
    const searchLower = search.toLowerCase();
    const matchModelo = !search || p.modelo?.toLowerCase().includes(searchLower);
    const matchCodigo = !search || p.codigo?.toLowerCase().includes(searchLower);
    return matchModelo || matchCodigo;
  });

  const getProductThumbnail = (product) => {
    if (product.variantes?.[0]?.imagenes?.[0]) {
      return product.variantes[0].imagenes[0].url_thumbnail || product.variantes[0].imagenes[0].url;
    }
    return null;
  };

  const handleViewProduct = (product) => {
    const variantesData = product.variantes || [];
    setModalVariantes(variantesData);
    
    const allImages = [];
    const stockMap = {};
    
    for (const variante of variantesData) {
      if (variante.imagenes) {
        allImages.push(...variante.imagenes.map(img => ({ ...img, color: variante.colores })));
      }
      stockMap[variante.id] = []; 
    }
    
    setModalStock(stockMap);
    setModalImagenes(allImages);
    setModalProduct(product);
    setShowModal(true);
    
    variantesData.forEach(async (v) => {
      const stk = await getStock(v.id);
      if (stk.data) {
        setModalStock(prev => ({ ...prev, [v.id]: stk.data }));
      }
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar producto?')) return;
    const result = await deleteProduct(id);
    if (!result.success) alert('Error: ' + result.error);
  };

  const handleOpenForm = async (product = null) => {
    if (product) {
      setEditingProduct({
        id: product.id,
        modelo: product.modelo,
        codigo: product.codigo || '',
        id_marca: product.id_marca,
        id_categoria: product.id_categoria,
        id_genero: product.id_genero,
        descripcion: product.descripcion,
        precio_base: product.precio_base,
        precio_oferta: product.precio_oferta,
        destacado: product.destacado || false,
        estado: product.estado
      });
      const vars = await getVariantes(product.id);
      const variantesData = vars.data || [];
      setVariantes(variantesData);
      
      // Auto-seleccionar primera variante para cargar imágenes y stock
      if (variantesData.length > 0) {
        handleSelectVariante(variantesData[0]);
      }
    } else {
      setEditingProduct({
        modelo: '',
        codigo: '',
        id_marca: marcas[0]?.id || '',
        id_categoria: categorias[0]?.id || '',
        id_genero: generos[0]?.id || '',
        descripcion: '',
        precio_base: '',
        precio_oferta: '',
        destacado: false
      });
      setVariantes([]);
      setSelectedVariante(null);
    }
    setCurrentStep(1);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setVariantes([]);
    setSelectedVariante(null);
    setImagenes([]);
    setStockData([]);
  };

  const handleSaveStep1 = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target);
    
    const productData = {
      modelo: formData.get('modelo'),
      codigo: formData.get('codigo') || null,
      id_marca: parseInt(formData.get('id_marca')) || null,
      id_categoria: parseInt(formData.get('id_categoria')) || null,
      id_genero: parseInt(formData.get('id_genero')) || null,
      descripcion: formData.get('descripcion') || null,
      precio_base: parseFloat(formData.get('precio_base')),
      precio_oferta: formData.get('precio_oferta') ? parseFloat(formData.get('precio_oferta')) : null,
      destacado: formData.get('destacado') === 'on'
    };

    let result;
    if (editingProduct?.id) {
      result = await updateProduct(editingProduct.id, productData);
    } else {
      result = await addProduct(productData);
    }

    if (result.success) {
      const newId = result.data?.id || editingProduct?.id;
      setEditingProduct(prev => ({ ...prev, id: newId }));
      setCurrentStep(2);
    } else {
      alert('Error: ' + result.error);
    }
    setSaving(false);
  };

  const handleAddVariante = async (colorId) => {
    if (!editingProduct?.id || addingColor) return;
    
    // Restricción: Solo un color por modelo
    if (variantes.length > 0) {
      alert('Este modelo ya tiene un color asignado. Elimina el actual si deseas cambiarlo.');
      return;
    }

    setAddingColor(true);
    const color = colores.find(c => c.id === colorId);
    const sku = `SKU-${editingProduct.id}-${colorId}-${Math.floor(Date.now() / 1000)}`;
    const result = await addVariante({
      id_producto: parseInt(editingProduct.id),
      id_color: parseInt(colorId),
      sku: sku,
      precio: parseFloat(editingProduct.precio_base) || 0,
      activo: true
    });
    if (result.success) {
      const freshVars = await getVariantes(editingProduct.id);
      const variantesData = freshVars.data || [];
      setVariantes(variantesData);
      
      // Seleccionar automáticamente la variante recién creada
      if (variantesData.length > 0) {
        handleSelectVariante(variantesData[0]);
      }
    } else {
      alert('Error: ' + result.error);
    }
    setAddingColor(false);
  };

  const handleDeleteVariante = async (id) => {
    if (!confirm('¿Eliminar color?')) return;
    const result = await deleteVariante(id);
    if (result.success) {
      setVariantes(prev => prev.filter(v => v.id !== id));
      if (selectedVariante?.id === id) {
        setSelectedVariante(null);
        setImagenes([]);
        setStockData([]);
      }
    }
  };

  const handleSelectVariante = async (variante) => {
    setSelectedVariante(variante);
    const imgs = await getImagenes(variante.id);
    setImagenes(imgs.data || []);
    const stk = await getStock(variante.id);
    
    // Crear mapa de stock asegurando que el ID de la talla sea la clave
    const stockMap = (stk.data || []).reduce((acc, s) => {
      acc[Number(s.id_talla)] = s.stock;
      return acc;
    }, {});
    
    const stock = tallas.map(t => ({
      id_talla: Number(t.id),
      talla: t.valor,
      stock: stockMap[Number(t.id)] || 0
    }));
    setStockData(stock);
  };

  const handleUploadImages = async (files) => {
    if (!files.length || !selectedVariante?.id) return;
    setUploading(true);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');
      formData.append('folder', 'kly-products');
      
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        const result = await addImagen({
          id_variante: selectedVariante.id,
          cloudinary_id: data.public_id,
          url: data.secure_url,
          url_thumbnail: data.eager?.[0]?.secure_url || data.secure_url,
          width: data.width,
          height: data.height,
          orden: imagenes.length
        });
        
        if (result.success) {
          setImagenes(prev => [...prev, result.data]);
        }
      } catch (err) {
        console.error('Error uploading:', err);
      }
    }
    setUploading(false);
  };

  const handleSetPrincipal = async (imagenId) => {
    if (!selectedVariante?.id) return;
    const result = await setImagenPrincipal(selectedVariante.id, imagenId);
    if (result.success) {
      setImagenes(prev => prev.map(img => ({
        ...img,
        orden: img.id === imagenId ? 0 : 1
      })));
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleSaveStock = async () => {
    if (!selectedVariante?.id) return;
    setSaving(true);
    try {
      const result = await updateStock(selectedVariante.id, stockData);
      if (result.success) {
        alert('¡Stock guardado exitosamente!');
      } else {
        alert('Error al guardar: ' + result.error);
      }
    } catch (err) {
      alert('Error inesperado: ' + err.message);
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!editingProduct?.id) return;
    if (variantes.length === 0) {
      alert('Por favor, selecciona al menos un color antes de finalizar.');
      return;
    }

    const targetVariante = selectedVariante || variantes[0];
    if (!targetVariante) {
      alert('Error: No hay una variante de color activa.');
      return;
    }

    const hasStock = stockData.some(s => s.stock > 0);
    if (!hasStock) {
      const confirmNoStock = confirm('Has ingresado 0 stock para todas las tallas. ¿Deseas publicar el producto de todas formas?');
      if (!confirmNoStock) return;
    }

    setSaving(true);
    try {
      // 1. Guardar el stock primero para asegurar persistencia
      const stockResult = await updateStock(targetVariante.id, stockData);
      
      if (stockResult.success) {
        // 2. Cambiar el estado del producto a activo
        const result = await publicarProducto(editingProduct.id);
        if (result.success) {
          alert('¡Producto creado y publicado con éxito!');
          handleCloseForm();
        } else {
          alert('El stock se guardó, pero hubo un error al activar el producto: ' + result.error);
        }
      } else {
        alert('Error crítico al guardar el stock: ' + stockResult.error);
      }
    } catch (err) {
      alert('Ocurrió un error inesperado durante la publicación: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <>
      <div className="animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Inventario de <span className="text-accent">Zapatillas</span></h1>
            <p className="text-textMuted text-sm text-balance">Gestiona productos, variantes, imágenes y stock en tiempo real.</p>
          </div>
          <button onClick={() => handleOpenForm()} className="btn btn-primary shadow-xl shadow-accent/20 px-6 py-4 self-start md:self-auto">
            <HiOutlinePlus className="text-xl" />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {showForm && editingProduct && (
          <div className="mb-12 glass rounded-[40px] overflow-hidden border border-white/5 animate-fade-up">
            <div className="flex items-center gap-2 p-6 bg-white/5 border-b border-white/5 overflow-x-auto custom-scrollbar">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center shrink-0">
                  <button
                    onClick={() => currentStep > idx + 1 && setCurrentStep(step.id)}
                    disabled={currentStep <= idx + 1}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all ${currentStep === step.id ? 'bg-accent text-black' : currentStep > step.id ? 'bg-accent/10 text-accent cursor-pointer' : 'bg-white/5 text-textMuted cursor-not-allowed'}`}
                  >
                    <span>{step.icon}</span>
                    <span>{step.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && <span className="mx-3 text-white/10">/</span>}
                </div>
              ))}
            </div>
            
            <div className="p-8 md:p-12">
              {currentStep === 1 && (
                <form onSubmit={handleSaveStep1} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-1">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-3 block ml-1">Modelo de Zapatilla</label>
                    <input name="modelo" defaultValue={editingProduct.modelo} required placeholder="Ej: Air Max 270 React" className="text-lg py-5 px-6 rounded-2xl" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-3 block ml-1">Código de Producto (Opcional)</label>
                    <input name="codigo" defaultValue={editingProduct.codigo} placeholder="Ej: REF-001 o KLY-123" className="text-lg py-5 px-6 rounded-2xl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-3 block ml-1">Marca</label>
                    <select name="id_marca" defaultValue={editingProduct.id_marca || ''} required className="py-5 px-6 rounded-2xl">
                      <option value="">Seleccionar marca</option>
                      {marcas.map(m => (<option key={m.id} value={m.id}>{m.nombre}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-3 block ml-1">Categoría</label>
                    <select name="id_categoria" defaultValue={editingProduct.id_categoria || categorias[0]?.id || ''} required className="py-5 px-6 rounded-2xl">
                      {categorias.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-3 block ml-1">Género</label>
                    <select name="id_genero" defaultValue={editingProduct.id_genero || generos[0]?.id || ''} required className="py-5 px-6 rounded-2xl">
                      {generos.map(g => (<option key={g.id} value={g.id}>{g.nombre}</option>))}
                    </select>
                  </div>
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-3 block ml-1">Descripción (Opcional)</label>
                    <textarea name="descripcion" defaultValue={editingProduct.descripcion || ''} placeholder="Detalles técnicos, materiales, etc." className="py-5 px-6 rounded-2xl w-full bg-white/5 border-white/10 min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-3 block ml-1">Precio S/.</label>
                      <input name="precio_base" type="number" step="0.01" defaultValue={editingProduct.precio_base || ''} required placeholder="0.00" className="py-5 px-6 rounded-2xl" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-3 block ml-1">Oferta S/.</label>
                      <input name="precio_oferta" type="number" step="0.01" defaultValue={editingProduct.precio_oferta || ''} placeholder="0.00" className="py-5 px-6 rounded-2xl" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-6 bg-white/5 rounded-3xl border border-white/5 self-end h-[74px]">
                    <input type="checkbox" name="destacado" defaultChecked={editingProduct.destacado} className="w-6 h-6 accent-accent" id="destacado" />
                    <label htmlFor="destacado" className="text-sm font-bold cursor-pointer">Producto Destacado</label>
                  </div>
                  <div className="col-span-full flex gap-4 pt-6">
                    <button type="button" onClick={handleCloseForm} className="btn btn-secondary flex-1 py-5 rounded-2xl font-black">CANCELAR</button>
                    <button type="submit" disabled={saving} className="btn btn-primary flex-1 py-5 rounded-2xl font-black">{saving ? 'GUARDANDO...' : 'SIGUIENTE PASO →'}</button>
                  </div>
                </form>
              )}

              {currentStep === 2 && (
                <div className="animate-fade-up space-y-10">
                  {variantes.length === 0 ? (
                    <div>
                      <h3 className="text-[10px] font-black text-textMuted uppercase tracking-[0.3em] mb-8">SELECCIONA EL COLOR DEL MODELO</h3>
                      <div className="flex gap-3 flex-wrap">
                        {colores.map(color => (
                          <button key={color.id} onClick={() => handleAddVariante(color.id)} className="group flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/10 hover:border-accent hover:bg-accent/5 transition-all">
                            <span className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: color.hex }}></span>
                            <span className="text-sm font-bold">{color.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-center animate-fade-up">
                      <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-4">COLOR ASIGNADO</p>
                      <div className="flex flex-col items-center gap-4">
                        <span className="w-16 h-16 rounded-full ring-8 ring-accent/10 border-2 border-accent" style={{ backgroundColor: variantes[0].colores?.hex }}></span>
                        <span className="text-xl font-black uppercase tracking-widest">{variantes[0].colores?.nombre}</span>
                        <button 
                          onClick={() => handleDeleteVariante(variantes[0].id)} 
                          className="mt-4 text-xs font-bold text-danger hover:underline uppercase tracking-widest"
                        >
                          Eliminar para cambiar color
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 pt-10 border-t border-white/5">
                    <button onClick={() => setCurrentStep(1)} className="btn btn-secondary flex-1 py-5 rounded-2xl font-black">← ATRÁS</button>
                    <button onClick={() => setCurrentStep(3)} disabled={variantes.length === 0} className="btn btn-primary flex-1 py-5 rounded-2xl font-black tracking-widest">CONTINUAR A IMÁGENES →</button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-fade-up space-y-10">
                  <div className="flex flex-wrap gap-3 justify-center mb-10">
                    {variantes.map(v => (
                      <button key={v.id} onClick={() => handleSelectVariante(v)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${selectedVariante?.id === v.id ? 'bg-accent text-black border-accent font-black shadow-lg shadow-accent/20' : 'bg-white/5 border-white/10 text-textMuted'}`}>
                        <span className="w-4 h-4 rounded-full border border-current" style={{ backgroundColor: v.colores?.hex }}></span>
                        <span className="text-xs uppercase tracking-widest">{v.colores?.nombre}</span>
                      </button>
                    ))}
                  </div>
                  
                  {selectedVariante ? (
                    <div className="space-y-8">
                      <label className="block group">
                        <div className={`border-2 border-dashed rounded-[40px] p-16 text-center cursor-pointer transition-all ${uploading ? 'bg-accent/5 border-accent animate-pulse' : 'border-white/10 hover:border-accent hover:bg-white/5'}`}>
                          <HiOutlineCloudUpload className="text-6xl mx-auto mb-4 text-accent" />
                          <p className="text-xl font-black tracking-tight">{uploading ? 'SUBIENDO...' : 'SUBIR FOTOGRAFÍAS'}</p>
                          <p className="text-textMuted text-xs mt-2 font-bold uppercase tracking-widest">Selecciona una o más fotos para el color {selectedVariante.colores?.nombre}</p>
                        </div>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUploadImages(Array.from(e.target.files))} disabled={uploading} />
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {imagenes.map(img => (
                          <div key={img.id} className={`relative aspect-square rounded-3xl overflow-hidden border-2 group transition-all ${img.orden === 0 ? 'border-accent shadow-lg shadow-accent/30' : 'border-white/5'}`}>
                            {img.orden === 0 && (
                              <div className="absolute top-2 left-2 z-10 bg-accent text-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                                Principal
                              </div>
                            )}
                            <img src={img.url_thumbnail || img.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {img.orden !== 0 && (
                                <button 
                                  onClick={() => handleSetPrincipal(img.id)} 
                                  className="w-8 h-8 bg-accent text-black rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                                  title="Establecer como principal"
                                >
                                  ★
                                </button>
                              )}
                              <button 
                                onClick={() => deleteImagen(img.id).then(() => setImagenes(prev => prev.filter(x => x.id !== img.id)))} 
                                className="w-8 h-8 bg-danger text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                              >
                                <HiOutlineTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center glass rounded-[40px] border border-dashed border-white/10">
                      <HiOutlinePhotograph className="text-6xl mx-auto mb-4 opacity-20" />
                      <p className="font-black text-textMuted uppercase tracking-widest">Selecciona un color para cargar fotos</p>
                    </div>
                  )}
                  <div className="flex gap-4 pt-10 border-t border-white/5">
                    <button onClick={() => setCurrentStep(2)} className="btn btn-secondary flex-1 py-5 rounded-2xl font-black">← ATRÁS</button>
                    <button onClick={() => setCurrentStep(4)} disabled={variantes.length === 0} className="btn btn-primary flex-1 py-5 rounded-2xl font-black tracking-widest">CONTINUAR A IMG PRINCIPAL →</button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="animate-fade-up space-y-10">
                  <div className="text-center mb-8">
                    <h3 className="text-[10px] font-black text-textMuted uppercase tracking-[0.3em] mb-2">SELECCIONA LA IMAGEN PRINCIPAL</h3>
                    <p className="text-textMuted text-sm">Esta imagen será la portada del producto en la tienda</p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mb-10">
                    {variantes.map(v => (
                      <button key={v.id} onClick={() => handleSelectVariante(v)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${selectedVariante?.id === v.id ? 'bg-accent text-black border-accent font-black shadow-lg shadow-accent/20' : 'bg-white/5 border-white/10 text-textMuted'}`}>
                        <span className="w-4 h-4 rounded-full border border-current" style={{ backgroundColor: v.colores?.hex }}></span>
                        <span className="text-xs uppercase tracking-widest">{v.colores?.nombre}</span>
                      </button>
                    ))}
                  </div>
                  {selectedVariante ? (
                    imagenes.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagenes.map(img => (
                          <div 
                            key={img.id} 
                            onClick={() => handleSetPrincipal(img.id)}
                            className={`relative aspect-square rounded-3xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                              img.orden === 0 
                                ? 'border-accent shadow-lg shadow-accent/30 ring-2 ring-accent' 
                                : 'border-white/10 hover:border-accent'
                            }`}
                          >
                            {img.orden === 0 && (
                              <div className="absolute top-3 left-3 z-10 bg-accent text-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <span>★</span> Principal
                              </div>
                            )}
                            <img src={img.url_thumbnail || img.url} className="w-full h-full object-cover" />
                            {img.orden !== 0 && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold">Seleccionar</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center glass rounded-[40px] border border-dashed border-white/10">
                        <HiOutlinePhotograph className="text-6xl mx-auto mb-4 opacity-20" />
                        <p className="font-black text-textMuted uppercase tracking-widest">Sube imágenes primero en el paso anterior</p>
                      </div>
                    )
                  ) : (
                    <div className="py-20 text-center glass rounded-[40px] border border-dashed border-white/10">
                      <p className="font-black text-textMuted uppercase tracking-widest">Selecciona un color para elegir la imagen principal</p>
                    </div>
                  )}
                  <div className="flex gap-4 pt-10 border-t border-white/5">
                    <button onClick={() => setCurrentStep(3)} className="btn btn-secondary flex-1 py-5 rounded-2xl font-black">← ATRÁS</button>
                    <button onClick={() => setCurrentStep(5)} disabled={imagenes.length === 0} className="btn btn-primary flex-1 py-5 rounded-2xl font-black tracking-widest">CONTINUAR A STOCK →</button>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="animate-fade-up space-y-10">
                  <div className="flex flex-wrap gap-3 justify-center mb-10">
                    {variantes.map(v => (
                      <button key={v.id} onClick={() => handleSelectVariante(v)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${selectedVariante?.id === v.id ? 'bg-accent text-black border-accent font-black shadow-lg shadow-accent/20' : 'bg-white/5 border-white/10 text-textMuted'}`}>
                        <span className="w-4 h-4 rounded-full border border-current" style={{ backgroundColor: v.colores?.hex }}></span>
                        <span className="text-xs uppercase tracking-widest">{v.colores?.nombre}</span>
                      </button>
                    ))}
                  </div>
                  {selectedVariante ? (
                    <div className="space-y-10">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-4">
                        {stockData.map(item => (
                          <div key={item.id_talla} className="space-y-2">
                            <label className="text-[10px] font-black text-textMuted block text-center uppercase">T{item.talla}</label>
                            <input type="number" min="0" value={item.stock} onChange={(e) => setStockData(prev => prev.map(s => s.id_talla === item.id_talla ? { ...s, stock: parseInt(e.target.value) || 0 } : s))} className="text-center font-black py-4 rounded-2xl border-white/10 focus:border-accent" />
                          </div>
                        ))}
                      </div>
                      <button onClick={handleSaveStock} disabled={saving} className="btn btn-secondary w-full py-5 rounded-2xl font-black uppercase tracking-widest">GUARDAR INVENTARIO PARA ESTE COLOR</button>
                    </div>
                  ) : (
                    <div className="py-20 text-center glass rounded-[40px] border border-dashed border-white/10">
                      <p className="font-black text-textMuted uppercase tracking-widest">Selecciona un color para definir el stock</p>
                    </div>
                  )}
                  <div className="pt-10 border-t border-white/5 space-y-4">
                    <div className="flex gap-4">
                      <button onClick={() => setCurrentStep(4)} className="btn btn-secondary flex-1 py-5 rounded-2xl font-black">← ATRÁS</button>
                      <button onClick={handlePublish} disabled={saving} className="btn btn-primary flex-[2] py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-accent/20">🚀 FINALIZAR Y PUBLICAR</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-10 flex flex-col md:flex-row gap-4 items-center animate-fade-up">
          <div className="relative flex-1 group w-full">
            <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-accent transition-colors text-xl" />
            <input type="text" placeholder="Buscar por modelo de zapatilla..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-14 py-5 bg-white/5 border-white/10 focus:bg-white/[0.08] transition-all rounded-[20px] w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => {
            const thumbnail = getProductThumbnail(product);
            const brand = getMarcaNombre(product.id_marca);
            return (
              <div key={product.id} className="group glass rounded-[40px] border border-white/5 overflow-hidden flex flex-col product-card-hover animate-fade-up shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#0a0a0a]">
                  {thumbnail ? <img src={thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-7xl opacity-10">👟</div>}
                  <div className="absolute top-6 left-6 flex flex-col gap-2 uppercase tracking-[0.2em] font-black text-[9px]">
                    <span className={`px-3 py-1.5 rounded-full border ${product.estado === 'activo' ? 'bg-accent/20 text-accent border-accent/20' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'}`}>{product.estado}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                    <button onClick={() => handleViewProduct(product)} className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"><HiOutlineEye className="text-2xl" /></button>
                    <button onClick={() => handleOpenForm(product)} className="w-14 h-14 rounded-2xl bg-accent text-black flex items-center justify-center hover:scale-110 transition-transform"><HiOutlinePencil className="text-2xl" /></button>
                    <button onClick={() => handleDelete(product.id)} className="w-14 h-14 rounded-2xl bg-danger text-white flex items-center justify-center hover:scale-110 transition-transform"><HiOutlineTrash className="text-2xl" /></button>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{brand}</span>
                    <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">{getGeneroNombre(product.id_genero)}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1 tracking-tight leading-tight group-hover:text-accent transition-colors">{product.modelo}</h3>
                  {product.codigo && <p className="text-[10px] font-mono text-textMuted mb-4">#{product.codigo}</p>}
                  <div className="mt-auto flex items-baseline gap-2 font-mono">
                    <span className="text-3xl font-black">S/. {product.precio_base}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && modalProduct && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-up" onClick={() => setShowModal(false)}>
          <div className="bg-[#050505] border border-white/10 rounded-[40px] max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-12 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-10 pb-6 border-b border-white/5">
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-[0.3em] font-mono">{getMarcaNombre(modalProduct.id_marca)}</span>
                  <h2 className="text-4xl font-black tracking-tighter mt-1 uppercase italic">{modalProduct.modelo}</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-danger hover:text-white rounded-2xl transition-all">✕</button>
              </div>
              <div className="space-y-24">
                {modalVariantes.map(v => {
                  const vImgs = modalImagenes.filter(img => img.id_variante === v.id);
                  const stk = modalStock[v.id] || [];
                  const stkByT = {}; tallas.forEach(t => stkByT[t.id] = stk.find(s => s.id_talla === t.id)?.stock || 0);
                  return (
                    <div key={v.id} className="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-fade-up">
                      <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                          <span className="w-12 h-12 rounded-full ring-4 ring-white/5 border border-white/20" style={{ backgroundColor: v.colores?.hex }} />
                          <h3 className="text-3xl font-black uppercase tracking-tighter italic">EDICIÓN {v.colores?.nombre}</h3>
                        </div>
                        {vImgs.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4">
                            {vImgs.map(img => (
                              <div key={img.id} className="relative rounded-[32px] overflow-hidden border border-white/5 bg-white/5 aspect-square">
                                <img src={img.url} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white/5 rounded-[32px] p-24 text-center border border-dashed border-white/10 opacity-30"><HiOutlinePhotograph className="text-6xl mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-[10px]">Sin fotografías</p></div>
                        )}
                      </div>
                      <div className="lg:col-span-5">
                        <div className="glass p-10 rounded-[40px] border border-white/10 sticky top-32">
                          <h4 className="text-[10px] font-black text-accent tracking-[0.4em] uppercase mb-10 text-center">INVENTARIO DISPONIBLE</h4>
                          <div className="grid grid-cols-4 gap-4">
                            {tallas.map(t => {
                              const s = stkByT[t.id];
                              return (
                                <div key={t.id} className="text-center">
                                  <div className="text-[9px] text-textMuted mb-2 font-black">T{t.valor}</div>
                                  <div className={`font-mono text-sm py-4 rounded-2xl border transition-all ${s > 0 ? 'bg-accent/10 border-accent/30 text-accent font-black' : 'bg-white/5 border-white/5 text-textMuted opacity-20'}`}>{s}</div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between">
                            <span className="text-textMuted text-[10px] font-black uppercase tracking-widest">Stock Total</span>
                            <span className="text-4xl font-black text-white">{Object.values(stkByT).reduce((a, b) => a + b, 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
