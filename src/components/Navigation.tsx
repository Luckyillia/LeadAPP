import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Phone, Users, ShoppingBag, LogOut, Zap, Home,
  TrendingUp, AlertTriangle, MessageSquare, BarChart2,
  CheckCircle, Briefcase, ChevronRight, Clock,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { ROLE_LABELS } from '@/types';
import { useRejections } from '@/hooks/useRejections';
import { useLeads } from '@/hooks/useLeads';
import { useBuyerRejections } from '@/hooks/useRejections';

type Child = { path: string; label: string; icon: React.ElementType; badgeKey?: string };
type NavItem = {
  role: UserRole[];
  path: string;
  label: string;
  icon: React.ElementType;
  children?: Child[];
};

const NAV_ITEMS: NavItem[] = [
  {
    role: ['admin', 'agent_cc', 'sales_direct', 'buyer'],
    path: '/',
    label: 'Strona główna',
    icon: Home,
  },
  {
    role: ['admin'],
    path: '/admin',
    label: 'Admin',
    icon: LayoutDashboard,
    children: [
      { path: '/admin',             label: 'Dashboard',      icon: LayoutDashboard },
      { path: '/admin/leady',       label: 'Leady',          icon: TrendingUp,     badgeKey: 'newLeads' },
      { path: '/admin/reklamacje',  label: 'Reklamacje',     icon: AlertTriangle,  badgeKey: 'pendingRej' },
      { path: '/admin/uzytkownicy', label: 'Użytkownicy',    icon: Users },
      { path: '/admin/czat',        label: 'Czat',           icon: MessageSquare,  badgeKey: 'unreadChat' },
    ],
  },
  {
    role: ['admin', 'agent_cc'],
    path: '/cc',
    label: 'Call Center',
    icon: Phone,
    children: [
      { path: '/cc',            label: 'Kolejka',      icon: Clock,     badgeKey: 'ccQueue' },
      { path: '/cc/historia',   label: 'Historia',     icon: CheckCircle },
      { path: '/cc/statystyki', label: 'Statystyki',   icon: BarChart2 },
    ],
  },
  {
    role: ['admin', 'sales_direct'],
    path: '/handlowiec',
    label: 'Handlowiec',
    icon: Briefcase,
    children: [
      { path: '/handlowiec',             label: 'Pipeline',    icon: Briefcase },
      { path: '/handlowiec/kontakty',    label: 'Kontakty',    icon: Users },
      { path: '/handlowiec/statystyki',  label: 'Statystyki',  icon: BarChart2 },
    ],
  },
  {
    role: ['buyer'],
    path: '/buyer',
    label: 'Portal Kupującego',
    icon: ShoppingBag,
    children: [
      { path: '/buyer',            label: 'Dashboard',       icon: LayoutDashboard },
      { path: '/buyer/leady',      label: 'Moje Kontakty',   icon: ShoppingBag },
      { path: '/buyer/reklamacje', label: 'Reklamacje',      icon: AlertTriangle,  badgeKey: 'buyerRej' },
      { path: '/buyer/kontakt',    label: 'Czat / Kontakt',  icon: MessageSquare },
    ],
  },
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin:        'bg-slate-900 text-white',
  agent_cc:     'bg-blue-600 text-white',
  sales_direct: 'bg-emerald-600 text-white',
  buyer:        'bg-violet-600 text-white',
};

export function Navigation() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const { data: allRejections = [] } = useRejections();
  const { data: allLeads = [] } = useLeads();
  const { data: buyerRejections = [] } = useBuyerRejections(user?.id ?? '');

  if (!user) return null;

  const badges: Record<string, number> = {
    newLeads:   allLeads.filter(l => ['new_web', 'pending_cc'].includes(l.status)).length,
    pendingRej: allRejections.filter(r => r.status === 'pending').length,
    unreadChat: 2, // mock
    ccQueue:    allLeads.filter(l => ['new_web', 'pending_cc'].includes(l.status)).length,
    buyerRej:   buyerRejections.filter(r => r.status === 'pending').length,
  };

  const visibleItems = NAV_ITEMS.filter(item => item.role.includes(user.role));

  const isParentActive = (item: NavItem) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

  const isChildActive = (path: string) => {
    if (path === '/admin' || path === '/buyer' || path === '/cc' || path === '/handlowiec') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const parentActive = isParentActive(item);

          if (item.children) {
            return (
              <div key={item.path}>
                {/* Group header — non-clickable */}
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold select-none',
                  parentActive ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className={cn(
                    'w-3 h-3 transition-transform duration-200',
                    parentActive && 'rotate-90'
                  )} />
                </div>

                {/* Sub-links */}
                <div className="ml-3 pl-3 border-l border-border space-y-0.5 mb-1">
                  {item.children.map(child => {
                    const ChildIcon = child.icon;
                    const active = isChildActive(child.path);
                    const badge = child.badgeKey ? badges[child.badgeKey] : 0;

                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}
                      >
                        <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1">{child.label}</span>
                        {badge > 0 && (
                          <span className={cn(
                            'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                            active ? 'bg-white/20 text-white' : 'bg-primary text-white'
                          )}>
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Flat link (Home)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn('sidebar-link', parentActive && 'active')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted mb-2">
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
            ROLE_COLORS[user.role]
          )}>
            {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Wyloguj się"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground font-mono text-center opacity-50">{user.email}</p>
      </div>
    </aside>
  );
}
