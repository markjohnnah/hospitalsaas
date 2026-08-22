import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Tenant = { id: string; name: string; slug: string };

type InvoiceForm = {
    id: string;
    number: string;
    tenant_id: string;
    status: string;
    subtotal: number;
    tax_amount: number;
    total: number;
    issued_at: string;
    due_at: string;
    notes: string | null;
};

type Props = { invoice: InvoiceForm; tenants: Tenant[] };

export default function InvoicesEdit({ invoice, tenants }: Props) {
    const [form, setForm] = useState({
        tenant_id: invoice.tenant_id,
        subtotal: invoice.subtotal.toString(),
        tax_amount: invoice.tax_amount.toString(),
        total: invoice.total.toString(),
        issued_at: invoice.issued_at,
        due_at: invoice.due_at,
        notes: invoice.notes ?? '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.put(`/admin/billing/invoices/${invoice.id}`, form, {
            onSuccess: () => setLoading(false),
            onError: (err) => {
                setErrors(err as Record<string, string>);
                setLoading(false);
            },
        });
    };

    return (
        <>
            <Head title={`Edit Invoice ${invoice.number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Invoice {invoice.number}</h1>
                        <p className="text-muted-foreground">
                            {invoice.status === 'draft' ? 'Draft invoice — editable' : 'Read-only (locked)'}
                        </p>
                    </div>
                </div>

                {invoice.status !== 'draft' && (
                    <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                        <CardContent className="py-4 text-sm text-yellow-800 dark:text-yellow-200">
                            This invoice is <strong>{invoice.status}</strong> and cannot be edited. Only draft invoices can be modified.
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Hospital</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Hospital</Label>
                                <Select
                                    value={form.tenant_id}
                                    onValueChange={(v) => setForm((prev) => ({ ...prev, tenant_id: v }))}
                                    disabled={invoice.status !== 'draft'}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select hospital..." /></SelectTrigger>
                                    <SelectContent>
                                        {tenants.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tenant_id && <p className="text-sm text-destructive">{errors.tenant_id}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Amounts (Kina)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="subtotal">Subtotal</Label>
                                    <Input id="subtotal" name="subtotal" type="number" step="0.01" min="0" value={form.subtotal} onChange={handleChange} required disabled={invoice.status !== 'draft'} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_amount">Tax</Label>
                                    <Input id="tax_amount" name="tax_amount" type="number" step="0.01" min="0" value={form.tax_amount} onChange={handleChange} disabled={invoice.status !== 'draft'} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="total">Total</Label>
                                    <Input id="total" name="total" type="number" step="0.01" min="0" value={form.total} onChange={handleChange} required disabled={invoice.status !== 'draft'} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Dates</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="issued_at">Issue Date</Label>
                                    <Input id="issued_at" name="issued_at" type="date" value={form.issued_at} onChange={handleChange} required disabled={invoice.status !== 'draft'} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="due_at">Due Date</Label>
                                    <Input id="due_at" name="due_at" type="date" value={form.due_at} onChange={handleChange} required disabled={invoice.status !== 'draft'} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                        <CardContent>
                            <Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={4} placeholder="Payment instructions or additional notes..." disabled={invoice.status !== 'draft'} />
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        {invoice.status === 'draft' && (
                            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                        )}
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Back</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
