import { createClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { banners } = await req.json();

    if (!banners || !Array.isArray(banners)) {
      return NextResponse.json({ error: 'Banners array is required' }, { status: 400 });
    }

    const results = await Promise.all(
      banners.map((banner: { id: string; position: number }) =>
        supabase
          .from('website_banners')
          .update({ position: banner.position })
          .eq('id', banner.id)
      )
    );

    const firstError = results.find(r => r.error)?.error;
    if (firstError) throw firstError;

    return NextResponse.json({
      success: true,
      message: 'Positions updated successfully',
    });
  } catch (error: any) {
    console.error('Error reordering banners:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reorder banners' },
      { status: 500 }
    );
  }
}
