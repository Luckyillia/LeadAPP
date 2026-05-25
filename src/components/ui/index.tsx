import React from 'react';
import { cn } from '@/lib/utils';
import type { LeadStatus, UserRole, LeadSource } from '@/types';
import { STATUS_LABELS, ROLE_LABELS, SOURCE_LABELS } from '@/types';

/* ── Status badge ─────────────────────────────────────────────────────────── */
export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={cn('status-badge', `status-${status}`)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {STATUS_LABELS[status]}
    </span>
  );
}

/* ── Role badge ──────────────────────────────────────────────────────────── */
export function RoleBadge({ role }: { role: UserRole }) {
  return <span className={cn('role-badge', `role-${role}`)}>{ROLE_LABELS[role]}</span>;
}

/* ── Source badge ────────────────────────────────────────────────────────── */
export function SourceBadge({ source }: { source: LeadSource }) {
  const colors: Record<LeadSource, string> = {
    web:          'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    call_center:  'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    sales_direct: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', colors[source])}>
      {SOURCE_LABELS[source]}
    </span>
  );
}

/* ── Card ────────────────────────────────────────────────────────────────── */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-xl border border-border shadow-sm', className)}
      {...props}
    />
  );
}

/* ── Page header ─────────────────────────────────────────────────────────── */
export function PageHeader({
  title, subtitle, children,
}: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────────────── */
export function StatCard({
  label, value, sub, accent,
}: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="card-stat">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className={cn('text-3xl font-semibold tracking-tight', accent ?? 'text-foreground')}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ── Duplicate badge ─────────────────────────────────────────────────────── */
export function DuplicateBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-xs font-medium">
      ⚠ Duplikat
    </span>
  );
}

/* ── Button ──────────────────────────────────────────────────────────────── */
export function Button({
  children, variant = 'primary', size = 'md', className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-foreground text-background hover:bg-foreground/90 shadow-sm',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    ghost:
      'hover:bg-secondary text-muted-foreground hover:text-foreground',
    outline:
      'border border-border bg-background hover:bg-secondary text-foreground shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-sm px-5 py-2.5',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Input ───────────────────────────────────────────────────────────────── */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg border border-input bg-background',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
        'placeholder:text-muted-foreground transition-shadow',
        className,
      )}
      {...props}
    />
  );
}

/* ── Select ──────────────────────────────────────────────────────────────── */
export function Select({
  className, children, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg border border-input bg-background',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/* ── Textarea ────────────────────────────────────────────────────────────── */
export function Textarea({
  className, ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-none',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        'placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

/* ── Label ───────────────────────────────────────────────────────────────── */
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
export function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-border w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Table ───────────────────────────────────────────────────────────────── */
export function Table({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border shadow-sm', className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide',
        'bg-secondary/60 border-b border-border',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <td
      className={cn('px-4 py-3 border-b border-border last:border-0 text-foreground', className)}
    >
      {children}
    </td>
  );
}