import { Head } from '@inertiajs/react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Payment = {
    id: string;
    amount: number;
    method: string;
    reference: string | null;
    paid_at: string;
    notes: string | null;
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
    payments: Payment[];
};

type Props = { invoice: Invoice };

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

function methodLabel(m: string): string {
    switch (m) {
        case 'bank_transfer': return 'Bank Transfer';
        case 'cash': return 'Cash';
        case 'check': return 'Check';
        default: return m;
    }
}

export default function TenantBillingShow({ invoice }: Props) {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = invoice.total - totalPaid;

    return (
        <>
            <Head title={`Invoice ${invoice.number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Invoice {invoice.number}</h1>
                        <p className="text-muted-foreground">
                            <Badge variant={statusVariant(invoice.status)} className="mr-2">{invoice.status}</Badge>
                            {invoice.paid_at && <span className="text-green-600">Paid {invoice.paid_at}</span>}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{formatPrice(invoice.tax_amount)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-lg border-t pt-3">
                                <span>Total</span>
                                <span>{formatPrice(invoice.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Issued</span>
                                <span>{invoice.issued_at}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Due</span>
                                <span>{invoice.due_at}</span>
                            </div>
                            {invoice.notes && (
                                <div className="border-t pt-3">
                                    <span className="text-muted-foreground">Notes</span>
                                    <p className="mt-1">{invoice.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Payment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold">{formatPrice(totalPaid)}</div>
                                <p className="text-sm text-muted-foreground">paid of {formatPrice(invoice.total)}</p>
                            </div>
                            {balance > 0 && (
                                <div className="text-center">
                                    <Badge variant="destructive" className="text-sm px-3 py-1">
                                        Balance: {formatPrice(balance)}
                                    </Badge>
                                </div>
                            )}
                            {balance <= 0 && (
                                <div className="text-center">
                                    <Badge variant="default" className="text-sm px-3 py-1">Fully Paid</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {invoice.payments.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.payments.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.paid_at}</TableCell>
                                            <TableCell>{methodLabel(p.method)}</TableCell>
                                            <TableCell className="text-muted-foreground">{p.reference ?? '—'}</TableCell>
                                            <TableCell className="text-right font-medium">{formatPrice(p.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
