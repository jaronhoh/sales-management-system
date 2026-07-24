import { useEffect, Fragment, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NativeSelect } from '@/components/NativeSelect';
import { Badge } from '@/components/ui/badge';

type UserRow = { id: number; name: string; username: string; role: string; created_at: string };

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Staff');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const [resettingId, setResettingId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccessId, setResetSuccessId] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);

  async function loadUsers() {
    const { users } = await api('/users');
    setUsers(users);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !username.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    setCreating(true);
    try {
      await api('/users', { method: 'POST', body: JSON.stringify({ name, username, password, role }) });
      setName('');
      setUsername('');
      setPassword('');
      setRole('Staff');
      await loadUsers();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Request failed');
    } finally {
      setCreating(false);
    }
  }

  function startReset(id: number) {
    setResettingId(id);
    setNewPassword('');
    setResetError('');
    setResetSuccessId(null);
  }

  async function submitReset(id: number) {
    setResetError('');
    if (!newPassword || newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }
    setResetting(true);
    try {
      await api(`/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPassword }),
      });
      setResettingId(null);
      setResetSuccessId(id);
    } catch (e) {
      setResetError(e instanceof ApiError ? e.message : 'Request failed');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">User Management</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="w-48" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} className="w-40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <NativeSelect value={role} onChange={(e) => setRole(e.target.value)} className="w-28">
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </NativeSelect>
            </div>
            <Button type="submit" loading={creating}>
              Create User
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <Fragment key={u.id}>
                  <TableRow>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'Admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>{u.created_at}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => startReset(u.id)}>
                        Reset Password
                      </Button>
                      {resetSuccessId === u.id && (
                        <span className="ml-2 text-xs text-success">Password reset ✓</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {resettingId === u.id && (
                    <TableRow key={`${u.id}-reset`}>
                      <TableCell colSpan={5}>
                        <div className="flex items-end gap-3 rounded-lg border bg-muted/30 p-3">
                          <div className="flex flex-col gap-1.5">
                            <Label>New password for {u.name}</Label>
                            <Input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-48"
                              autoFocus
                            />
                          </div>
                          <Button size="sm" loading={resetting} onClick={() => submitReset(u.id)}>
                            Confirm Reset
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setResettingId(null)}>
                            Cancel
                          </Button>
                          {resetError && <p className="text-sm text-destructive">{resetError}</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
