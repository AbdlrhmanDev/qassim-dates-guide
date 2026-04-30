import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/comments?target_type=date_type&target_id=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('target_type');
  const targetId   = searchParams.get('target_id');

  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'target_type and target_id are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users ( full_name, avatar_url )
    `)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/comments
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('comments')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/comments?comment_id=xxx
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get('comment_id');

  if (!commentId) {
    return NextResponse.json({ error: 'comment_id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('comment_id', commentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
