import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Python Microservice configuration
const PYTHON_MICROSERVICE_URL =
  process.env.PYTHON_MICROSERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_ENGINE_URL ||
  'http://127.0.0.1:8000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context, email } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Fetch user profile and meal plan from Supabase to provide real context
    let mealPlan = null;
    let userId = 'anonymous';

    if (email) {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (profile) {
          userId = profile.id;
          const { data: latestPlan } = await supabase
            .from('meal_plans')
            .select('plan_data')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestPlan) {
            mealPlan = latestPlan.plan_data;
          }
        }
      } catch (dbErr) {
        console.warn("Supabase context fetch failed. Continuing with context parameters from frontend.", dbErr);
      }
    }

    // 2. Prepare payload for Python AI-Engine Chatbot
    const chatPayload = {
      message,
      user_id: userId,
      context: {
        ...context,
        email,
        mealPlan: mealPlan || context?.mealPlan || null
      }
    };

    // 3. Forward to Python Nara Agent
    const aiResponse = await fetch(`${PYTHON_MICROSERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatPayload),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Engine Chat Error response:", errorText);
      throw new Error(`AI Engine responded with status ${aiResponse.status}`);
    }

    const data = await aiResponse.json();

    return NextResponse.json({
      success: true,
      response: data.response,
      isXAI: data.isXAI ?? true
    });

  } catch (error) {
    console.error("Agent Route Error:", error);
    return NextResponse.json({
      error: "Gagal terhubung ke Agent NARA.",
      details: error instanceof Error ? error.message : "Internal Server Error"
    }, { status: 500 });
  }
}