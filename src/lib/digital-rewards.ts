import type { CSSProperties } from 'react';

import type { PublicDigitalReward } from '@/lib/api';

type RewardVisual = Pick<PublicDigitalReward, 'title' | 'kind' | 'config' | 'selected'>;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const safeRewardColor = (value: unknown, fallback: string) => (
  typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback
);

export const selectedReward = (
  rewards: RewardVisual[] | null | undefined,
  kind: PublicDigitalReward['kind'],
) => rewards?.find((reward) => reward.selected && reward.kind === kind) ?? null;

const effectStyle = (reward: RewardVisual | null) => {
  const value = reward?.config.style;
  return value === 'gradient' || value === 'glow' ? value : 'solid';
};

export const avatarFrameStyle = (
  rewards: RewardVisual[] | null | undefined,
): CSSProperties | undefined => {
  const reward = selectedReward(rewards, 'avatar_frame');
  if (!reward) return undefined;
  const color = safeRewardColor(reward.config.color, '#8b5cf6');
  const secondary = safeRewardColor(reward.config.secondary_color, '#22d3ee');
  const style = effectStyle(reward);
  return {
    borderColor: color,
    borderWidth: '3px',
    borderStyle: 'solid',
    background: style === 'gradient' ? `linear-gradient(135deg, ${color}, ${secondary})` : undefined,
    boxShadow: style === 'glow'
      ? `var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 0 18px ${color}`
      : undefined,
  };
};

export const profileBorderStyle = (
  rewards: RewardVisual[] | null | undefined,
): CSSProperties | undefined => {
  const reward = selectedReward(rewards, 'profile_border');
  if (!reward) return undefined;
  const color = safeRewardColor(reward.config.color, '#8b5cf6');
  const secondary = safeRewardColor(reward.config.secondary_color, '#22d3ee');
  const style = effectStyle(reward);
  return {
    borderColor: color,
    boxShadow: style === 'glow'
      ? `0 18px 50px -18px ${color}`
      : undefined,
    backgroundImage: style === 'gradient'
      ? `linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box, linear-gradient(135deg, ${color}, ${secondary}) border-box`
      : undefined,
  };
};

export const profileThemeStyle = (
  rewards: RewardVisual[] | null | undefined,
): CSSProperties | undefined => {
  const reward = selectedReward(rewards, 'profile_theme');
  if (!reward) return undefined;
  const color = safeRewardColor(reward.config.color, '#8b5cf6');
  const secondary = safeRewardColor(reward.config.secondary_color, '#22d3ee');
  return {
    backgroundImage: `radial-gradient(circle at 8% 0%, ${color}33, transparent 42%), radial-gradient(circle at 96% 100%, ${secondary}2b, transparent 38%)`,
  };
};

export const rewardTitles = (
  rewards: RewardVisual[] | null | undefined,
) => (rewards ?? [])
  .filter((reward) => reward.selected && reward.kind === 'user_title')
  .map((reward) => {
    const configuredText = reward.config.text;
    const text = typeof configuredText === 'string' && configuredText.trim()
      ? configuredText
      : reward.title;
    return text.trim().slice(0, 60);
  })
  .filter(Boolean)
  .slice(0, 3);

export const rewardIcon = (rewards: RewardVisual[] | null | undefined) => {
  const reward = selectedReward(rewards, 'special_icon');
  const icon = reward?.config.icon;
  return typeof icon === 'string' && icon.trim() ? icon.trim().slice(0, 40) : null;
};
