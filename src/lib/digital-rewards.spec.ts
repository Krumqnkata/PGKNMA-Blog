import { describe, expect, it } from 'vitest';

import type { PublicDigitalReward } from './api';
import { rewardTitles } from './digital-rewards';


const titleReward = (
  key: string,
  selected = true,
  text?: string,
): PublicDigitalReward => ({
  key,
  title: `Награда ${key}`,
  kind: 'user_title',
  config: text === undefined ? {} : { text },
  unlocked_at: '2026-08-13T10:00:00+03:00',
  selected,
});


describe('rewardTitles', () => {
  it('returns all selected titles up to the supported limit', () => {
    expect(rewardTitles([
      titleReward('one', true, 'Първа титла'),
      titleReward('two', false, 'Скрита титла'),
      titleReward('three', true, 'Втора титла'),
      titleReward('four', true, 'Трета титла'),
      titleReward('five', true, 'Четвърта титла'),
    ])).toEqual(['Първа титла', 'Втора титла', 'Трета титла']);
  });

  it('uses the reward name when an older title has no configured text', () => {
    expect(rewardTitles([titleReward('legacy')])).toEqual(['Награда legacy']);
  });
});
