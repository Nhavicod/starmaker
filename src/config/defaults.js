export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC3iwfeStY1ANVcGIsH8rJD-8rJ5n_p_fE",
  authDomain: "starmaker-505b7.firebaseapp.com",
  projectId: "starmaker-505b7"
};

export const CLOUDINARY_CONFIG = {
  cloudName: "k6x0ampi",
  uploadPreset: "STARMAKER"
};

export const PORTALES = [
  {
    id: 1,
    targetId: "card-registro",
    name: "Registro",
    icon: "fa-rocket",
    ctaText: "Postula a STARMAKER ↓",
    accent: "#8B5CF6",
    glow: "#A78BFA",
    rgb: "139, 92, 246",
    adminColor: "#F18D79"
  },
  {
    id: 2,
    targetId: "card-tutoriales",
    name: "Academia",
    icon: "fa-film",
    ctaText: "Ver Tutoriales Pro ↓",
    accent: "#EC4899",
    glow: "#F472B6",
    rgb: "236, 72, 153",
    adminColor: "#E64381"
  },
  {
    id: 3,
    targetId: "card-dudas",
    name: "Soporte AI",
    icon: "fa-robot",
    ctaText: "Contactar Soporte ↓",
    accent: "#10B981",
    glow: "#34D399",
    rgb: "16, 185, 129",
    adminColor: "#45D09E"
  }
];

export const DEFAULT_MASCOT_PORTALS = {
  1: { safari: "", chrome: "", s: 1, x: 0, y: 0 },
  2: { safari: "", chrome: "", s: 1, x: 0, y: 0 },
  3: { safari: "", chrome: "", s: 1, x: 0, y: 0 }
};

