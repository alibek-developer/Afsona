import { createClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('website_banners')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from('website_banners')
      .update(body)
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // First get banner to get image path
    const { data: banner } = await supabase
      .from('website_banners')
      .select('image_url')
      .eq('id', params.id)
      .single();

    // Delete image from storage if it exists
    if (banner?.image_url) {
      try {
        const urlParts = banner.image_url.split('/website-banners/');
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage
            .from('website-banners')
            .remove([storagePath]);
        }
      } catch (storageError) {
        console.error('Error deleting image:', storageError);
      }
    }

    const { error } = await supabase
      .from('website_banners')
      .delete()
      .eq('id', params.id);

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
