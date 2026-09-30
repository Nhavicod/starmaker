import { handleUpload } from '@vercel/blob/client';

export default async function uploadHandler(request, response) {
  try {
    const body = (typeof request.body === 'string') ? JSON.parse(request.body) : request.body;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob upload completed', blob, tokenPayload);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Upload error:", error);
    return response.status(400).json({ error: error.message });
  }
}
