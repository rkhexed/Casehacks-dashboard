'use server';

import { createServerActionClient } from '@/lib/supabase-server';

export async function checkInUser(userId: string, eventId: string) {
  
  const supabase = await createServerActionClient();
  // First, get the user details
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return { error: 'User not found', success: false };
  }

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

  return { 
    success: true, 
    userName: user.name || user.email,
    error: null 
  };
}

export async function getEvents() {
  
  const supabase = await createServerActionClient();

  const { data, error } = await supabase
    .from('events')
    .select('id, title, starts_at, ends_at')
    .order('starts_at', { ascending: false });

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
