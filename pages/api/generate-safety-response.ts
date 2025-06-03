import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken } from '../../utils/auth';
import { AUTODESK_AI_URL } from '../../utils/environment';

// Safety guidelines database
const safetyGuidelines = {
  ppe: {
    responses: [
      "Always wear a hard hat in construction zones.",
      "Steel-toed boots are mandatory on site.",
      "Use safety glasses when working with power tools or in dusty conditions.",
      "Wear high-visibility clothing in areas with moving vehicles or equipment.",
      "Use appropriate gloves for the task - chemical resistant, cut resistant, etc.",
    ]
  },
  machinery: {
    responses: [
      "Always perform pre-use equipment checks.",
      "Never operate machinery without proper training and certification.",
      "Keep all safety guards in place while operating machinery.",
      "Maintain clear communication with spotters and nearby workers.",
      "Follow lockout/tagout procedures during maintenance.",
    ]
  },
  vehicles: {
    responses: [
      "Inspect vehicles before operation using the daily checklist.",
      "Always wear seatbelts when operating vehicles.",
      "Maintain safe speeds and follow site traffic rules.",
      "Use spotters when backing up or operating in tight spaces.",
      "Keep proper distance from other vehicles and equipment.",
    ]
  },
  emergency: {
    responses: [
      "Know the location of emergency exits and assembly points.",
      "Keep first aid kits easily accessible.",
      "Report all incidents immediately to site supervisor.",
      "Know the emergency contact numbers for your site.",
      "Familiarize yourself with the site's emergency response plan.",
    ]
  },
  protocols: {
    responses: [
      "Always sign in and out of the construction site.",
      "Attend daily safety briefings.",
      "Report any unsafe conditions immediately.",
      "Follow proper lifting techniques.",
      "Maintain good housekeeping in your work area.",
    ]
  },
  hazards: {
    responses: [
      "Conduct regular hazard assessments of your work area.",
      "Be aware of overhead power lines and underground utilities.",
      "Check for proper ventilation in confined spaces.",
      "Watch for trip hazards and mark them appropriately.",
      "Monitor weather conditions that could affect safety.",
    ]
  }
};

// Common safety responses for general queries
const commonResponses = [
  "Safety is our top priority. Always follow proper safety protocols.",
  "If you're unsure about any safety procedure, ask your supervisor.",
  "Remember: everyone has the right to stop work if they feel unsafe.",
  "Take regular breaks to stay alert and prevent fatigue.",
  "Report any safety concerns immediately to your supervisor.",
];

interface AutodeskAIResponse {
  content: string;
  modelId: string;
  outputTokens: number;
  promptTokens: number;
  responseId: string;
  totalTokens: number;
}

interface FormattedResponse {
  content: string;
  metadata: {
    modelId: string;
    responseId: string;
    tokens: {
      output: number;
      prompt: number;
      total: number;
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, category } = req.body;

    // Get Autodesk access token
    const accessToken = await getAccessToken();

    // Base context for Autodesk-specific safety guidance
    const baseContext = `Using Autodesk Construction Cloud and BIM 360 tools for safety management. Consider features like:
- BIM 360 Field safety checklists
- Construction IQ risk analysis
- Autodesk Build safety workflows
- PlanGrid safety protocols
- Autodesk Takeoff safety markups`;

    // Construct the prompt based on category and query
    let promptText = '';
    if (category) {
      promptText = `${baseContext}

As a construction safety expert using Autodesk solutions, provide detailed guidance about ${category} regarding: ${query}.
Focus on:
1. How to use Autodesk tools to implement these safety measures
2. Specific features in Autodesk Construction Cloud for monitoring and reporting
3. BIM 360 safety checklist items and documentation
4. Integration with Autodesk Build's safety workflows
5. Best practices using Autodesk's construction management tools`;
    } else {
      promptText = `${baseContext}

As a construction safety expert using Autodesk solutions, provide detailed guidance about: ${query}.
Focus on:
1. Relevant Autodesk tools and features for this safety concern
2. How to document and track using Autodesk Construction Cloud
3. Safety checklist implementation in BIM 360
4. Autodesk Build safety workflow recommendations
5. Integration with existing Autodesk construction management processes`;
    }

    // Call Autodesk AI API
    const aiResponse = await fetch(AUTODESK_AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          targetModel: "CLAUDE_SONET_3_7_v1",
          parameters: {
            messages: [
              {
                role: "system",
                content: `You are an Autodesk construction safety expert. Provide guidance focused on Autodesk construction tools and platforms for safety management. 

IMPORTANT FORMATTING RULES:
1. Structure your response in clear sections using markdown
2. Start with a brief summary using > blockquote
3. Use ### for main sections
4. Use - for bullet points
5. Use \`code\` for tool names and technical terms
6. Use **bold** for emphasis
7. Use numbered lists for steps
8. Add a horizontal rule (---) between major sections
9. Keep paragraphs short and readable
10. Use tables where appropriate using | for columns

Example Format:
> Brief summary of the response

### Main Section
- Key point using \`tool name\`
- Another point with **emphasis**

1. First step
2. Second step

--- 

### Next Section
etc.`
              },
              {
                role: "user",
                content: promptText
              }
            ]
          }
        }]
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({}));
      console.error('AI API Error:', errorData);
      throw new Error(`Failed to get AI response: ${aiResponse.status}`);
    }

    const data: AutodeskAIResponse = await aiResponse.json();
    console.log('Raw AI Response:', JSON.stringify(data, null, 2));
    
    // Ensure we have content before processing
    if (!data.content) {
      throw new Error('No content received from AI service');
    }

    const formattedResponse: FormattedResponse = {
      content: data.content,
      metadata: {
        modelId: data.modelId || 'unknown',
        responseId: data.responseId || 'unknown',
        tokens: {
          output: data.outputTokens || 0,
          prompt: data.promptTokens || 0,
          total: data.totalTokens || 0
        }
      }
    };
    console.log('Formatted Response:', JSON.stringify(formattedResponse, null, 2));

    // Process and structure the markdown content
    const processedContent = formattedResponse.content;
      

    // Structure the response with metadata
    const chatResponse = {
      response: processedContent,
      details: {
        model: formattedResponse.metadata.modelId,
        responseId: formattedResponse.metadata.responseId,
        tokens: formattedResponse.metadata.tokens,
        category: category || 'general',
        query: query,
        timestamp: new Date().toISOString(),
        format: {
          markdown: true,
          supportedElements: [
            'summary-blockquote',
            'headers',
            'bullet-lists',
            'numbered-lists',
            'code-blocks',
            'inline-code',
            'bold',
            'tables',
            'horizontal-rules'
          ]
        }
      },
      markdown: true
    };
    console.log('Final Chat Response:', JSON.stringify(chatResponse, null, 2));

    res.status(200).json(chatResponse);
  } catch (error) {
    console.error('Error generating safety response:', error);
    res.status(500).json({ 
      error: 'Error generating safety response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 