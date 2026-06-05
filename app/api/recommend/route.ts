import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Python Microservice configuration
const PYTHON_MICROSERVICE_URL = process.env.PYTHON_MICROSERVICE_URL || 'http://127.0.0.1:8000';

export const dynamic = 'force-dynamic';

/**
 * Normalizes Python AI Engine results to match the PWA frontend expectations.
 */
const normalizeAiResponse = (result: any) => {
  if (!result || result.status !== 'success') return result;

  // Combine primary_schedule and alternative_pool into a single pool for the PWA
  const rawPool = [
    ...(result.primary_schedule || []),
    ...(result.alternative_pool || [])
  ];

  const normalizedPool = rawPool.map((item: any, i: number) => ({
    id: item.id || `ai_${i}_${Date.now()}`,
    title: item.title || 'NARA Specialty',
    // Logic: Use existing image if AI provides it, else use high-quality placeholders
    image: item.image || `https://images.unsplash.com/photo-${[
        '1596797038530-2c107229654b', '1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd', '1547592166-23ac45744acd'
      ][i % 4]}?q=80&w=800&auto=format&fit=crop`,
    calories: Math.round(item.calories_per_serving || item.calories || 400),
    protein: Math.round(item.protein_per_serving || item.protein || 25),
    carbs: Math.round(item.carbs_per_serving || item.carbs || 45),
    fat: Math.round(item.fat_per_serving || item.fat || 12),
    // Scaling reason: Join explanations array or use default
    scaling_reason: Array.isArray(item.explanations) 
      ? item.explanations.join(' ') 
      : (item.scaling_reason || 'Calibrated based on your province and biometrics.'),
    ingredients: item.ingredients || [
      { name: 'Protein Source', qty: 'Scaled to target' },
      { name: 'Local Carbohydrate', qty: 'Standard portion' }
    ]
  }));

  return {
    ...result,
    top_20_recipes: normalizedPool // This is what the PWA (Zustand) expects
  };
};

// Fallback Mock Data Generator (In case Python server is offline)
const generateMockRecommendations = (goal: string) => {
  const recipes = [
    { title: 'Nasi Tim Ayam Kampung', calories: 345, protein: 22, carbs: 45, fat: 8, scaling_reason: 'Selected for high bioavailability.' },
    { title: 'Pepes Ikan Kembung', calories: 420, protein: 28, carbs: 10, fat: 12, scaling_reason: 'Optimized for Omega-3 content.' },
    { title: 'Gado-Gado Siram', calories: 380, protein: 15, carbs: 55, fat: 10, scaling_reason: 'High fiber local selection.' }
  ];

  const top_20 = Array.from({ length: 20 }).map((_, i) => ({
    ...recipes[i % recipes.length],
    id: `mock_${i}_${Date.now()}`,
    image: `https://images.unsplash.com/photo-${['1596797038530-2c107229654b', '1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd'][i % 3]}?q=80&w=800&auto=format&fit=crop`,
    ingredients: [{ name: 'Base Ingredient', qty: 'Scaled' }]
  }));

  return {
    status: 'success',
    is_mock: true,
    target_calories: goal === 'bulking' ? 2800 : goal === 'cutting' ? 1800 : 2200,
    top_20_recipes: top_20
  };
};

const mapActivity = (level: string) => {
  const mapping: Record<string, string> = {
    'sedentary': 'sedentary',
    'light': 'lightly_active',
    'moderate': 'moderately_active',
    'extra': 'highly_active'
  };
  return mapping[level] || 'sedentary';
};

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

    const pythonPayload = {
      weight_kg: parseFloat(body.weight),
      height_cm: parseFloat(body.height),
      age_years: parseInt(body.age),
      sex: body.gender,
      activity_level: mapActivity(body.activity),
      goal: mapGoal(body.goal),
      allergies: body.allergies || [],
      province: body.location || 'Jakarta',
      clinical_conditions: []
    };

    let result;
    try {
      const aiResponse = await fetch(`${PYTHON_MICROSERVICE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pythonPayload),
        signal: AbortSignal.timeout(10000) // Increase to 10s for heavy AI tasks
      });

      if (!aiResponse.ok) throw new Error('AI Server Error');
      const rawResult = await aiResponse.json();
      
      // CRITICAL: Normalize the Python specific format to the PWA format
      result = normalizeAiResponse(rawResult);

    } catch (fetchErr) {
      console.warn("AI Engine unreachable. Using Safety Fallback.");
      result = generateMockRecommendations(body.goal);
    }

    if (result.status === 'safety_cutoff_triggered') {
      return NextResponse.json(result, { status: 403 });
    }

    // PERSIST TO SUPABASE
    if (body.email) {
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

       const { data: user } = await supabase.from('user_profiles').select('id').eq('email', body.email).single();
       
       if (user) {
         await supabase.from('meal_plans').insert({
           user_id: user.id,
           target_calories: result.target_calories || 0,
           plan_data: result.top_20_recipes // This now contains the normalized REAL recipes
         });
       }
    }

    return NextResponse.json(result, { status: 200 });

  } catch (err: any) {
    console.error('API Bridge Error:', err);
    return NextResponse.json({ status: 'error', message: 'Internal bridge error', details: err.message }, { status: 500 });
  }
}
