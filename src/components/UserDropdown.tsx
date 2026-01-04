import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Икони
import { User as UserIcon, Settings, LogOut, ChevronDown } from 'lucide-react';

/**
 * Извлича първата буква от потребителското име за аватара.
 * @param name - Потребителското име (string).
 * @returns Голяма първа буква или '?' ако няма име.
 */
const getAvatarInitial = (name?: string): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

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
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserIcon className="h-5 w-5" />
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

