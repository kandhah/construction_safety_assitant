export const environment = {
  AUTODESK_CLIENT_ID: process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID || 'dYrYrKLLaa0efEoUAKbwy2QGXhENGgokFdVS0aIl0iQkrWXF',
  AUTODESK_CLIENT_SECRET: process.env.AUTODESK_CLIENT_SECRET || 'xPJoFH1MbMJhMqUBHEQFeobI3TJq4bLyJXvGP59boYjntLqvbuYWnba2KhOO89cW',
  AUTODESK_AUTH_URL: 'https://developer-stg.api.autodesk.com/authentication/v2/token',
  AUTODESK_AI_SERVICE_URL: process.env.AUTODESK_AI_SERVICE_URL || 'https://developer-stg.api.autodesk.com/aiservice/model/invoke',
  AUTODESK_ACCESS_TOKEN: process.env.AUTODESK_ACCESS_TOKEN || '',
}; 