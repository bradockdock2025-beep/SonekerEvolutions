import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const svcr = process.env.SUPABASE_SERVICE_ROLE_KEY!

/** Server-only admin client — service role key. Import ONLY in API routes, never in client components. */
export const supabaseAdmin = createClient(url, svcr)
