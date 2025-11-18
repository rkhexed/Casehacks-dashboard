'use client';

import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Event {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  location: string | null;
}

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [todaysEvents, setTodaysEvents] = useState<Event[]>([]);
  const [eventsCount, setEventsCount] = useState(0);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    const fetchTodaysEvents = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('starts_at', today.toISOString())
        .lt('starts_at', tomorrow.toISOString())
        .order('starts_at', { ascending: true });

      if (!error && data) {
        setTodaysEvents(data);
        setEventsCount(data.length);
      }
    };
    fetchTodaysEvents();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">
            Check-in Monitor
          </h1>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-foreground/60">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm bg-card border border-border text-foreground rounded-lg hover:bg-foreground/5 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        <div className="grid gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-card rounded-lg shadow">
              <p className="text-sm text-foreground/60 mb-1">Total Check-ins</p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow">
              <p className="text-sm text-foreground/60 mb-1">Events Today</p>
              <p className="text-3xl font-bold text-primary">{eventsCount}</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow">
              <p className="text-sm text-foreground/60 mb-1">Total Participants</p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
          </div>

          {/* Today's Events */}
          <div className="p-8 bg-card rounded-lg shadow">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Today's Events
            </h2>
            {todaysEvents.length === 0 ? (
              <div className="p-6 bg-background rounded">
                <p className="text-center text-foreground/60">
                  No events scheduled for today
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysEvents.map((event) => (
                  <div key={event.id} className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-foreground/70 mt-1">{event.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-foreground/60">
                          <span>🕒 {new Date(event.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(event.ends_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Scanner */}
          <div className="p-8 bg-card rounded-lg shadow">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              QR Code Scanner
            </h2>
            <div className="p-12 bg-background rounded border-2 border-dashed border-border flex items-center justify-center">
              <p className="text-foreground/40">
                Scanner
              </p>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="p-8 bg-card rounded-lg shadow">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Recent Check-ins
            </h2>
            <div className="p-6 bg-background rounded">
              <p className="text-center text-foreground/60">
                No check-ins yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
