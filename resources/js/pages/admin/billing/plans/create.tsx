import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ALL_FEATURES = [
    { id: 'emr', label: 'Electronic Medical Records' },
    { id: 'appointments', label: 'Appointment Scheduling' },
    { id: 'patients', label: 'Patient Management' },
    { id: 'pharmacy', label: 'Pharmacy & Dispensing' },
    { id: 'doctors', label: 'Doctor Management' },
    { id: 'lab', label: 'Laboratory Management' },
    { id: 'radiology', label: 'Radiology' },
    { id: 'inpatient', label: 'Inpatient Management' },
    { id: 'billing', label: 'Billing & Accounting' },
    { id: 'hr', label: 'HR Management' },
    { id: 'inventory', label: 'Inventory Management' },
    { id: 'multi_branch', label: 'Multi-Branch Support' },
];

export default function PlansCreate() {
    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        price_monthly: '',
        price_yearly: '',
        max_users: '',
        max_patients: '',
        features: [] as string[],
        sort_order: '0',
        is_active: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox' && 'checked' in e.target) {
            setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const toggleFeature = (featureId: string) => {
        setForm((prev) => ({
            ...prev,
            features: prev.features.includes(featureId)
                ? prev.features.filter((f) => f !== featureId)
                : [...prev.features, featureId],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.post('/admin/billing/plans', form, {
            onSuccess: () => setLoading(false),
            onError: (err) => {
                setErrors(err as Record<string, string>);
                setLoading(false);
            },
        });
    };

    return (
        <>
            <Head title="Create Plan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Plan</h1>
                        <p className="text-muted-foreground">Add a new subscription plan</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input id="slug" name="slug" value={form.slug} onChange={handleChange} required />
                                    {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing (in Kina)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="price_monthly">Monthly Price</Label>
                                    <Input id="price_monthly" name="price_monthly" type="number" step="0.01" min="0" value={form.price_monthly} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price_yearly">Yearly Price</Label>
                                    <Input id="price_yearly" name="price_yearly" type="number" step="0.01" min="0" value={form.price_yearly} onChange={handleChange} required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Limits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="max_users">Max Users (empty = unlimited)</Label>
                                    <Input id="max_users" name="max_users" type="number" min="1" value={form.max_users} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_patients">Max Patients (empty = unlimited)</Label>
                                    <Input id="max_patients" name="max_patients" type="number" min="1" value={form.max_patients} onChange={handleChange} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {ALL_FEATURES.map((feature) => (
                                    <div key={feature.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`feature-${feature.id}`}
                                            checked={form.features.includes(feature.id)}
                                            onCheckedChange={() => toggleFeature(feature.id)}
                                        />
                                        <Label htmlFor={`feature-${feature.id}`} className="text-sm cursor-pointer">
                                            {feature.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Display Order</Label>
                                <Input id="sort_order" name="sort_order" type="number" min="0" value={form.sort_order} onChange={handleChange} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" name="is_active" checked={form.is_active} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: !!checked }))} />
                                <Label htmlFor="is_active" className="cursor-pointer">Active (visible to customers)</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Plan'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
