import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Role = { name: string; value: string; label: string };

type Props = { roles: Role[] };

export default function StaffCreate({ roles }: Props) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        gender: '',
        date_of_birth: '',
        password: '',
        is_active: true,
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
        router.post('/staff', form, {
            onSuccess: () => setLoading(false),
            onError: (err) => { setErrors(err as Record<string, string>); setLoading(false); },
        });
    };

    return (
        <>
            <Head title="Add Staff Member" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Add Staff Member</h1>
                        <p className="text-muted-foreground">Create a new hospital staff account</p>
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
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
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
                                        <SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger>
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
                                    <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+675 7XXX XXXX" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
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
                        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Staff Member'}</Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
