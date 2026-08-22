import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

type Plan = { id: string; name: string; slug: string };
type Tenant = {
    id: string;
    name: string;
    slug: string | null;
    plan: Plan | null;
    subscription_status: string;
    trial_ends_at: string | null;
    subscribed_at: string | null;
    subscription_ends_at: string | null;
    users_count: number;
    is_active: boolean;
};
type Props = {
    tenants: { data: Tenant[]; current_page: number; last_page: number; total: number };
    plans: Plan[];
    filters: { status?: string };
    statuses: { name: string; value: string; label: string; color: string }[];
};

function statusColor(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (s) {
        case 'active': return 'default';
        case 'trialing': return 'secondary';
        case 'past_due': return 'destructive';
        case 'canceled': return 'outline';
        default: return 'secondary';
    }
}

export default function SubscriptionsIndex({ tenants, plans, filters, statuses }: Props) {
    const [editing, setEditing] = useState<Tenant | null>(null);
    const [form, setForm] = useState({ plan_id: '', subscription_status: '', trial_ends_at: '', subscription_ends_at: '' });
    const [extendDays, setExtendDays] = useState('7');

    const openEdit = (tenant: Tenant) => {
        setEditing(tenant);
        setForm({
            plan_id: tenant.plan?.id ?? '',
            subscription_status: tenant.subscription_status,
            trial_ends_at: tenant.trial_ends_at ?? '',
            subscription_ends_at: tenant.subscription_ends_at ?? '',
        });
    };

    const saveEdit = () => {
        if (!editing) return;
        router.put(`/admin/billing/subscriptions/${editing.id}`, form, {
            onSuccess: () => setEditing(null),
        });
    };

    const extendTrial = (tenantId: string) => {
        router.post(`/admin/billing/subscriptions/${tenantId}/extend-trial`, { days: parseInt(extendDays) });
    };

    return (
        <>
            <Head title="Subscriptions" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
                    <p className="text-muted-foreground">Manage tenant subscriptions — {tenants.total} total</p>
                </div>

                <div className="flex gap-3">
                    <Select defaultValue={filters.status ?? 'all'}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left text-sm font-medium">
                                    <th className="p-3">Hospital</th>
                                    <th className="p-3">Plan</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Users</th>
                                    <th className="p-3">Started</th>
                                    <th className="p-3">Trial Ends</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            No subscriptions found.
                                        </td>
                                    </tr>
                                ) : (
                                    tenants.data.map((tenant) => (
                                        <tr key={tenant.id} className="border-b text-sm">
                                            <td className="p-3 font-medium">{tenant.name}</td>
                                            <td className="p-3 text-muted-foreground">{tenant.plan?.name ?? 'No plan'}</td>
                                            <td className="p-3">
                                                <Badge variant={statusColor(tenant.subscription_status)}>{tenant.subscription_status}</Badge>
                                            </td>
                                            <td className="p-3">{tenant.users_count}</td>
                                            <td className="p-3 text-muted-foreground">{tenant.subscribed_at ?? '—'}</td>
                                            <td className="p-3 text-muted-foreground">{tenant.trial_ends_at ?? '—'}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(tenant)}>
                                                        Manage
                                                    </Button>
                                                    {tenant.subscription_status === 'trialing' && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm">Extend</Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Extend Trial</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="space-y-4 py-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Days to add</Label>
                                                                        <Input type="number" min="1" max="90" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button onClick={() => extendTrial(tenant.id)}>Extend Trial</Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Edit Dialog */}
                {editing && (
                    <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Manage Subscription — {editing.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Plan</Label>
                                    <Select value={form.plan_id} onValueChange={(v) => setForm((f) => ({ ...f, plan_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select plan..." /></SelectTrigger>
                                        <SelectContent>
                                            {plans.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={form.subscription_status} onValueChange={(v) => setForm((f) => ({ ...f, subscription_status: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Trial Ends</Label>
                                        <Input type="date" value={form.trial_ends_at} onChange={(e) => setForm((f) => ({ ...f, trial_ends_at: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subscription Ends</Label>
                                        <Input type="date" value={form.subscription_ends_at} onChange={(e) => setForm((f) => ({ ...f, subscription_ends_at: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                                <Button onClick={saveEdit}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}
