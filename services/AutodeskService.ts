import { environment } from '../config/environment';

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface AIServiceResponse {
  content: string;
  modelId: string;
  outputTokens: number;
  promptTokens: number;
  responseId: string;
  totalTokens: number;
}

class AutodeskService {
  private static instance: AutodeskService;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {}

  static getInstance(): AutodeskService {
    if (!AutodeskService.instance) {
      AutodeskService.instance = new AutodeskService();
    }
    return AutodeskService.instance;
  }

  private getBasicAuth(): string {
    const clientId = environment.AUTODESK_CLIENT_ID;
    const clientSecret = environment.AUTODESK_CLIENT_SECRET;
  debugger;
  
    if (!clientId || !clientSecret) {
      throw new Error('Missing Autodesk credentials. Please check your environment variables.');
    }
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    return `Basic ${auth}`;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(environment.AUTODESK_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': this.getBasicAuth(),
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'scope': 'data:read data:write',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Auth response error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
      }

      const data: AuthResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async generateRFIContent(query: string): Promise<{
    projectName: string;
    subject: string;
    description: string;
  }> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(environment.AUTODESK_AI_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              targetModel: 'CLAUDE_SONET_3_7_v1',
              parameters: {
                messages: [
                  {
                    role: 'system',
                    content: 'You are a professional construction project manager helping to draft RFIs (Request for Information). Convert informal queries into structured RFI content. Extract or infer the project name, subject, and description from the query. Keep the response in JSON format with the following fields: projectName, subject, description.',
                  },
                  {
                    role: 'user',
                    content: query,
                  },
                ],
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate RFI content');
      }

      const data: AIServiceResponse = await response.json();
      
      try {
        const parsedContent = JSON.parse(data.content);
        return {
          projectName: parsedContent.projectName || 'Construction Project',
          subject: parsedContent.subject || query,
          description: parsedContent.description || 'Please provide clarification on the above query.',
        };
      } catch (error) {
        console.error('Failed to parse AI response:', error);
        return {
          projectName: 'Construction Project',
          subject: query,
          description: 'Please provide clarification on the above query.',
        };
      }
    } catch (error) {
      console.error('Error generating RFI content:', error);
      throw error;
    }
  }
}

export const autodeskService = AutodeskService.getInstance(); 