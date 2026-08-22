import { Head, Link, router } from '@inertiajs/react';
import { CreditCard, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Plan = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price_monthly: number;
    price_yearly: number;
    max_users: number | null;
    max_patients: number | null;
    features: string[] | null;
    sort_order: number;
    is_active: boolean;
};

type Props = {
    plans: Plan[];
};

const AVAILABLE_FEATURES = [
    'emr', 'appointments', 'patients', 'pharmacy', 'doctors',
    'lab', 'radiology', 'inpatient', 'billing', 'hr', 'inventory', 'multi_branch',
] as const;

const FEATURE_LABELS: Record<string, string> = {
    emr: 'EMR',
    appointments: 'Appointments',
    patients: 'Patients',
    pharmacy: 'Pharmacy',
    doctors: 'Doctors',
    lab: 'Lab',
    radiology: 'Radiology',
    inpatient: 'Inpatient',
    billing: 'Billing',
    hr: 'HR',
    inventory: 'Inventory',
    multi_branch: 'Multi-Branch',
};

function getFeatures(plan: Plan): string[] {
    if (!plan.features) return [];
    if (Array.isArray(plan.features)) return plan.features;
    try { return JSON.parse(plan.features as unknown as string); } catch { return []; }
}
function formatPrice(cents: number): string {
    if (cents === 0) return 'Free';
    return `K${(cents / 100).toLocaleString()}`;
}

export default function PlansIndex({ plans }: Props) {
    const handleDelete = (id: string, name: string) => {
        if (confirm(`Delete plan "${name}"? This cannot be undone.`)) {
            router.delete(`/admin/billing/plans/${id}`);
        }
    };

    return (
        <>
            <Head title="Subscription Plans" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
                        <p className="text-muted-foreground">
                            Manage subscription plans and pricing
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/billing/plans/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Plan
                        </Link>
                    </Button>
                </div>

                {plans.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <CreditCard className="mb-4 h-10 w-10 text-muted-foreground/40" />
                            <h3 className="text-lg font-medium">No plans yet</h3>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Create your first subscription plan.
                            </p>
                            <Button asChild>
                                <Link href="/admin/billing/plans/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Plan
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {plans.map((plan) => (
                            <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">{plan.slug}</p>
                                        </div>
                                        <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                                            {plan.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {plan.description && (
                                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                                    )}
                                    <div className="flex gap-4 text-sm">
                                        <div>
                                            <span className="font-semibold text-lg">{formatPrice(plan.price_monthly)}</span>
                                            <span className="text-muted-foreground">/mo</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-lg">{formatPrice(plan.price_yearly)}</span>
                                            <span className="text-muted-foreground">/yr</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                        <p>Users: {plan.max_users ?? 'Unlimited'}</p>
                                        <p>Patients: {plan.max_patients ?? 'Unlimited'}</p>
                                    </div>
                                    {(() => {
                                        const f = getFeatures(plan);
                                        return f.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {f.map((feature) => (
                                                    <Badge key={feature} variant="outline" className="text-[10px]">
                                                        {FEATURE_LABELS[feature] ?? feature}
                                                    </Badge>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/billing/plans/${plan.id}/edit`}>
                                                <Pencil className="mr-1 h-3 w-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(plan.id, plan.name)}
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
