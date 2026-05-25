import React, { useState } from 'react';
import { useProfiles, useCreateUser, useUpdateProfile } from '@/hooks/useProfiles';
import {
  Table, Th, Td, Button, Modal, Input, Label, Select, RoleBadge, Card,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { UserPlus, Loader2, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import type { UserRole } from '@/types';
import { ROLE_LABELS } from '@/types';

export function AdminUsers() {
  const { data: profiles = [], isLoading } = useProfiles();
  const createUser = useCreateUser();
  const updateProfile = useUpdateProfile();

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'agent_cc' as UserRole });
  const [userFormErr, setUserFormErr] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const filtered = roleFilter === 'all' ? profiles : profiles.filter(p => p.role === roleFilter);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormErr('');
    if (newUser.password.length < 8) { setUserFormErr('Hasło min. 8 znaków.'); return; }
    try {
      await createUser.mutateAsync(newUser);
      setAddUserOpen(false);
      setNewUser({ email: '', password: '', fullName: '', role: 'agent_cc' });
    } catch (err: unknown) {
      setUserFormErr(err instanceof Error ? err.message : 'Błąd tworzenia użytkownika');
    }
  };

  const roleStats = Object.entries(ROLE_LABELS).map(([role, label]) => ({
    role: role as UserRole,
    label,
    count: profiles.filter(p => p.role === role).length,
    active: profiles.filter(p => p.role === role && p.isActive).length,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Użytkownicy
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">Zarządzanie kontami i rolami</p>
        </div>
        <Button onClick={() => setAddUserOpen(true)}>
          <UserPlus className="w-4 h-4" /> Dodaj użytkownika
        </Button>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {roleStats.map(({ role, label, count, active }) => (
          <button
            key={role}
            onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
            className={`text-left p-4 rounded-xl border transition-all ${
              roleFilter === role ? 'border-primary bg-primary/5' : 'border-border bg-white hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <RoleBadge role={role} />
              <span className="text-xs font-mono text-muted-foreground">{active}/{count}</span>
            </div>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <Table>
          <thead>
            <tr><Th>Użytkownik</Th><Th>Email</Th><Th>Rola</Th><Th>Status</Th><Th>Dołączył</Th><Th>Akcje</Th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {p.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="font-medium text-sm">{p.fullName}</span>
                  </div>
                </Td>
                <Td><span className="text-sm font-mono">{p.email}</span></Td>
                <Td>
                  <select
                    className="text-xs border border-input rounded px-2 py-1 bg-white"
                    value={p.role}
                    onChange={e => updateProfile.mutate({ id: p.id, role: e.target.value as UserRole })}
                  >
                    {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <span className={`text-xs font-mono font-semibold ${p.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {p.isActive ? '● Aktywny' : '○ Nieaktywny'}
                  </span>
                </Td>
                <Td><span className="text-xs font-mono text-muted-foreground">{formatDate(p.createdAt)}</span></Td>
                <Td>
                  <button
                    onClick={() => updateProfile.mutate({ id: p.id, isActive: !p.isActive })}
                    className={`text-xs flex items-center gap-1 transition-colors ${p.isActive ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-800'}`}
                  >
                    {p.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {p.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={addUserOpen} onClose={() => { setAddUserOpen(false); setUserFormErr(''); }} title="Nowy użytkownik">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-1">
            <Label>Imię i Nazwisko</Label>
            <Input placeholder="Jan Kowalski" value={newUser.fullName}
              onChange={e => setNewUser(u => ({ ...u, fullName: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" placeholder="jan@firma.pl" value={newUser.email}
              onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label>Rola</Label>
            <Select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as UserRole }))}>
              {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Hasło (min. 8 znaków)</Label>
            <Input type="password" placeholder="••••••••" value={newUser.password}
              onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} required />
          </div>
          {userFormErr && <p className="text-xs text-destructive">{userFormErr}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setAddUserOpen(false)}>Anuluj</Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Tworzę...</> : 'Utwórz konto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
