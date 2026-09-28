# STARMAKER — Plataforma Web Serverless Premium

STARMAKER es una plataforma digital de streaming espacial, interactiva e inmersiva. Utiliza una arquitectura serverless sin dependencias de frameworks frontend (Vanilla JS ES6+), alimentada en tiempo real mediante **Firebase Firestore** (`onSnapshot`) y desplegada sobre **Vercel**.

---

## 1. Stack Tecnológico

- **Frontend Core**: Vanilla JavaScript ES6+ (ES Modules), HTML5 semántico, CSS3 moderno.
- **Build Tool**: [Vite](https://vitejs.dev/) v5+.
- **Backend as a Service (BaaS)**: [Firebase](https://firebase.google.com/) v10+ (Authentication & Firestore).
- **Hosting & Serverless**: [Vercel](https://vercel.com/) (Frontend Hosting + Serverless Functions).
- **Almacenamiento Multimedia**: [YourImageShare API](https://yourimageshare.com/) conectado mediante proxy Serverless seguro.

---

## 2. Estructura del Proyecto

```text
starmaker/
├── api/
│   └── upload-image.js          # Serverless Function: Multipart proxy a YourImageShare
├── public/
│   ├── favicon.svg              # Isotipo vectorial
│   └── assets/                  # Fallbacks y media estática
├── src/
│   ├── main.js                  # Entry point de la app y orquestador reactivo
│   ├── db.js                    # Inicialización Firestore, saveState y normalización
│   ├── state.js                 # Reactive Store ligero (patrón Observer)
│   ├── router.js                # Router Hash Vanilla JS (#/, #/admin, etc.)
│   ├── components/
│   │   ├── Header.js            # Navegación y branding espacial
│   │   ├── Hero.js              # Sección principal cinematográfica
│   │   ├── CardGrid.js          # Grid de módulos destacados
│   │   ├── HolographicCard.js   # Tarjeta con WebM alpha y triple fallback
│   │   ├── Carousel.js          # Carrusel espacial interactivo
│   │   ├── ActivityFeed.js      # Radar de telemetría en tiempo real
│   │   ├── MascotLayer.js       # Mascota flotante reactiva
│   │   └── LoadingScreen.js     # Pantalla de carga cuántica
│   ├── admin/
│   │   ├── admin.js             # Controlador del panel y Dirty State
│   │   ├── auth.js              # Firebase Auth v10 modular
│   │   ├── AdminLayout.js       # Shell admin e indicador de guardado de 5 estados
│   │   ├── SettingsEditor.js    # Editor cromático y del carrusel
│   │   ├── CardEditor.js        # CRUD reactivo de tarjetas
│   │   └── MediaUploader.js     # Subida binaria con barra de progreso
│   └── styles/
│       ├── variables.css        # Paleta oficial STARMAKER, radios y tipografía
│       ├── global.css           # Reset, fondo cósmico CSS puro y accesibilidad
│       ├── components.css       # Estilos modulares de componentes
│       ├── animations.css       # Animaciones optimizadas con aceleración GPU
│       └── responsive.css       # Breakpoints móviles, tablet y ultrawide
├── firestore.rules              # Reglas de seguridad para Firestore
├── .env.example                 # Plantilla de variables de entorno
├── index.html                   # Shell HTML5 semántico
├── package.json
└── vite.config.js
```

---

## 3. Configuración Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear archivo `.env` tomando como base `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Completar las credenciales en `.env`.
4. Iniciar el servidor local:
   ```bash
   npm run dev
   ```
