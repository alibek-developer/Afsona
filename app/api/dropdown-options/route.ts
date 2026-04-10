import { createClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = req.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');
    const type = searchParams.get('type') || 'all';

    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    const result: any = {};

    if (type === 'categories' || type === 'all') {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, sort_order')
        .eq('is_active', true)
        .order('sort_order');
      result.categories = categories || [];
    }

    if (type === 'menu_items' || type === 'all') {
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('id, name, price, category_id')
        .eq('branch_id', branchId)
        .eq('is_active', true);
      result.menuItems = menuItems || [];
    }

    if (type === 'promotions' || type === 'all') {
      const { data: promotions } = await supabase
        .from('website_promotions')
        .select('id, code, title, discount_percent')
        .eq('branch_id', branchId)
        .eq('is_active', true);
      result.promotions = promotions || [];
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching dropdown options:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch options' },
      { status: 500 }
    );
  }
}
