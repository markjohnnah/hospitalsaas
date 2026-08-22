import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, UserCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type StaffMember = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    gender: string | null;
    is_active: boolean;
    created_at: string;
};

type Role = { name: string; value: string; label: string };

type Props = {
    staff: { data: StaffMember[]; current_page: number; last_page: number; total: number };
    roles: Role[];
    filters: { search?: string; role?: string; is_active?: string };
};

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
    if (role === 'hospital_admin') return 'default';
    if (role === 'doctor') return 'secondary';
    return 'outline';
}

export default function StaffIndex({ staff, roles, filters }: Props) {
    return (
        <>
            <Head title="Staff Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
                        <p className="text-muted-foreground">Manage hospital staff — {staff.total} members</p>
                    </div>
                    <Button asChild>
                        <Link href="/staff/create">
                            <Plus className="mr-2 h-4 w-4" />Add Staff
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                    <form className="flex gap-3">
                        <Input name="search" placeholder="Search name or email..." defaultValue={filters.search ?? ''} className="max-w-xs" />
                        <Select name="role" defaultValue={filters.role ?? 'all'}>
                            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All roles" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All roles</SelectItem>
                                {roles.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select name="is_active" defaultValue={filters.is_active ?? 'all'}>
                            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All status</SelectItem>
                                <SelectItem value="1">Active</SelectItem>
                                <SelectItem value="0">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
                    </form>
                </div>

                {staff.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Users className="mb-4 h-10 w-10 text-muted-foreground/40" />
                            <h3 className="text-lg font-medium">No staff found</h3>
                            <p className="mb-4 text-sm text-muted-foreground">Add your first staff member.</p>
                            <Button asChild>
                                <Link href="/staff/create"><Plus className="mr-2 h-4 w-4" />Add Staff</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staff.data.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <Link href={`/staff/${member.id}`} className="flex items-center gap-2 font-medium text-primary hover:underline">
                                                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                                                    {member.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{member.email}</TableCell>
                                            <TableCell><Badge variant={roleBadgeVariant(member.role)}>{member.role}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground">{member.phone ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant={member.is_active ? 'default' : 'secondary'}>
                                                    {member.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
