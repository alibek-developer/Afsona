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

    const { 
      branch_id, title, image_url, description, cta_button_text, 
      link_type, link_url, is_active, position, display_on_mobile,
      background_color, text_color, cta_button_color, image_alt_text,
      start_date, end_date
    } = body;

    if (!branch_id || !title || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields (branch_id, title, image_url)' },
        { status: 400 }
      );
    }

    const payload = {
      branch_id,
      title,
      image_url,
      description: description || null,
      cta_button_text: cta_button_text || null,
      link_type: link_type || null,
      link_url: link_url || null,
      is_active: is_active ?? true,
      position: position || 0,
      display_on_mobile: !!display_on_mobile,
      background_color: background_color || null,
      text_color: text_color || null,
      cta_button_color: cta_button_color || null,
      image_alt_text: image_alt_text || null,
      start_date: start_date || null,
      end_date: end_date || null,
    };

    const { data, error } = await supabase
      .from('website_banners')
      .insert([payload])
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