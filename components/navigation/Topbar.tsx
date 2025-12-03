'use client';

import { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';
import { getUserData, type User as UserType } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Topbar() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    setUser(getUserData());
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-gray-900 text-white">
              {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
            <p className="text-gray-500">{user?.role || 'Role'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
