import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import UserAvatar from '@/components/UserAvatar';

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
import { User as UserIcon, Settings, LogOut, Shield } from 'lucide-react';

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
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full p-0">
          <UserAvatar
            username={user.username}
            avatarUrl={user.avatar_url}
            className="h-9 w-9"
          />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Здравей, {user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Профил</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/">
            <Settings className="mr-2 h-4 w-4" />
            <span>Администрация на сайта</span>
          </Link>
        </DropdownMenuItem>
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

