import { Head, Link } from '@inertiajs/react';
import { Building2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tenant } from '@/types';

type PaginatedTenants = {
    data: Tenant[];
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    tenants: PaginatedTenants;
};

export default function TenantsIndex({ tenants }: Props) {
    return (
        <>
            <Head title="Hospitals" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Hospitals</h1>
                        <p className="text-muted-foreground">
                            Manage all hospital tenants — {tenants.total} total
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/tenants/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Hospital
                        </Link>
                    </Button>
                </div>

                {/* Hospitals grid */}
                {tenants.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Building2 className="mb-4 h-10 w-10 text-muted-foreground/40" />
                            <h3 className="text-lg font-medium">No hospitals yet</h3>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Create the first hospital to get started.
                            </p>
                            <Button asChild>
                                <Link href="/admin/tenants/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Hospital
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {tenants.data.map((tenant) => (
                            <Card key={tenant.id} className="transition-shadow hover:shadow-md">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{tenant.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {tenant.slug}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                                        {tenant.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {tenant.email && (
                                        <p className="text-sm text-muted-foreground">{tenant.email}</p>
                                    )}
                                    {tenant.phone && (
                                        <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                                    )}
                                    <p className="text-sm font-medium">
                                        {tenant.users_count ?? 0} staff members
                                    </p>
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/tenants/${tenant.id}`}>View</Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/tenants/${tenant.id}/edit`}>Edit</Link>
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

TenantsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hospitals', href: '/admin/tenants' },
    ],
};