export const DEFAULT_STATE = {
  videoPurgeVersion: 2,
  themeColor: "#D4AF7A",
  mascotPortals: JSON.parse(JSON.stringify(DEFAULT_MASCOT_PORTALS)),
  pinnedWidgets: {
    "w-kpi": true,
    "w-pending": true,
    "w-approved": true,
    "w-tickets": true
  },
  requestStatuses: {},
  requests: [
    {
      id: "SL-2026-48291",
      name: "Valeria Mendoza",
      user: "@valeria_live",
      country: "México",
      city: "CDMX",
      status: "EN REVISIÓN",
      video: false,
      videoUrl: "",
      date: "25/09/2026, 18:30",
      email: "valeria@starmaker.app",
      phone: "+52 55 4829 1020",
      agency: "StarLeo Agency",
      agentId: "AG-104",
      talent: "Canto & Charla",
      gender: "Femenino",
      platform: "TikTok Live"
    },
    {
      id: "SL-2026-19402",
      name: "Carlos Rivera",
      user: "@charly_stream",
      country: "Colombia",
      city: "Medellín",
      status: "APROBADA",
      video: false,
      videoUrl: "",
      date: "24/09/2026, 14:15",
      email: "charly@starmaker.app",
      phone: "+57 300 194 0211",
      agency: "Andes Creators",
      agentId: "AG-208",
      talent: "Música Acústica",
      gender: "Masculino",
      platform: "Twitch"
    },
    {
      id: "SL-2026-33910",
      name: "Camila Solís",
      user: "@cami_music",
      country: "Argentina",
      city: "Buenos Aires",
      status: "APROBADA",
      video: false,
      videoUrl: "",
      date: "23/09/2026, 11:40",
      email: "camila@starmaker.app",
      phone: "+54 9 11 3391 0044",
      agency: "Sur Talent",
      agentId: "AG-312",
      talent: "Baile & Entretenimiento",
      gender: "Femenino",
      platform: "Instagram Live"
    }
  ],
  tutorials: [
    {
      id: "tut-1",
      title: "Configura tu Set-up Pro",
      desc: "Aprende a usar luces, cámara y encuadre vertical a tu favor antes de salir en vivo.",
      category: "Fundamentos del Live",
      duration: "GUÍA",
      badge: "",
      progress: 100,
      type: "guide",
      thumb: "https://images.unsplash.com/photo-1516280440502-a2f0729792bf?w=480&q=75",
      url: "",
      points: [
        "Coloca tu luz principal a 45° frente a tu rostro, ligeramente por encima del nivel de los ojos.",
        "Limpia el lente frontal y fija el teléfono en un tripié estable a la altura de la mirada.",
        "Cuida el fondo: orden visual y una luz de acento cálida o RGB suave elevan la retención un 40%."
      ]
    },
    {
      id: "tut-2",
      title: "Retención de Audiencia",
      desc: "Técnicas probadas para enganchar espectadores en los primeros 15 segundos de tu Live.",
      category: "Fundamentos del Live",
      duration: "GUÍA",
      badge: "",
      progress: 55,
      type: "guide",
      thumb: "https://images.unsplash.com/photo-1580519542014-2252848ff70c?w=480&q=75",
      url: "",
      points: [
        "Saluda por su nombre a cada usuario que entra a la sala en menos de 5 segundos.",
        "Mantén una meta visible en pantalla (ej. canción especial o reto al llegar a la meta).",
        "Alterna bloques dinámicos de 10 minutos: talento, interacción con chat y dinámica grupal."
      ]
    },
    {
      id: "tut-3",
      title: "Audio y Micrófonos",
      desc: "Ecualización, monitoreo con audífonos y control de ganancia para una voz nítida.",
      category: "Fundamentos del Live",
      duration: "GUÍA",
      badge: "Popular",
      progress: 30,
      type: "guide",
      thumb: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=480&q=75",
      url: "",
      points: [
        "Usa siempre audífonos alámbricos o interfaz dedicada para evitar eco durante batallas PK.",
        "Mantén el micrófono a un puño de distancia con filtro antipop para evitar saturación.",
        "Haz una prueba de 30 segundos grabando voz y pista musical antes de iniciar emisión."
      ]
    },
    {
      id: "tut-4",
      title: "Iluminación Escénica RGB",
      desc: "Crea atmósfera visual de estudio usando esquemas de dos y tres puntos de luz.",
      category: "Fundamentos del Live",
      duration: "GUÍA",
      badge: "",
      progress: 15,
      type: "guide",
      thumb: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=480&q=75",
      url: "",
      points: [
        "Evita contraluces de ventanas abiertas detrás de ti; la luz clave siempre va al frente.",
        "Usa temperatura neutra (4500K-5200K) en el rostro para tonos de piel naturales.",
        "Reserva los colores neón (magenta, violeta o cian) para bañar la pared del fondo."
      ]
    },
    {
      id: "tut-5",
      title: "Ganar Batallas PK",
      desc: "Estrategias de equipo, gestión de guantes/multiplicadores y cierre en los últimos 30s.",
      category: "Monetización y Batallas PK",
      duration: "GUÍA",
      badge: "Nuevo",
      progress: 80,
      type: "guide",
      thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=480&q=75",
      url: "",
      points: [
        "Coordina previamente con tu comunidad los primeros 30 segundos para activar bonos de velocidad.",
        "Guarda el llamado fuerte para el último minuto manteniendo energía positiva y agradecimiento.",
        "Pacta dinámicas divertidas y respetuosas con el streamer rival para entretener a ambas salas."
      ]
    },
    {
      id: "tut-6",
      title: "Multiplicador de Diamantes",
      desc: "Aprovecha horarios estelares, metas semanales de agencia y bonificaciones oficiales.",
      category: "Monetización y Batallas PK",
      duration: "GUÍA",
      badge: "",
      progress: 40,
      type: "guide",
      thumb: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=480&q=75",
      url: "",
      points: [
        "Transmite con constancia en un horario fijo mínimo 5 días por semana para entrenar al algoritmo.",
        "Revisa con tu agente las campañas oficiales de temporada que otorgan bonos extra.",
        "Divide tu meta mensual en micro-metas diarias alcanzables."
      ]
    },
    {
      id: "tut-7",
      title: "Fidelizar Donadores VIP",
      desc: "Cómo construir una comunidad leal y reconocer a tus principales patrocinadores.",
      category: "Monetización y Batallas PK",
      duration: "GUÍA",
      badge: "",
      progress: 20,
      type: "guide",
      thumb: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=480&q=75",
      url: "",
      points: [
        "Personaliza tus agradecimientos mencionando el logro que ayudaron a desbloquear.",
        "Recuerda gustos musicales o temas favoritos de tus espectadores habituales.",
        "Mantén comunicación profesional dentro de los canales oficiales de la plataforma."
      ]
    }
  ],
  tickets: [
    {
      id: "TICK-4012",
      name: "Sofía Herrera",
      cat: "Oficial de Livestreaming",
      msg: "¿Cómo vinculo mi ID de la app para el corte mensual?",
      status: "ABIERTO",
      date: "25/09/2026"
    },
    {
      id: "TICK-3988",
      name: "Diego Morales",
      cat: "Oficial de Recarga",
      msg: "Confirmación de liquidación de diamantes.",
      status: "RESUELTO",
      date: "24/09/2026"
    }
  ],
  supportContacts: [
    {
      id: "livestreaming",
      name: "Oficial de Livestreaming",
      role: "Dirección de talento y emisiones",
      avatar: "🎙️",
      whatsapp: "5215500000001",
      email: "talento@starmaker.app"
    },
    {
      id: "recargas",
      name: "Oficial de Recarga",
      role: "Banca, recargas y liquidaciones",
      avatar: "💎",
      whatsapp: "5215500000000",
      email: "recargas@starmaker.app"
    },
    {
      id: "verificacion",
      name: "Oficial de Verificación",
      role: "Cumplimiento e identidad",
      avatar: "🛡️",
      whatsapp: "5215500000002",
      email: "verificacion@starmaker.app"
    }
  ],
  socials: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com"
  },
  events: [
    ["Sistema optimizado", "Videos previos depurados y conexiones activas", "Hoy"]
  ],
  notes: "• Revisar solicitudes pendientes antes de las 20:00.\n• Validar métricas de retención de nuevos streamers."
};
