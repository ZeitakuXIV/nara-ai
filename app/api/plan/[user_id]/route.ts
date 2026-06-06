import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

const PYTHON_MICROSERVICE_URL = process.env.PYTHON_MICROSERVICE_URL || 'http://127.0.0.1:8000';

export async function GET(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params;

    let targetUserId = user_id;

    // 1. Resolve email to user UUID from user_profiles if an email is passed
    if (user_id.includes('@')) {
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', user_id)
        .maybeSingle();

      if (profileError) {
        console.error("Supabase user_profile lookup error:", profileError.message);
      }
      
      if (userProfile) {
        targetUserId = userProfile.id;
      }
    }

    // 2. Try to fetch the plan from Supabase first to save compute resource
    const { data: dbData, error: dbError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (dbError) {
      console.error("Supabase Fetch Error:", dbError.message);
    }

    if (dbData && dbData.plan_data) {
      const allRecipes = dbData.plan_data || [];
      // Reconstruct compatible response structure from stored data
      return NextResponse.json({
        success: true,
        status: 'success',
        target_calories: dbData.target_calories,
        primary_schedule: allRecipes.slice(0, 7),
        alternative_pool: allRecipes.slice(7),
        mealPool: allRecipes
      }, { status: 200 });
    }

    // 3. Fallback to Python microservice if not found in database
    const response = await fetch(`${PYTHON_MICROSERVICE_URL}/plan/${user_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 } // Avoid cache so chatbot retrieves freshest plan
    });

    if (!response.ok) {
      // If the microservice also doesn't have it, let's try fallback check on 'default_user' in Supabase
      if (user_id !== 'default_user') {
        const { data: defaultData } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', 'default_user')
          .maybeSingle();
        
        if (defaultData && defaultData.plan_data) {
          const allRecipes = defaultData.plan_data || [];
          return NextResponse.json({
            success: true,
            status: 'success',
            target_calories: defaultData.target_calories,
            primary_schedule: allRecipes.slice(0, 7),
            alternative_pool: allRecipes.slice(7),
            mealPool: allRecipes
          }, { status: 200 });
        }
      }

      if (response.status === 404) {
        return NextResponse.json(
          { status: 'error', message: `No active plan found for user: ${user_id}` },
          { status: 404 }
        );
      }
      throw new Error(`Python Recommendation microservice returned error status ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });

  } catch (err: any) {
    console.error('API Error in Nara Get Plan:', err);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error while fetching meal plan',
        details: err.message || String(err)
      },
      { status: 500 }
    );
  }
}
