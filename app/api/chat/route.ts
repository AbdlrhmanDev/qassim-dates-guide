import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY   = process.env.GROQ_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'No AI key configured. Add GEMINI_API_KEY or GROQ_API_KEY to .env.local' },
      { status: 500 }
    );
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
  }

  // Fetch live data in parallel
  const [tradersRes, dateTypesRes, topProductsRes] = await Promise.all([
    supabase
      .from('traders')
      .select('shop_name, city, rating, rating_count, description, verified')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(10),
    supabase
      .from('date_types')
      .select('name_ar, name_en, description_en, description_ar, category, calories, season'),
    supabase
      .from('trader_products')
      .select('price_per_kg, rating, rating_count, traders(shop_name, city), date_types(name_ar, name_en, category)')
      .eq('available', true)
      .gt('rating', 0)
      .order('rating', { ascending: false })
      .limit(8),
  ]);

  const traders      = tradersRes.data      ?? [];
  const dateTypes    = dateTypesRes.data    ?? [];
  const topProducts  = topProductsRes.data  ?? [];

  // Format trader list
  const tradersText = traders.length > 0
    ? traders.map((t, i) =>
        `${i + 1}. ${t.shop_name}${t.city ? ` — ${t.city}` : ''}` +
        (t.rating > 0 ? ` | ⭐ ${t.rating}/5 (${t.rating_count ?? 0} votes)` : ' | No rating yet') +
        (t.verified ? ' | ✓ Verified' : '') +
        (t.description ? `\n   "${t.description}"` : '')
      ).join('\n')
    : 'No traders available yet.';

  // Format date types
  const dateTypesText = dateTypes.length > 0
    ? dateTypes.map(d =>
        `• ${d.name_ar} / ${d.name_en} [${d.category}]` +
        (d.calories ? ` | ${d.calories} cal/100g` : '') +
        (d.season ? ` | Season: ${d.season}` : '') +
        (d.description_en ? `\n  ${d.description_en}` : '')
      ).join('\n')
    : 'No date types available yet.';

  // Format top-rated products
  const topProductsText = topProducts.length > 0
    ? (topProducts as any[]).map((p, i) =>
        `${i + 1}. ${p.date_types?.name_ar} / ${p.date_types?.name_en} — ${p.traders?.shop_name}` +
        (p.traders?.city ? ` (${p.traders.city})` : '') +
        ` | ${p.price_per_kg} SAR/kg | ⭐ ${p.rating} (${p.rating_count} votes)`
      ).join('\n')
    : 'No rated products yet.';

  const systemPrompt = `You are an expert AI assistant for "دليل تمور القصيم" (Qassim Dates Guide), a platform for premium date fruits from the Qassim region of Saudi Arabia.

You help users with:
- Finding top-rated traders and their products
- Recommending dates by health conditions (diabetes, high blood pressure, energy, weight loss, etc.)
- Nutritional info, glycemic index, and health benefits of different date varieties
- Comparing varieties, seasons, and prices
- General questions about Qassim dates and Saudi date culture

RULES:
- ALWAYS respond in the SAME LANGUAGE as the user's message. If Arabic → reply in Arabic. If English → reply in English.
- Be friendly, concise, and helpful.
- For medical conditions, always add a reminder to consult a doctor.
- When recommending traders or products, use the LIVE DATA below.
- If asked for prices, show the price from the products list or suggest visiting the trader's page.

═══ LIVE DATA FROM DATABASE ═══

🏆 TOP TRADERS (sorted by community rating):
${tradersText}

📦 TOP RATED PRODUCTS:
${topProductsText}

🌴 DATE TYPES IN OUR CATALOG:
${dateTypesText}

═══ HEALTH KNOWLEDGE (use your training data for this) ═══
- For DIABETICS: dates with lower glycemic impact, smaller portions recommended; Ajwa, Sukkary in moderation
- For ENERGY: Medjool, Khalas high in natural sugars and fiber
- For WEIGHT MANAGEMENT: smaller, dried varieties with controlled portions
- For HEART HEALTH: Ajwa dates are traditionally known for cardiovascular benefits
- General: dates are rich in fiber, potassium, magnesium, and antioxidants`;

  // ── Groq (OpenAI-compatible) ─────────────────────────────────────────────
  if (GROQ_API_KEY) {
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.error?.message ?? `Groq returned ${res.status}`;
        return NextResponse.json({ error: msg }, { status: 500 });
      }

      const data = await res.json();
      const content: string = data.choices?.[0]?.message?.content ?? 'No response.';
      return NextResponse.json({ content });
    } catch {
      return NextResponse.json({ error: 'Failed to reach Groq API.' }, { status: 500 });
    }
  }

  // ── Gemini fallback ───────────────────────────────────────────────────────
  const geminiContents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const msg = errBody?.error?.message ?? `Gemini returned ${res.status}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const data = await res.json();
    const content: string =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.';
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: 'Failed to reach Gemini API.' }, { status: 500 });
  }
}
