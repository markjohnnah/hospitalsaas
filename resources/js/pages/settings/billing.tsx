import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, DollarSign, FileText, Users } from 'lucide-react';

type Plan = {
    id: string;
    name: string;
    slug: string;
    price_monthly: number;
    price_yearly: number;
    max_users: number | null;
    max_patients: number | null;
    features: string[] | null;
};

type Tenant = {
    id: string;
    name: string;
    subscription_status: string;
    trial_ends_at: string | null;
    subscribed_at: string | null;
    subscription_ends_at: string | null;
};

type Invoice = {
    id: string;
    number: string;
    status: string;
    total: number;
    issued_at: string;
    due_at: string;
    paid_at: string | null;
    payments: { amount: number }[];
};

type Props = {
    tenant: Tenant;
    plan: Plan | null;
    usage: { users: number; patients: number; doctors: number };
    invoices: { data: Invoice[]; current_page: number; last_page: number; total: number };
};

function formatPrice(cents: number): string {
    if (cents === 0) return 'Free';
    return `K${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function statusColor(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (s) {
        case 'paid': return 'default';
        case 'sent': return 'secondary';
        case 'overdue': return 'destructive';
        case 'draft': return 'outline';
        default: return 'secondary';
    }
}

function subStatusColor(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (s) {
        case 'active': return 'default';
        case 'trialing': return 'secondary';
        case 'past_due': return 'destructive';
        case 'canceled': return 'outline';
        default: return 'secondary';
    }
}

const FEATURE_LABELS: Record<string, string> = {
    emr: 'EMR',
    appointments: 'Appointments',
    patients: 'Patients',
    pharmacy: 'Pharmacy',
    doctors: 'Doctors',
    lab: 'Laboratory',
    radiology: 'Radiology',
    inpatient: 'Inpatient',
    billing: 'Billing',
    hr: 'HR',
    inventory: 'Inventory',
    multi_branch: 'Multi-Branch',
};

export default function Billing({ tenant, plan, usage, invoices }: Props) {
    const userLimit = plan?.max_users ?? null;
    const patientLimit = plan?.max_patients ?? null;

    return (
        <>
            <Head title="Billing & Subscription" />

            <div className="space-y-6">
                {/* Subscription Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {plan?.name ?? 'No plan'} —{' '}
                                <Badge variant={subStatusColor(tenant.subscription_status)}>
                                    {tenant.subscription_status}
                                </Badge>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">{plan ? formatPrice(plan.price_monthly) : 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">per month</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Staff Users</p>
                                    <p className="font-medium">{usage.users}{userLimit ? ` / ${userLimit}` : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                                <Building2 className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Patients</p>
                                    <p className="font-medium">{usage.patients}{patientLimit ? ` / ${patientLimit}` : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                                <Calendar className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {tenant.subscription_status === 'trialing' ? 'Trial Ends' : 'Renews'}
                                    </p>
                                    <p className="font-medium">
                                        {tenant.trial_ends_at ?? tenant.subscription_ends_at ?? 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {userLimit && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Staff Usage</span>
                                    <span>{usage.users} / {userLimit}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full bg-primary transition-all"
                                        style={{ width: `${Math.min((usage.users / userLimit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        {patientLimit && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Patient Usage</span>
                                    <span>{usage.patients} / {patientLimit}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full bg-primary transition-all"
                                        style={{ width: `${Math.min((usage.patients / patientLimit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {plan?.features && plan.features.length > 0 && (
                            <div className="border-t pt-4">
                                <p className="mb-2 text-xs font-medium text-muted-foreground">Included Features</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(() => {
                                        const f = Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []);
                                        return f.map((feature: string) => (
                                            <Badge key={feature} variant="outline" className="text-xs">
                                                {FEATURE_LABELS[feature] ?? feature}
                                            </Badge>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Invoice History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Invoice History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoices.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <DollarSign className="mx-auto mb-2 h-8 w-8 opacity-40" />
                                <p>No invoices yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left text-sm font-medium">
                                            <th className="p-2">Invoice</th>
                                            <th className="p-2">Status</th>
                                            <th className="p-2">Total</th>
                                            <th className="p-2">Issued</th>
                                            <th className="p-2">Due</th>
                                            <th className="p-2">Paid</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.data.map((inv) => {
                                            const totalPaid = inv.payments.reduce((s, p) => s + p.amount, 0);
                                            return (
                                                <tr key={inv.id} className="border-b text-sm">
                                                    <td className="p-2 font-medium">{inv.number}</td>
                                                    <td className="p-2">
                                                        <Badge variant={statusColor(inv.status)}>{inv.status}</Badge>
                                                    </td>
                                                    <td className="p-2">{formatPrice(inv.total)}</td>
                                                    <td className="p-2 text-muted-foreground">{inv.issued_at}</td>
                                                    <td className="p-2 text-muted-foreground">{inv.due_at}</td>
                                                    <td className="p-2">
                                                        {inv.paid_at ? (
                                                            <span className="text-green-600">{formatPrice(totalPaid)}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
