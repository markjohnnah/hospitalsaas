import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { index as doctorsIndex, create as doctorsCreate, show as doctorsShow, edit as doctorsEdit } from '@/routes/doctors';
import type { Doctor, Department, Specialization, PaginatedResult } from '@/types/auth';

type Props = {
    doctors: PaginatedResult<Doctor>;
    departments: Pick<Department, 'id' | 'name'>[];
    specializations: Pick<Specialization, 'id' | 'name'>[];
    filters: {
        search?: string;
        department_id?: string;
        specialization_id?: string;
    };
};

export default function DoctorsIndex({ doctors, departments, specializations, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(doctorsIndex.url(), { search, department_id: filters.department_id, specialization_id: filters.specialization_id }, { preserveScroll: true, replace: true });
    }

    return (
        <>
            <Head title="Doctors" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Doctors</h1>
                        <p className="text-muted-foreground">{doctors.total} registered doctors</p>
                    </div>
                    <Link href={doctorsCreate.url()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Doctor
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Search doctors…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <select
                                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                value={filters.department_id ?? ''}
                                onChange={(e) => router.get(doctorsIndex.url(), { search, department_id: e.target.value, specialization_id: filters.specialization_id }, { replace: true })}
                            >
                                <option value="">All Departments</option>
                                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <select
                                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                value={filters.specialization_id ?? ''}
                                onChange={(e) => router.get(doctorsIndex.url(), { search, department_id: filters.department_id, specialization_id: e.target.value }, { replace: true })}
                            >
                                <option value="">All Specializations</option>
                                {specializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <Button type="submit">Search</Button>
                            {(filters.search || filters.department_id || filters.specialization_id) && (
                                <Button variant="outline" type="button" onClick={() => { setSearch(''); router.get(doctorsIndex.url()); }}>
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Doctor</th>
                                        <th className="px-4 py-3 text-left font-medium">Department</th>
                                        <th className="px-4 py-3 text-left font-medium">Specialization</th>
                                        <th className="px-4 py-3 text-left font-medium">License</th>
                                        <th className="px-4 py-3 text-left font-medium">Fee</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {doctors.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                                No doctors found.
                                            </td>
                                        </tr>
                                    ) : doctors.data.map((doctor) => (
                                        <tr key={doctor.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium">
                                                        <Link href={doctorsShow(doctor.id).url} className="hover:underline text-primary">
                                                            Dr. {doctor.full_name}
                                                        </Link>
                                                    </p>
                                                    {doctor.qualification && <p className="text-xs text-muted-foreground">{doctor.qualification}</p>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{doctor.department?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{doctor.specialization?.name ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{doctor.license_number ?? '—'}</td>
                                            <td className="px-4 py-3">KES {parseFloat(doctor.consultation_fee).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                {doctor.is_available
                                                    ? <Badge className="bg-green-100 text-green-800">Available</Badge>
                                                    : <Badge variant="secondary">Unavailable</Badge>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <Link href={doctorsShow(doctor.id).url}>
                                                        <Button variant="ghost" size="sm">View</Button>
                                                    </Link>
                                                    <Link href={doctorsEdit(doctor.id).url}>
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {doctors.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">Showing {doctors.from}–{doctors.to} of {doctors.total}</p>
                                <div className="flex gap-1">
                                    {doctors.links.map((link, i) => (
                                        <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
