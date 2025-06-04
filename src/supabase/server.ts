import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/supabase.types'

// Cách sửa: cookies() => await cookies()
export async function createClient() {
  const cookieStore = await cookies() // ✅ sửa lại

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {
          // No-op in Server Component
        },
        remove() {
          // No-op in Server Component
        },
      },
    }
  )
}
