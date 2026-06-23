import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Python Microservice configuration
const PYTHON_MICROSERVICE_URL =
  process.env.PYTHON_MICROSERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_ENGINE_URL ||
  'http://127.0.0.1:8000';

export const dynamic = 'force-dynamic';

const ACTIVITY_MAP: Record<string, string> = {
  'sedentary': 'sedentary',
  'light': 'lightly_active',
  'moderate': 'moderately_active',
  'extra': 'extra_active'
};

const GOAL_MAP: Record<string, string> = {
  'cutting': 'weight_loss',
  'maintenance': 'maintenance',
  'bulking': 'muscle_gain',
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
      activity_level: ACTIVITY_MAP[body.activity] || 'sedentary',
      goal: GOAL_MAP[body.goal] || 'maintenance',
      allergies: body.allergies || [],
      province: body.location || 'Jakarta',
      clinical_conditions: []
    };

    let result;
    try {
      // ATTEMPT REAL FETCH
      const aiResponse = await fetch(`${PYTHON_MICROSERVICE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pythonPayload),
        signal: AbortSignal.timeout(8000) // 8s timeout (optimal for Vercel Hobby serverless limits)
      });

      if (!aiResponse.ok) throw new Error(`AI Server responded with status ${aiResponse.status}`);
      result = await aiResponse.json();

    } catch (fetchErr) {
      throw new Error(`AI Engine unreachable: ${fetchErr}`);
    }

    // NORMALIZE SUCCESSFUL PYTHON ENGINE RESPONSE FOR FRONTEND
    if (result && result.status === 'success' && (result.primary_schedule || result.alternative_pool)) {
      const primary = result.primary_schedule || [];
      const alternatives = result.alternative_pool || [];
      const combined = [...primary, ...alternatives];
      
      const mappedRecipes = combined.map((item: any, i: number) => {
        return {
          id: item.id || `recipe_${i}_${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
          title: item.title,
          image: item.image || `https://images.unsplash.com/photo-${[
              '1596797038530-2c107229654b', '1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd'
            ][i % 3]}?q=80&w=800&auto=format&fit=crop`,
          calories: Math.round(item.calories_per_serving || 400),
          protein: Math.round(item.protein_per_serving || 25),
          carbs: Math.round(item.carbs_per_serving || 45),
          fat: Math.round(item.fat_per_serving || 12),
          explanations: item.explanations || ['Calibrated based on your province and biometrics.'],
          ingredients: item.ingredients || '',
          structured_ingredients: item.structured_ingredients || [],
          score: item.score ?? null,
          food_category: item.food_category || null,
          portion_scale_factor: item.portion_scale_factor ?? null,
          regional_alignment_score: item.regional_alignment_score ?? null,
        };
      });
      
      result = {
        status: 'success',
        is_mock: false,
        target_calories: result.targets?.caloric_target_meal ? Math.round(result.targets.caloric_target_meal * 3) : 2000,
        top_20_recipes: mappedRecipes
      };
    }

    // HANDLE SAFETY CUTOFF
    if (result.status === 'safety_cutoff_triggered') {
      return NextResponse.json({
        status: 'safety_shield',
        message: 'NARA Safety Shield Triggered: Based on your biometrics, the current goal may be medically unsafe.',
        recommendation: result.clinical_condition_triggered || 'Maintenance mode enforced.',
        details: result.medical_disclaimer_id || result.medical_disclaimer_en || 'Consult a clinical dietitian.'
      }, { status: 403 });
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

       // Save the generated meal plan (Top 20 / 15 combined)
       // We find the user_id first
       const { data: user } = await supabase.from('user_profiles').select('id').eq('email', body.email).single();
       
       if (user) {
         const mealPool = result.primary_schedule && result.alternative_pool
           ? [...result.primary_schedule, ...result.alternative_pool]
           : (result.top_20_recipes || []);

         await supabase.from('meal_plans').upsert({
           user_id: user.id,
           target_calories: result.targets?.calories || result.target_calories || 0,
           plan_data: mealPool
         }, { onConflict: 'user_id' });
       }
    }

    return NextResponse.json(result, { status: 200 });

  } catch (err: any) {
    console.error('API Error in Nara AI-Engine Integration:', err);
    return NextResponse.json({
        status: 'error',
        message: 'Internal server error',
        details: err.message
      }, { status: 500 });
  }
}
