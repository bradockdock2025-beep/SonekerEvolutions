import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const svcr = process.env.SUPABASE_SERVICE_ROLE_KEY!

/** Browser client — anon key, used in client components */
export const supabase = createClient(url, anon)

/** Server client — service role, used in API routes only */
export const supabaseAdmin = createClient(url, svcr)
