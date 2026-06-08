import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Python Microservice configuration
const PYTHON_MICROSERVICE_URL =
  process.env.PYTHON_MICROSERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_ENGINE_URL ||
  'http://127.0.0.1:8000';

export const dynamic = 'force-dynamic';

// Parser to split comma-separated ingredients into name and quantity objects
const parseIngredients = (ingredientsStr: string): Array<{ name: string; qty: string }> => {
  if (!ingredientsStr) return [];
  return ingredientsStr.split(',').map(part => {
    const trimmed = part.trim();
    // Match something like "1 butir", "250 gr", "2 siung", "1/2 sdt", "0.5 kg" etc.
    const match = trimmed.match(/^(\d+(?:\/\d+)?(?:\.\d+)?\s*(?:kg|gr|g|siung|butir|sdm|sdt|ml|liter|bungkus|lembar|piring|gelas|biji|ruas|tangkai|buah)?)\s+(.+)$/i);
    if (match) {
      return {
        qty: match[1].trim(),
        name: match[2].trim()
      };
    }
    return {
      qty: 'Secukupnya',
      name: trimmed
    };
  });
};

// Fallback Mock Data Generator (In case Python server is offline / ECONNREFUSED)
const generateMockRecommendations = (goal: string) => {
  const recipes = [
    { title: 'Nasi Tim Ayam Kampung', calories: 345, protein: 22, carbs: 45, fat: 8, scaling_reason: 'Selected for high bioavailability.' },
    { title: 'Pepes Ikan Kembung', calories: 420, protein: 28, carbs: 10, fat: 12, scaling_reason: 'Optimized for Omega-3 content.' },
    { title: 'Gado-Gado Siram', calories: 380, protein: 15, carbs: 55, fat: 10, scaling_reason: 'High fiber local selection.' },
    { title: 'Soto Ayam Lamongan', calories: 310, protein: 20, carbs: 35, fat: 7, scaling_reason: 'Balanced micronutrient profile.' },
    { title: 'Rendang Daging Sapi', calories: 550, protein: 32, carbs: 15, fat: 25, scaling_reason: 'High protein muscle support.' },
    { title: 'Ikan Bakar Cianjur', calories: 400, protein: 30, carbs: 5, fat: 14, scaling_reason: 'Grilled method reduces excess fat.' },
    { title: 'Tahu Tempe Bacem', calories: 290, protein: 18, carbs: 40, fat: 6, scaling_reason: 'Plant-based protein synergy.' },
    { title: 'Sayur Asem Jakarta', calories: 150, protein: 5, carbs: 30, fat: 2, scaling_reason: 'Low calorie electrolyte support.' },
    { title: 'Sate Ayam Madura', calories: 480, protein: 35, carbs: 25, fat: 18, scaling_reason: 'Focused on lean protein mass.' },
    { title: 'Gulai Daun Singkong', calories: 320, protein: 12, carbs: 30, fat: 15, scaling_reason: 'Calibrated for regional preference.' }
  ];

  // Fill to 20
  const top_20 = Array.from({ length: 20 }).map((_, i) => ({
    ...recipes[i % recipes.length],
    id: `mock_${i}`,
    image: `https://images.unsplash.com/photo-${['1596797038530-2c107229654b', '1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd'][i % 3]}?q=80&w=800&auto=format&fit=crop`
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
    'extra': 'extra_active'
  };
  return mapping[level] || 'sedentary';
};

const mapGoal = (goal: string) => {
  const mapping: Record<string, string> = {
    'cutting': 'weight_loss',
    'weight_loss': 'weight_loss', // Tangkap jika frontend sudah mengirim 'weight_loss'
    'maintenance': 'maintenance',
    'bulking': 'muscle_gain',
    'muscle_gain': 'muscle_gain'  // Tangkap jika frontend sudah mengirim 'muscle_gain'
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
      console.warn("AI Engine connection failed. Using NARA Safety Fallback logic. Error:", fetchErr);
      // FALLBACK TO MOCK IF AI SERVER IS DOWN
      result = generateMockRecommendations(body.goal);
    }

    // NORMALIZE SUCCESSFUL PYTHON ENGINE RESPONSE FOR FRONTEND
    if (result && result.status === 'success' && (result.primary_schedule || result.alternative_pool)) {
      const primary = result.primary_schedule || [];
      const alternatives = result.alternative_pool || [];
      const combined = [...primary, ...alternatives];
      
      const mappedRecipes = combined.map((item: any, i: number) => {
        const scaling_reason = item.explanations && item.explanations.length > 0
          ? item.explanations.join(' ')
          : 'Calibrated based on your province and biometrics.';
          
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
          scaling_reason: scaling_reason,
          ingredients: parseIngredients(item.ingredients)
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

         await supabase.from('meal_plans').insert({
           user_id: user.id,
           target_calories: result.targets?.calories || result.target_calories || 0,
           plan_data: mealPool // Storing the combined list for dashboard and later "swapping"
         });
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
