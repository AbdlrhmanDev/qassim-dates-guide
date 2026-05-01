import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isAuthError } from '@/lib/auth-guard';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

// POST /api/upload — authenticated users only
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (isAuthError(guard)) return guard;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Validate MIME type against strict allowlist — never trust file.name extension
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP, or AVIF images are allowed' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Maximum file size is 5 MB' }, { status: 400 });
  }

  // Derive extension from validated MIME type — never from file.name (prevents path traversal)
  const ext  = EXT_MAP[file.type];

  // Scope upload path to authenticated user's id — never accept path from client
  const path = `${guard.id}/${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: 'Upload failed' }, { status: 500 });

  const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
