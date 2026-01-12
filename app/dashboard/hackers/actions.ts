'use server';

import { createClient } from '@supabase/supabase-js';

export async function getHackers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'hacker')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching hackers:', JSON.stringify(error, null, 2));
    return [];
  }

  return data;
}
