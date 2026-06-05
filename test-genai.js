const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env.local' });

async function testConnection(location) {
  const project = process.env.GOOGLE_CLOUD_PROJECT || 'nara-ai-498513';
  
  console.log(`\n=== Testing Project: ${project}, Location: ${location} ===`);

  try {
    const ai = new GoogleGenAI({
        vertexai: {
          project: project,
          location: location,
        }
      });

    console.log(`Sending request to gemini-2.5-flash in ${location}...`);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Say "Hello, connection successful!"',
    });

    console.log("Response received:");
    console.log(response.text);
    console.log("SUCCESS!");
  } catch (error) {
    console.error(`FAILED in ${location} with error:`);
    console.error(error.message);
  }
}

async function runAllTests() {
    // Test Jakarta
    await testConnection('asia-southeast1');
    // Test US
    await testConnection('us-central1');
}

runAllTests();