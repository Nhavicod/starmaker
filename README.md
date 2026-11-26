# STARMAKER — Universo Digital de Creadores (v2.0)

Plataforma web interactiva con Showroom 3D, Cápsula Trackpad Automatizada, Portales de Registro/Academia/Soporte AI y Consola Ejecutiva en tiempo real.

## Arquitectura Modular

```text
├── index.html                  # Estructura semántica limpia (Showroom, Portales y Consola)
├── api/
│   ├── submit-excel.js         # Webhook Serverless hacia Power Automate / Excel Online
│   └── upload-file.js          # Relay Serverless de subida de archivos multimedia
├── public/
│   ├── leonsito.webm           # Mascota StarLeo con canal alfa (Chrome / Android)
│   ├── LEON2.mp4               # Mascota StarLeo compatible con Safari / iOS
│   └── favicon.svg
├── src/
│   ├── main.js                 # Punto de entrada y puente reactivo de la aplicación
│   ├── config/
│   │   └── defaults.js         # Configuración de portales, catálogo inicial y estado base
│   ├── services/
│   │   └── bridge.js           # Sincronización bidireccional Firestore + LocalStorage + Uploads
│   ├── showroom/
│   │   └── stage.js            # Motor de partículas, Chroma-Key 30fps y Capsule Trackpad
│   ├── portals/
│   │   └── portals.js          # Registro 10s, Academia dinámica y Soporte AI + Tickets
│   ├── admin/
│   │   ├── mascotWidget.js     # Calibrador flotante 3D de mascota por portal
│   │   └── console.js          # Consola Ejecutiva con widgets prendidos/dormidos y CRUD
│   └── styles/
│       ├── app.css             # Estilos del Showroom, Trackpad y Portales
│       └── admin.css           # Estilos aislados de la Consola Ejecutiva y Calibrador
└── scripts/
    └── verify_app.cjs          # Suite de verificación E2E con Puppeteer
```

## Comandos

```bash
npm run dev       # Servidor local Vite (http://localhost:3000)
npm run build     # Compilación optimizada de producción en dist/
npm test          # Verificación integral E2E en navegador headless
```
