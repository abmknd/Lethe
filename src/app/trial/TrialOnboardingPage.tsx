import { useEffect, useMemo, useState } from 'react';
import { getTrialUserProfile, listTrialUsers, saveTrialUserProfile } from './api';
import { DAY_OPTIONS, formatSlot } from './time';
import type { TrialAvailabilitySlot, TrialUser, TrialUserProfile } from './types';

const defaultSlot: TrialAvailabilitySlot = {
  dayOfWeek: 1,
  startHour: 18,
  endHour: 19,
};

function emptyProfile(userId: string): TrialUserProfile {
  return {
    user: {
      id: userId,
      displayName: '',
      handle: '',
      email: '',
      timezone: 'UTC',
      location: '',
      isActive: true,
      matchingEnabled: true,
    },
    preferences: {
      matchIntent: [],
      interests: [],
      introText: '',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
    },
    availability: [],
  };
}

function parseCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function TrialOnboardingPage() {
  const [users, setUsers] = useState<TrialUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [profile, setProfile] = useState<TrialUserProfile | null>(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newSlot, setNewSlot] = useState<TrialAvailabilitySlot>(defaultSlot);

  useEffect(() => {
    listTrialUsers()
      .then((nextUsers) => {
        setUsers(nextUsers);
        if (nextUsers[0]) {
          setSelectedUserId(nextUsers[0].id);
        }
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load users');
      });
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    getTrialUserProfile(selectedUserId)
      .then((nextProfile) => {
        setProfile(nextProfile);
      })
      .catch(() => {
        setProfile(emptyProfile(selectedUserId));
      });
  }, [selectedUserId]);

  const intentCsv = useMemo(() => profile?.preferences.matchIntent.join(', ') ?? '', [profile]);
  const interestsCsv = useMemo(() => profile?.preferences.interests.join(', ') ?? '', [profile]);
  const blockedCsv = useMemo(() => profile?.preferences.blockedUserIds.join(', ') ?? '', [profile]);

  function updateProfile(mutator: (current: TrialUserProfile) => TrialUserProfile) {
    setProfile((current) => {
      if (!current) {
        return current;
      }
      return mutator(current);
    });
  }

  function addSlot() {
    if (newSlot.endHour <= newSlot.startHour) {
      setMessage('End hour must be after start hour.');
      return;
    }

    updateProfile((current) => ({
      ...current,
      availability: [...current.availability, newSlot],
    }));
    setMessage('');
  }

  async function handleSave() {
    if (!profile) {
      return;
    }

    setIsSaving(true);
    setMessage('');
    try {
      const saved = await saveTrialUserProfile(profile.user.id, profile);
      setProfile(saved);
      setMessage('Onboarding/settings data saved to SQLite.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-3">Structured onboarding + settings persistence</h2>
        <label className="text-sm text-white/70">Select user</label>
        <select
          className="mt-1 w-full md:w-[360px] bg-black/30 border border-white/15 rounded px-3 py-2 text-sm"
          value={selectedUserId}
          onChange={(event) => setSelectedUserId(event.target.value)}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.displayName} (@{user.handle})
            </option>
          ))}
        </select>
      </section>

      {!profile ? null : (
        <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm text-white/70">
              Display name
              <input
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2"
                value={profile.user.displayName}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    user: {
                      ...current.user,
                      displayName: event.target.value,
                    },
                  }))
                }
              />
            </label>
            <label className="text-sm text-white/70">
              Handle
              <input
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2"
                value={profile.user.handle}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    user: {
                      ...current.user,
                      handle: event.target.value,
                    },
                  }))
                }
              />
            </label>
            <label className="text-sm text-white/70">
              Email
              <input
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2"
                value={profile.user.email}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    user: {
                      ...current.user,
                      email: event.target.value,
                    },
                  }))
                }
              />
            </label>
            <label className="text-sm text-white/70">
              Timezone
              <input
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2"
                value={profile.user.timezone}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    user: {
                      ...current.user,
                      timezone: event.target.value,
                    },
                  }))
                }
              />
            </label>
            <label className="text-sm text-white/70 md:col-span-2">
              Location
              <input
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2"
                value={profile.user.location}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    user: {
                      ...current.user,
                      location: event.target.value,
                    },
                  }))
                }
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm text-white/70">
              Match intent (comma-separated)
              <input
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2"
                value={intentCsv}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      matchIntent: parseCsv(event.target.value),
                    },
                  }))
                }
              />
            </label>
            <label className="text-sm text-white/70">
              Interests (comma-separated)
              <input
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2"
                value={interestsCsv}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      interests: parseCsv(event.target.value),
                    },
                  }))
                }
              />
            </label>
            <label className="text-sm text-white/70 md:col-span-2">
              Intro/profile text
              <textarea
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2 min-h-24"
                value={profile.preferences.introText}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      introText: event.target.value,
                    },
                  }))
                }
              />
            </label>
            <label className="text-sm text-white/70">
              Meeting format
              <select
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2"
                value={profile.preferences.meetingFormat}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      meetingFormat: event.target.value,
                    },
                  }))
                }
              >
                <option value="video">Video</option>
                <option value="voice">Voice</option>
                <option value="in_person">In person</option>
              </select>
            </label>
            <label className="text-sm text-white/70">
              Blocked user ids (comma-separated)
              <input
                className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2"
                value={blockedCsv}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      blockedUserIds: parseCsv(event.target.value),
                    },
                  }))
                }
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-5 text-sm">
            <label className="inline-flex items-center gap-2 text-white/75">
              <input
                type="checkbox"
                checked={profile.user.isActive}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    user: {
                      ...current.user,
                      isActive: event.target.checked,
                    },
                  }))
                }
              />
              Active user
            </label>
            <label className="inline-flex items-center gap-2 text-white/75">
              <input
                type="checkbox"
                checked={profile.user.matchingEnabled}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    user: {
                      ...current.user,
                      matchingEnabled: event.target.checked,
                    },
                  }))
                }
              />
              Consent to matching
            </label>
            <label className="inline-flex items-center gap-2 text-white/75">
              <input
                type="checkbox"
                checked={profile.preferences.matchEnabled}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      matchEnabled: event.target.checked,
                    },
                  }))
                }
              />
              Matching enabled
            </label>
            <label className="inline-flex items-center gap-2 text-white/75">
              <input
                type="checkbox"
                checked={profile.preferences.localOnly}
                onChange={(event) =>
                  updateProfile((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      localOnly: event.target.checked,
                    },
                  }))
                }
              />
              Local-only matches
            </label>
          </div>

          <div className="border border-white/10 rounded-lg p-4 bg-black/20">
            <h3 className="text-sm font-semibold mb-3">Availability slots</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {profile.availability.map((slot, index) => (
                <div key={`${slot.dayOfWeek}-${slot.startHour}-${slot.endHour}-${index}`} className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20">
                  {formatSlot(slot.dayOfWeek, slot.startHour, slot.endHour)}
                  <button
                    className="ml-2 text-white/60 hover:text-white"
                    onClick={() =>
                      updateProfile((current) => ({
                        ...current,
                        availability: current.availability.filter((_, availabilityIndex) => availabilityIndex !== index),
                      }))
                    }
                  >
                    x
                  </button>
                </div>
              ))}
              {profile.availability.length === 0 && <p className="text-sm text-white/55">No availability slots configured.</p>}
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs text-white/70">
                Day
                <select
                  className="block mt-1 bg-black/30 border border-white/20 rounded px-2 py-1"
                  value={newSlot.dayOfWeek}
                  onChange={(event) =>
                    setNewSlot((current) => ({
                      ...current,
                      dayOfWeek: Number(event.target.value),
                    }))
                  }
                >
                  {DAY_OPTIONS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs text-white/70">
                Start
                <input
                  type="number"
                  min={0}
                  max={23}
                  className="block mt-1 w-20 bg-black/30 border border-white/20 rounded px-2 py-1"
                  value={newSlot.startHour}
                  onChange={(event) =>
                    setNewSlot((current) => ({
                      ...current,
                      startHour: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="text-xs text-white/70">
                End
                <input
                  type="number"
                  min={1}
                  max={24}
                  className="block mt-1 w-20 bg-black/30 border border-white/20 rounded px-2 py-1"
                  value={newSlot.endHour}
                  onChange={(event) =>
                    setNewSlot((current) => ({
                      ...current,
                      endHour: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <button
                onClick={addSlot}
                className="px-3 py-2 text-xs rounded bg-white/10 border border-white/20 hover:bg-white/20"
              >
                Add slot
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={isSaving}
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-[#7FFF00]/15 border border-[#7FFF00]/35 text-[#c9ff87] disabled:opacity-50"
            >
              Save onboarding/settings
            </button>
            {message && <p className="text-sm text-white/75">{message}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
