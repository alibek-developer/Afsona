import { createClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const branchId = formData.get('branchId') as string;

    if (!file || !branchId) {
      return NextResponse.json(
        { error: 'File and branch ID are required' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const filename = `${branchId}/${timestamp}-${file.name.replace(/\s+/g, '_')}`;

    const { data, error } = await supabase.storage
      .from('website-banners')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('website-banners')
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrl.publicUrl,
      path: data.path,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
