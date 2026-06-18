import { supabase } from '../lib/supabase';

export const productService = {
  async getAllProducts() {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        marcas(nombre, slug),
        categorias(nombre),
        generos(nombre),
        variantes(
          *,
          colores(*),
          imagenes(*)
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addProduct(product, marcas) {
    const marca = marcas.find(m => m.id === product.id_marca);
    const slug = `${marca?.slug || 'p'}-${product.modelo?.toLowerCase().replace(/\s+/g, '-') || 'model'}-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('productos')
      .insert([{ 
        ...product,
        slug,
        estado: 'borrador',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id, product) {
    const { data, error } = await supabase
      .from('productos')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async setStatus(id, estado) {
    const { data, error } = await supabase
      .from('productos')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ========== VARIANTES ==========
  async getVariantes(productId) {
    const { data, error } = await supabase
      .from('variantes')
      .select('*, colores(*)')
      .eq('id_producto', productId);

    if (error) throw error;
    return { data };
  },

  async addVariante(variante) {
    const { data: existing, error: checkError } = await supabase
      .from('variantes')
      .select('id')
      .eq('id_producto', variante.id_producto)
      .eq('id_color', variante.id_color)
      .maybeSingle();
    
    if (existing) {
      throw new Error('duplicate');
    }

    const { data, error } = await supabase
      .from('variantes')
      .insert([variante])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVariante(id) {
    const { error } = await supabase
      .from('variantes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // ========== IMÁGENES ==========
  async getImagenes(varianteId) {
    const { data, error } = await supabase
      .from('imagenes')
      .select('*')
      .eq('id_variante', varianteId)
      .order('orden');

    if (error) throw error;
    return { data };
  },

  async addImagen(imagen) {
    const { data, error } = await supabase
      .from('imagenes')
      .insert([imagen])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteImagen(id) {
    const { error } = await supabase
      .from('imagenes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async setImagenPrincipal(varianteId, imagenId) {
    const { data: imagenes, error: fetchError } = await supabase
      .from('imagenes')
      .select('id')
      .eq('id_variante', varianteId);

    if (fetchError) throw fetchError;

    for (const img of imagenes) {
      const newOrden = img.id === imagenId ? 0 : 1;
      const { error: updateError } = await supabase
        .from('imagenes')
        .update({ orden: newOrden })
        .eq('id', img.id);

      if (updateError) throw updateError;
    }

    return true;
  },

  // ========== STOCK ==========
  async getStock(varianteId) {
    const { data, error } = await supabase
      .from('variantes_tallas')
      .select('id_variante, id_talla, stock')
      .eq('id_variante', varianteId);

    if (error) throw error;
    return { data };
  },

  async updateStock(varianteId, tallasStock) {
    const upsertData = tallasStock.map(s => ({
      id_variante: parseInt(varianteId),
      id_talla: parseInt(s.id_talla),
      stock: parseInt(s.stock) || 0
    }));

    const { data, error } = await supabase
      .from('variantes_tallas')
      .upsert(upsertData, {
        onConflict: 'id_variante,id_talla'
      })
      .select();

    if (error) throw error;
    return data;
  }
};
