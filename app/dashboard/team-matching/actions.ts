'use server';

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MajorCategory = 'business' | 'cs' | 'other';
type GenderCategory = 'male' | 'female' | 'other';

interface Participant {
  id: string;
  name: string;
  gender: GenderCategory;
  major: MajorCategory;
  team_id: string | null;
}

interface PartialTeam {
  team_id: string;
  members: Participant[];
}

interface ProposedTeam {
  team_id: string | null;          // null = brand-new team
  existing_members: Participant[];  // already on the team
  new_members: Participant[];       // assigned by the algorithm
}

export interface MatchingResult {
  success: boolean;
  error?: string;
  proposed_teams: ProposedTeam[];
  unmatched: Participant[];
  stats: {
    total_participants: number;
    partial_teams_filled: number;
    new_teams_formed: number;
    unmatched_count: number;
    ideal_teams: number;         // teams that perfectly hit 2M/2F + 2Biz/2CS
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function classifyGender(raw: string): GenderCategory {
  const g = raw.toLowerCase().trim();
  if (['male', 'm', 'man', 'he/him'].includes(g)) return 'male';
  if (['female', 'f', 'woman', 'she/her'].includes(g)) return 'female';
  return 'other';
}

function classifyMajor(raw: string): MajorCategory {
  const m = raw.toLowerCase().trim();
  if (
    m.includes('business') ||
    m.includes('commerce') ||
    m.includes('finance') ||
    m.includes('accounting') ||
    m.includes('marketing') ||
    m.includes('management') ||
    m.includes('economics') ||
    m.includes('bba') ||
    m.includes('mba')
  ) return 'business';
  if (
    m.includes('computer') ||
    m.includes('software') ||
    m.includes('cs') ||
    m.includes('computing') ||
    m.includes('informatics') ||
    m.includes('data science') ||
    m.includes('engineering') ||
    m.includes('math')
  ) return 'cs';
  return 'other';
}

/**
 * Score how well a candidate fills a gap in a team.
 * Higher = better fit.  Max possible score = 2 (fills both a gender AND major gap).
 */
function fitScore(
  team: Participant[],
  candidate: Participant,
  targetSize = 4,
): number {
  const males   = team.filter(p => p.gender === 'male').length;
  const females = team.filter(p => p.gender === 'female').length;
  const biz     = team.filter(p => p.major === 'business').length;
  const cs      = team.filter(p => p.major === 'cs').length;

  let score = 0;

  // Gender balance: ideal is 2M / 2F
  if (candidate.gender === 'male'   && males < 2)   score += 1;
  if (candidate.gender === 'female' && females < 2)  score += 1;

  // Major balance: ideal is 2 business / 2 CS
  if (candidate.major === 'business' && biz < 2) score += 1;
  if (candidate.major === 'cs'       && cs < 2)  score += 1;

  return score;
}

/**
 * Pick the best candidate from a pool for a given partial team.
 * Returns the index into `pool`.
 */
function pickBest(team: Participant[], pool: Participant[]): number {
  let bestIdx = 0;
  let bestScore = -1;

  for (let i = 0; i < pool.length; i++) {
    const s = fitScore(team, pool[i]);
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function isIdealTeam(members: Participant[]): boolean {
  const males   = members.filter(p => p.gender === 'male').length;
  const females = members.filter(p => p.gender === 'female').length;
  const biz     = members.filter(p => p.major === 'business').length;
  const cs      = members.filter(p => p.major === 'cs').length;
  return males === 2 && females === 2 && biz === 2 && cs === 2;
}

// ---------------------------------------------------------------------------
// Main algorithm
// ---------------------------------------------------------------------------

function buildTeams(
  partialTeams: PartialTeam[],
  singles: Participant[],
): { proposed: ProposedTeam[]; unmatched: Participant[] } {
  const pool = [...singles]; // mutable copy
  const proposed: ProposedTeam[] = [];

  // ── Phase 1: Fill partial teams (size 2 or 3 → 4) ─────────────────────
  // Sort by most constrained first (team of 3 before team of 2)
  const sortedPartials = [...partialTeams].sort(
    (a, b) => b.members.length - a.members.length,
  );

  for (const pt of sortedPartials) {
    const needed = 4 - pt.members.length;
    if (needed <= 0 || pool.length === 0) {
      // Already full or no one left
      if (needed <= 0) continue;
      proposed.push({
        team_id: pt.team_id,
        existing_members: pt.members,
        new_members: [],
      });
      continue;
    }

    const newMembers: Participant[] = [];
    const workingTeam = [...pt.members];

    for (let i = 0; i < needed && pool.length > 0; i++) {
      const bestIdx = pickBest(workingTeam, pool);
      const pick = pool.splice(bestIdx, 1)[0];
      newMembers.push(pick);
      workingTeam.push(pick);
    }

    proposed.push({
      team_id: pt.team_id,
      existing_members: pt.members,
      new_members: newMembers,
    });
  }

  // ── Phase 2: Form new teams of 4 from remaining singles ───────────────
  // Bucket participants into 4 ideal categories
  type Bucket = 'male_biz' | 'male_cs' | 'female_biz' | 'female_cs' | 'other';

  const buckets: Record<string, Participant[]> = {
    male_biz: [],
    male_cs: [],
    female_biz: [],
    female_cs: [],
    other: [],
  };

  for (const p of pool) {
    if (p.gender === 'male' && p.major === 'business') buckets.male_biz.push(p);
    else if (p.gender === 'male' && p.major === 'cs') buckets.male_cs.push(p);
    else if (p.gender === 'female' && p.major === 'business') buckets.female_biz.push(p);
    else if (p.gender === 'female' && p.major === 'cs') buckets.female_cs.push(p);
    else buckets.other.push(p);
  }

  // Greedily form ideal teams: 1 from each of the 4 main buckets
  while (
    buckets.male_biz.length > 0 &&
    buckets.male_cs.length > 0 &&
    buckets.female_biz.length > 0 &&
    buckets.female_cs.length > 0
  ) {
    proposed.push({
      team_id: null,
      existing_members: [],
      new_members: [
        buckets.male_biz.pop()!,
        buckets.male_cs.pop()!,
        buckets.female_biz.pop()!,
        buckets.female_cs.pop()!,
      ],
    });
  }

  // Remaining participants that didn't fit a perfect quad
  const remaining = [
    ...buckets.male_biz,
    ...buckets.male_cs,
    ...buckets.female_biz,
    ...buckets.female_cs,
    ...buckets.other,
  ];

  // Form best-effort teams of 4 from leftovers using greedy scoring
  while (remaining.length >= 4) {
    const team: Participant[] = [remaining.shift()!];
    for (let i = 0; i < 3; i++) {
      const bestIdx = pickBest(team, remaining);
      team.push(remaining.splice(bestIdx, 1)[0]);
    }
    proposed.push({
      team_id: null,
      existing_members: [],
      new_members: team,
    });
  }

  // Anyone left over (1-3 people) stays unmatched
  return { proposed, unmatched: remaining };
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Preview the algorithm's output without writing anything to the database.
 */
export async function previewTeamMatching(): Promise<MatchingResult> {
  const supabase = getSupabase();

  // 1. Fetch all accepted hackers
  const { data: hackers, error } = await supabase
    .from('users')
    .select('id, name, gender, major, team_id')
    .eq('role', 'hacker')
    .eq('status', 'accepted');

  if (error) {
    return {
      success: false,
      error: error.message,
      proposed_teams: [],
      unmatched: [],
      stats: { total_participants: 0, partial_teams_filled: 0, new_teams_formed: 0, unmatched_count: 0, ideal_teams: 0 },
    };
  }

  // 2. Classify raw field values
  const participants: Participant[] = (hackers ?? []).map(h => ({
    id: h.id,
    name: h.name ?? 'Unknown',
    gender: classifyGender(h.gender ?? ''),
    major: classifyMajor(h.major ?? ''),
    team_id: h.team_id,
  }));

  // 3. Separate into partial teams and singles
  const teamMap = new Map<string, Participant[]>();
  const singles: Participant[] = [];

  for (const p of participants) {
    if (p.team_id) {
      if (!teamMap.has(p.team_id)) teamMap.set(p.team_id, []);
      teamMap.get(p.team_id)!.push(p);
    } else {
      singles.push(p);
    }
  }

  // Only include partial teams (size < 4) that have space
  const partialTeams: PartialTeam[] = [];
  for (const [team_id, members] of teamMap.entries()) {
    if (members.length < 4) {
      partialTeams.push({ team_id, members });
    }
  }

  // 4. Run the algorithm
  const { proposed, unmatched } = buildTeams(partialTeams, singles);

  // 5. Compute stats
  const ideal_teams = proposed.filter(t => {
    const all = [...t.existing_members, ...t.new_members];
    return all.length === 4 && isIdealTeam(all);
  }).length;

  return {
    success: true,
    proposed_teams: proposed,
    unmatched,
    stats: {
      total_participants: participants.length,
      partial_teams_filled: proposed.filter(t => t.team_id !== null && t.new_members.length > 0).length,
      new_teams_formed: proposed.filter(t => t.team_id === null).length,
      unmatched_count: unmatched.length,
      ideal_teams,
    },
  };
}

/**
 * Apply the matching: create new teams in the `teams` table and update
 * each user's `team_id`.
 */
export async function applyTeamMatching(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const result = await previewTeamMatching();
  if (!result.success) return { success: false, error: result.error };

  // Process each proposed team
  for (const team of result.proposed_teams) {
    let teamId = team.team_id;

    // Create a new team row if this is a brand-new team
    if (!teamId) {
      const memberNames = team.new_members.map(m => m.name).join(', ');
      const { data: newTeam, error: createErr } = await supabase
        .from('teams')
        .insert({
          name: `Auto-Team: ${memberNames}`.slice(0, 100),
          has_space: false,
        })
        .select('id')
        .single();

      if (createErr || !newTeam) {
        console.error('Failed to create team:', createErr?.message);
        continue;
      }
      teamId = newTeam.id;
    } else {
      // Update existing team: mark as full if now at 4
      const totalSize = team.existing_members.length + team.new_members.length;
      if (totalSize >= 4) {
        await supabase
          .from('teams')
          .update({ has_space: false })
          .eq('id', teamId);
      }
    }

    // Assign new members to the team
    for (const member of team.new_members) {
      await supabase
        .from('users')
        .update({ team_id: teamId })
        .eq('id', member.id);
    }
  }

  return { success: true };
}
