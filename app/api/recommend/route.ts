import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';

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

    // 2. Resolve Paths
    const workspaceRoot = process.cwd();
    const scriptPath = path.join(
      workspaceRoot,
      'ai-engine',
      'src',
      'parsing',
      'recommendation_engine.py'
    );
    const profileJsonString = JSON.stringify(body);

    // 3. Spawn Python Subprocess Securely
    // We execute python3 directly and pass arguments as an array to prevent shell injection.
    const runRecommender = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        execFile(
          'python3',
          [scriptPath, '--profile', profileJsonString],
          { maxBuffer: 1024 * 1024 * 10, cwd: path.join(workspaceRoot, 'ai-engine') }, // 10MB buffer limit
          (error, stdout, stderr) => {
            if (error) {
              reject({ error, stderr });
              return;
            }
            try {
              const cleanStdout = stdout.trim();
              const jsonStart = cleanStdout.indexOf('{');
              if (jsonStart === -1) {
                reject({ error: new Error('No JSON output found from Python engine'), stdout, stderr });
                return;
              }
              const parsed = JSON.parse(cleanStdout.substring(jsonStart));
              resolve(parsed);
            } catch (jsonErr) {
              reject({ error: jsonErr, stdout, stderr });
            }
          }
        );
      });
    };

    const result = await runRecommender();

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
