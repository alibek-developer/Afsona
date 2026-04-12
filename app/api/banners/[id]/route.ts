import { createClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('website_banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await req.json();

    const {
      title, image_url, description, cta_button_text,
      link_type, link_url, is_active, position, display_on_mobile,
      background_color, text_color, cta_button_color, image_alt_text,
      start_date, end_date
    } = body;

    const payload: any = {};
    if (title !== undefined) payload.title = title;
    if (image_url !== undefined) payload.image_url = image_url;
    if (description !== undefined) payload.description = description;
    if (cta_button_text !== undefined) payload.cta_button_text = cta_button_text;
    if (link_type !== undefined) payload.link_type = link_type;
    if (link_url !== undefined) payload.link_url = link_url;
    if (is_active !== undefined) payload.is_active = is_active;
    if (position !== undefined) payload.position = position;
    if (display_on_mobile !== undefined) payload.display_on_mobile = display_on_mobile;
    if (background_color !== undefined) payload.background_color = background_color;
    if (text_color !== undefined) payload.text_color = text_color;
    if (cta_button_color !== undefined) payload.cta_button_color = cta_button_color;
    if (image_alt_text !== undefined) payload.image_alt_text = image_alt_text;
    if (start_date !== undefined) payload.start_date = start_date;
    if (end_date !== undefined) payload.end_date = end_date;

    const { data, error } = await supabase
      .from('website_banners')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data?.[0],
      message: 'Banner updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: banner } = await supabase
      .from('website_banners')
      .select('image_url')
      .eq('id', id)
      .single();

    if (banner?.image_url) {
      try {
        const urlParts = banner.image_url.split('/banners/');
        if (urlParts.length > 1) {
          await supabase.storage
            .from('banners')
            .remove([urlParts[1]]);
        }
      } catch (storageError) {
        console.error('Error deleting image:', storageError);
      }
    }

    const { error } = await supabase
      .from('website_banners')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete banner' },
      { status: 500 }
    );
  }
}