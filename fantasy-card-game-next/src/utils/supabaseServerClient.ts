// utils/supabaseServerClient.ts
// Helper for creating a Supabase client on the server (API routes, server components)
import { createServerClient } from '@supabase/ssr';
import type { NextApiRequest, NextApiResponse } from 'next';

export function createSupabaseServerClient(req: NextApiRequest, res: NextApiResponse) {
  // Implements the CookieMethodsServer interface for SSR
  const cookies = {
    get: (key: string) => {
      const match = req.cookies?.[key];
      return match ? { name: key, value: match } : undefined;
    },
    getAll: () => Object.entries(req.cookies ?? {}).map(([name, value]) => ({ name, value: value! })),
    set: (key: string, value: string, options?: any) => {},
    delete: (key: string, options?: any) => {},
  };
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
}
