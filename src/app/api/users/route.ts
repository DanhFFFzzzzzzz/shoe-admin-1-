import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ users: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from('users')
    .insert([body])
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ user: data });
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { id, ...updateData } = body;
  if ('id' in updateData) delete updateData.id;
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ user: data });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { id } = await req.json();
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 