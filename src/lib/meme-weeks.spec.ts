import { describe, expect, it } from 'vitest';

import { daysLeftToVote, formatMemeWeek, votingDeadlineText } from '@/lib/meme-weeks';

describe('meme weeks', () => {
  it('formats a Monday–Sunday week', () => {
    expect(formatMemeWeek('2026-11-09')).toBe('9 – 15 ноември 2026');
    expect(formatMemeWeek('2026-10-26')).toBe('26 октомври – 1 ноември 2026');
    expect(formatMemeWeek('not-a-date')).toBe('not-a-date');
  });

  it('counts the days left to vote', () => {
    const now = new Date('2026-11-12T10:00:00+02:00');
    expect(daysLeftToVote('2026-11-15T23:59:59+02:00', now)).toBe(3);
    expect(daysLeftToVote('2026-11-12T23:59:59+02:00', now)).toBe(0);
    expect(daysLeftToVote(null, now)).toBeNull();
    expect(votingDeadlineText('2026-11-13T23:59:59+02:00', now)).toContain('остават 1 ден');
    expect(votingDeadlineText('2026-11-12T23:59:59+02:00', now)).toContain('последният ден');
  });
});
