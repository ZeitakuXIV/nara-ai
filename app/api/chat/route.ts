import { NextResponse } from 'next/server';

// Python Microservice configuration
const PYTHON_MICROSERVICE_URL = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://127.0.0.1:8000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context } = body;

    // 1. FORWARD TO PYTHON NARA AGENT (using google-adk)
    const aiResponse = await fetch(`${PYTHON_MICROSERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: {
          ...context,
          email: body.email // Adding email here so Python can fetch meal plan
        }
      }),
    });

    if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("AI Engine Chat Error:", errorText);
        throw new Error(`Failed to get response from Nara Agent. Status: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();

    return NextResponse.json({
      success: true,
      response: data.response,
      isXAI: data.isXAI || true
    });

  } catch (err) {
    console.error("AGENT ERROR:", err);

    return NextResponse.json({
      error: "Agent gagal terhubung",
      details: err instanceof Error ? err.message : "Unknown Error"
    }, { status: 500 });
  }
}
