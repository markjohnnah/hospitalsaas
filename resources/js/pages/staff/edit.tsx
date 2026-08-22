import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type StaffMember = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    gender: string | null;
    date_of_birth: string | null;
    is_active: boolean;
    created_at: string;
};

type Role = { name: string; value: string; label: string };

type Props = { staff: StaffMember; roles: Role[] };

export default function StaffEdit({ staff, roles }: Props) {
    const [form, setForm] = useState({
        name: staff.name,
        email: staff.email,
        phone: staff.phone ?? '',
        role: staff.role,
        gender: staff.gender ?? '',
        date_of_birth: staff.date_of_birth ?? '',
        password: '',
        is_active: staff.is_active,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        router.put(`/staff/${staff.id}`, form, {
            onSuccess: () => setLoading(false),
            onError: (err) => { setErrors(err as Record<string, string>); setLoading(false); },
        });
    };

    const handleDelete = () => {
        if (confirm('Deactivate this staff member? They will no longer be able to log in.')) {
            router.delete(`/staff/${staff.id}`);
        }
    };

    return (
        <>
            <Head title={`Edit ${staff.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit {staff.name}</h1>
                        <p className="text-muted-foreground">Update staff account details</p>
                    </div>
                    <div className="ml-auto">
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />Deactivate
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                                <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current" />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Role & Contact</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select value={form.role} onValueChange={(v) => setForm((prev) => ({ ...prev, role: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {roles.map((r) => (
                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Personal Info & Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select value={form.gender} onValueChange={(v) => setForm((prev) => ({ ...prev, gender: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                                    <Input id="date_of_birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                                </div>
                                <div className="flex items-end space-x-2 pb-1">
                                    <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} className="h-4 w-4" />
                                    <Label htmlFor="is_active">Active account</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
