'use client';

import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Search, MessageCircle, User as UserIcon, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import ThemeControls from './theme-controls';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<any>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/sign-in');
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage alt={user.name || ''} />
            <AvatarFallback>
              {user.name
                ? user.name.split(' ').map((n: string) => n[0]).join('')
                : user.email.split('@')[0].charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminNavbar() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guests, rooms, reservations..."
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Messages */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MessageCircle className="h-4 w-4" />
            <span className="sr-only">Messages</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeControls />

          {/* User Menu */}
          <Suspense fallback={<div className="h-8 w-8" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}