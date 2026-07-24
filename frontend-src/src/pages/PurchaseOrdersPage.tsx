import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NativeSelect } from '@/components/NativeSelect';
import StatusBadge from '@/components/StatusBadge';
import { Trash2, Plus } from 'lucide-react';

type Book = { id: number; title: string; cost_price: number; stock_qty: number };
type Vendor = { id: number; name: string };
type LineItem = { book_id: number; qty: number; unit_cost: number };
type Order = { id: number; vendor_id: number; status: string; created_at: string };

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  async function loadAll() {
    const [b, v, o] = await Promise.all([api('/books'), api('/vendors'), api('/purchase-orders')]);
    setBooks(b.books);
    setVendors(v.vendors);
    setOrders(o.orders);
    if (v.vendors.length > 0 && vendorId === null) setVendorId(v.vendors[0].id);
    if (b.books.length > 0 && items.length === 0) {
      setItems([{ book_id: b.books[0].id, qty: 1, unit_cost: b.books[0].cost_price }]);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addLine() {
    if (books.length === 0) return;
    setItems([...items, { book_id: books[0].id, qty: 1, unit_cost: books[0].cost_price }]);
  }

  function removeLine(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, patch: Partial<LineItem>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function onBookChange(idx: number, bookId: number) {
    const book = books.find((b) => b.id === bookId);
    updateLine(idx, { book_id: bookId, unit_cost: book?.cost_price ?? 0 });
  }

  const vendorById = Object.fromEntries(vendors.map((v) => [v.id, v.name]));

  async function handleCreate() {
    setError('');
    if (!vendorId || items.length === 0) {
      setError('Vendor and at least one line item are required.');
      return;
    }
    setCreating(true);
    try {
      const { id } = await api('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({ vendor_id: vendorId, items }),
      });
      navigate(`/purchase-orders/${id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Request failed');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Purchase Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create new Purchase Order</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 max-w-xs">
            <Label>Vendor</Label>
            <NativeSelect value={vendorId ?? ''} onChange={(e) => setVendorId(Number(e.target.value))}>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <NativeSelect
                  className="max-w-xs"
                  value={item.book_id}
                  onChange={(e) => onBookChange(idx, Number(e.target.value))}
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} (stock: {b.stock_qty})
                    </option>
                  ))}
                </NativeSelect>
                <Input
                  type="number"
                  min={1}
                  className="w-20"
                  value={item.qty}
                  onChange={(e) => updateLine(idx, { qty: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  step="0.01"
                  className="w-24"
                  value={item.unit_cost}
                  onChange={(e) => updateLine(idx, { unit_cost: Number(e.target.value) })}
                />
                <Button size="icon" variant="destructive-outline" onClick={() => removeLine(idx)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={addLine}>
              <Plus className="size-4" /> Add book
            </Button>
            <Button loading={creating} onClick={handleCreate}>
              Create Purchase Order
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>#{o.id}</TableCell>
                  <TableCell>{vendorById[o.vendor_id] || o.vendor_id}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>{o.created_at}</TableCell>
                  <TableCell>
                    <Link className="text-sm underline" to={`/purchase-orders/${o.id}`}>
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
