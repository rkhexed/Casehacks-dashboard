'use server';

import { createServerActionClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

// Service-role client bypasses RLS — used only for the points increment
// so we don't need any SQL functions created in Supabase.
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function checkInUser(userId: string, eventId: string) {
  
  const supabase = await createServerActionClient();

  // Fetch user and event point_value in parallel
  const [userResult, eventResult] = await Promise.all([
    supabase.from('users').select('id, name, email').eq('id', userId).single(),
    supabase.from('events').select('point_value').eq('id', eventId).single(),
  ]);

  if (userResult.error || !userResult.data) {
    console.error('[checkInUser] user lookup failed:', userResult.error);
    return { error: 'User not found', success: false };
  }
  if (eventResult.error || !eventResult.data) {
    console.error('[checkInUser] event lookup failed:', eventResult.error);
    return { error: 'Event not found', success: false };
  }

  const user = userResult.data;
  const pointValue: number = eventResult.data.point_value ?? 1;

  // Check if already checked in
  const { data: existingCheckin } = await supabase
    .from('checkins')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  if (existingCheckin) {
    return { error: 'User already checked in to this event', success: false };
  }

  // Create check-in record
  const { error: checkinError } = await supabase
    .from('checkins')
    .insert({
      user_id: userId,
      event_id: eventId,
      user_name: user.name || user.email,
    });

  if (checkinError) {
    return { error: checkinError.message, success: false };
  }

  // Award points atomically via the Supabase RPC (avoids read-then-write race condition).
  // Uses the service-role client to bypass RLS.
  const admin = adminClient();
  const { error: rpcErr } = await admin.rpc('increment_interaction_points', {
    user_id: userId,
    amount: pointValue,
  });

  if (rpcErr) {
    console.error('[checkInUser] RPC increment failed:', rpcErr);
    await supabase.from('checkins').delete().eq('user_id', userId).eq('event_id', eventId);
    return { error: 'Points update failed — please try again.', success: false };
  }

  // Award scanning bounties if check-in bounty conditions are met
  const { error: bountyErr } = await admin.rpc('check_and_award_bounties', {
    user_id: userId,
    bounty_type: 'checkin',
    event_id: eventId,
  });

  if (bountyErr) {
    console.error('[checkInUser] bounty check failed:', bountyErr);
  }

  return { 
    success: true, 
    userName: user.name || user.email,
    error: null 
  };
}

export async function getEvents() {
  
  const supabase = await createServerActionClient();

  // Grace period: show events that ended up to 2 hours ago
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('id, title, starts_at, ends_at')
    .gte('ends_at', cutoff)
    .order('starts_at', { ascending: true });

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: data || [], error: null };
}

export async function getEventCheckins(eventId: string) {

  const supabase = await createServerActionClient();

  const { data, error } = await supabase
    .from('checkins')
    .select('id, user_name, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    return { checkins: [], error: error.message };
  }

  return { checkins: data || [], error: null };
}

export async function getDashboardStats() {
  
  const supabase = await createServerActionClient();

  const { count: totalCheckins } = await supabase
    .from('checkins')
    .select('*', { count: 'exact', head: true });

  const { count: totalParticipants } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  return { 
    totalCheckins: totalCheckins ?? 0, 
    totalParticipants: totalParticipants ?? 0 
  };
}

export async function getRecentCheckins() {
  
  const supabase = await createServerActionClient();

  const { data, error } = await supabase
    .from('checkins')
    .select('id, user_name, created_at, events(title)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    return { checkins: [], error: error.message };
  }

  return { checkins: data || [], error: null };
}
