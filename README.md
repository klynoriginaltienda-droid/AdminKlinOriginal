# KLYN Server - Panel de Control de Inventario

![Klyn Original](https://via.placeholder.com/800x200/050505/ffffff?text=KLYN+SERVER)

**KLYN Server** es el panel de administración back-office diseñado específicamente para **Klyn Original**, una tienda de calzado. Este sistema permite a los administradores gestionar de forma centralizada e intuitiva todo el catálogo de productos, controlar el inventario a nivel de variantes (colores y tallas), y gestionar las imágenes utilizando almacenamiento optimizado en la nube.

---

## ✨ Características Principales

- 🔐 **Autenticación Segura:** Acceso restringido mediante credenciales para proteger la información comercial.
- 📦 **Gestión del Catálogo:** Creación, edición y visualización de productos de calzado (modelos, precios base, ofertas, marcas, categorías y géneros).
- 🎨 **Gestión de Variantes:** Control detallado de las distintas variantes de un modelo (colores distintos, SKUs únicos).
- 👟 **Control de Stock por Talla:** Sistema de inventario preciso (`variantes_tallas`) que evita ventas en negativo.
- 🖼️ **Imágenes Optimizadas:** Integración nativa con **Cloudinary** para carga, transformación en tiempo real (thumbnails) y eliminación sincronizada de imágenes.
- 📊 **Dashboard:** Panel de control con métricas generales del estado del inventario (en desarrollo).
- 🗑️ **Soft Deletes:** Los productos eliminados no se borran físicamente de la base de datos, manteniendo la integridad referencial y el historial de ventas.

---

## 🛠️ Stack Tecnológico

**Frontend:**
- **[React 19](https://react.dev/)** + **[Vite](https://vitejs.dev/)**: Construcción rápida y renderizado moderno.
- **[Tailwind CSS](https://tailwindcss.com/)**: Estilos utility-first para una UI premium, con tema oscuro (glassmorphism y neon accents).
- **[React Icons](https://react-icons.github.io/react-icons/)**: Iconografía moderna e intuitiva.

**Backend / Servicios Cloud:**
- **[Supabase](https://supabase.com/)**: Base de datos PostgreSQL en tiempo real, con Row Level Security (RLS) y autenticación.
- **[Cloudinary](https://cloudinary.com/)**: Almacenamiento y optimización de imágenes en la nube.

---

## 🗄️ Arquitectura de Base de Datos

El sistema está diseñado para soportar la complejidad real de una tienda de calzado, donde un "Producto" es una abstracción que agrupa variantes.

El modelo relacional principal incluye:
- **Catálogos Base:** `marcas`, `categorias`, `generos`, `tallas`, `colores`.
- **`productos`:** Define el modelo (ej. "Nike Air Max 90"), precio base y relaciones de marca/categoría.
- **`variantes`:** Define una versión específica del producto en un color determinado y con su propio SKU y precio opcional.
- **`variantes_tallas`:** La tabla de inventario real (stock físico de una variante en una talla concreta).
- **`imagenes`:** Vinculadas a cada variante, almacenando referencias a Cloudinary.

> 📚 Para detalles técnicos exhaustivos sobre la base de datos, tipos, diagramas relacionales, queries comunes y reglas de negocio, consulta el archivo: **[ContexDataBase.md](./ContexDataBase.md)**.

---

## 🚀 Instalación y Uso Local

### 1. Clonar y preparar dependencias

```bash
# Instalar dependencias
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en la configuración necesaria para Supabase y Cloudinary:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_API_KEY=tu_api_key
VITE_CLOUDINARY_API_SECRET=tu_api_secret
```

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

El panel estará disponible localmente, generalmente en `http://localhost:5173`.

### 4. Construcción para Producción

```bash
npm run build
```
Esto generará los archivos estáticos optimizados en la carpeta `dist/`.

---

## 📂 Estructura del Proyecto

```text
/src
 ├── /assets       # Recursos estáticos (imágenes, logos)
 ├── /components   # Componentes modulares de React (Sidebar, Dashboard, Products, etc.)
 ├── /hooks        # Custom hooks (ej. useApp para el estado global y auth)
 ├── /lib          # Configuraciones y clientes (Supabase client, Cloudinary)
 ├── /services     # Capa de servicios para abstraer las peticiones a la BD (metadataService, productService)
 ├── App.jsx       # Componente principal y enrutador condicional
 ├── index.css     # Estilos globales y capas de Tailwind
 └── main.jsx      # Punto de entrada de la aplicación React
```

---

*Desarrollado para la administración integral de **Klyn Original**.*
