export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookUrl = process.env.EXCEL_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(200).json({
      success: false,
      skipped: true,
      warning: 'EXCEL_WEBHOOK_URL no configurada; respaldado en Firestore/Consola.'
    });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : { ...(req.body || {}) };
    payload.timestamp = new Date().toISOString();

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Servidor Excel respondió ${response.status} ${response.statusText}`);
    }

    return res.status(200).json({ success: true, message: 'Guardado en Excel exitosamente' });
  } catch (error) {
    console.error('Error enviando a Excel:', error);
    return res.status(502).json({ success: false, error: error.message });
  }
}
