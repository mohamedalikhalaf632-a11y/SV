import { describe, expect, it } from 'vitest';
import { getDisplayName } from './auth';

describe('getDisplayName', () => {
  it('returns the stored username when available', () => {
    expect(
      getDisplayName({
        email: 'student@example.com',
        user_metadata: { username: 'Ayman' },
      } as any)
    ).toBe('Ayman');
  });

  it('falls back to the email local part when no username exists', () => {
    expect(
      getDisplayName({
        email: 'student@example.com',
        user_metadata: {},
      } as any)
    ).toBe('student');
  });
});
