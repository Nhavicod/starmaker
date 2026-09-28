// /api/upload-image.js
// 1. ANULAR LÍMITES DE VERCEL (CRÍTICO)
export const config = {
  maxDuration: 60, // Sube el timeout de 10s a 60s
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Sube el límite del payload de 1MB a 10MB
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const apiKey = process.env.YOURIMAGESHARE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key no configurada en Vercel' });

  try {
    const { fileBase64, mimeType, fileName } = req.body;
    if (!fileBase64) return res.status(400).json({ error: 'No content provided' });

    // 2. CONSTRUCCIÓN BINARIA MANUAL (NO USAR FormData)
    const buffer = Buffer.from(fileBase64, 'base64');
    const type = mimeType || 'video/webm';
    const name = fileName || 'upload.webm';
    const boundary = '----StarmakerBoundary' + Date.now();
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="uploads"; filename="${name}"\r\nContent-Type: ${type}\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const body = Buffer.concat([
      Buffer.from(header, 'utf-8'),
      buffer,
      Buffer.from(footer, 'utf-8'),
    ]);

    // 3. ENVÍO A YOURIMAGESHARE
    const response = await fetch('https://yourimageshare.com/api', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: body,
    });

    const data = await response.json();

    if (!response.ok || data.type === 'error') {
      return res.status(400).json({ error: data.errors || data.message || 'Error en YourImageShare' });
    }

    const fileData = Array.isArray(data.data) ? data.data[0] : data.data;
    const url = fileData.path || fileData.src || fileData.url;

    return res.status(200).json({ success: true, url: url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
