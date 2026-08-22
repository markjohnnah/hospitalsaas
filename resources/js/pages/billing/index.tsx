import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, DollarSign, FileText, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Stats = {
    total_invoices: number;
    paid_invoices: number;
    overdue_invoices: number;
    draft_invoices: number;
    total_revenue: number;
    pending_amount: number;
};

type Invoice = {
    id: string;
    number: string;
    status: string;
    subtotal: number;
    tax_amount: number;
    total: number;
    issued_at: string;
    due_at: string;
    paid_at: string | null;
    notes: string | null;
    payments: { amount: number }[];
};

type Props = {
    stats: Stats;
    invoices: { data: Invoice[]; current_page: number; last_page: number; total: number };
};

function formatPrice(cents: number): string {
    return `K${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function statusVariant(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (s) {
        case 'paid': return 'default';
        case 'sent': return 'secondary';
        case 'overdue': return 'destructive';
        case 'draft': return 'outline';
        default: return 'secondary';
    }
}

export default function TenantBillingIndex({ stats, invoices }: Props) {
    return (
        <>
            <Head title="Billing" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
                    <p className="text-muted-foreground">Manage invoices and payments</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(stats.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">All paid invoices</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.paid_invoices}</div>
                            <p className="text-xs text-muted-foreground">of {stats.total_invoices} invoices</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Receipt className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(stats.pending_amount)}</div>
                            <p className="text-xs text-muted-foreground">Awaiting payment</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.overdue_invoices}</div>
                            <p className="text-xs text-muted-foreground">{stats.draft_invoices} drafts</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice List */}
                <Card>
                    <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {invoices.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <FileText className="mb-4 h-10 w-10 text-muted-foreground/40" />
                                <h3 className="text-lg font-medium">No invoices yet</h3>
                                <p className="text-sm text-muted-foreground">Invoices will appear here.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Issued</TableHead>
                                        <TableHead>Due</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.data.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell>
                                                <Link href={`/billing/${inv.id}`} className="font-medium text-primary hover:underline">
                                                    {inv.number}
                                                </Link>
                                            </TableCell>
                                            <TableCell><Badge variant={statusVariant(inv.status)}>{inv.status}</Badge></TableCell>
                                            <TableCell className="font-medium">{formatPrice(inv.total)}</TableCell>
                                            <TableCell className="text-muted-foreground">{inv.issued_at}</TableCell>
                                            <TableCell className="text-muted-foreground">{inv.due_at}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
