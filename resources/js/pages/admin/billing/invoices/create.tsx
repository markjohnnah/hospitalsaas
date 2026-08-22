import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Tenant = {
    id: string;
    name: string;
    slug: string;
    plan: { id: string; name: string; price_monthly: number; price_yearly: number } | null;
};

type Plan = {
    id: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
};

type Props = { tenants: Tenant[]; plans: Plan[] };

function formatPrice(cents: number): string {
    return (cents / 100).toFixed(2);
}

export default function InvoicesCreate({ tenants, plans }: Props) {
    const [form, setForm] = useState({
        tenant_id: '',
        plan_id: '',
        subtotal: '',
        tax_amount: '0',
        total: '',
        description: '',
        issued_at: new Date().toISOString().split('T')[0],
        due_at: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const selectedPlan = plans.find((p) => p.id === form.plan_id);
    const selectedTenant = tenants.find((t) => t.id === form.tenant_id);

    const applyPlanPrice = (planId: string) => {
        const plan = plans.find((p) => p.id === planId);
        if (plan) {
            const subtotal = formatPrice(plan.price_monthly);
            const tax = '0';
            const total = subtotal;
            setForm((prev) => ({ ...prev, plan_id: planId, subtotal, tax_amount: tax, total }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.post('/admin/billing/invoices', form, {
            onSuccess: () => setLoading(false),
            onError: (err) => {
                setErrors(err as Record<string, string>);
                setLoading(false);
            },
        });
    };

    return (
        <>
            <Head title="Create Invoice" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
                        <p className="text-muted-foreground">Generate a new billing invoice</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Hospital & Plan</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Hospital</Label>
                                <Select value={form.tenant_id} onValueChange={(v) => setForm((prev) => ({ ...prev, tenant_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select hospital..." /></SelectTrigger>
                                    <SelectContent>
                                        {tenants.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name} {t.plan ? `(${t.plan.name})` : '(No plan)'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tenant_id && <p className="text-sm text-destructive">{errors.tenant_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Plan (auto-fills pricing)</Label>
                                <Select value={form.plan_id} onValueChange={applyPlanPrice}>
                                    <SelectTrigger><SelectValue placeholder="Select plan..." /></SelectTrigger>
                                    <SelectContent>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} — K{formatPrice(p.price_monthly)}/mo
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Amounts (Kina)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="subtotal">Subtotal</Label>
                                    <Input id="subtotal" name="subtotal" type="number" step="0.01" min="0" value={form.subtotal} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_amount">Tax</Label>
                                    <Input id="tax_amount" name="tax_amount" type="number" step="0.01" min="0" value={form.tax_amount} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="total">Total</Label>
                                    <Input id="total" name="total" type="number" step="0.01" min="0" value={form.total} onChange={handleChange} required />
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
                                    <Input id="issued_at" name="issued_at" type="date" value={form.issued_at} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="due_at">Due Date</Label>
                                    <Input id="due_at" name="due_at" type="date" value={form.due_at} onChange={handleChange} required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                        <CardContent>
                            <Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={4} placeholder="Payment instructions or additional notes..." />
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Invoice'}</Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
