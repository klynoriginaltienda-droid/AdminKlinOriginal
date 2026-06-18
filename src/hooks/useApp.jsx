import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { productService } from '../services/productService';
import { metadataService } from '../services/metadataService';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [metadata, setMetadata] = useState({
    marcas: [],
    categorias: [],
    generos: [],
    tallas: [],
    colores: []
  });
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Verificar sesión real de Supabase o LocalStorage
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsAuthenticated(true);
      } else {
        const localSession = localStorage.getItem('klyn_session');
        if (localSession === 'active') setIsAuthenticated(true);
      }
      setIsAuthLoading(false);
    }
    checkUser();
  }, []);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [productsData, metadataData] = await Promise.all([
        productService.getAllProducts(),
        metadataService.getMetadata()
      ]);
      setProducts(productsData || []);
      setMetadata(metadataData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========== AUTH ==========
  async function login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: error?.message || 'Credenciales incorrectas' };
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('klyn_session');
    setIsAuthenticated(false);
    setProducts([]);
  }

  // ========== PRODUCTOS ==========
  async function addProduct(product) {
    try {
      const data = await productService.addProduct(product, metadata.marcas);
      setProducts(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function updateProduct(id, product) {
    try {
      const data = await productService.updateProduct(id, product);
      // Recargar todos los productos para asegurar consistencia con joins
      const freshProducts = await productService.getAllProducts();
      setProducts(freshProducts);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function deleteProduct(id) {
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function publicarProducto(id) {
    try {
      const data = await productService.setStatus(id, 'activo');
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return (
    <AppContext.Provider value={{
      products,
      ...metadata,
      loading,
      isAuthenticated,
      isAuthLoading,
      login,
      logout,
      loadData,
      addProduct,
      updateProduct,
      deleteProduct,
      publicarProducto,
      getVariantes: productService.getVariantes,
      addVariante: async (variante) => {
        try {
          const data = await productService.addVariante(variante);
          return { success: true, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      deleteVariante: productService.deleteVariante,
      getImagenes: productService.getImagenes,
      addImagen: async (imagen) => {
        try {
          const data = await productService.addImagen(imagen);
          return { success: true, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      deleteImagen: productService.deleteImagen,
      setImagenPrincipal: async (varianteId, imagenId) => {
        try {
          await productService.setImagenPrincipal(varianteId, imagenId);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      getStock: async (varianteId) => {
        try {
          return await productService.getStock(varianteId);
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      updateStock: async (varianteId, tallasStock) => {
        try {
          const data = await productService.updateStock(varianteId, tallasStock);
          return { success: true, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
