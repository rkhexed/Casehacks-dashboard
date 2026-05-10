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
    console.error('[checkInUser] user lookup failed:', userError);
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

  // Could be bad if the checkin goes through but points dont will have to manually reset it. Maybe more validation before adding points?

  // Get current points for event attendance of user
  const { data: userAttendancePoints, error: pointsError } = await supabase
    .from('users')
    .select('event_attendance_points')
    .eq('id', userId)
    .single();

  // Error handling
  if (pointsError || !userAttendancePoints) {
    console.error('[checkInUser] points fetch failed:', pointsError);
    return { error: 'Failed to retrieve user points', success: false };
  }

  const { data: eventPointsValue, error: eventPointsError } = await supabase
    .from('events')
    .select('point_value')
    .eq('id', eventId)
    .single();

  if (eventPointsError || !eventPointsValue) {
    console.error('[checkInUser] event points fetch failed:', eventPointsError);
    return { error: 'Failed to retrieve event points value', success: false };
  }

  // Mmmm slop math, probably good to have some validation though
  const currentPoints = Number(userAttendancePoints.event_attendance_points ?? 0);
  console.log('Current points:', currentPoints);
  const eventPoints = Number(eventPointsValue.point_value ?? 0);
  console.log('Event points:', eventPoints);
  const newPointValue = currentPoints + eventPoints;
  console.log('New point value:', newPointValue);

  const { data: updatedRows, error: updatePointsError } = await supabase
    .from('users')
    .update({ event_attendance_points: newPointValue })
    .eq('id', userId)
    .select('id, event_attendance_points');


  console.log('update error:', updatePointsError);
  console.log('updated rows:', updatedRows);


  if (updatePointsError) {
    console.error('[checkInUser] points update failed:', updatePointsError);
    return { error: updatePointsError.message, success: false };
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
