import { AUTODESK_AUTH_URL, AUTODESK_CLIENT_ID, AUTODESK_CLIENT_SECRET, AUTODESK_SCOPE } from './environment';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  if (!AUTODESK_CLIENT_ID || !AUTODESK_CLIENT_SECRET) {
    throw new Error('Autodesk credentials not configured');
  }

  try {
    // Prepare credentials for token request
    const credentials = Buffer.from(`${AUTODESK_CLIENT_ID}:${AUTODESK_CLIENT_SECRET}`).toString('base64');
    
    // Request new access token
    const response = await fetch(AUTODESK_AUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&scope=${encodeURIComponent(AUTODESK_SCOPE)}`,
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    
    if (!data.access_token || typeof data.access_token !== 'string') {
      throw new Error('Invalid access token received');
    }
    
    // Cache the token and set expiry
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000);

    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Authentication failed');
  }
} 