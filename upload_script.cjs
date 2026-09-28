const fs = require('fs');
const path = require('path');

async function upload() {
  const filePath = path.join(__dirname, 'leonsito_alpha.webm');
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');

  console.log(`Uploading ${fileBuffer.length} bytes...`);

  const response = await fetch('https://starmaker-two.vercel.app/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileBase64: base64Data,
      mimeType: 'video/webm',
      fileName: 'leonsito_alpha.webm'
    })
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
}

upload().catch(console.error);
