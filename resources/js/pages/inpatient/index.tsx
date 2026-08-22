import { Head, Link, router } from '@inertiajs/react';
import { Bed, Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Admission, PaginatedResult, Patient, Ward } from '@/types/auth';
import { index as inpatientIndex, create as inpatientCreate, show as inpatientShow } from '@/routes/inpatient';

type Props = {
    admissions: PaginatedResult<Admission>;
    stats: { admitted: number; discharged_today: number; available_beds: number; total_beds: number };
    filters: { status?: string; ward_id?: string; patient_id?: string };
    wards: Pick<Ward, 'id' | 'name' | 'code' | 'type'>[];
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'mrn'>[];
};

const statusColors: Record<string, string> = {
    admitted: 'bg-green-100 text-green-800',
    discharged: 'bg-gray-100 text-gray-800',
    transferred: 'bg-blue-100 text-blue-800',
};

export default function InpatientIndex({ admissions, stats, filters, wards, patients }: Props) {
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilter(key: string, value: string) {
        router.get(inpatientIndex.url(), { ...filters, [key]: value === 'all' ? '' : value }, { replace: true });
    }

    const bedOccupancy = stats.total_beds > 0
        ? Math.round(((stats.total_beds - stats.available_beds) / stats.total_beds) * 100)
        : 0;

    return (
        <>
            <Head title="Inpatient" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Inpatient Management</h1>
                        <p className="text-muted-foreground">{admissions.total} admissions</p>
                    </div>
                    <Link href={inpatientCreate.url()}>
                        <Button><Plus className="mr-2 h-4 w-4" />Admit Patient</Button>
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Currently Admitted</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-green-600">{stats.admitted}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Discharged Today</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{stats.discharged_today}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Available Beds</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-blue-600">{stats.available_beds}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Bed Occupancy</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{bedOccupancy}%</p>
                            <p className="text-xs text-muted-foreground">{stats.total_beds - stats.available_beds} / {stats.total_beds}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-3">
                            <Select value={status} onValueChange={(v) => { setStatus(v); applyFilter('status', v); }}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="admitted">Admitted</SelectItem>
                                    <SelectItem value="discharged">Discharged</SelectItem>
                                    <SelectItem value="transferred">Transferred</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.ward_id ?? ''} onValueChange={(v) => applyFilter('ward_id', v)}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="All Wards" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Wards</SelectItem>
                                    {wards.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Admission #</th>
                                        <th className="px-4 py-3 text-left font-medium">Patient</th>
                                        <th className="px-4 py-3 text-left font-medium">Ward / Bed</th>
                                        <th className="px-4 py-3 text-left font-medium">Doctor</th>
                                        <th className="px-4 py-3 text-left font-medium">Admitted</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {admissions.data.length === 0 ? (
                                        <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                            <Bed className="mx-auto mb-2 h-8 w-8 opacity-30" />No admissions found.
                                        </td></tr>
                                    ) : admissions.data.map((a) => (
                                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs">{a.admission_number}</td>
                                            <td className="px-4 py-3 font-medium">{a.patient?.first_name} {a.patient?.last_name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{a.ward?.name} \u2014 {a.bed?.bed_number}</td>
                                            <td className="px-4 py-3">Dr. {a.admitting_doctor?.user?.name}</td>
                                            <td className="px-4 py-3">{new Date(a.admitted_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-3"><Badge className={statusColors[a.status]}>{a.status}</Badge></td>
                                            <td className="px-4 py-3">
                                                <Link href={inpatientShow(a.id).url}>
                                                    <Button variant="ghost" size="sm"><Eye className="mr-1 h-3 w-3" />View</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {admissions.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">Showing {admissions.from}\u2013{admissions.to} of {admissions.total}</p>
                                <div className="flex gap-1">
                                    {admissions.links.map((link, i) => (
                                        <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)} dangerouslySetInnerHTML={{ __html: link.label }} />
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

InpatientIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inpatient', href: '/inpatient' },
    ],
};
