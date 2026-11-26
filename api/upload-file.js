export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '15mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { fileBase64, ext, mimeType } = body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'No se recibió contenido del archivo' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    const safeExt = String(ext || 'bin').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
    const blob = new Blob([buffer], { type: mimeType || 'application/octet-stream' });

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, `starmaker_${Date.now()}.${safeExt}`);

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });

    const url = (await catboxRes.text()).trim();
    if (!catboxRes.ok || !url.startsWith('http')) {
      throw new Error(url || `Error ${catboxRes.status} en servidor de archivos`);
    }

    return res.status(200).json({ success: true, url });
  } catch (error) {
    console.error('Error en /api/upload-file:', error);
    return res.status(500).json({ error: error.message });
  }
}
