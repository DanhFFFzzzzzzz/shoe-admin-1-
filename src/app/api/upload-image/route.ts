import { NextRequest, NextResponse } from 'next/server';
import { imageUploadHandler } from '@/server/actions/categories';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const url = await imageUploadHandler(formData);
    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
} 