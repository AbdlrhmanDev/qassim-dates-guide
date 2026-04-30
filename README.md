# Qassim Dates Guide | دليل تمور القصيم

A full-stack web platform connecting consumers with date traders and farmers in the Qassim region of Saudi Arabia.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth
- **State / Data Fetching**: TanStack React Query
- **AI Chatbot**: Claude API (Anthropic)

## Features

- Browse date varieties with detailed info and ratings
- Trader & farmer directory with WhatsApp contact
- Product catalog per trader with stock and pricing
- Order system with WhatsApp notification flow
- Star ratings for traders and products (logged-in users only)
- Exhibitions listing
- Producers directory
- Multi-role dashboard (Admin / Trader / User)
- Arabic & English bilingual support (RTL/LTR)
- AI assistant powered by Claude

## Getting Started

```sh
# 1. Clone the repository
git clone https://github.com/AbdlrhmanDev/qassim-dates-guide.git

# 2. Navigate into the project
cd qassim-dates-guide

# 3. Install dependencies
npm install

# 4. Copy environment variables
cp .env.example .env.local
# Fill in your Supabase URL, anon key, service role key, and Anthropic API key

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Database Migrations

Run the SQL files in order inside the Supabase SQL Editor:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_trader_products.sql
supabase/migrations/003_producers.sql
supabase/migrations/004_product_image.sql
supabase/migrations/005_product_ratings.sql
supabase/migrations/006_trader_ratings.sql
supabase/migrations/007_orders.sql
supabase/migrations/008_update_trader_whatsapp.sql
supabase/migrations/009_orders_price.sql
```

## Deployment

Deploy on [Vercel](https://vercel.com) by importing the GitHub repository and setting the environment variables in the project settings.
