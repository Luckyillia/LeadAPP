import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Phone, Users, ShoppingBag,
  LogOut, ChevronDown, Zap,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { ROLE_LABELS } from '@/types';

const NAV_ITEMS: { role: UserRole[]; path: string; label: string; icon: React.ElementType }[] = [
  { role: ['admin'], path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { role: ['admin', 'agent_cc'], path: '/cc', label: 'CRM Call Center', icon: Phone },
  { role: ['admin', 'sales_direct'], path: '/handlowiec', label: 'CRM Handlowiec', icon: Users },
  { role: ['admin', 'buyer'], path: '/buyer', label: 'Portal Kupującego', icon: ShoppingBag },
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-slate-900 text-white',
  agent_cc: 'bg-blue-600 text-white',
  sales_direct: 'bg-emerald-600 text-white',
  buyer: 'bg-violet-600 text-white',
};

export function Navigation() {
  const { user, login, logout } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => item.role.includes(user.role));

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">LEADAPP</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">CRM B2B Lead Generation</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn('sidebar-link', active && 'active')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Demo role switcher */}
      <div className="p-3 border-t border-border space-y-2">
        <p className="text-xs text-muted-foreground px-2 font-mono">DEMO – zmień rolę:</p>
        <div className="grid grid-cols-2 gap-1">
          {(['admin', 'agent_cc', 'sales_direct', 'buyer'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => login(role)}
              className={cn(
                'text-xs px-2 py-1.5 rounded font-mono font-medium transition-all',
                user.role === role
                  ? ROLE_COLORS[role]
                  : 'bg-secondary text-muted-foreground hover:bg-muted'
              )}
            >
              {role === 'agent_cc' ? 'CC' : role === 'sales_direct' ? 'Sales' : role === 'admin' ? 'Admin' : 'Buyer'}
            </button>
          ))}
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted mt-1">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {user.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          </div>
          <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
