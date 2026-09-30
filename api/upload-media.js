import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb' // Catbox allows up to 200MB, but Vercel limits Serverless Functions to 4.5MB payload on free tier usually! Wait!
    }
  }
}
