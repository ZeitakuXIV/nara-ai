import { NextRequest, NextResponse } from 'next/server';
// Python Microservice configuration
const PYTHON_MICROSERVICE_URL = process.env.PYTHON_MICROSERVICE_URL || 'http://127.0.0.1:8000';

// Enforce dynamic execution for real-time recommendations
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Basic Stateless Validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { status: 'error', message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { weight_kg, height_cm, age_years, sex, activity_level, goal, province } = body;

    if (!weight_kg || !height_cm || !age_years || !sex || !activity_level || !goal || !province) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required onboarding profile fields' },
        { status: 400 }
      );
    }

    // 2. Forward request to Python Recommendation Microservice
    const response = await fetch(`${PYTHON_MICROSERVICE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python Recommendation microservice returned error status ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    // 4. Clinical Safety Trigger Check
    if (result.status === 'safety_cutoff_triggered') {
      return NextResponse.json(result, { status: 403 });
    }

    if (result.status === 'error') {
      return NextResponse.json(result, { status: 500 });
    }

    // 5. Success response
    return NextResponse.json(result, { status: 200 });

  } catch (err: any) {
    console.error('API Error in Nara AI-Engine Integration:', err);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error during recommendation computation',
        details: err.stderr || err.message || String(err)
      },
      { status: 500 }
    );
  }
}
