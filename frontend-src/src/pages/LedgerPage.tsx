import { useEffect, useState } from 'react';
import { api, fmtMoney } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

type Entry = {
  id: number;
  type: 'in' | 'out';
  amount: number;
  source: string;
  created_at: string;
  running_balance: number;
};

export default function LedgerPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    api('/ledger').then((res) => {
      setEntries(res.entries);
      setBalance(res.balance);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Cash Ledger</h1>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Current balance</p>
          <p className="text-2xl font-semibold">{fmtMoney(balance)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entries (most recent first)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Running balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.created_at}</TableCell>
                  <TableCell>
                    {e.type === 'in' ? (
                      <span className="flex items-center gap-1 text-success">
                        <ArrowUpCircle className="size-4" /> Cash in
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-destructive">
                        <ArrowDownCircle className="size-4" /> Cash out
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{e.source}</TableCell>
                  <TableCell className={e.type === 'in' ? 'text-success' : 'text-destructive'}>
                    {e.type === 'in' ? '+' : '-'}
                    {fmtMoney(e.amount)}
                  </TableCell>
                  <TableCell>{fmtMoney(e.running_balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
