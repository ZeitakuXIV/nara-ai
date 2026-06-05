const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const project = process.env.GOOGLE_CLOUD_PROJECT || 'nara-ai-498513';
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'asia-southeast1';

  console.log(`Connecting to Project: ${project}, Location: ${location}`);

  try {
    const vertexAI = new VertexAI({ project: project, location: location });
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    console.log("Sending test request to gemini-2.5-flash...");
    const req = {
      contents: [{ role: 'user', parts: [{ text: 'Say "Hello, connection successful!"' }] }],
    };

    const resp = await generativeModel.generateContent(req);
    console.log("Response received:");
    console.log(resp.response.candidates[0].content.parts[0].text);
    console.log("SUCCESS");
  } catch (error) {
    console.error("FAILED with error:");
    console.error(error.message);
  }
}

testConnection();