export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { fileBase64, ext } = req.body;
    if (!fileBase64) throw new Error("No file data");
    
    // fileBase64 is a base64 string
    const buffer = Buffer.from(fileBase64, 'base64');
    
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', new Blob([buffer]), `upload.${ext || 'mp4'}`);

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });

    const url = await catboxRes.text();
    if (!url.startsWith('http')) throw new Error(url);

    return res.status(200).json({ url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
