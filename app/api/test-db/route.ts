import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  try {
    // Try to fetch something simple to verify connection
    const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ 
        connected: false, 
        message: "Database connection failed", 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      connected: true, 
      message: "Supabase is connected successfully!",
      table: "user_profiles"
    });

  } catch (error: any) {
    return NextResponse.json({ 
      connected: false, 
      message: "Internal error checking connection", 
      error: error.message 
    }, { status: 500 });
  }
}
