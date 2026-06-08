import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

const PYTHON_MICROSERVICE_URL = process.env.PYTHON_MICROSERVICE_URL || 'http://127.0.0.1:8000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { biometrics, user_id = 'default_user' } = body;

    // Map biometrics to Python FastAPI payload format
    const activityMap: Record<string, string> = {
      'sedentary': 'sedentary',
      'light': 'lightly_active',
      'moderate': 'moderately_active',
      'extra': 'extra_active'
    };

    const goalMap: Record<string, string> = {
      'cutting': 'weight_loss',
      'maintenance': 'maintenance',
      'bulking': 'muscle_gain'
    };

    const pythonPayload = {
      user_id: user_id,
      weight_kg: Number(biometrics.weight),
      height_cm: Number(biometrics.height),
      age_years: Number(biometrics.age),
      sex: biometrics.gender === 'male' ? 'male' : 'female',
      activity_level: activityMap[biometrics.activity] || 'sedentary',
      goal: goalMap[biometrics.goal] || 'maintenance',
      province: biometrics.location || 'Nasional',
      allergies: biometrics.allergies || [],
      clinical_conditions: []
    };

    const response = await fetch(`${PYTHON_MICROSERVICE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pythonPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python Recommendation microservice returned error status ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (result.status === 'safety_cutoff_triggered') {
      return NextResponse.json({
        success: false,
        status: 'safety_cutoff_triggered',
        clinical_condition_triggered: result.clinical_condition_triggered,
        medical_disclaimer: result.medical_disclaimer_id
      }, { status: 403 });
    }

    const mealPool = result.primary_schedule && result.alternative_pool
      ? [...result.primary_schedule, ...result.alternative_pool]
      : (result.top_20_recipes || []);

    // Save generated plan persistently to Supabase database
    const { error: supabaseError } = await supabase
      .from('meal_plans')
      .upsert({
        user_id: user_id,
        target_calories: result.targets?.calories || result.target_calories || 0,
        plan_data: mealPool
      }, { onConflict: 'user_id' });

    if (supabaseError) {
      console.error("Supabase Save Error:", supabaseError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Plan generated successfully and stored persistently.",
      plan: result
    }, { status: 200 });

  } catch (error: any) {
    console.error("Plan Generation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
