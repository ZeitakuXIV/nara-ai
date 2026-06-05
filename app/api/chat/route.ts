import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context } = body;

    const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT!;
    const LOCATION = process.env.GOOGLE_CLOUD_LOCATION!;
    const AGENT_ID = process.env.GOOGLE_AGENT_ID!;
    const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN!; // dari gcloud / service account

    // 🔥 Inject data user ke prompt (INI GANTI systemInstruction)
    const enrichedMessage = `
User Goal: ${context?.goal || 'General Health Improvement'}
BMI Data: ${JSON.stringify(context?.bmi || {})}
Meal Plan: ${JSON.stringify(context?.mealPlan || {})}

User Message:
${message}
`;

    // 🟢 STEP 1: Create session
    const sessionRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/projects/${PROJECT_ID}/locations/${LOCATION}/agents/${AGENT_ID}/sessions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      }
    );

    const sessionData = await sessionRes.json();

    if (!sessionRes.ok) {
      throw new Error(sessionData.error?.message || 'Failed to create session');
    }

    // 🟢 STEP 2: Send message ke agent
    const chatRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${sessionData.name}:sendMessage`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            role: "user",
            content: enrichedMessage
          }
        })
      }
    );

    const chatData = await chatRes.json();

    if (!chatRes.ok) {
      throw new Error(chatData.error?.message || 'Chat failed');
    }

    // 🔥 Ambil response dari agent
    const aiText =
      chatData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({
      success: true,
      response: aiText,
      isAgent: true
    });

  } catch (error) {
    console.error("Agent Error:", error);

    return NextResponse.json({
      error: "Gagal terhubung ke Agent Gemini.",
      details: error instanceof Error ? error.message : "Internal Server Error"
    }, { status: 500 });
  }
}