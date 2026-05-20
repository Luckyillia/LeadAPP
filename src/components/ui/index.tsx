import React from 'react';
import { cn } from '@/lib/utils';
import type { LeadStatus, UserRole, LeadSource } from '@/types';
import { STATUS_LABELS, ROLE_LABELS, SOURCE_LABELS } from '@/types';

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={cn('status-badge', `status-${status}`)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  return <span className={cn('role-badge', `role-${role}`)}>{ROLE_LABELS[role]}</span>;
}

export function SourceBadge({ source }: { source: LeadSource }) {
  const colors: Record<LeadSource, string> = {
    web: 'bg-sky-100 text-sky-700',
    call_center: 'bg-blue-100 text-blue-700',
    sales_direct: 'bg-emerald-100 text-emerald-700',
  };
  return <span className={cn('status-badge', colors[source])}>{SOURCE_LABELS[source]}</span>;
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export function Card({ className, ...props }: CardProps) {
  return <div className={cn('bg-white rounded-xl border border-border', className)} {...props} />;
}

export function PageHeader({ title, subtitle, children }: {
  title: string; subtitle?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className="card-stat">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{label}</p>
      <p className={cn('text-3xl font-bold tracking-tight', accent ?? 'text-foreground')}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function DuplicateBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-mono font-medium">
      ⚠ Duplikat
    </span>
  );
}

export function Button({
  children, variant = 'primary', size = 'md', className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-blue-600 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-muted',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-red-600',
    ghost: 'hover:bg-secondary text-muted-foreground hover:text-foreground',
    outline: 'border border-border bg-white hover:bg-secondary text-foreground',
  };
  const sizes = { sm: 'text-xs px-2.5 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-sm px-5 py-2.5' };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg border border-input bg-white',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
        'placeholder:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg border border-input bg-white',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg border border-input bg-white resize-none',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        'placeholder:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-medium text-foreground', className)} {...props} />;
}

export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border', className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-mono font-medium text-muted-foreground uppercase tracking-wide bg-muted/50 border-b border-border', className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 border-b border-border last:border-0', className)}>
      {children}
    </td>
  );
}
