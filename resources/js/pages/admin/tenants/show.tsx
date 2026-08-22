import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, Mail, Phone, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tenant, User } from '@/types';

type Props = {
    tenant: Tenant & { users: User[] };
};

export default function TenantsShow({ tenant }: Props) {
    return (
        <>
            <Head title={tenant.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/tenants">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
                            <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                                {tenant.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">ID: {tenant.id}</p>
                    </div>
                    <Button asChild>
                        <Link href={`/admin/tenants/${tenant.id}/edit`}>Edit Hospital</Link>
                    </Button>
                </div>

                {/* Info cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Slug</p>
                                <p className="font-medium">{tenant.slug ?? '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium">{tenant.email ?? '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-medium">{tenant.phone ?? '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Staff Members</p>
                                <p className="font-medium">{tenant.users.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Staff list */}
                <Card>
                    <CardHeader>
                        <CardTitle>Staff Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tenant.users.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No staff members yet.</p>
                        ) : (
                            <div className="divide-y">
                                {tenant.users.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{String(user.role).replace('_', ' ')}</Badge>
                                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TenantsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hospitals', href: '/admin/tenants' },
        { title: 'View Hospital', href: '#' },
    ],
};
