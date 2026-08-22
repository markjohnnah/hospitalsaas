import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Payment = {
    id: string;
    amount: number;
    method: string;
    reference: string | null;
    paid_at: string;
    notes: string | null;
    recorded_by: { id: number; name: string } | null;
};

type Invoice = {
    id: string;
    number: string;
    tenant: { id: string; name: string; slug: string; email: string | null; phone: string | null };
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

type Props = { invoice: Invoice; statuses: { name: string; value: string; label: string; color: string }[] };

function formatPrice(cents: number): string {
    return `K${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function statusColor(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (s) {
        case 'paid': return 'default';
        case 'sent': return 'secondary';
        case 'overdue': return 'destructive';
        case 'canceled': return 'outline';
        default: return 'secondary';
    }
}

export default function InvoicesShow({ invoice, statuses }: Props) {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = invoice.total - totalPaid;
    const [paymentForm, setPaymentForm] = useState({ amount: (balanceDue / 100).toFixed(2), method: 'bank_transfer', reference: '', paid_at: new Date().toISOString().split('T')[0], notes: '' });
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(false);

    const recordPayment = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.post(`/admin/billing/invoices/${invoice.id}/payments`, paymentForm, {
            onSuccess: () => { setLoading(false); setShowPayment(false); },
            onError: () => setLoading(false),
        });
    };

    const updateStatus = (newStatus: string) => {
        router.patch(`/admin/billing/invoices/${invoice.id}/status`, { status: newStatus });
    };

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
                        <p className="text-muted-foreground">{invoice.tenant.name}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant={statusColor(invoice.status)} className="text-sm px-3 py-1">
                            {invoice.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main details */}
                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Hospital:</span>
                                    <p className="font-medium">{invoice.tenant.name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant={statusColor(invoice.status)} className="ml-2">{invoice.status}</Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Issued:</span>
                                    <p>{invoice.issued_at}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Due:</span>
                                    <p>{invoice.due_at}</p>
                                </div>
                                {invoice.paid_at && (
                                    <div>
                                        <span className="text-muted-foreground">Paid:</span>
                                        <p>{invoice.paid_at}</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>{formatPrice(invoice.tax_amount)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                                    <span>Total</span>
                                    <span>{formatPrice(invoice.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Paid</span>
                                    <span className="text-green-600">{formatPrice(totalPaid)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-sm border-t pt-2">
                                    <span>Balance Due</span>
                                    <span className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                                        {formatPrice(balanceDue)}
                                    </span>
                                </div>
                            </div>

                            {invoice.notes && (
                                <div className="border-t pt-4">
                                    <span className="text-sm text-muted-foreground">Notes</span>
                                    <p className="text-sm mt-1">{invoice.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions sidebar */}
                    <Card>
                        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <Label>Update Status</Label>
                                <Select defaultValue={invoice.status} onValueChange={updateStatus}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {balanceDue > 0 && (
                                <Button className="w-full" onClick={() => setShowPayment(!showPayment)}>
                                    Record Payment
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Record Payment Form */}
                {showPayment && (
                    <Card>
                        <CardHeader><CardTitle>Record Payment</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={recordPayment} className="max-w-md space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (K)</Label>
                                    <Input id="amount" name="amount" type="number" step="0.01" min="0.01" max={(balanceDue / 100).toFixed(2)} value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="method">Payment Method</Label>
                                    <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm((p) => ({ ...p, method: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="check">Check</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reference">Reference #</Label>
                                    <Input id="reference" name="reference" value={paymentForm.reference} onChange={(e) => setPaymentForm((p) => ({ ...p, reference: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paid_at">Payment Date</Label>
                                    <Input id="paid_at" name="paid_at" type="date" value={paymentForm.paid_at} onChange={(e) => setPaymentForm((p) => ({ ...p, paid_at: e.target.value }))} required />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Payment'}</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowPayment(false)}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Payment History */}
                {invoice.payments.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Recorded By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{payment.paid_at}</TableCell>
                                            <TableCell className="font-medium text-green-600">{formatPrice(payment.amount)}</TableCell>
                                            <TableCell className="capitalize">{payment.method.replace('_', ' ')}</TableCell>
                                            <TableCell>{payment.reference ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground">{payment.recorded_by?.name ?? '—'}</TableCell>
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
