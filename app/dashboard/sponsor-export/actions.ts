'use server';

import { createClient } from '@supabase/supabase-js';

// Use service role so this works server-side without a session cookie
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface SponsorHacker {
  id: string;
  name: string | null;
  email: string;
  school: string | null;
  major: string | null;
  github: string | null;
  linkedin: string | null;
  portfolio: string | null;   // stored in `other` column
  status: string | null;
  resumeFileName: string | null;
  resumeSignedUrl: string | null;
}

// Signed URLs valid for 7 days — long enough for sponsor review sessions
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 7;

export async function getSponsorsHackers(): Promise<{
  hackers: SponsorHacker[];
  schools: string[];
  error: string | null;
}> {
  const supabase = adminClient();

  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, school, major, github, linkedin, other, status, resume')
    .order('name', { ascending: true });

  if (error) return { hackers: [], schools: [], error: error.message };

  // Bulk-generate signed URLs in one round trip (only for users who have a file)
  const withResume = users.filter(u => u.resume);
  let signedUrlMap: Record<string, string> = {};

  if (withResume.length > 0) {
    const { data: signed, error: signErr } = await supabase.storage
      .from('resumes')
      .createSignedUrls(
        withResume.map(u => u.resume as string),
        SIGNED_URL_EXPIRY
      );
    if (signErr) return { hackers: [], schools: [], error: signErr.message };
    // Map filename → signed URL
    signed?.forEach((entry, i) => {
      if (entry.signedUrl) signedUrlMap[withResume[i].resume as string] = entry.signedUrl;
    });
  }

  // Normalize school name to title-case so variants like 'sheridan university'
  // and 'Sheridan University' collapse to a single entry in the filter dropdown.
  const titleCase = (s: string) => s.trim().replace(/\b\w/g, c => c.toUpperCase());

  const hackers: SponsorHacker[] = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    school: u.school ? titleCase(u.school) : null,
    major: u.major,
    github: u.github,
    linkedin: u.linkedin,
    portfolio: u.other,
    status: u.status,
    resumeFileName: u.resume ?? null,
    resumeSignedUrl: u.resume ? (signedUrlMap[u.resume] ?? null) : null,
  }));

  // Sorted unique list of schools for the filter dropdown (case-insensitive dedup already handled by titleCase)
  const schools = [...new Set(hackers.map(h => h.school).filter(Boolean) as string[])].sort();

  return { hackers, schools, error: null };
}
