import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

type Book = {
  id: number;
  title: string;
  stock_qty: number;
  safety_stock_qty: number;
};

export default function DashboardPage() {
  const [lowStock, setLowStock] = useState<Book[] | null>(null);

  useEffect(() => {
    api('/dashboard').then((res) => setLowStock(res.lowStock));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {lowStock === null && <p className="text-muted-foreground">Loading...</p>}

      {lowStock !== null && lowStock.length === 0 && (
        <Alert className="border-success/30 bg-success/10">
          <CheckCircle2 className="text-success" />
          <AlertTitle>All good</AlertTitle>
          <AlertDescription>
            All books are above their Safety Stock Qty. No alerts.
          </AlertDescription>
        </Alert>
      )}

      {lowStock !== null && lowStock.length > 0 && (
        <>
          <Alert variant="error">
            <AlertTriangle />
            <AlertTitle>Low stock alert</AlertTitle>
            <AlertDescription>
              {lowStock.length} book(s) at or below Safety Stock Qty.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Books needing restock</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Current stock</TableHead>
                    <TableHead>Safety Stock Qty</TableHead>
                    <TableHead>Shortfall</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.title}</TableCell>
                      <TableCell>{b.stock_qty}</TableCell>
                      <TableCell>{b.safety_stock_qty}</TableCell>
                      <TableCell className="font-medium text-destructive">
                        {Math.max(0, b.safety_stock_qty - b.stock_qty)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div>
            <Button render={<Link to="/purchase-orders">Raise a Purchase Order</Link>} />
          </div>
        </>
      )}
    </div>
  );
}
