import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError, fmtMoney } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft } from 'lucide-react';

type Item = { book_id: number; title: string; qty: number; unit_price: number; current_stock: number };
type Order = {
  id: number;
  status: string;
  salesperson_name: string;
  created_at: string;
  confirmed_at?: string;
  delivered_at?: string;
  paid_at?: string;
  cancelled_at?: string;
  items: Item[];
};

export default function SalesOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [actionError, setActionError] = useState('');
  const [shortfalls, setShortfalls] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { order } = await api(`/sales-orders/${id}`);
    setOrder(order);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function runAction(path: string) {
    setActionError('');
    setShortfalls(null);
    setBusy(true);
    try {
      await api(`/sales-orders/${id}/${path}`, { method: 'POST' });
      await load();
    } catch (e) {
      if (e instanceof ApiError) {
        setActionError(e.message);
        if (e.data?.shortfalls) setShortfalls(e.data.shortfalls);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!order) return <p className="text-muted-foreground">Loading...</p>;

  const total = order.items.reduce((s, it) => s + it.qty * it.unit_price, 0);
  const canConfirm = order.status === 'Pending';
  const canDeliver = order.status === 'Confirmed';
  const canPay = order.status === 'Delivered';
  const canCancel = order.status === 'Pending' || order.status === 'Confirmed';
  const canPrintDO = order.status !== 'Pending' && order.status !== 'Cancelled';
  const canPrintInvoice = order.status === 'Paid';

  return (
    <div className="flex flex-col gap-4">
      <Link to="/sales-orders" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Sales Orders
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Sales Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">Salesperson:</strong> {order.salesperson_name}
      </p>

      {actionError && (
        <Alert variant="error">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {shortfalls && (
        <Alert variant="warning">
          <AlertTitle>Shortfall detail</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {shortfalls.map((s, i) => (
                <li key={i}>
                  {s.title}: need {s.needed}, have {s.available} (short {s.shortfall})
                </li>
              ))}
            </ul>
            <Button className="mt-2" render={<Link to="/purchase-orders">Raise a Purchase Order for the shortfall</Link>} />
          </AlertDescription>
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
          <Button disabled={!canDeliver || busy} onClick={() => runAction('deliver')}>
            Mark Delivered
          </Button>
          <Button disabled={!canPay || busy} onClick={() => runAction('pay')}>
            Mark Paid
          </Button>
          <Button
            variant="outline"
            disabled={!canPrintDO}
            render={<a href={`/print/sales-order/${order.id}/delivery-order`} target="_blank" rel="noreferrer" />}
          >
            Print Delivery Order
          </Button>
          <Button
            variant="outline"
            disabled={!canPrintInvoice}
            render={<a href={`/print/sales-order/${order.id}/invoice`} target="_blank" rel="noreferrer" />}
          >
            Print Invoice
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
                <TableHead>Stock available</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead>Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((it, i) => (
                <TableRow key={i} className={it.qty > it.current_stock ? 'bg-destructive/5' : ''}>
                  <TableCell>{it.title}</TableCell>
                  <TableCell>{it.qty}</TableCell>
                  <TableCell>
                    {it.current_stock}
                    {it.qty > it.current_stock && <span className="text-destructive"> ⚠ short</span>}
                  </TableCell>
                  <TableCell>{fmtMoney(it.unit_price)}</TableCell>
                  <TableCell>{fmtMoney(it.qty * it.unit_price)}</TableCell>
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
            {order.delivered_at && (
              <li>
                <strong className="text-foreground">Delivered:</strong> {order.delivered_at}
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
