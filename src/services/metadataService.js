import { supabase } from '../lib/supabase';

export const metadataService = {
  async getMetadata() {
    const [marcas, categorias, generos, tallas, colores] = await Promise.all([
      supabase.from('marcas').select('*').order('nombre'),
      supabase.from('categorias').select('*').order('nombre'),
      supabase.from('generos').select('*').order('nombre'),
      supabase.from('tallas').select('*').order('valor'),
      supabase.from('colores').select('*').order('nombre'),
    ]);

    return {
      marcas: marcas.data || [],
      categorias: categorias.data || [],
      generos: generos.data || [],
      tallas: tallas.data || [],
      colores: colores.data || []
    };
  }
};
