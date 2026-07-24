import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError, fmtMoney } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft } from 'lucide-react';

type Item = { book_id: number; title: string; qty: number; unit_cost: number };
type Order = {
  id: number;
  vendor_id: number;
  vendor?: { name: string; contact_info: string };
  status: string;
  created_at: string;
  confirmed_at?: string;
  grn_at?: string;
  paid_at?: string;
  cancelled_at?: string;
  items: Item[];
};

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const { order } = await api(`/purchase-orders/${id}`);
    setOrder(order);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function runAction(path: string) {
    setActionError('');
    setBusy(true);
    try {
      await api(`/purchase-orders/${id}/${path}`, { method: 'POST' });
      await load();
    } catch (e) {
      if (e instanceof ApiError) setActionError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!order) return <p className="text-muted-foreground">Loading...</p>;

  const total = order.items.reduce((s, it) => s + it.qty * it.unit_cost, 0);
  const canConfirm = order.status === 'Pending';
  const canGrn = order.status === 'Confirmed';
  const canPay = order.status === 'GRN';
  const canCancel = order.status === 'Pending' || order.status === 'Confirmed';
  const canPrintPO = order.status !== 'Pending' && order.status !== 'Cancelled';

  return (
    <div className="flex flex-col gap-4">
      <Link to="/purchase-orders" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Purchase Orders
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Purchase Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">Vendor:</strong>{' '}
        {order.vendor ? order.vendor.name : order.vendor_id}
        {order.vendor?.contact_info && ` (${order.vendor.contact_info})`}
      </p>

      {actionError && (
        <Alert variant="error">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button disabled={!canConfirm || busy} onClick={() => runAction('confirm')}>
            Confirm
          </Button>
          <Button
            variant="outline"
            disabled={!canPrintPO}
            render={<a href={`/print/purchase-order/${order.id}`} target="_blank" rel="noreferrer" />}
          >
            Print Purchase Order
          </Button>
          <Button disabled={!canGrn || busy} onClick={() => runAction('grn')}>
            Mark GRN (Goods Received, stock in)
          </Button>
          <Button disabled={!canPay || busy} onClick={() => runAction('pay')}>
            Mark Paid (cash out)
          </Button>
          <Button
            variant="destructive-outline"
            disabled={!canCancel || busy}
            onClick={() => runAction('cancel')}
            className="ml-auto"
          >
            Cancel Order
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit cost</TableHead>
                <TableHead>Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((it, i) => (
                <TableRow key={i}>
                  <TableCell>{it.title}</TableCell>
                  <TableCell>{it.qty}</TableCell>
                  <TableCell>{fmtMoney(it.unit_cost)}</TableCell>
                  <TableCell>{fmtMoney(it.qty * it.unit_cost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-3 text-right font-semibold">Total: {fmtMoney(total)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Created:</strong> {order.created_at}
            </li>
            {order.confirmed_at && (
              <li>
                <strong className="text-foreground">Confirmed:</strong> {order.confirmed_at}
              </li>
            )}
            {order.grn_at && (
              <li>
                <strong className="text-foreground">GRN:</strong> {order.grn_at}
              </li>
            )}
            {order.paid_at && (
              <li>
                <strong className="text-foreground">Paid:</strong> {order.paid_at}
              </li>
            )}
            {order.cancelled_at && (
              <li>
                <strong className="text-foreground">Cancelled:</strong> {order.cancelled_at}
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
