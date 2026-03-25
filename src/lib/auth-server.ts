import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Extracts and verifies the Supabase JWT from the Authorization header.
 * Returns the user or null.
 */
export async function getUserFromRequest(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}
