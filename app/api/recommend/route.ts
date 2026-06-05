import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Python Microservice configuration
const PYTHON_MICROSERVICE_URL = process.env.PYTHON_MICROSERVICE_URL || 'http://127.0.0.1:8000';

export const dynamic = 'force-dynamic';

// Helper to map Frontend Activity names to Python API names
const mapActivity = (level: string) => {
  const mapping: Record<string, string> = {
    'sedentary': 'sedentary',
    'light': 'lightly_active',
    'moderate': 'moderately_active',
    'extra': 'highly_active'
  };
  return mapping[level] || 'sedentary';
};

// Helper to map Frontend Goal names to Python API names
const mapGoal = (goal: string) => {
  const mapping: Record<string, string> = {
    'cutting': 'weight_loss',
    'maintenance': 'maintenance',
    'bulking': 'muscle_gain'
  };
  return mapping[goal] || 'maintenance';
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ status: 'error', message: 'Invalid request body' }, { status: 400 });
    }

    // 1. DATA MAPPING (Frontend -> Python Bridge)
    const pythonPayload = {
      weight_kg: parseFloat(body.weight),
      height_cm: parseFloat(body.height),
      age_years: parseInt(body.age),
      sex: body.gender, // 'male' or 'female'
      activity_level: mapActivity(body.activity),
      goal: mapGoal(body.goal),
      allergies: body.allergies || [],
      province: body.location || 'Jakarta',
      clinical_conditions: [] // Future extension
    };

    // 2. FORWARD TO PYTHON AI ENGINE
    const aiResponse = await fetch(`${PYTHON_MICROSERVICE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pythonPayload),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      return NextResponse.json({ 
        status: 'error', 
        message: `AI Engine Error: ${aiResponse.status}`,
        details: errorText 
      }, { status: aiResponse.status });
    }

    const result = await aiResponse.json();

    // 3. HANDLE SAFETY CUTOFF
    // If BMI is dangerous or specific health risks are detected by Python
    if (result.status === 'safety_cutoff_triggered') {
      return NextResponse.json({
        status: 'safety_shield',
        message: 'NARA Safety Shield Triggered: Based on your biometrics, the current goal may be medically unsafe. Please consult a professional.',
        recommendation: 'Maintenance mode enforced.',
        details: result.reason
      }, { status: 403 });
    }

    // 4. PERSIST TO SUPABASE (Requirement 4)
    // We update the user profile and save the top 20 recommendations
    if (body.email) {
       // Save/Update Profile
       await supabase.from('user_profiles').upsert({
         email: body.email,
         full_name: body.fullName,
         gender: body.gender,
         age: body.age,
         height: body.height,
         weight: body.weight,
         activity_level: body.activity,
         location: body.location,
         allergies: body.allergies,
         dietary_goal: body.goal
       });

       // Save the generated meal plan (Top 20)
       // We find the user_id first
       const { data: user } = await supabase.from('user_profiles').select('id').eq('email', body.email).single();
       
       if (user) {
         await supabase.from('meal_plans').insert({
           user_id: user.id,
           target_calories: result.target_calories || 0,
           plan_data: result.top_20_recipes // Storing the full list for later "swapping"
         });
       }
    }

    // 5. SUCCESS RESPONSE
    return NextResponse.json(result, { status: 200 });

  } catch (err: any) {
    console.error('API Error in Nara AI-Engine Integration:', err);
    return NextResponse.json({
        status: 'error',
        message: 'Internal server error during recommendation computation',
        details: err.message
      }, { status: 500 });
  }
}
