import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  username?: string | null;
  avatarUrl?: string | null;
  className?: string;
  imageClassName?: string;
}

const getInitial = (username?: string | null) => (
  username?.trim().charAt(0).toUpperCase() || '?'
);

const UserAvatar = ({
  username,
  avatarUrl,
  className,
  imageClassName,
}: UserAvatarProps) => (
  <Avatar className={className}>
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
