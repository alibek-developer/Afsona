import { createClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const branchId = searchParams.get('branchId');
    const sort = searchParams.get('sort') || 'position';
    const order = searchParams.get('order') || 'asc';
    const status = searchParams.get('status') || 'all';

    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('website_banners')
      .select('*', { count: 'exact' })
      .eq('branch_id', branchId);

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    query = query.order(sort, { ascending: order === 'asc' });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { branch_id, title, description, image_url, image_alt_text, link_type, link_url, position, is_active, start_date, end_date, background_color, text_color, cta_button_text, cta_button_color, display_on_mobile } = body;

    if (!title || !image_url || !link_type || !link_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('website_banners')
      .insert([
        {
          branch_id,
          title,
          description,
          image_url,
          image_alt_text,
          link_type,
          link_url,
          position,
          is_active,
          start_date,
          end_date,
          background_color,
          text_color,
          cta_button_text,
          cta_button_color,
          display_on_mobile,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data?.[0],
      message: 'Banner created successfully',
    });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create banner' },
      { status: 500 }
    );
  }
}