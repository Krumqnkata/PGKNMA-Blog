import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import UserAvatar from '@/components/UserAvatar';
import SiteRoleBadge from '@/components/SiteRoleBadge';

// Компоненти от shadcn/ui
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Икони
import { Eye, User as UserIcon, Settings, LogOut, Shield } from 'lucide-react';
import { publicProfilePath } from '@/lib/public-profile';

export const UserDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Проверяваме дали текущият път е страницата на профила
  const isOnProfilePage = location.pathname === '/profile';

  if (!user) {
    return null; // Ако няма логнат потребител, не показваме нищо
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full p-0" aria-label="Меню на профила">
          <UserAvatar
            username={user.username}
            avatarUrl={user.avatar_url}
            siteRole={user.site_role}
            equippedRewards={user.equipped_rewards}
            className="h-9 w-9"
          />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[min(18rem,calc(100vw-1rem))]" align="end">
        <DropdownMenuLabel className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1 break-words leading-5 [overflow-wrap:anywhere]">Здравей, {user.username}</span>
          <SiteRoleBadge role={user.site_role} compact />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Профил</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile?tab=settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={publicProfilePath(user.username)}>
            <Eye className="mr-2 h-4 w-4" />
            <span>Публичен профил</span>
          </Link>
        </DropdownMenuItem>
        {user.can_access_admin === true && (
          <DropdownMenuItem asChild>
            <a href="/admin/">
              <Settings className="mr-2 h-4 w-4" />
              <span>Администрация на сайта</span>
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/profile?tab=rules">
            <Shield className="mr-2 h-4 w-4" />
            <span>Правила</span>
          </Link>
        </DropdownMenuItem>
        
        {/* Показваме бутона за изход, само ако НЕ сме на страницата на профила */}
        {!isOnProfilePage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Изход</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

