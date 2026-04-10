import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Attempt to get branch_id from an existing profile or default to first branch
    // For now, let's just return the first available branch ID to get things working
    const { data: branches } = await supabase
      .from('branches')
      .select('id')
      .limit(1)
      .single();

    return NextResponse.json({
      email: user.email,
      branch_id: branches?.id || null,
    });
  } catch (error: any) {
    console.error('Error in /api/profile:', error);
    return NextResponse.json({ branch_id: null });
  }
}
