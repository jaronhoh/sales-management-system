import { useEffect, useState } from 'react';
import { api, fmtMoney } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Row = { period: string; total: number };
type TopBook = { title: string; qty_sold: number; revenue: number };

export default function ReportsPage() {
  const [daily, setDaily] = useState<Row[]>([]);
  const [monthly, setMonthly] = useState<Row[]>([]);
  const [yearly, setYearly] = useState<Row[]>([]);
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    api('/reports/sales').then((res) => {
      setDaily(res.daily);
      setMonthly(res.monthly);
      setYearly(res.yearly);
    });
  }, []);

  useEffect(() => {
    api(`/reports/top-books?month=${month}`).then((res) => setTopBooks(res.topBooks));
  }, [month]);

  function renderRows(rows: Row[]) {
    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={2} className="text-muted-foreground">
            No data yet
          </TableCell>
        </TableRow>
      );
    }
    return rows.map((r, i) => (
      <TableRow key={i}>
        <TableCell>{r.period}</TableCell>
        <TableCell>{fmtMoney(r.total)}</TableCell>
      </TableRow>
    ));
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales — Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderRows(daily)}</TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales — Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderRows(monthly)}</TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales — Yearly</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderRows(yearly)}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 books by quantity sold</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 max-w-[200px]">
            <Label>Month</Label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Qty sold</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No sales in {month}
                  </TableCell>
                </TableRow>
              ) : (
                topBooks.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{b.title}</TableCell>
                    <TableCell>{b.qty_sold}</TableCell>
                    <TableCell>{fmtMoney(b.revenue)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
