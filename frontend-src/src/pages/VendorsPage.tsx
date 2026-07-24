import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Vendor = { id: number; name: string; contact_info: string };

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadVendors() {
    const { vendors } = await api('/vendors');
    setVendors(vendors);
  }

  useEffect(() => {
    loadVendors();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    try {
      await api('/vendors', { method: 'POST', body: JSON.stringify({ name, contact_info: contact }) });
      setName('');
      setContact('');
      await loadVendors();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Vendors</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="w-64" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Contact info</Label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email / phone"
                className="w-64"
              />
            </div>
            <Button type="submit" loading={loading}>
              Create Vendor
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>{v.contact_info}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
