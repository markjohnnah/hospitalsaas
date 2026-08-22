import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedResult, Patient } from '@/types/auth';
import AppLayout from '@/layouts/app-layout';
import { index as patientsIndex, create as patientsCreate, show as patientsShow, edit as patientsEdit } from '@/routes/patients';

type Props = {
    patients: PaginatedResult<Patient>;
    filters: {
        search?: string;
        gender?: string;
        active_only?: boolean;
    };
};

export default function PatientsIndex({ patients, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(patientsIndex.url(), { search, gender: filters.gender }, { preserveScroll: true, replace: true });
    }

    function statusBadge(isActive: boolean) {
        return isActive
            ? <Badge className="bg-green-100 text-green-800">Active</Badge>
            : <Badge variant="secondary">Inactive</Badge>;
    }

    function genderBadge(gender: string) {
        const colors: Record<string, string> = { male: 'bg-blue-100 text-blue-800', female: 'bg-pink-100 text-pink-800', other: 'bg-purple-100 text-purple-800' };
        return <Badge className={colors[gender] ?? ''}>{gender}</Badge>;
    }

    return (
        <>
            <Head title="Patients" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
                        <p className="text-muted-foreground">{patients.total} registered patients</p>
                    </div>
                <Link href={patientsCreate.url()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Register Patient
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, MRN or phone..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit">Search</Button>
                            {(filters.search || filters.gender) && (
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(patientsIndex.url());
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">MRN</th>
                                        <th className="px-4 py-3 text-left font-medium">Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Gender</th>
                                        <th className="px-4 py-3 text-left font-medium">Age</th>
                                        <th className="px-4 py-3 text-left font-medium">Phone</th>
                                        <th className="px-4 py-3 text-left font-medium">Blood Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {patients.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                                                No patients found.
                                            </td>
                                        </tr>
                                    ) : (
                                        patients.data.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs text-muted-foreground">{patient.mrn}</span>
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    <Link
                                                        href={patientsShow(patient.id).url}
                                                        className="hover:underline text-primary"
                                                    >
                                                        {patient.full_name}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">{genderBadge(patient.gender)}</td>
                                                <td className="px-4 py-3">{patient.age} yrs</td>
                                                <td className="px-4 py-3 text-muted-foreground">{patient.phone ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    {patient.blood_type ? (
                                                        <Badge variant="outline">{patient.blood_type}</Badge>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-4 py-3">{statusBadge(patient.is_active)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <Link href={patientsShow(patient.id).url}>
                                                            <Button variant="ghost" size="sm">View</Button>
                                                        </Link>
                                                        <Link href={patientsEdit(patient.id).url}>
                                                            <Button variant="ghost" size="sm">Edit</Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {patients.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Showing {patients.from}–{patients.to} of {patients.total}
                                </p>
                                <div className="flex gap-1">
                                    {patients.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
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
