import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/supabase.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: any) {
          try {
            await cookieStore.set(name, value, options);
          } catch (error) {
            // Handle cookie errors
          }
        },
        async remove(name: string, options: any) {
          try {
            await cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
    }
  );
}