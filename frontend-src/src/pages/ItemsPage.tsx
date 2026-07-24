import { useEffect, useState } from 'react';
import { api, ApiError, fmtMoney } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Book = {
  id: number;
  title: string;
  price: number;
  cost_price: number;
  stock_qty: number;
  safety_stock_qty: number;
};

const emptyForm = { title: '', price: '', cost_price: '', stock_qty: '0', safety_stock_qty: '0' };

export default function ItemsPage() {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadBooks() {
    const { books } = await api('/books');
    setBooks(books);
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    if (!form.title.trim() || !form.price) {
      setCreateError('Title and selling price are required.');
      return;
    }
    setCreating(true);
    try {
      await api('/books', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          price: Number(form.price),
          cost_price: Number(form.cost_price) || 0,
          stock_qty: Number(form.stock_qty) || 0,
          safety_stock_qty: Number(form.safety_stock_qty) || 0,
        }),
      });
      setForm(emptyForm);
      await loadBooks();
    } catch (e) {
      setCreateError(e instanceof ApiError ? e.message : 'Request failed');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(b: Book) {
    setEditingId(b.id);
    setEditForm({
      title: b.title,
      price: String(b.price),
      cost_price: String(b.cost_price),
      stock_qty: String(b.stock_qty),
      safety_stock_qty: String(b.safety_stock_qty),
    });
    setEditError('');
  }

  async function saveEdit(id: number) {
    setEditError('');
    if (!editForm.title.trim() || !editForm.price) {
      setEditError('Title and selling price are required.');
      return;
    }
    setSaving(true);
    try {
      await api(`/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editForm.title,
          price: Number(editForm.price),
          cost_price: Number(editForm.cost_price) || 0,
          stock_qty: Number(editForm.stock_qty) || 0,
          safety_stock_qty: Number(editForm.safety_stock_qty) || 0,
        }),
      });
      setEditingId(null);
      await loadBooks();
    } catch (e) {
      setEditError(e instanceof ApiError ? e.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Item Master</h1>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-56" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Selling price</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-28" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Cost price</Label>
                <Input type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className="w-28" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Initial stock</Label>
                <Input type="number" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} className="w-24" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Safety Stock Qty</Label>
                <Input type="number" value={form.safety_stock_qty} onChange={(e) => setForm({ ...form, safety_stock_qty: e.target.value })} className="w-24" />
              </div>
              <Button type="submit" loading={creating}>
                Create Book
              </Button>
            </form>
            {createError && <p className="mt-2 text-sm text-destructive">{createError}</p>}
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertDescription>
            View-only: only Admin can create or edit books/prices/Safety Stock Qty.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Books</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Selling price</TableHead>
                <TableHead>Cost price</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Safety Stock Qty</TableHead>
                {isAdmin && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((b) =>
                editingId === b.id ? (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" className="w-24" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" className="w-24" value={editForm.cost_price} onChange={(e) => setEditForm({ ...editForm, cost_price: e.target.value })} />
                    </TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>
                      <Input type="number" className="w-20" value={editForm.stock_qty} onChange={(e) => setEditForm({ ...editForm, stock_qty: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-20" value={editForm.safety_stock_qty} onChange={(e) => setEditForm({ ...editForm, safety_stock_qty: e.target.value })} />
                    </TableCell>
                    <TableCell className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <Button size="sm" loading={saving} onClick={() => saveEdit(b.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                      {editError && <p className="text-xs text-destructive">{editError}</p>}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={b.id} className={b.stock_qty <= b.safety_stock_qty ? 'bg-destructive/5' : ''}>
                    <TableCell>{b.title}</TableCell>
                    <TableCell>{fmtMoney(b.price)}</TableCell>
                    <TableCell>{fmtMoney(b.cost_price)}</TableCell>
                    <TableCell>{fmtMoney(b.price - b.cost_price)}</TableCell>
                    <TableCell>{b.stock_qty}</TableCell>
                    <TableCell>{b.safety_stock_qty}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => startEdit(b)}>
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
