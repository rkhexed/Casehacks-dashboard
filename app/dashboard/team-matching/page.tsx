'use client';

import { useState } from 'react';
import { previewTeamMatching, applyTeamMatching } from './actions';
import type { MatchingResult } from './actions';

export default function TeamMatchingPage() {
  const [result, setResult] = useState<MatchingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    setApplied(false);
    try {
      const data = await previewTeamMatching();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!confirm('This will create teams and assign participants. Continue?')) return;
    setApplying(true);
    try {
      const res = await applyTeamMatching();
      if (res.success) {
        setApplied(true);
      } else {
        alert('Error applying teams: ' + res.error);
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error applying teams.');
    } finally {
      setApplying(false);
    }
  };

  const genderLabel = (g: string) => {
    if (g === 'male') return '♂';
    if (g === 'female') return '♀';
    return '◦';
  };

  const majorLabel = (m: string) => {
    if (m === 'business') return 'BIZ';
    if (m === 'cs') return 'CS';
    return 'OTH';
  };

  const badgeColor = (m: string) => {
    if (m === 'business') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (m === 'cs') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <p className="text-sm uppercase tracking-wide text-primary/70 font-semibold">
            Admin
          </p>
          <h1 className="text-4xl font-bold text-primary">Team Matching</h1>
          <p className="text-foreground/70 mt-2">
            Automatically form balanced teams of 4. The algorithm optimises for
            an equal mix of <strong>2 male / 2 female</strong> and{' '}
            <strong>2 business / 2 CS</strong> majors.
          </p>
        </header>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Running algorithm…' : 'Preview Matching'}
          </button>

          {result?.success && !applied && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
            >
              {applying ? 'Applying…' : 'Apply Teams'}
            </button>
          )}

          {applied && (
            <span className="flex items-center gap-2 px-6 py-3 bg-green-600/20 text-green-400 rounded-lg font-semibold border border-green-600/30">
              ✓ Teams applied successfully
            </span>
          )}
        </div>

        {/* Results */}
        {result && !result.success && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            Error: {result.error}
          </div>
        )}

        {result?.success && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Participants', value: result.stats.total_participants },
                { label: 'Partial Teams Filled', value: result.stats.partial_teams_filled },
                { label: 'New Teams Formed', value: result.stats.new_teams_formed },
                { label: 'Ideal Teams', value: result.stats.ideal_teams },
                { label: 'Unmatched', value: result.stats.unmatched_count },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-4 bg-card rounded-lg border border-border text-center"
                >
                  <p className="text-sm text-foreground/60">{s.label}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Proposed teams */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Proposed Teams ({result.proposed_teams.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.proposed_teams.map((team, idx) => {
                  const allMembers = [...team.existing_members, ...team.new_members];
                  const ideal =
                    allMembers.length === 4 &&
                    allMembers.filter(p => p.gender === 'male').length === 2 &&
                    allMembers.filter(p => p.gender === 'female').length === 2 &&
                    allMembers.filter(p => p.major === 'business').length === 2 &&
                    allMembers.filter(p => p.major === 'cs').length === 2;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        ideal
                          ? 'border-green-500/40 bg-green-500/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">
                          {team.team_id ? 'Existing Team' : `New Team #${idx + 1}`}
                        </h3>
                        {ideal && (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                            ✓ Ideal
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {team.existing_members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 text-sm text-foreground/60"
                          >
                            <span>{genderLabel(m.gender)}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${badgeColor(m.major)}`}>
                              {majorLabel(m.major)}
                            </span>
                            <span>{m.name}</span>
                            <span className="text-foreground/30 text-xs">(existing)</span>
                          </div>
                        ))}
                        {team.new_members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 text-sm text-foreground"
                          >
                            <span>{genderLabel(m.gender)}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${badgeColor(m.major)}`}>
                              {majorLabel(m.major)}
                            </span>
                            <span className="font-medium">{m.name}</span>
                            <span className="text-green-400 text-xs">+ new</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Unmatched */}
            {result.unmatched.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">
                  Unmatched ({result.unmatched.length})
                </h2>
                <p className="text-sm text-foreground/60">
                  Not enough participants remaining to form a full team of 4.
                </p>
                <div className="p-4 bg-card rounded-lg border border-border space-y-2">
                  {result.unmatched.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <span>{genderLabel(m.gender)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${badgeColor(m.major)}`}>
                        {majorLabel(m.major)}
                      </span>
                      <span>{m.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
