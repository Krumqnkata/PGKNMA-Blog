import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { SiteRole } from '@/lib/api';
import type { PublicDigitalReward } from '@/lib/api';
import { avatarFrameStyle } from '@/lib/digital-rewards';

interface UserAvatarProps {
  username?: string | null;
  avatarUrl?: string | null;
  className?: string;
  imageClassName?: string;
  siteRole?: SiteRole;
  equippedRewards?: PublicDigitalReward[];
}

const getInitial = (username?: string | null) => (
  username?.trim().charAt(0).toUpperCase() || '?'
);

const UserAvatar = ({
  username,
  avatarUrl,
  className,
  imageClassName,
  siteRole,
  equippedRewards,
}: UserAvatarProps) => (
  <Avatar
    className={cn(
      className,
      siteRole === 'administrator' && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background shadow-[0_0_18px_hsl(43_96%_56%/0.35)]',
      siteRole === 'contributor' && 'ring-2 ring-sky-500 ring-offset-2 ring-offset-background shadow-[0_0_14px_hsl(199_89%_48%/0.25)]',
    )}
    title={siteRole === 'administrator' ? 'Администратор на сайта' : siteRole === 'contributor' ? 'Сътрудник на сайта' : undefined}
    style={avatarFrameStyle(equippedRewards)}
  >
    {avatarUrl ? (
      <AvatarImage
        src={avatarUrl}
        alt={`Профилна снимка на ${username || 'потребител'}`}
        className={cn('object-cover', imageClassName)}
      />
    ) : null}
    <AvatarFallback>{getInitial(username)}</AvatarFallback>
  </Avatar>
);

export default UserAvatar;
