import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Shield, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/types';

type PaginatedUsers = {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    users: PaginatedUsers;
};

function roleLabel(role: string): string {
    return role
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function roleBadgeVariant(
    role: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (role === 'super_admin') {
        return 'destructive';
    }

    if (role === 'hospital_admin') {
        return 'default';
    }

    return 'secondary';
}

export default function UsersIndex({ users }: Props) {
    function handleDelete(user: User) {
        if (!confirm(`Are you sure you want to delete "${user.name}"?`)) {
            return;
        }

        router.delete(`/admin/users/${user.id}`);
    }

    return (
        <>
            <Head title="Hospital Admins" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Hospital Admins
                        </h1>
                        <p className="text-muted-foreground">
                            Manage hospital admin accounts — {users.total} total
                        </p>
                    </div>
                </div>

                {/* Users list */}
                {users.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Shield className="mb-4 h-10 w-10 text-muted-foreground/40" />
                            <h3 className="text-lg font-medium">
                                No users found
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Users will appear here once they are created.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {users.data.map((user) => (
                            <Card
                                key={user.id}
                                className="transition-shadow hover:shadow-md"
                            >
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <Shield className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">
                                                {user.name}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={roleBadgeVariant(user.role)}
                                    >
                                        {roleLabel(user.role)}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {Boolean(user.tenant) && (
                                        <p className="text-sm text-muted-foreground">
                                            Hospital:{' '}
                                            <span className="font-medium text-foreground">
                                                {
                                                    (
                                                        user.tenant as {
                                                            name: string;
                                                        }
                                                    ).name
                                                }
                                            </span>
                                        </p>
                                    )}
                                    <Badge
                                        variant={
                                            user.is_active
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                            >
                                                <Pencil className="mr-1 h-3 w-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(user)}
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

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {users.current_page > 1 && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={`/admin/users?page=${users.current_page - 1}`}
                                >
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="flex items-center px-3 text-sm text-muted-foreground">
                            Page {users.current_page} of {users.last_page}
                        </span>
                        {users.current_page < users.last_page && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={`/admin/users?page=${users.current_page + 1}`}
                                >
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hospital Admins', href: '/admin/users' },
    ],
};
