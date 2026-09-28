export default async function handler(req, res) {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Obtenemos la URL secreta del Webhook de nuestras variables de entorno en Vercel
  const webhookUrl = process.env.EXCEL_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return res.status(500).json({ error: 'EXCEL_WEBHOOK_URL no configurada en Vercel. Agrega el Webhook de Power Automate.' });
  }

  try {
    const payload = req.body;
    
    // Añadimos la estampa de tiempo exacta desde el servidor
    payload.timestamp = new Date().toISOString();

    // Enviamos los datos estructurados en formato JSON hacia Microsoft Power Automate / Excel Online
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor de Microsoft: ${response.status} ${response.statusText}`);
    }

    // Retornamos éxito al Frontend
    return res.status(200).json({ success: true, message: 'Guardado en Excel exitosamente' });
  } catch (error) {
    console.error("Error enviando a Excel:", error);
    return res.status(500).json({ error: error.message });
  }
}
