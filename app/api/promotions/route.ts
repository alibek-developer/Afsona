import { createClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = req.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');

    if (!branchId) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('website_promotions')
      .select('id, code, title')
      .eq('branch_id', branchId)
      .eq('is_active', true);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}
