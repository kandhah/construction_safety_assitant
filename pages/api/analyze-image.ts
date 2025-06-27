import type { NextApiRequest, NextApiResponse } from 'next';
import { environment } from '../../config/environment';

interface SafetyAnalysisResponse {
  content: string;
}

// Add API config for larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
    responseLimit: false,
  },
};

// Cache token for 1 hour
let cachedToken: { token: string; expiry: number } | null = null;

async function getAccessToken(): Promise<string> {
  try {
    const response = await fetch(environment.AUTODESK_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `client_id=${environment.AUTODESK_CLIENT_ID}&client_secret=${environment.AUTODESK_CLIENT_SECRET}&grant_type=client_credentials&scope=data:read`,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Auth Error Response:', errorData);
      throw new Error(`Auth failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Auth Error:', error);
    throw new Error('Authentication failed');
  }
}

function formatSafetyAnalysis(aiResponse: string): string {
  // Just return the AI response directly - it's already well formatted
  return aiResponse;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SafetyAnalysisResponse>
) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  try {
    if (!req.body.image) {
      throw new Error('No image data provided');
    }

    const accessToken = await getAccessToken();
    
    const response = await fetch(environment.AUTODESK_AI_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          targetModel: "CLAUDE_SONET_3_7_v1",
          parameters: {
            customFields: {
              stop_sequences: ["color"]
            },
            messages: [
              {
                role: "system",
                content: "You are a construction safety expert. Analyze the image for safety compliance and provide a detailed report with the following structure:\n\n1. Personal Protective Equipment (PPE)\n- Compliant Items\n- Critical Violations\n- Recommendations\n\n2. Equipment and Machinery Safety\n- Safe Practices\n- Safety Concerns\n- Recommendations\n\n3. Work Environment Safety\n- Safe Conditions\n- Hazardous Conditions\n- Recommendations\n\n4. Site Organization\n- Positive Observations\n- Areas for Improvement\n- Recommendations\n\n5. Emergency Preparedness\n- Available Safety Measures\n- Missing Safety Elements\n- Recommendations\n\n6. Priority Actions Required\n- Immediate Actions (24 Hours)\n- Short-term Actions (1 Week)\n- Long-term Improvements (1 Month)\n\n7. Training Requirements\n- Required Training\n- Recommended Training"
              },
              {
                role: "file",
                content: "safety_image"
              },
              {
                role: "user",
                content: "Analyze this construction site image for safety compliance and provide a detailed report following the exact structure specified."
              }
            ]
          }
        }],
        attachments: [
          {
            id: "safety_image",
            mime: "image/jpeg",
            data: req.body.image
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI Service Error Response:', errorData);
      throw new Error(`AI service failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.content) {
      console.error('Invalid AI response format:', data);
      throw new Error('Invalid response format from AI service');
    }

    res.status(200).json({ content: data.content });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      content: `Error analyzing image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.` 
    });
  }
} 