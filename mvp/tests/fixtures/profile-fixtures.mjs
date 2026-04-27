export function buildProfileFixture(overrides = {}) {
  const userId = overrides.user?.id ?? 'user_fixture';
  const defaultAvailability = [
    {
      dayOfWeek: 1,
      startHour: 17,
      endHour: 19,
      timezone: 'UTC',
    },
    {
      dayOfWeek: 3,
      startHour: 18,
      endHour: 20,
      timezone: 'UTC',
    },
  ];

  return {
    user: {
      id: userId,
      displayName: 'Fixture User',
      handle: 'fixture.user',
      email: 'fixture@example.com',
      timezone: 'UTC',
      location: 'Montreal, Canada',
      bio: 'Product builder focused on thoughtful intros.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      matchIntent: ['collaboration', 'brainstorming'],
      offers: ['design feedback', 'product strategy'],
      asks: ['fundraising advice'],
      preferredLocations: ['Montreal, Canada'],
      userType: 'designer',
      preferredUserTypes: ['founder', 'operator'],
      interests: ['product', 'ai'],
      objectives: ['calibration_v1', 'career_growth'],
      introText: 'I enjoy connecting with people building useful tools.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? defaultAvailability,
  };
}
