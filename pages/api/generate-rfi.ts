import { NextApiRequest, NextApiResponse } from 'next';
import { autodeskService } from '../../services/AutodeskService';
import { environment } from '../../config/environment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Debug environment variables
  console.log('Environment check:', {
    hasClientId: !!process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID,
    hasClientSecret: !!process.env.AUTODESK_CLIENT_SECRET,
    envClientId: !!environment.AUTODESK_CLIENT_ID,
    envClientSecret: !!environment.AUTODESK_CLIENT_SECRET,
    authUrl: environment.AUTODESK_AUTH_URL,
    aiServiceUrl: environment.AUTODESK_AI_SERVICE_URL
  });

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    console.log('Processing RFI query:', query);
    const rfiContent = await autodeskService.generateRFIContent(query);
    res.status(200).json(rfiContent);
  } catch (error) {
    console.error('Error generating RFI content:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Send a more detailed error message to the client
    res.status(500).json({
      message: 'Error generating RFI content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 