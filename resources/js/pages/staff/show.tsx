import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

type Props = { staff: StaffMember };

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
    if (role === 'hospital_admin') return 'default';
    if (role === 'doctor') return 'secondary';
    return 'outline';
}

export default function StaffShow({ staff }: Props) {
    return (
        <>
            <Head title={staff.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{staff.name}</h1>
                        <p className="text-muted-foreground">
                            <Badge variant={roleBadgeVariant(staff.role)} className="mr-2">{staff.role}</Badge>
                            <Badge variant={staff.is_active ? 'default' : 'secondary'}>{staff.is_active ? 'Active' : 'Inactive'}</Badge>
                        </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/staff/${staff.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => {
                            if (confirm('Deactivate this staff member?')) router.delete(`/staff/${staff.id}`);
                        }}>
                            <Trash2 className="mr-2 h-4 w-4" />Deactivate
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Account Info</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{staff.email}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{staff.phone ?? '—'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge variant={roleBadgeVariant(staff.role)}>{staff.role}</Badge></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Member since</span><span>{new Date(staff.created_at).toLocaleDateString()}</span></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Gender</span><span className="capitalize">{staff.gender ?? '—'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Date of Birth</span><span>{staff.date_of_birth ?? '—'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                                <Badge variant={staff.is_active ? 'default' : 'secondary'}>{staff.is_active ? 'Active' : 'Inactive'}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
