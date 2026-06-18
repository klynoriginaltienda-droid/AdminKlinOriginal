import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useReclamacionesAdmin = () => {
  const [reclamaciones, setReclamaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReclamaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('reclamaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw new Error(fetchError.message);
      setReclamaciones(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamaciones();
  }, []);

  const responderReclamacion = async (id, respuestaAdmin) => {
    try {
      const { error: updateError } = await supabase
        .from('reclamaciones')
        .update({
          respuesta_admin: respuestaAdmin.trim(),
          estado: 'respondido',
        })
        .eq('id', id);

      if (updateError) throw new Error(updateError.message);

      setReclamaciones(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, respuesta_admin: respuestaAdmin.trim(), estado: 'respondido' }
            : r
        )
      );

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    reclamaciones,
    loading,
    error,
    fetchReclamaciones,
    responderReclamacion,
  };
};